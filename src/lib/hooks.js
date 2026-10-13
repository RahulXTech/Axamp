import { useEffect, useId, useState, useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

// Desktop gets the pinned section with the big ring; touch / small screens
// get the compact stacked layout.
export const useIsCarousel = () =>
  useMediaQuery('(max-width: 900px), (pointer: coarse)')

export function useInView(ref, rootMargin = '0px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}

// Taking a <video> off the page doesn't always stop its download. Clearing
// its src does, so the connection is free for the video now on screen.
export function useStopDownloadWhenHidden(videoRef, shown) {
  useEffect(() => {
    const v = videoRef.current
    if (!shown || !v) return
    return () => {
      v.removeAttribute('src')
      v.load()
    }
  }, [videoRef, shown])
}

// iOS Safari kills and reloads the tab (back to the top) when the page runs
// out of memory, and every inline <video> holds its own decoder and buffers.
// A fast scroll used to wake up to ~8 reels at once (strip cards + rings), so
// phones get at most TOUCH_VIDEOS at a time: the newest request wins and the
// oldest drops back to its poster. Desktop is unlimited.
const TOUCH_VIDEOS = 2
const maxVideos = window.matchMedia('(pointer: coarse)').matches ? TOUCH_VIDEOS : Infinity
let videoHolders = [] // oldest first
const slotListeners = new Set()
const subscribeSlots = (fn) => {
  slotListeners.add(fn)
  return () => slotListeners.delete(fn)
}

// `wants` → this video would like to load / play now. Returns whether it may.
export function useVideoSlot(wants) {
  const id = useId()
  useEffect(() => {
    if (!wants) return
    videoHolders.push(id)
    slotListeners.forEach((fn) => fn())
    return () => {
      videoHolders = videoHolders.filter((h) => h !== id)
      slotListeners.forEach((fn) => fn())
    }
  }, [id, wants])
  return useSyncExternalStore(
    subscribeSlots,
    () => wants && videoHolders.slice(-maxVideos).includes(id),
  )
}

// Checks (once per URL) whether a self-hosted MP4 exists. Content-type is
// checked because SPA hosts answer missing files with index.html + 200.
const probes = new Map()
export function useVideoAvailable(url) {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    if (!url) return setOk(false)
    let alive = true
    if (!probes.has(url)) {
      probes.set(
        url,
        fetch(url, { method: 'HEAD' })
          .then((r) => r.ok && (r.headers.get('content-type') || '').startsWith('video'))
          .catch(() => false),
      )
    }
    probes.get(url).then((v) => alive && setOk(v))
    return () => { alive = false }
  }, [url])
  return ok
}

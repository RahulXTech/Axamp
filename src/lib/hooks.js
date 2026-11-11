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

/* Pauses the CSS animations of every section that's off screen (the
 * `[data-offscreen]` rule in styles.css). On the home page dozens of looping
 * animations — flow lines, sheens, pulses, the closing border — kept running
 * in sections nobody could see, and each made the browser recompute styles
 * every frame; on a slow phone that was the largest cost while scrolling.
 * Watches the page's `<section>`s (inside <main>, plus the footer), including
 * ones added later (deferred sections, an industry switch). */
export function usePauseOffscreen() {
  useEffect(() => {
    const root = document.querySelector('main')
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
      { rootMargin: '10% 0px' },
    )
    const watched = new Set()
    const scan = () => {
      frame = 0
      for (const el of [...root.querySelectorAll('section'), document.querySelector('footer')]) {
        if (el && !watched.has(el)) {
          watched.add(el)
          io.observe(el)
        }
      }
    }
    let frame = 0
    const mo = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(scan)
    })
    mo.observe(root, { childList: true, subtree: true })
    scan()
    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      io.disconnect()
      watched.forEach((el) => el.removeAttribute('data-offscreen'))
    }
  }, [])
}

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
// `enabled` false holds the check back (answer stays null) until the video
// could actually play — a page of reel rings used to send one request per
// card on load. A known answer is kept when it turns false again.
const probes = new Map()
export function useVideoAvailable(url, enabled = true) {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    if (!url) return setOk(false)
    if (!enabled) return
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
  }, [url, enabled])
  return ok
}

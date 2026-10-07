import { useEffect, useState } from 'react'

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

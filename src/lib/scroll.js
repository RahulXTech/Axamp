import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

// Eased scrolling is motion too — with reduced motion on, the browser scrolls natively
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initSmoothScroll() {
  if (lenis || reducedMotion()) return () => {}
  lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }
}

export function scrollToTarget(target, retries = 0) {
  if (typeof target === 'number') {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 })
    else window.scrollTo({ top: target, behavior: reducedMotion() ? 'auto' : 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) {
    // Maybe inside a section that isn't built yet (components/Deferred.jsx):
    // ask for them all, then try again when one lands (its code may still be
    // downloading on a slow connection) — or after a while anyway, ~10 s in all
    if (typeof target === 'string' && retries < 20) {
      window.dispatchEvent(new Event('axamp:need-sections'))
      let done = false
      const retry = () => {
        if (done) return
        done = true
        clearTimeout(fallback)
        window.removeEventListener('axamp:sections-built', retry)
        // A beat for the new section's pins to be measured
        setTimeout(() => scrollToTarget(target, retries + 1), 50)
      }
      const fallback = setTimeout(retry, 450)
      window.addEventListener('axamp:sections-built', retry)
    }
    return
  }
  // Re-measure first: right after a page change Lenis still clamps to the old page's height
  lenis?.resize()
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 })
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

// Jump straight to the top — used when a new page mounts
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.classList.toggle('is-locked', locked)
}

/* Re-measure every ScrollTrigger (pins, scrubs, slides) — once per frame at
 * most. A full refresh measures the whole page; on the home page several
 * parts each asked for one while it loaded (the slide setup twice, the lead
 * engine, the fonts landing), and on a slow phone each one blocked the page
 * for up to ~2 s. Requests made in the same frame now share one refresh. */
let refreshFrame = 0
export function requestScrollRefresh() {
  if (refreshFrame) return
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0
    ScrollTrigger.refresh()
  })
}

/* The page's scroll position, kept by one passive listener. Per-frame code
 * (the reel rings) reads this instead of window.scrollY: reading scrollY
 * after styles have changed forces the browser to redo layout on the spot,
 * and every ring did that every frame. */
let pageScrollY = typeof window !== 'undefined' ? window.scrollY : 0
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { pageScrollY = window.scrollY }, { passive: true })
}
export const getScrollY = () => pageScrollY

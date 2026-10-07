import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initSmoothScroll() {
  if (lenis) return () => {}
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

export function scrollToTarget(target) {
  if (typeof target === 'number') {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 })
    else window.scrollTo({ top: target, behavior: 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  // Re-measure first: right after a page change Lenis still clamps to the old page's height
  lenis?.resize()
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
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

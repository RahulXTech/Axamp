import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Where each `data-slide` direction starts from.
const FROM = {
  up:    { y: 90 },
  left:  { x: -140 },
  right: { x: 140 },
  scale: { y: 70, scale: 0.9 },
}

/*
 * Scroll-in slides for any element marked up in JSX:
 *
 *   <div data-slide="left">…</div>              slides itself in
 *   <ol data-slide="right" data-slide-stagger>  slides its children in, one by one
 *
 * Plays forward when the element enters and reverses when you
 * scroll back above it. Returns a cleanup function.
 *
 * A block marked `data-slide-root` wires up its own slides (it can swap
 * its content later) — call initSlides(thatBlock); everyone else skips it.
 */
export function initSlides(root = document) {
  const ctx = gsap.context(() => {
    const owner = root === document ? null : root
    gsap.utils.toArray('[data-slide]', root).forEach((el) => {
      if (el.closest('[data-slide-root]') !== owner) return
      const from = FROM[el.dataset.slide] || FROM.up
      const stagger = el.hasAttribute('data-slide-stagger')

      gsap.from(stagger ? el.children : el, {
        ...from,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  // Created after the section pins — re-order so positions account for them
  ScrollTrigger.sort()
  ScrollTrigger.refresh()

  return () => ctx.revert()
}

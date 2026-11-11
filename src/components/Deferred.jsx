import { useEffect, useRef, useState } from 'react'
import { initSlides } from '../lib/slide'
import { loadChunk } from '../lib/lazyPage'

/*
 * Builds its section a little after the page has loaded, instead of in the
 * first render. The home page used to build everything at once (~2,300
 * elements and ~50 scroll animations), and every scroll animation measured
 * that whole page — on a slow phone the first task blocked for ~5 s.
 *
 * With `load` (e.g. () => import('./Performance')) the section's code isn't
 * part of the first download either: it's fetched when the section is about
 * to be built. Without it, `children` are built.
 *
 * A deferred section is built, one at a time and in page order, as soon as
 * the browser is idle after load — or straight away when the visitor scrolls
 * near it, or when something wants to jump to a section inside it
 * (scrollToTarget asks with the 'axamp:need-sections' event). Sections above
 * it are always built first (or together with it), so the pins are set up in
 * page order even when a later chunk downloads sooner. It wires up its own
 * `data-slide` animations once built, like the proof block does.
 */

const queue = [] // start callbacks of deferred sections not started yet, in page order
let idleId = 0
// Settles once every section started so far has been built (keeps page order)
let order = Promise.resolve()

const idle = (fn) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 300)

// Build the next waiting section when the browser next has a moment
function scheduleNext() {
  if (idleId || !queue.length) return
  const start = () => {
    idleId = idle(() => {
      idleId = 0
      queue[0]?.()
    })
  }
  document.readyState === 'complete' ? start() : window.addEventListener('load', start, { once: true })
}

// Build everything still waiting (a jump to a section inside one of them)
function mountAll() {
  ;[...queue].forEach((start) => start())
}
if (typeof window !== 'undefined') window.addEventListener('axamp:need-sections', mountAll)

export default function Deferred({ load, children }) {
  const [ready, setReady] = useState(false)
  const [Section, setSection] = useState(null)
  const [failed, setFailed] = useState(null)
  const placeholderRef = useRef(null)
  const rootRef = useRef(null)

  // Join the queue; leave it once started (or if the page goes away first)
  useEffect(() => {
    if (ready) return
    let started = false
    let cancelled = false

    const start = () => {
      if (started) return
      started = true
      const i = queue.indexOf(start)
      // Sections above this one go first
      queue.slice(0, Math.max(i, 0)).forEach((s) => s())
      if (i >= 0) queue.splice(queue.indexOf(start), 1)

      // Download now; build once it's here and everything above is built
      const code = load ? loadChunk(load) : Promise.resolve(null)
      order = Promise.all([order, code]).then(
        ([, mod]) => {
          if (cancelled) return
          if (mod) setSection(() => mod.default)
          setReady(true)
        },
        (err) => {
          if (!cancelled) setFailed(err) // shown by RouteBoundary (reload button)
        },
      )
      // One failed section mustn't hold back the ones below it
      order = order.catch(() => {})
    }
    queue.push(start)
    scheduleNext()

    // Visitor already scrolling towards it: build now
    const io = new IntersectionObserver(([e]) => e.isIntersecting && start(), { rootMargin: '150% 0px' })
    io.observe(placeholderRef.current)
    return () => {
      cancelled = true
      io.disconnect()
      const i = queue.indexOf(start)
      if (i >= 0) queue.splice(i, 1)
    }
    // `load` is read when the section starts (pass a module-level function)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Built: wire up its slide-ins, then let the next one go
  useEffect(() => {
    if (!ready) return
    const stopSlides = initSlides(rootRef.current)
    window.dispatchEvent(new Event('axamp:sections-built'))
    scheduleNext()
    return stopSlides
  }, [ready])

  if (failed) throw failed
  if (!ready) return <div ref={placeholderRef} aria-hidden="true" className="min-h-[100svh] bg-[var(--navy)]" />
  return (
    <div ref={rootRef} data-slide-root className="contents">
      {Section ? <Section /> : children}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { resolveReel } from '../data/work'
import IntroPanel, { PillLabel } from './IntroPanel'
import VideoCard from './VideoCard'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/*
 * Pillar section as an orbit (used by the University pillars):
 * the reels circle the copy on an ellipse. Desktop: cards swell to full
 * size as they swing out to the left and right of the copy and shrink as
 * they pass above (behind the text) and below it — so two big videos
 * always sit beside the copy. Phones stack the copy above and use a plain
 * orbit, big at the front (bottom), small at the back.
 * Drag to spin, scroll speeds it up. Desktop pins it briefly so the
 * objection gets struck through on scroll.
 */

const SLOTS = 6           // cards on the orbit (reels repeat to fill it)
const SLOTS_STACKED = 6   // phones
const BASE_SPEED = 9      // deg / second
const HOVER_FACTOR = 0.15 // fraction of BASE_SPEED kept while hovered / focused
const SCROLL_BOOST = 0.035
const STACKED_CARD = 'min(calc(56vw * 16 / 9), 52svh)' // phones: card height
const MIN_SCALE = { sides: 0.42, bottom: 0.5 } // card scale at its smallest point
const pad = (n) => String(n).padStart(2, '0')

export default function PillarOrbit({ pillar, index, inView, stacked }) {
  const warm = pillar.tone === 'warm'

  const reels = useMemo(
    () =>
      pillar.reels?.length
        ? pillar.reels.map((r) => resolveReel(r, pillar))
        : Array.from({ length: 6 }, (_, i) => ({
            key: `${pillar.id}-soon-${i}`,
            placeholder: true,
            caption: `${pillar.label} — coming soon`,
            warm,
          })),
    [pillar, warm],
  )

  const [active, setActive] = useState(0)
  const sectionRef = useRef(null)
  const introRef = useRef(null)
  const orbitRef = useRef(null)
  const progressRef = useRef(null)

  useGSAP(
    () => {
      if (stacked) return
      const section = sectionRef.current

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 1.1}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          section.style.setProperty('--p', self.progress) // IntroPanel strike + answer
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`
        },
      })

      // Copy rises in; the orbit opens out around it
      const enter = { trigger: section, start: 'top 85%', end: 'top 15%', scrub: 0.6 }
      gsap.fromTo(introRef.current, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, ease: 'power3.out', scrollTrigger: enter })
      gsap.fromTo(
        orbitRef.current,
        { autoAlpha: 0, scale: 0.55, rotate: -8 },
        { autoAlpha: 1, scale: 1, rotate: 0, ease: 'power3.out', scrollTrigger: enter },
      )
    },
    { scope: sectionRef, dependencies: [stacked] },
  )

  const counter = reels[0]?.placeholder ? (
    <span>Reels coming soon</span>
  ) : (
    <>
      <span className="text-white">{pad(active + 1)}</span>
      <span>/</span>
      <span>{pad(reels.length)}</span>
      <span>Reels</span>
    </>
  )

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden ${stacked ? 'pb-3 pt-7' : 'h-[100svh] min-h-[720px]'}`}
      style={{
        // University's coral accent (same as --amber, see data/services.js)
        '--tone-rgb': 'var(--amber-rgb)',
        // Phones: no scroll scrub, reveal the strikethrough once in view
        ...(stacked && { '--p': inView ? 1 : 0, transition: '--p 1.8s var(--ease)' }),
      }}
    >
      {/* Backdrop: tone glow in the middle of the orbit */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 55%, rgba(var(--tone-rgb), 0.09), transparent 70%)' }}
      />

      {stacked ? (
        <>
          <div className="mb-2 px-5 sm:px-8">
            <IntroPanel pillar={pillar} index={index} compact />
          </div>
          <div ref={orbitRef} className="mt-4" style={{ height: `calc(${STACKED_CARD} * 1.5)` }}>
            <ReelOrbit reels={reels} inView={inView} mode="bottom" count={SLOTS_STACKED} cardHeight={STACKED_CARD} onActiveChange={setActive} />
          </div>
          <div className="mt-2 flex justify-center gap-3 text-xs uppercase tracking-[0.25em] text-white/40">{counter}</div>
        </>
      ) : (
        <>
          <div className="absolute left-[var(--gutter)] top-24 z-[60]">
            <PillLabel pillar={pillar} />
          </div>

          <div ref={orbitRef} className="absolute inset-x-0 bottom-28 top-20">
            <ReelOrbit reels={reels} inView={inView} mode="sides" cardHeight="min(54vh, 500px)" onActiveChange={setActive}>
              {/* Copy sits in the middle of the orbit: cards passing above go behind it */}
              <div
                ref={introRef}
                className="pointer-events-none absolute left-1/2 top-1/2 z-50 w-[min(520px,38vw)] -translate-x-1/2 -translate-y-1/2 [text-shadow:0_2px_24px_rgba(5,8,26,0.9)]"
              >
                <IntroPanel pillar={pillar} index={index} align="center" />
              </div>
            </ReelOrbit>
          </div>

          <div className="pointer-events-none absolute bottom-10 left-[var(--gutter)] right-[var(--gutter)] z-[60] flex items-end justify-between text-xs uppercase tracking-[0.25em] text-white/40">
            <div className="flex items-center gap-3">{counter}</div>
            <div className="flex items-center gap-3">
              <span>Drag to orbit</span>
              <span className="text-xl" style={{ color: 'rgba(var(--tone-rgb), 0.8)' }}>◎</span>
            </div>
          </div>

          {/* Scroll progress through the pin — fills from the centre out */}
          <div className="absolute bottom-5 left-[var(--gutter)] right-[var(--gutter)] h-[2px] overflow-hidden rounded-full bg-white/10">
            <div
              ref={progressRef}
              className="h-full w-full origin-center scale-x-0"
              style={{
                background: 'linear-gradient(90deg, rgba(var(--tone-rgb), 0.3), rgb(var(--tone-rgb)), rgba(var(--tone-rgb), 0.3))',
                boxShadow: '0 0 16px rgba(var(--tone-rgb), 0.6)',
              }}
            />
          </div>
        </>
      )}
    </section>
  )
}

/* ============================================================
   ORBIT — cards on a tilted ellipse, kept upright and depth-
   sorted. GSAP's ticker drives the angle; drag to spin it by
   hand, release for inertia.
============================================================ */

function ReelOrbit({ reels, inView, cardHeight, mode = 'bottom', count = SLOTS, onActiveChange, children }) {
  const stageRef = useRef(null)
  const pathRef = useRef(null)
  // Slot(s) at full size: the right-hand card (+ the left-hand one in "sides" mode)
  const [front, setFront] = useState(0)
  const [second, setSecond] = useState(-1)
  const rotRef = useRef(0)

  const inViewRef = useRef(inView)
  const onActiveRef = useRef(onActiveChange)
  useEffect(() => {
    inViewRef.current = inView
  }, [inView])
  useEffect(() => {
    onActiveRef.current = onActiveChange
  }, [onActiveChange])

  const n = reels.length
  const slots = useMemo(() => (n ? Array.from({ length: count }, (_, i) => reels[i % n]) : []), [reels, n, count])

  useEffect(() => {
    if (n) onActiveRef.current?.(front % n)
  }, [front, n])

  useGSAP(
    () => {
      const stage = stageRef.current
      const cards = gsap.utils.toArray('[data-orbit-card]', stage)
      const shades = gsap.utils.toArray('[data-shade]', stage)
      const N = cards.length
      if (!N) return

      const step = 360 / N
      let rx = 0
      let ry = 0
      let cy = 0 // vertical shift of the orbit centre
      let rot = rotRef.current
      let vel = BASE_SPEED
      let lastScroll = window.scrollY
      let lastFront = -1
      let hovering = false
      let focused = false
      let drag = null
      let draggedPx = 0

      const sides = mode === 'sides'
      const minScale = MIN_SCALE[mode]
      const slotAt = (deg) => ((Math.round((deg - rot) / step) % N) + N) % N

      const render = () => {
        rotRef.current = rot
        for (let i = 0; i < N; i++) {
          const a = ((i * step + rot) * Math.PI) / 180
          // sides: 1 at the left/right, 0 above/below (squared so only the side cards get big)
          // bottom: 1 at the bottom, 0 at the top
          const depth = sides ? Math.sin(a) ** 2 : (Math.cos(a) + 1) / 2
          const s = minScale + (1 - minScale) * depth
          cards[i].style.transform =
            `translate(-50%, -50%) translate(${(rx * Math.sin(a)).toFixed(1)}px, ${(cy + ry * Math.cos(a)).toFixed(1)}px) scale(${s.toFixed(3)})`
          // Small cards sit under the copy (z-50), big ones over it
          cards[i].style.zIndex = String(Math.round(depth * 100))
          shades[i].style.opacity = ((1 - depth) * (sides ? 0.6 : 0.75)).toFixed(3)
        }

        const f = sides ? slotAt(90) : slotAt(0)
        if (f !== lastFront) {
          lastFront = f
          setFront(f)
          if (sides) setSecond(slotAt(270))
        }
      }

      const measure = () => {
        const w = cards[0].offsetWidth
        const h = cards[0].offsetHeight
        if (!h) return
        if (sides) {
          // Big cards just inside the edges, small ones clear of the top and bottom
          rx = Math.max(stage.clientWidth / 2 - w / 2 - 32, 200)
          ry = Math.max((stage.clientHeight - h * minScale) / 2, 40)
        } else {
          rx = Math.max(stage.clientWidth / 2 - w * 0.45, 100)
          // Fit the orbit to the box: back cards touch the top, the front card the bottom
          const H = stage.clientHeight
          cy = -(h * (1 - minScale)) / 4
          ry = Math.max(H / 2 - (h * (1 + minScale)) / 4, 40)
        }
        if (pathRef.current) {
          pathRef.current.style.width = `${rx * 2}px`
          pathRef.current.style.height = `${ry * 2}px`
        }
        render()
      }

      const tick = (_time, deltaTime) => {
        const y = window.scrollY
        const scrolled = Math.min(Math.abs(y - lastScroll), 120)
        lastScroll = y

        if (!inViewRef.current || !rx || drag) return

        const dt = Math.min(deltaTime, 50) / 1000
        const target = BASE_SPEED * (hovering || focused ? HOVER_FACTOR : 1)
        vel += (target - vel) * (1 - Math.exp(-dt * 3))
        rot = (rot + vel * dt + scrolled * SCROLL_BOOST) % 360
        render()
      }

      /* ── Drag to spin (front cards follow the pointer) ── */
      const toDeg = (px) => (px / rx) * (180 / Math.PI)

      const onMove = (e) => {
        const now = performance.now()
        const dx = e.clientX - drag.x
        const dt = Math.max(now - drag.t, 1) / 1000
        const d = toDeg(dx)
        drag.x = e.clientX
        drag.t = now
        drag.moved += Math.abs(dx)
        drag.v = drag.v * 0.6 + (d / dt) * 0.4
        rot = (rot + d) % 360
        render()
      }

      const onUp = () => {
        vel = gsap.utils.clamp(-200, 200, drag.v)
        draggedPx = drag.moved
        drag = null
        stage.classList.remove('is-dragging')
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }

      const onDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        drag = { x: e.clientX, t: performance.now(), moved: 0, v: 0 }
        draggedPx = 0
        stage.classList.add('is-dragging')
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
      }

      // A drag shouldn't also open the reel under the pointer
      const onClick = (e) => {
        if (draggedPx > 6) {
          e.stopPropagation()
          e.preventDefault()
        }
        draggedPx = 0
      }

      const onEnter = (e) => {
        if (e.pointerType === 'mouse') hovering = true
      }
      const onLeave = () => (hovering = false)
      const onFocusIn = () => (focused = true)
      const onFocusOut = () => (focused = false)

      stage.addEventListener('pointerdown', onDown)
      stage.addEventListener('click', onClick, true)
      stage.addEventListener('pointerenter', onEnter)
      stage.addEventListener('pointerleave', onLeave)
      stage.addEventListener('focusin', onFocusIn)
      stage.addEventListener('focusout', onFocusOut)

      measure()
      gsap.ticker.add(tick)
      const ro = new ResizeObserver(measure)
      ro.observe(stage)

      return () => {
        gsap.ticker.remove(tick)
        ro.disconnect()
        if (drag) onUp()
        stage.removeEventListener('pointerdown', onDown)
        stage.removeEventListener('click', onClick, true)
        stage.removeEventListener('pointerenter', onEnter)
        stage.removeEventListener('pointerleave', onLeave)
        stage.removeEventListener('focusin', onFocusIn)
        stage.removeEventListener('focusout', onFocusOut)
      }
    },
    { scope: stageRef, dependencies: [slots.length, mode] },
  )

  // How many slots a card is from the nearest full-size slot
  const gap = (i, f) => {
    if (f < 0) return Infinity
    const raw = Math.abs(i - f)
    return Math.min(raw, count - raw)
  }

  const cardWidth = `calc(${cardHeight} * 9 / 16)`

  return (
    <div ref={stageRef} className="reel-stage reel-orbit relative h-full w-full">
      {/* The orbit path */}
      <div
        ref={pathRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{
          border: '1px dashed rgba(var(--tone-rgb), 0.28)',
          boxShadow: '0 0 60px -10px rgba(var(--tone-rgb), 0.25), inset 0 0 60px -10px rgba(var(--tone-rgb), 0.15)',
        }}
      />

      {children}

      {slots.map((reel, i) => {
        const distance = Math.min(gap(i, front), gap(i, second))
        return (
          <div
            key={`${reel.key}-${i}`}
            data-orbit-card
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{ width: cardWidth, height: cardHeight }}
          >
            <VideoCard reel={reel} active={distance === 0} near={distance <= 1} playing={inView && distance === 0} />
            <div
              data-shade
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 rounded-[26px] bg-[#05081a]"
              style={{ opacity: 0 }}
            />
            <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              {pad((i % n) + 1)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

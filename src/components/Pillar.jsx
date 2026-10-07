import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { resolveReel } from '../data/work'
import { useInView, useIsCarousel } from '../lib/hooks'
import IntroPanel, { PillLabel } from './IntroPanel'
import VideoCard from './VideoCard'
import PillarShowcase from './PillarShowcase'
import PillarOrbit from './PillarOrbit'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* Ring tuning */
const SLOTS = 10           // minimum cards around the ring (reels repeat to fill it)
const SLOTS_PHONE = 8      // phones: fewer, bigger cards
const MAX_SLOTS = 24       // cap — more cards are added only to close up wide gaps
const MIN_UNIQUE = 6       // with this many distinct reels each shows once — no repeats on the ring
const UNIQUE_SPREAD = 1.35 // …and the ring may open up to this × its tightest size to fill the stage
const BASE_SPEED = 11      // deg / second, front cards travel away from the intro
const HOVER_FACTOR = 0.1   // fraction of BASE_SPEED kept while hovered / focused
const SCROLL_BOOST = 0.04  // extra degrees of spin per px scrolled
const GAP_RATIO = 0.08     // minimum space between neighbours, as a fraction of card width
const FILL = 0.94          // how much of the stage width the ring spreads across
const FRONT_LIFT = 0.06    // the front card moves this much (× radius) out of the ring…
const FRONT_SCALE = 0.05   // …and grows this much, so it stands out

// `variant="showcase"` swaps the 3D ring for the coverflow in PillarShowcase,
// `variant="orbit"` for the elliptical orbit in PillarOrbit
export default function Pillar({ pillar, index, variant }) {
  const isCarousel = useIsCarousel()

  const reels = useMemo(() => {
    const original = pillar.reels || []
    if (!original.length) {
      return Array.from({ length: 6 }, (_, i) => ({
        key: `${pillar.id}-soon-${i}`,
        placeholder: true,
        caption: `${pillar.label} — coming soon`,
        warm: pillar.tone === 'warm',
      }))
    }

    return original.map((reel) => resolveReel(reel, pillar))
  }, [pillar])

  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, '10% 0px')

  const Layout = isCarousel ? PillarMobile : PillarDesktop

  return (
    <div
      id={pillar.id}
      ref={sectionRef}
      className="relative z-10 w-full overflow-hidden bg-[var(--navy)]"
    >
      {variant === 'showcase' ? (
        <PillarShowcase pillar={pillar} index={index} inView={inView} stacked={isCarousel} />
      ) : variant === 'orbit' ? (
        <PillarOrbit pillar={pillar} index={index} inView={inView} stacked={isCarousel} />
      ) : (
        <Layout pillar={pillar} index={index} reels={reels} inView={inView} />
      )}
    </div>
  )
}


/* ============================================================
   3D REEL RING
   Cards sit on a cylinder (rotateY · translateZ) and the
   whole ring spins. GSAP's ticker drives the rotation;
   drag to spin it by hand, release for inertia. The card
   swinging past the front lifts out a little and lights up.
============================================================ */

// `centerFront` cancels the drop the tilt gives the front cards, so they sit centred in the box (phones)
function ReelRing({ reels, inView, cardHeight, tone, tilt = -9, direction = 1, minSlots = SLOTS, centerFront = false, onActiveChange }) {
  const stageRef = useRef(null)
  const ringRef = useRef(null)

  /* Slot index currently facing the viewer */
  const [front, setFront] = useState(0)
  const n = reels.length
  // Enough distinct reels to go round: one card each, never repeated.
  // Fewer: they repeat to fill the ring (more cards on wide stages).
  const unique = n >= MIN_UNIQUE
  const fewestSlots = unique ? n : minSlots
  const mostSlots = unique ? n : MAX_SLOTS

  /* Cards on the ring — grows on wide stages so neighbours stay close */
  const [slotCount, setSlotCount] = useState(fewestSlots)
  /* Ring angle survives a re-layout when the card count changes */
  const rotRef = useRef(0)

  const inViewRef = useRef(inView)
  const onActiveRef = useRef(onActiveChange)

  useEffect(() => {
    inViewRef.current = inView
  }, [inView])

  useEffect(() => {
    onActiveRef.current = onActiveChange
  }, [onActiveChange])

  const slots = useMemo(
    () => (n ? Array.from({ length: slotCount }, (_, i) => reels[i % n]) : []),
    [reels, n, slotCount],
  )

  useEffect(() => {
    if (n) onActiveRef.current?.(front % n)
  }, [front, n])

  useGSAP(
    () => {
      const stage = stageRef.current
      const ring = ringRef.current
      if (!stage || !ring) return

      const cards = gsap.utils.toArray('[data-reel]', ring)
      const shades = gsap.utils.toArray('[data-shade]', ring)
      const N = cards.length
      if (!N) return

      const step = 360 / N

      let radius = 0
      let rot = rotRef.current
      let vel = BASE_SPEED * direction
      let lastScroll = window.scrollY
      let lastFront = -1
      let hovering = false
      let focused = false
      let drag = null
      let draggedPx = 0

      const render = () => {
        rotRef.current = rot
        const shiftY = centerFront ? radius * Math.sin((tilt * Math.PI) / 180) : 0
        ring.style.transform =
          `translateY(${shiftY}px) translateZ(${-radius}px) rotateX(${tilt}deg) rotateY(${rot}deg)`

        for (let i = 0; i < N; i++) {
          const facing = (Math.cos(((i * step + rot) * Math.PI) / 180) + 1) / 2
          // The card at the front lifts out of the ring a little
          const lift = facing ** 10
          cards[i].style.transform =
            `rotateY(${i * step}deg) translateZ(${radius + lift * radius * FRONT_LIFT}px) scale(${1 + lift * FRONT_SCALE})`
          // Cards darken as they turn away, like the back of the ring
          shades[i].style.opacity = ((1 - facing) * 0.8).toFixed(3)
        }

        const f = ((Math.round(-rot / step) % N) + N) % N
        if (f !== lastFront) {
          lastFront = f
          setFront(f)
        }
      }

      const measure = () => {
        const w = cards[0].offsetWidth
        if (!w) return

        // Radius that makes the projected ring span FILL of the stage.
        // (With perspective = 2.6R the widest point sits at ≈0.73R + 0.2w.)
        const fitRadius = ((stage.clientWidth * FILL) / 2 - w * 0.2) / 0.73

        // Keep the ring that size and fill it with as many cards as fit
        // GAP_RATIO apart, instead of spreading a few cards far apart.
        const chord = Math.min(1, (w * (1 + GAP_RATIO)) / (2 * fitRadius))
        const wanted = gsap.utils.clamp(fewestSlots, mostSlots, Math.floor(Math.PI / Math.asin(chord)))
        if (wanted !== N) {
          setSlotCount(wanted) // re-runs this effect with the new cards
          return
        }

        // Smallest radius that fits N cards without touching (narrow stages)
        const minRadius = (w * (1 + GAP_RATIO)) / (2 * Math.tan(Math.PI / N))
        // A fixed set of unique cards stays close together rather than
        // spreading thin across a wide stage
        radius = unique
          ? Math.max(minRadius, Math.min(fitRadius, minRadius * UNIQUE_SPREAD))
          : Math.max(minRadius, fitRadius)
        stage.style.perspective = `${radius * 2.6}px`

        render()
      }

      const tick = (_time, deltaTime) => {
        // Track scroll even off-screen so there's no jump on entry
        const y = window.scrollY
        const scrolled = Math.min(Math.abs(y - lastScroll), 120)
        lastScroll = y

        if (!inViewRef.current || !radius || drag) return

        const dt = Math.min(deltaTime, 50) / 1000
        const target = BASE_SPEED * direction * (hovering || focused ? HOVER_FACTOR : 1)

        // Ease toward the target speed — also bleeds off drag inertia
        vel += (target - vel) * (1 - Math.exp(-dt * 3))

        rot = (rot + vel * dt + scrolled * SCROLL_BOOST) % 360
        render()
      }

      /* ── Drag to spin ─────────────────────────────────── */
      const toDeg = (px) => (px / radius) * (180 / Math.PI)

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
        vel = gsap.utils.clamp(-240, 240, drag.v)
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
    {
      scope: stageRef,
      dependencies: [slots.length, tilt, direction, minSlots, centerFront],
    },
  )

  const cardWidth = `calc(${cardHeight} * 9 / 16)`
  const warm = tone === 'warm'

  return (
    <div
      ref={stageRef}
      className="reel-stage relative flex h-full w-full items-center justify-center"
    >
      {/* Spotlight behind the front of the ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: `calc(${cardWidth} * 2.2)`,
          height: `calc(${cardHeight} * 0.85)`,
          background: warm
            ? 'radial-gradient(ellipse at center, rgba(255,122,80,0.2), transparent 65%)'
            : 'radial-gradient(ellipse at center, rgba(83,247,251,0.15), transparent 65%)',
        }}
      />

      {/* Floor shadow + tone glow under the ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%] blur-2xl"
        style={{
          top: `calc(50% + ${cardHeight} / 2 - 10px)`,
          width: `${FILL * 92}%`,
          height: `calc(${cardHeight} * 0.16)`,
          background: warm
            ? 'radial-gradient(ellipse at center, rgba(255,122,80,0.28), rgba(0,0,0,0.55) 45%, transparent 72%)'
            : 'radial-gradient(ellipse at center, rgba(83,247,251,0.22), rgba(0,0,0,0.55) 45%, transparent 72%)',
        }}
      />

      <div
        ref={ringRef}
        className="reel-ring"
        style={{ width: cardWidth, height: cardHeight }}
      >
        {slots.map((reel, i) => {
          const realIndex = i % n
          const raw = Math.abs(i - front)
          const distance = Math.min(raw, slotCount - raw)

          return (
            <div key={`${reel.key}-${i}`} data-reel className="reel-ring__card">
              <VideoCard
                reel={reel}
                active={i === front}
                near={distance <= 1}
                playing={inView && distance <= 1}
              />

              <div
                data-shade
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30 rounded-[26px] bg-[#05081a]"
                style={{ opacity: 0 }}
              />

              <div
                className="
                  absolute
                  left-4
                  top-4
                  z-20
                  rounded-full
                  border
                  border-white/15
                  bg-black/50
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/70
                  pointer-events-none
                "
              >
                {String(realIndex + 1).padStart(2, '0')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


/* ============================================================
   DESKTOP
============================================================ */

function PillarDesktop({ pillar, index, reels, inView }) {
  // 01, 03, 05: intro left, ring right · 02, 04, 06: mirrored
  const flip = index % 2 === 1
  const sectionRef = useRef(null)
  const introRef = useRef(null)
  const ringWrapRef = useRef(null)
  const progressRef = useRef(null)

  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      /* Pin: gives the ring the screen for a moment,
       * scroll spins it faster and drives the intro. */
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 1.2}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Drives the IntroPanel strikethrough + answer reveal
          section.style.setProperty('--p', self.progress)

          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`
          }
        },
      })

      /* Entrance: intro slides in from its own side, the ring
       * from the opposite side while it spins up. */
      const enter = {
        trigger: section,
        start: 'top 85%',
        end: 'top 15%',
        scrub: 0.6,
      }

      gsap.fromTo(
        introRef.current,
        { autoAlpha: 0, x: flip ? 140 : -140 },
        { autoAlpha: 1, x: 0, ease: 'power3.out', scrollTrigger: enter },
      )

      gsap.fromTo(
        ringWrapRef.current,
        { autoAlpha: 0, xPercent: flip ? -45 : 45, scale: 0.85 },
        { autoAlpha: 1, xPercent: 0, scale: 1, ease: 'power3.out', scrollTrigger: enter },
      )
    },
    { scope: sectionRef, dependencies: [flip] },
  )

  return (
    <section
      ref={sectionRef}
      className={`
        relative
        h-[100svh]
        min-h-[720px]
        w-full
        overflow-hidden
        ${
          pillar.tone === 'warm'
            ? flip
              ? 'bg-[radial-gradient(circle_at_32%_50%,rgba(255,122,80,0.12),transparent_55%)]'
              : 'bg-[radial-gradient(circle_at_68%_50%,rgba(255,122,80,0.12),transparent_55%)]'
            : flip
              ? 'bg-[radial-gradient(circle_at_32%_50%,rgba(83,247,251,0.08),transparent_55%)]'
              : 'bg-[radial-gradient(circle_at_68%_50%,rgba(83,247,251,0.08),transparent_55%)]'
        }
      `}
    >
      {/* ── TOP LABEL ───────────────────────────────────── */}
      <div className={`absolute top-24 z-30 ${flip ? 'right-[var(--gutter)]' : 'left-[var(--gutter)]'}`}>
        <PillLabel pillar={pillar} />
      </div>

      {/* ── INTRO (its side, vertically centered) ───────── */}
      <div
        ref={introRef}
        className={`
          absolute
          ${flip ? 'right-[var(--gutter)]' : 'left-[var(--gutter)]'}
          top-1/2
          -translate-y-1/2
          z-20
          pointer-events-none
          w-[min(420px,32vw)]
        `}
      >
        <IntroPanel pillar={pillar} index={index} align={flip ? 'right' : 'left'} />
      </div>

      {/* ── 3D RING (opposite side to the intro) ────────── */}
      <div
        ref={ringWrapRef}
        className={`absolute inset-y-0 z-10 ${flip ? 'left-0' : 'right-0'}`}
        style={{ [flip ? 'right' : 'left']: 'calc(var(--gutter) + min(420px, 32vw))' }}
      >
        <ReelRing
          reels={reels}
          inView={inView}
          tone={pillar.tone}
          cardHeight="min(60vh, 600px)"
          direction={flip ? -1 : 1}
          onActiveChange={setActive}
        />
      </div>
      

      {/* ── BOTTOM INFO ─────────────────────────────────── */}
      <div
        className={`
          absolute
          bottom-10
          left-[var(--gutter)]
          right-[var(--gutter)]
          z-30
          flex
          ${flip ? 'flex-row-reverse' : ''}
          items-end
          justify-between
          pointer-events-none
        `}
      >
        <div
          className="
            flex
            items-center
            gap-3
            text-xs
            uppercase
            tracking-[0.25em]
            text-white/40
          "
        >
          {reels[0]?.placeholder ? (
            <span>Reels coming soon</span>
          ) : (
            <>
              <span className="text-white">
                {String(active + 1).padStart(2, '0')}
              </span>
              <span>/</span>
              <span>{String(reels.length).padStart(2, '0')}</span>
              <span className="hidden md:block">REELS</span>
            </>
          )}
        </div>

        <div
          className="
            hidden
            md:flex
            items-center
            gap-3
            text-xs
            uppercase
            tracking-[0.25em]
            text-white/40
          "
        >
          <span>Drag to spin</span>
          <span
            className={`
              text-xl
              ${
                pillar.tone === 'warm'
                  ? 'text-[var(--amber)]/80'
                  : 'text-[var(--cyan)]/80'
              }
            `}
          >
            ⟳
          </span>
        </div>
      </div>

      {/* ── PROGRESS BAR ────────────────────────────────── */}
      <div
        className="
          absolute
          bottom-5
          left-[var(--gutter)]
          right-[var(--gutter)]
          z-30
          h-[2px]
          overflow-hidden
          rounded-full
          bg-white/10
        "
      >
        <div
          ref={progressRef}
          className={`
            h-full
            w-full
            ${flip ? 'origin-right bg-gradient-to-l' : 'origin-left bg-gradient-to-r'}
            scale-x-0
            from-orange-400
            via-orange-300
            to-cyan-300
            shadow-[0_0_16px_rgba(83,247,251,0.6)]
          `}
        />
      </div>
    </section>
  )
}


/* ============================================================
   MOBILE
============================================================ */

function PillarMobile({ pillar, index, reels, inView }) {
  const [active, setActive] = useState(0)

  const cardHeight = 'min(calc(66vw * 16 / 9), 62svh)'

  return (
    <section
      className={`
        relative
        overflow-hidden
        pt-7
        pb-4
        ${pillar.tone === 'warm' ? 'bg-[#120d16]' : 'bg-[#0b1229]'}
      `}
      /* No scroll scrub on mobile — reveal the strikethrough once in view */
      style={{
        '--p': inView ? 1 : 0,
        transition: '--p 1.8s var(--ease)',
      }}
    >
      <div className="px-5 sm:px-8">
        <IntroPanel pillar={pillar} index={index} compact />
      </div>

      <div className="mt-3" style={{ height: `calc(${cardHeight} * 1.06)` }}>
        <ReelRing
          reels={reels}
          inView={inView}
          tone={pillar.tone}
          cardHeight={cardHeight}
          minSlots={SLOTS_PHONE}
          centerFront
          onActiveChange={setActive}
        />
      </div>

      <div
        className="
          mt-4
          flex
          justify-center
          text-xs
          uppercase
          tracking-[0.25em]
          text-white/40
        "
      >
        {reels[0]?.placeholder ? (
          'Reels coming soon'
        ) : (
          <>
            <span className="text-white">
              {String(active + 1).padStart(2, '0')}
            </span>
            <span className="mx-3">/</span>
            {String(reels.length).padStart(2, '0')}
            <span className="ml-3">REELS</span>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {reels.map((reel, i) => (
          <span
            key={`${reel.key}-dot-${i}`}
            className={`
              h-1.5
              rounded-full
              transition-all
              duration-500
              ${i === active ? 'w-8 bg-orange-400' : 'w-1.5 bg-white/20'}
            `}
          />
        ))}
      </div>
    </section>
  )
}





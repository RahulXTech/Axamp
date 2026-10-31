import { useEffect, useRef, useState } from 'react'
import { BookOpen, Clapperboard, Clock, Drone, Flame, MessagesSquare, MoveHorizontal, Share2, Sparkles } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useMediaQuery } from '../lib/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ------------------------------------------------------------------
   "Content that matters" — the photo cards stand around a 3D circle
   that turns by itself. The front card is big and bright; towards the
   back they shrink, rise and darken. Every card keeps facing you, so
   nothing is ever mirrored.

   Phones / tablets: the front turns left → right.
   Desktop: the circle spans the whole screen at an angle — cards come
   out of the screen from the top right and land big at the bottom left.

   Autoplay, card by card: GSAP's ticker holds a card at the front for
   HOLD_S (its progress bar fills; paused while hovered or off screen),
   then glides the next one round. Drag / swipe to spin it (with
   inertia) — it settles on the nearest card; tap a side card or a dot
   to bring that one round. Each time the circle comes into view it
   flies in from the top right, spinning, and settles on a card;
   scrolling up it sinks and leans (top-right → bottom-left).

   Positions are computed per card (2D translate + scale, a small turn
   of its own) rather than one shared 3D scene — far lighter on phones.
------------------------------------------------------------------ */

const icons = {
  clapperboard: Clapperboard, clock: Clock, book: BookOpen,
  flame: Flame, sparkles: Sparkles, messages: MessagesSquare,
  drone: Drone, share: Share2,
}

const HOLD_S = 4          // seconds each card stays at the front
const GLIDE_S = 1.1       // seconds to turn to the next / a picked card
const SNAP_S = 0.55       // seconds to settle on the nearest card after a spin
const SPIN_IN_S = 1.7     // seconds of the full spin as the circle flies in
const RADIUS = 0.34       // circle radius, as a share of the stage width…
const RADIUS_NARROW = 0.42 // …wider on phones, so the side cards peek out past the front one
const MAX_RADIUS = 440    // …capped on wide screens
const BACK_SCALE = 0.44   // how much smaller the card at the very back is
const TURN = 26           // deg a card at the side turns, as if on a cylinder
// Desktop: a wide circle seen at an angle, filling the screen edge to edge —
// its back sits small and deep at the top right (inside the screen), its
// front big at the bottom left (out of it). Shares of the stage size:
const WIDE = { dx: 0.25, dy: 0.14, mx: 0.33, my: 0.08 }
const WIDE_BACK_SCALE = 0.66 // front 1.08 → back 0.42
const LEAN_Y = 28         // px the circle sinks (scrolling up) / rises (down) at full lean
const LEAN_RX = 9         // deg of 3D tilt at full lean
const LEAN_RY = 6

const pad = (n) => String(n).padStart(2, '0')

function Card({ item, index, front, onPick }) {
  const Icon = icons[item.icon]
  const tone = item.warm ? '255,122,80' : '83,247,251'

  return (
    // Outer: placed on the circle (GSAP) · inner: tilts toward the cursor
    <li
      data-cr-card
      onClick={() => onPick(index)}
      aria-current={front || undefined}
      className="absolute left-1/2 top-1/2 w-[62vw] max-w-[250px] cursor-pointer min-[640px]:w-[290px] min-[640px]:max-w-none lg:w-[380px] xl:w-[420px]"
      style={{ '--tone': tone }}
    >
      <div
        data-cr-tilt
        className={`
          group relative flex flex-col overflow-hidden
          rounded-[26px] border
          bg-[linear-gradient(165deg,rgba(22,33,74,0.92),rgba(11,18,41,0.98))]
          transition-[border-color,box-shadow] duration-500 ease-[var(--ease)]
          ${front
            ? 'border-[rgba(var(--tone),0.5)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_0_50px_-12px_rgba(var(--tone),0.6)]'
            : 'border-white/[0.08] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]'}
        `}
      >
        {/* Photo */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.07]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,41,0.15)_0%,transparent_35%,rgba(11,18,41,0.92)_100%)]" />

          {/* Autoplay: time left at the front */}
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 bottom-0 h-[3px] bg-white/10 transition-opacity duration-500 ${front ? 'opacity-100' : 'opacity-0'}`}
          >
            <span
              data-cr-progress
              className="block h-full origin-left bg-[rgb(var(--tone))] shadow-[0_0_10px_rgba(var(--tone),0.9)]"
              style={{ transform: 'scaleX(0)' }}
            />
          </span>

          <span className="absolute left-3.5 top-3.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 font-[family-name:var(--font-display)] text-[11px] font-bold tracking-[0.16em] text-white/90">
            {pad(index + 1)}
          </span>
        </div>

        {/* Copy — the icon straddles the photo's bottom edge */}
        <div className="relative flex flex-1 flex-col gap-2 px-5 pb-5 pt-8 max-[640px]:px-4 max-[640px]:pb-4">
          <span
            className="absolute -top-[22px] left-5 grid h-11 w-11 place-items-center rounded-2xl border bg-[var(--navy)] transition-transform duration-500 ease-[var(--ease)] group-hover:-rotate-6 group-hover:scale-110 max-[640px]:left-4"
            style={{ borderColor: `rgba(${tone},0.5)`, color: `rgb(${tone})`, boxShadow: `0 12px 24px -10px rgba(0,0,0,0.9), 0 0 22px -6px rgba(${tone},0.7)` }}
          >
            {Icon && <Icon size={19} strokeWidth={1.9} aria-hidden="true" />}
          </span>

          <h3 className="m-0 font-[family-name:var(--font-display)] text-[19px] font-[700] tracking-[-0.015em] text-white max-[640px]:text-[17px] lg:text-[21px] xl:text-[23px]">
            {item.title}
          </h3>
          <p className="m-0 mb-3 text-[14px] leading-[1.55] text-[var(--muted)] max-[640px]:text-[13px] lg:text-[15px]">{item.text}</p>
          <span
            aria-hidden="true"
            className={`mt-auto h-[2px] rounded-full transition-[width] duration-500 ease-[var(--ease)] ${front ? 'w-20' : 'w-10'}`}
            style={{ background: `linear-gradient(90deg, rgb(${tone}), transparent)` }}
          />
        </div>

        {/* Light that follows the cursor across the tilted card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(420px circle at var(--gx, 50%) var(--gy, 0%), rgba(255,255,255,0.12), transparent 45%)' }}
        />

        {/* Darkens as the card turns away to the back of the circle */}
        <div data-cr-shade aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#05081a]" style={{ opacity: 0 }} />
      </div>
    </li>
  )
}

export default function ContentCarousel({ items }) {
  const n = items.length
  const step = 360 / n

  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const ringRef = useRef(null)
  const seekRef = useRef(null) // set to an angle to glide the circle there
  const rotRef = useRef(0)
  const dirRef = useRef(1) // which way the autoplay turns (see `dir` below)
  const [front, setFront] = useState(0)

  const inView = useInView(rootRef, '0px')
  const inViewRef = useRef(inView)
  useEffect(() => {
    inViewRef.current = inView
  }, [inView])
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Bring card i to the front by the shortest way round
  const pick = (i) => {
    const rot = rotRef.current
    const target = dirRef.current * i * step
    const diff = ((((target - rot) % 360) + 540) % 360) - 180
    seekRef.current = rot + diff
  }

  useGSAP(
    () => {
      const root = rootRef.current
      const stage = stageRef.current
      const ring = ringRef.current
      const cards = gsap.utils.toArray('[data-cr-card]', ring)
      const shades = cards.map((c) => c.querySelector('[data-cr-shade]'))
      const bars = cards.map((c) => c.querySelector('[data-cr-progress]'))
      if (!cards.length) return

      // Phones / tablets get a gentler lean and fly-in
      const touch = window.matchMedia('(pointer: coarse)').matches
      const leanAmt = touch ? 0.55 : 1

      let radius = 0
      let lift = 0
      let wide = false // desktop layout (see WIDE)
      let W = 0
      let H = 0
      let dir = 1 // desktop turns the other way: cards come top-right → bottom-left
      let rot = rotRef.current
      let vel = 0
      let scrollVel = 0 // page scroll per frame, smoothed (negative = scrolling up)
      let lean = 0 // -1 … 1, follows scrollVel
      let hovering = false
      let drag = null
      let draggedPx = 0
      let lastScroll = window.scrollY
      let lastFront = -1
      let glide = null // { from, to, t, dur } — an eased turn in progress
      let held = 0 // seconds the front card has been held
      let barFront = -1 // card whose progress bar is filled

      const measure = () => {
        W = stage.clientWidth
        H = stage.clientHeight
        wide = W >= 1024
        dir = wide ? -1 : 1
        dirRef.current = dir
        // Drag maths uses this as the circle's radius
        radius = wide ? W * WIDE.mx : Math.min(W * (W < 640 ? RADIUS_NARROW : RADIUS), MAX_RADIUS)
        // Cards at the back rise by this much — the circle is seen from slightly above
        lift = Math.min(H * 0.16, 80)
      }

      /* Place every card on the circle — one style write per card */
      const render = () => {
        rotRef.current = rot
        let best = 0
        let bestC = -2
        for (let i = 0; i < n; i++) {
          // Cards are laid round against the turning direction, so the
          // autoplay always counts up: 01 → 02 → 03 …
          const a = ((-dir * i * step + rot) * Math.PI) / 180
          const s = Math.sin(a)
          const c = Math.cos(a) // 1 = front, -1 = back
          const depth = (1 - c) / 2
          if (wide) {
            // Tilted ellipse: front bottom-left, back top-right, sides at the
            // lower right and upper left. Cards at the back lean into the screen.
            const x = -c * W * WIDE.dx + s * W * WIDE.mx
            const y = c * H * WIDE.dy + s * H * WIDE.my
            const scale = 1.08 - depth * WIDE_BACK_SCALE
            cards[i].style.transform =
              `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) ` +
              `perspective(1000px) rotateY(${s * 22}deg) rotateX(${depth * 12}deg) scale(${scale})`
          } else {
            const scale = 1 - depth * BACK_SCALE
            cards[i].style.transform =
              `translate(-50%, -50%) translate3d(${radius * s}px, ${-depth * lift}px, 0) ` +
              `perspective(900px) rotateY(${s * TURN}deg) scale(${scale})`
          }
          cards[i].style.zIndex = String(Math.round(c * 100) + 100)
          shades[i].style.opacity = (depth * 0.78).toFixed(3)
          if (c > bestC) {
            bestC = c
            best = i
          }
        }
        if (best !== lastFront) {
          lastFront = best
          setFront(best)
        }

        // The whole circle sinks and leans while you scroll up (rises, scrolling down)
        stage.style.transform =
          `perspective(1200px) translate3d(0, ${-lean * LEAN_Y * leanAmt}px, 0) ` +
          `rotateX(${-lean * LEAN_RX * leanAmt}deg) rotateY(${lean * LEAN_RY * leanAmt}deg)`
      }

      const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)
      const easeOut = (p) => 1 - (1 - p) ** 3
      const turnTo = (to, dur, curve = easeInOut) => {
        glide = { from: rot, to, t: 0, dur, curve }
        held = 0
      }

      // Fill the front card's bar; empty the previous front's
      const showProgress = () => {
        if (barFront !== lastFront) {
          if (barFront >= 0) bars[barFront].style.transform = 'scaleX(0)'
          barFront = lastFront
        }
        if (barFront >= 0) bars[barFront].style.transform = `scaleX(${(held / HOLD_S).toFixed(4)})`
      }

      const tick = (_t, deltaTime) => {
        const y = window.scrollY
        const delta = gsap.utils.clamp(-120, 120, y - lastScroll)
        lastScroll = y
        if (!inViewRef.current || drag?.on) return

        const dt = Math.min(deltaTime, 50) / 1000
        const ease = (rate) => 1 - Math.exp(-dt * rate)
        // Touch scrolling reports position in uneven jumps — smooth it
        scrollVel += (delta - scrollVel) * ease(10)

        // A card was picked (tap / dot)
        if (seekRef.current !== null) {
          turnTo(seekRef.current, GLIDE_S)
          seekRef.current = null
          vel = 0
        }

        if (glide) {
          // Eased turn — starts gently, lands softly
          glide.t = Math.min(glide.t + dt, glide.dur)
          rot = glide.from + (glide.to - glide.from) * glide.curve(glide.t / glide.dur)
          if (glide.t >= glide.dur) glide = null
        } else if (Math.abs(vel) > 4) {
          // Coasting after a drag or the spin-in — bleeds off…
          vel -= vel * ease(2.2)
          rot += vel * dt
        } else {
          // …then settles on the next card in the direction it was going
          const way = Math.sign(vel) || dir
          vel = 0
          const settle = (way > 0 ? Math.ceil : Math.floor)(rot / step - 1e-6 * way) * step
          if (Math.abs(rot - settle) > 0.05) turnTo(settle, SNAP_S)
          else if (!reduced) {
            // Autoplay: hold, then turn to the next card
            if (!hovering) held += dt
            if (held >= HOLD_S) turnTo(settle + dir * step, GLIDE_S)
          }
        }

        // Keep the angle small — and shift a turn in progress with it, so
        // one that crosses a full turn doesn't whirl round again
        if (Math.abs(rot) >= 360) {
          const turns = Math.trunc(rot / 360) * 360
          rot -= turns
          if (glide) {
            glide.from -= turns
            glide.to -= turns
          }
        }

        if (!reduced) lean += (gsap.utils.clamp(-1, 1, scrollVel / 40) - lean) * ease(5)
        render()
        showProgress()
      }

      /* ── Drag / swipe to spin ─────────────────────────── */
      const toDeg = (px) => (px / Math.max(radius, 1)) * (180 / Math.PI)

      const onMove = (e) => {
        const dx = e.clientX - drag.x
        if (!drag.on) {
          // Only take over horizontal gestures — vertical swipes still scroll the page
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return
          drag.on = true
          seekRef.current = null
          glide = null
          held = 0
          stage.classList.add('is-dragging')
        }
        const now = performance.now()
        const dt = Math.max(now - drag.t, 1) / 1000
        const d = toDeg(dx)
        drag.v = drag.v * 0.6 + (d / dt) * 0.4
        drag.moved += Math.abs(dx)
        drag.x = e.clientX
        drag.t = now
        rot = (rot + d) % 360
        render()
      }
      const onUp = () => {
        if (drag?.on) vel = gsap.utils.clamp(-260, 260, drag.v)
        draggedPx = drag?.moved ?? 0
        drag = null
        stage.classList.remove('is-dragging')
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }
      const onDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        drag = { x: e.clientX, y: e.clientY, t: performance.now(), v: 0, moved: 0, on: false }
        draggedPx = 0
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
      }
      // A drag shouldn't also pick the card under the pointer
      const onClickCapture = (e) => {
        if (draggedPx > 6) {
          e.stopPropagation()
          e.preventDefault()
        }
        draggedPx = 0
      }
      const onOver = (e) => {
        if (e.pointerType === 'mouse') hovering = true
      }
      const onOut = () => (hovering = false)

      stage.addEventListener('pointerdown', onDown)
      stage.addEventListener('click', onClickCapture, true)
      // Hovering a card (not the whole, screen-wide stage) pauses the autoplay
      cards.forEach((c) => {
        c.addEventListener('pointerenter', onOver)
        c.addEventListener('pointerleave', onOut)
      })

      measure()
      render()
      gsap.ticker.add(tick)

      const ro = new ResizeObserver(() => {
        measure()
        render()
      })
      ro.observe(stage)

      /* Entrance — every time the circle comes into view, scrolling either
       * way: it flies in out of depth from the top right */
      let flownAt = 0
      const flyIn = () => {
        // ScrollTrigger may report the same entrance twice on load
        if (performance.now() - flownAt < 200) return
        flownAt = performance.now()
        const w = window.innerWidth
        gsap.fromTo(
          ring,
          touch
            ? { x: w * 0.4, y: -110, scale: 0.8, rotation: 4, autoAlpha: 0 }
            : { x: w * 0.3, y: -170, scale: 0.72, rotation: 6, autoAlpha: 0 },
          {
            x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1,
            duration: touch ? 1.05 : 1.3,
            ease: touch ? 'power3.out' : 'expo.out',
            force3D: true,
            overwrite: true,
          },
        )
        // …spinning in: one fast full turn that lands back on the card it
        // left (card 01 the first time), then the autoplay carries on
        if (!reduced) {
          vel = 0
          turnTo(Math.round(rot / step) * step + dir * 360, SPIN_IN_S, easeOut)
        }
      }
      // Hidden while away, so the next entrance can play
      const hide = () => gsap.set(ring, { autoAlpha: 0 })

      if (!reduced) {
        hide()
        const st = ScrollTrigger.create({
          trigger: root,
          start: 'top 85%',
          end: 'bottom 15%',
          onEnter: flyIn,
          onEnterBack: flyIn,
          onLeave: hide,
          onLeaveBack: hide,
        })
        // Page opened with the circle already on screen
        if (st.isActive) flyIn()
      }

      /* Hover (mouse): the card tilts toward the cursor, a light follows it */
      const tiltOff = reduced || touch
        ? []
        : gsap.utils.toArray('[data-cr-tilt]', ring).map((el) => {
            gsap.set(el, { transformPerspective: 900 })
            const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
            const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
            const move = (e) => {
              if (e.pointerType !== 'mouse' || drag?.on) return
              const r = el.getBoundingClientRect()
              const px = (e.clientX - r.left) / r.width
              const py = (e.clientY - r.top) / r.height
              ry((px - 0.5) * 14)
              rx((0.5 - py) * 10)
              el.style.setProperty('--gx', `${px * 100}%`)
              el.style.setProperty('--gy', `${py * 100}%`)
            }
            const leave = () => {
              rx(0)
              ry(0)
            }
            el.addEventListener('pointermove', move)
            el.addEventListener('pointerleave', leave)
            return () => {
              el.removeEventListener('pointermove', move)
              el.removeEventListener('pointerleave', leave)
            }
          })

      return () => {
        gsap.ticker.remove(tick)
        ro.disconnect()
        tiltOff.forEach((off) => off())
        if (drag) onUp()
        stage.removeEventListener('pointerdown', onDown)
        stage.removeEventListener('click', onClickCapture, true)
        cards.forEach((c) => {
          c.removeEventListener('pointerenter', onOver)
          c.removeEventListener('pointerleave', onOut)
        })
      }
    },
    { scope: rootRef, dependencies: [items, reduced] },
  )

  return (
    <div ref={rootRef} className="relative mt-10 max-[640px]:mt-6">
      {/* Desktop: the stage spans the full screen width, edge to edge */}
      <div
        ref={stageRef}
        className="cr-stage relative h-[420px] min-[640px]:h-[480px] lg:left-1/2 lg:h-[720px] lg:w-screen lg:-translate-x-1/2 xl:h-[760px]"
      >
        {/* Floor glow under the front of the circle (bottom-left on desktop) */}
        <div
          aria-hidden="true"
          className="glow pointer-events-none absolute bottom-[8%] left-1/2 h-[90px] w-[70%] -translate-x-1/2 rounded-[50%] blur-2xl lg:bottom-[3%] lg:left-[25%] lg:w-[40%]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(83,247,251,0.22), rgba(0,0,0,0.5) 45%, transparent 72%)' }}
        />

        <ul ref={ringRef} aria-label="Content that matters" className="relative m-0 h-full list-none p-0">
          {items.map((item, i) => (
            <Card key={item.title} item={item} index={i} front={i === front} onPick={pick} />
          ))}
        </ul>
      </div>

      {/* Which card is at the front — tap a dot to bring it round */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => pick(i)}
              aria-label={`Show ${item.title}`}
              aria-current={i === front || undefined}
              className={`relative h-2 rounded-full transition-[width,background-color] duration-500 ease-[var(--ease)] before:absolute before:-inset-x-1 before:-inset-y-4 ${
                i === front ? 'w-7 bg-[var(--cyan)] shadow-[0_0_10px_rgba(83,247,251,0.7)]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
        <p className="m-0 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">
          <MoveHorizontal size={15} aria-hidden="true" />
          Drag to spin
        </p>
      </div>
    </div>
  )
}

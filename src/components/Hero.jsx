import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Building2, GraduationCap, Play, UserRound } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { scrollToTarget } from '../lib/scroll'
import { useMediaQuery } from '../lib/hooks'
import { useIndustry } from '../lib/industry'
import { services } from '../data/services'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const serviceIcons = { building: Building2, user: UserRound, graduation: GraduationCap }

export default function Hero() {
  const heroRef = useRef(null)
  const videoRef = useRef(null)
  const contentRef = useRef(null)
  const shadeRef = useRef(null)
  // Portrait phones / tablets get the lighter vertical cut
  const isMobile = useMediaQuery('(max-width: 900px) and (orientation: portrait)')

  // Shared with the sections below, which swap to match
  const { industry, setIndustry } = useIndustry()
  const active = Math.max(0, services.findIndex((s) => s.id === industry))
  // Swap animation only after the first switch (the page-load `rise` covers the initial reveal)
  const [switched, setSwitched] = useState(false)
  const svc = services[active]

  const select = (i) => {
    if (i === active) return
    setIndustry(services[i].id)
    setSwitched(true)
  }

  /* The hero stays pinned (no extra spacing) while the next
   * section slides up over it: the video drifts in, the copy
   * lifts away and the whole frame dims underneath. */
  useGSAP(
    () => {
      const hero = heroRef.current
      const scrub = {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }

      // Once fully covered, hide it and pause the video (saves GPU)
      const covered = (yes) => {
        gsap.set(hero, { visibility: yes ? 'hidden' : 'visible' })
        const v = videoRef.current
        if (v) yes ? v.pause() : v.play().catch(() => {})
      }

      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        onLeave: () => covered(true),
        onEnterBack: () => covered(false),
      })

      gsap.to(videoRef.current, { scale: 1.18, ease: 'none', scrollTrigger: scrub })
      gsap.to(contentRef.current, { yPercent: -18, autoAlpha: 0, ease: 'none', scrollTrigger: scrub })
      gsap.fromTo(shadeRef.current, { opacity: 0 }, { opacity: 0.75, ease: 'none', scrollTrigger: scrub })
    },
    { scope: heroRef },
  )

  // Staggered entrance for each piece of copy when the service changes
  const swap = (delay) =>
    switched ? { animation: `swap 0.8s var(--ease) ${delay}ms both` } : undefined

  const CtaIcon = svc.cta.icon === 'arrow' ? ArrowRight : Play

  return (
    <section
      ref={heroRef}
      id="top"
      className="
        relative
        h-screen h-[100svh] min-h-[560px]
        overflow-hidden

        bg-[#0b1229]
      "
    >
      {/* ── BACKGROUND VIDEO ───────────────────────────── */}
      <video
        ref={videoRef}
        className="
          absolute inset-0
          w-full h-full
          object-cover
          z-0

          scale-[1.04]
        "
        src={isMobile ? '/assets/Hero_section_mobile.mp4' : '/assets/Hero_section.mp4'}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />

      {/* ── VIGNETTE / READABILITY OVERLAY ─────────────── */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0
          pointer-events-none
          z-10

          bg-[linear-gradient(90deg,rgba(11,18,41,0.88)_0%,rgba(11,18,41,0.45)_45%,rgba(11,18,41,0.15)_75%,transparent_100%),
              linear-gradient(0deg,rgba(11,18,41,0.95)_0%,rgba(11,18,41,0.30)_30%,transparent_55%),
              linear-gradient(180deg,rgba(11,18,41,0.55)_0%,transparent_25%)]

          max-[900px]:bg-[linear-gradient(0deg,rgba(11,18,41,0.98)_8%,rgba(11,18,41,0.65)_40%,rgba(11,18,41,0.20)_70%,transparent_100%)]
        "
      />

      {/* Accent tint per service — cross-fades as the service changes */}
      {services.map((s, i) => (
        <div
          key={s.id}
          aria-hidden="true"
          className="
            absolute inset-0
            pointer-events-none
            z-10

            mix-blend-screen
            transition-opacity duration-[900ms] ease-[var(--ease)]
          "
          style={{
            opacity: i === active ? 1 : 0,
            background: `radial-gradient(900px 600px at 75% 45%, rgba(${s.accentRgb}, 0.10), transparent 65%)`,
          }}
        />
      ))}

      {/* Darkens as the next section covers the hero */}
      <div
        ref={shadeRef}
        aria-hidden="true"
        className="absolute inset-0 z-[25] pointer-events-none bg-[#05081a] opacity-0"
      />

      <div ref={contentRef} className="absolute inset-0 z-20">
        {/* ── CONTENT ────────────────────────────────────── */}
        <div
          className="
            absolute
            left-[var(--gutter)] right-[var(--gutter)]
            bottom-[16vh]
            max-[640px]:bottom-[88px]

            z-20

            flex flex-col items-start gap-6
            max-[640px]:gap-4

            [animation:rise_1.2s_var(--ease)_0.2s_both]
          "
          style={{ '--accent': svc.accent, '--accent-rgb': svc.accentRgb }}
        >
          <ServiceSwitch active={active} onSelect={select} />

          <div
            id="hero-service-panel"
            role="tabpanel"
            aria-labelledby={`hero-tab-${svc.id}`}
            className="flex flex-col items-start gap-6 max-[640px]:gap-4"
          >
            {/* Eyebrow */}
            <p
              key={`eyebrow-${svc.id}`}
              style={swap(0)}
              className="
                font-semibold text-[12px] leading-none
                tracking-[0.28em] uppercase
                text-[rgba(var(--accent-rgb),0.90)]
                font-[family-name:var(--font-ui)]
                drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]
              "
            >
              {svc.eyebrow}
            </p>

            {/* Headline */}
            <h1
              className="
                flex flex-col
                font-[800] text-[clamp(2.5rem,6.6vw,6.4rem)] leading-none
                tracking-[-0.035em]
                max-w-[12em]
                font-[family-name:var(--font-display)]
                text-white
                drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]
              "
            >
              <span key={`h1-${svc.id}`} style={swap(70)}>
                {svc.headline[0]}
              </span>
              <span
                key={`h2-${svc.id}`}
                style={swap(140)}
                className="
                  bg-gradient-to-r from-[var(--accent)] via-[#f2ffff] to-[var(--accent)]
                  bg-clip-text text-transparent
                  drop-shadow-[0_0_28px_rgba(var(--accent-rgb),0.45)]
                "
              >
                {svc.headline[1]}
              </span>
            </h1>

            {/* Description */}
            <p
              key={`desc-${svc.id}`}
              style={swap(210)}
              className="
                max-w-[34em]
                text-[clamp(15px,1.15vw,17px)] leading-[1.6]
                text-[var(--muted)]
                drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]

                [@media(max-height:640px)]:hidden
              "
            >
              {svc.description}
            </p>

            {/* CTA */}
            <button
              key={`cta-${svc.id}`}
              style={swap(280)}
              className="
                inline-flex items-center gap-3
                pl-[10px] pr-6 py-[10px]
                rounded-full
                font-[600] text-[15px] leading-none tracking-[0.02em]
                font-[family-name:var(--font-display)]

                bg-[linear-gradient(160deg,rgba(11,18,41,0.60),rgba(11,18,41,0.35))]
                backdrop-blur-[14px]
                border border-[rgba(var(--accent-rgb),0.50)]
                shadow-[0_0_32px_-8px_rgba(var(--accent-rgb),0.55)]

                transition-[box-shadow,border-color,transform,background]
                duration-[400ms] ease-[var(--ease)]

                hover:border-[rgba(255,255,255,0.75)]
                hover:shadow-[0_0_40px_-4px_rgba(var(--accent-rgb),0.75)]
                hover:-translate-y-0.5

                [&:hover_.btn-icon]:scale-110
              "
              onClick={() => scrollToTarget(svc.cta.target)}
            >
              <span
                className="
                  btn-icon
                  grid place-items-center
                  w-9 h-9
                  rounded-full
                  bg-[var(--accent)] text-[var(--navy)]
                  transition-transform duration-[400ms] ease-[var(--ease)]
                "
              >
                <CtaIcon size={14} fill={svc.cta.icon === 'play' ? 'currentColor' : 'none'} strokeWidth={2.4} />
              </span>
              {svc.cta.label}
            </button>
          </div>
        </div>

        {/* ── SCROLL CUE ─────────────────────────────────── */}
        <button
          className="
            absolute left-1/2 bottom-[26px]
            max-[640px]:bottom-4
            -translate-x-1/2

            z-20

            flex flex-col items-center gap-2

            text-[var(--muted)]
          "
          onClick={() => scrollToTarget('#process')}
          aria-label="Scroll down"
        >
          <span
            className="
              relative w-px h-11
              max-[640px]:h-7
              overflow-hidden
              bg-[rgba(83,247,251,0.25)]

              after:content-['']
              after:absolute
              after:left-0 after:-top-[40%]
              after:w-px after:h-[40%]
              after:bg-[var(--amber)]
              after:[animation:cue_2s_var(--ease)_infinite]
            "
          />
          <ArrowDown size={14} />
        </button>
      </div>
    </section>
  )
}

/* Glass segmented control with a glowing pill that glides
 * to the active service. Arrow keys move between tabs. */
function ServiceSwitch({ active, onSelect }) {
  const listRef = useRef(null)
  const tabRefs = useRef([])
  const [pill, setPill] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[active]
      if (el) setPill({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight })
    }
    measure()
    // Fonts loading / viewport changes resize the tabs
    const ro = new ResizeObserver(measure)
    ro.observe(listRef.current)
    tabRefs.current.forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [active])

  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    let next
    if (step) next = (active + step + services.length) % services.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = services.length - 1
    else return
    e.preventDefault()
    onSelect(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Our services"
      onKeyDown={onKeyDown}
      className="
        svc-track
        relative
        inline-flex items-stretch gap-1
        p-1.5
        rounded-full

        bg-[linear-gradient(160deg,rgba(11,18,41,0.72),rgba(11,18,41,0.42))]
        backdrop-blur-[16px]
        border border-white/10
        shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]

        max-[640px]:grid max-[640px]:grid-cols-3
        max-[640px]:w-full max-[640px]:max-w-[460px]
        max-[640px]:rounded-[22px]
      "
    >
      {/* Gliding indicator */}
      <span
        aria-hidden="true"
        className="
          svc-pill
          absolute left-0 top-0
          rounded-full max-[640px]:rounded-[16px]
          overflow-hidden

          bg-[var(--accent)]
          shadow-[0_0_28px_-2px_rgba(var(--accent-rgb),0.75),inset_0_1px_0_rgba(255,255,255,0.6)]
        "
        style={
          pill
            ? {
                width: pill.w,
                height: pill.h,
                transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
              }
            : { opacity: 0 }
        }
      />

      {services.map((s, i) => {
        const Icon = serviceIcons[s.icon]
        const on = i === active
        return (
          <button
            key={s.id}
            ref={(el) => (tabRefs.current[i] = el)}
            id={`hero-tab-${s.id}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls="hero-service-panel"
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(i)}
            className={`
              group
              relative z-10
              inline-flex items-center gap-2.5
              pl-2 pr-5 py-2
              rounded-full
              font-[family-name:var(--font-display)] font-[600]
              text-[14px] leading-none tracking-[0.01em] whitespace-nowrap

              transition-colors duration-[400ms] ease-[var(--ease)]

              max-[640px]:flex-col max-[640px]:justify-center max-[640px]:gap-1.5
              max-[640px]:px-2 max-[640px]:py-2.5
              max-[640px]:rounded-[16px]
              max-[640px]:text-[11.5px] max-[640px]:leading-tight
              max-[640px]:whitespace-normal max-[640px]:text-center

              ${on ? 'text-[var(--navy)]' : 'text-[var(--muted)] hover:text-white'}
            `}
          >
            <span
              className={`
                grid place-items-center
                w-8 h-8 shrink-0
                rounded-full
                transition-[background,color,transform] duration-[400ms] ease-[var(--ease)]

                max-[640px]:w-7 max-[640px]:h-7

                ${
                  on
                    ? 'bg-[rgba(11,18,41,0.14)] text-[var(--navy)]'
                    : 'bg-white/[0.06] group-hover:bg-white/10 group-hover:scale-110'
                }
              `}
              style={on ? undefined : { color: s.accent }}
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </span>
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

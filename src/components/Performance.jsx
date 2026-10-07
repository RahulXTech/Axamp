import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Building,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  Flame,
  Globe,
  Heart,
  Infinity as InfinityIcon,
  MessageCircle,
  MessagesSquare,
  Navigation,
  Phone,
  Play,
  Search,
  Send,
  Star,
  Store,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Autoplay, EffectCoverflow, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

import { SHOW_COUNT_FROM, businessProfile, compact, googleItems, headlineStats, reelGroups } from '../data/performance'
import { whatsappLink } from '../data/site'
import { useInView } from '../lib/hooks'
import { useModal } from '../lib/modal'
import { lockScroll, scrollToTarget } from '../lib/scroll'
import { WhatsAppIcon } from './icons'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const pad = (n) => String(n).padStart(2, '0')

const groupIcons = { flame: Flame, tower: Building, store: Store }

// Panels in the desktop slider, in order (labels on the progress rail)
const PLATFORMS = ['Meta Ads', 'Google Ads', 'Business Profile']

const SLIDE_MS = 2800      // Meta carousel: time on each reel
const PORTFOLIO_MS = 6500  // Google: time on each portfolio

const promises = [
  { icon: Target, title: 'Hyper-local targeting', text: 'Buyers within reach of your site, not the whole state.' },
  { icon: Clapperboard, title: 'Creatives from your proof', text: 'Ads cut from the reels that already earn trust.' },
  { icon: MessagesSquare, title: 'Leads to WhatsApp, fast', text: 'Every form fill reaches sales in minutes.' },
  { icon: ChartColumn, title: 'Reports that matter', text: 'Weekly cost per lead and booked site visits.' },
]

/* ─── Small shared pieces ──────────────────────────────────────────── */

function MetaGlyph({ size = 22 }) {
  return <InfinityIcon size={size} strokeWidth={2.4} className="shrink-0 text-[#4f9bff]" aria-hidden="true" />
}

function GoogleGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// Google Maps pin
function MapsGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
      <path fill="#B31412" d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13V2Z" opacity="0.35" />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
    </svg>
  )
}

function BlockHeading({ num, glyph, title, sub }) {
  return (
    <div className="flex items-center gap-4">
      <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {glyph}
        <span className="absolute -right-2 -top-2 rounded-full border border-white/10 bg-[var(--navy)] px-1.5 py-0.5 font-[family-name:var(--font-display)] text-[9.5px] font-bold tracking-[0.1em] text-[var(--faint)]">
          {num}
        </span>
      </span>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
          {title}
        </h3>
        <p className="mt-1.5 text-[13.5px] text-[var(--faint)]">{sub}</p>
      </div>
    </div>
  )
}

/* Counts up once when scrolled into view */
function CountUp({ value, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (v) =>
      prefix + v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
    el.textContent = fmt(0)
    const state = { v: 0 }
    let tween
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        tween = gsap.to(state, { v: value, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(state.v)) })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      tween?.kill()
    }
  }, [value, decimals, prefix, suffix])

  return <span ref={ref} />
}

/* ============================================================
   SECTION
   Scroll choreography (GSAP + ScrollTrigger, all scrubbed so it
   follows the scroll and rewinds on the way back up):
   · header lines rise out of masks, numbers band settles in
   · desktop: Meta, Google and Google Business Profile sit side by
     side in a pinned track — scrolling slides each one out to the
     left and the next in from the right, with a clickable rail
   · phones / short screens: each block slides in from its side
============================================================ */

// Same query in CSS (styles.css → .perf-track) and in the GSAP setup
const SLIDE_MQ = '(min-width: 1024px) and (min-height: 700px)'
const STACK_MQ = '(max-width: 1023px), (max-height: 699px)'

export default function Performance() {
  const [lightbox, setLightbox] = useState(null) // { items, index }
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)
  const slideST = useRef(null)
  const [step, setStep] = useState(0) // which platform the slider shows

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const mm = gsap.matchMedia()
      const scrub = (trigger, start = 'top 88%', end = 'top 45%') => ({ trigger, start, end, scrub: 0.8 })

      mm.add('all', () => {
        // Aurora drifts slower than the page
        gsap.to(q('.perf-aurora'), {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        // ── Header: pill pops, headline lines rise out of their masks
        const head = q('.perf-head')[0]
        gsap
          .timeline({ scrollTrigger: scrub(head, 'top 90%', 'top 35%') })
          .from(q('.perf-pill'), { y: 30, scale: 0.85, autoAlpha: 0, ease: 'back.out(1.6)' })
          .from(q('.perf-line'), { yPercent: 110, rotate: 2.5, stagger: 0.15, ease: 'power3.out' }, '<0.1')
          .from(q('.perf-sub'), { y: 36, autoAlpha: 0, stagger: 0.12, ease: 'power2.out' }, '<0.25')

        // ── Numbers band: lifts and un-tilts, cells cascade in
        const band = q('.perf-stats')[0]
        gsap
          .timeline({ scrollTrigger: scrub(band, 'top 95%', 'top 60%') })
          .from(band, { y: 80, scale: 0.94, rotateX: 18, transformPerspective: 1000, autoAlpha: 0, ease: 'power3.out' })
          .from(q('.perf-stat'), { y: 40, autoAlpha: 0, stagger: 0.1, ease: 'power2.out' }, '<0.15')

        // ── What-you-get cards + CTA
        gsap.from(q('.perf-promise'), {
          y: 70,
          rotateX: -25,
          transformPerspective: 900,
          autoAlpha: 0,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: scrub(q('.perf-promises')[0], 'top 95%', 'top 60%'),
        })
        gsap.from(q('.perf-cta'), {
          y: 60,
          scale: 0.94,
          autoAlpha: 0,
          ease: 'power3.out',
          scrollTrigger: scrub(q('.perf-cta')[0], 'top 98%', 'top 70%'),
        })
      })

      // ── Desktop: pinned horizontal slide, Meta → Google → Business Profile
      mm.add(SLIDE_MQ, () => {
        const pin = pinRef.current
        const track = trackRef.current
        const [metaPanel, googlePanel, gmbPanel] = q('.perf-panel-inner')
        const distance = () => track.scrollWidth - pin.clientWidth
        const panel = () => distance() / (PLATFORMS.length - 1)

        // Meta arrives before the pin: copy from the left, stage from the right
        gsap
          .timeline({ scrollTrigger: scrub(pin, 'top 95%', 'top top') })
          .from(q('.perf-meta-copy'), { x: -120, autoAlpha: 0, ease: 'power3.out' })
          .from(q('.perf-meta-stage'), { x: 160, scale: 0.85, rotateY: -14, transformPerspective: 1400, autoAlpha: 0, ease: 'power3.out' }, '<')
          .from(q('.perf-rail'), { y: -20, autoAlpha: 0, ease: 'power2.out' }, '<0.2')

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${distance() * 1.15}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setStep(Math.min(PLATFORMS.length - 1, Math.round(self.progress * (PLATFORMS.length - 1)))),
          },
        })
        slideST.current = tl.scrollTrigger

        tl.to({}, { duration: 0.08 }) // short hold on Meta
          .to(track, { x: () => -panel(), duration: 1, ease: 'power1.inOut' })
          // Meta recedes as it leaves…
          .to(metaPanel, { scale: 0.86, autoAlpha: 0.2, rotateY: 10, transformPerspective: 1600, transformOrigin: '100% 50%', duration: 0.8 }, '<')
          // …Google swings in to meet it
          .fromTo(
            googlePanel,
            { scale: 0.86, autoAlpha: 0.2, rotateY: -10, transformPerspective: 1600, transformOrigin: '0% 50%' },
            { scale: 1, autoAlpha: 1, rotateY: 0, duration: 0.8 },
            '<0.2',
          )
          .from(q('.perf-g-dash'), { x: -80, rotateY: 12, transformPerspective: 1400, duration: 0.6 }, '<0.2')
          .from(q('.perf-g-copy > *'), { x: 80, autoAlpha: 0, stagger: 0.06, duration: 0.4 }, '<0.1')
          .fromTo(q('.perf-rail-fill')[0], { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power1.inOut' }, 0.08)
          .to({}, { duration: 0.08 }) // short hold on Google
          .addLabel('toMaps')
          .to(track, { x: () => -distance(), duration: 1, ease: 'power1.inOut' })
          // Google recedes…
          .to(googlePanel, { scale: 0.86, autoAlpha: 0.2, rotateY: 10, transformPerspective: 1600, transformOrigin: '100% 50%', duration: 0.8 }, '<')
          // …the Maps profile swings in
          .fromTo(
            gmbPanel,
            { scale: 0.86, autoAlpha: 0.2, rotateY: -10, transformPerspective: 1600, transformOrigin: '0% 50%' },
            { scale: 1, autoAlpha: 1, rotateY: 0, duration: 0.8 },
            '<0.2',
          )
          .from(q('.perf-b-copy > *'), { x: -80, autoAlpha: 0, stagger: 0.06, duration: 0.4 }, '<0.2')
          .from(q('.perf-b-map'), { x: 80, rotateY: -12, transformPerspective: 1400, duration: 0.6 }, '<0.1')
          .fromTo(q('.perf-rail-fill')[1], { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power1.inOut' }, 'toMaps')
          .to({}, { duration: 0.08 }) // short hold on the Maps profile

        return () => {
          slideST.current = null
          setStep(0)
        }
      })

      // ── Phones / short screens: blocks slide in from their sides
      mm.add(STACK_MQ, () => {
        const from = (sel, x) =>
          gsap.from(q(sel), { x, autoAlpha: 0, ease: 'power3.out', scrollTrigger: scrub(q(sel)[0], 'top 92%', 'top 55%') })
        from('.perf-meta-copy', -60)
        from('.perf-meta-stage', 60)
        from('.perf-g-copy', 60)
        from('.perf-g-dash', -60)
        from('.perf-b-copy', -60)
        from('.perf-b-map', 60)
      })
    },
    { scope: sectionRef },
  )

  // Rail buttons jump to that platform's spot in the slide
  const goToStep = (i) => {
    const st = slideST.current
    if (!st) return
    const at = st.start + ((st.end - st.start) * i) / (PLATFORMS.length - 1)
    scrollToTarget(Math.min(st.end - 2, Math.max(st.start + 2, at)))
  }

  return (
    <section
      ref={sectionRef}
      id="performance"
      className="relative z-10 overflow-x-clip bg-[var(--navy)] px-[var(--gutter)] pb-[clamp(24px,4vh,48px)] pt-[clamp(96px,15vh,170px)] max-sm:pt-14"
    >
      {/* Background: aurora + faint grid */}
      <div aria-hidden="true" className="perf-aurora pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(79,155,255,0.16),transparent_70%)]" />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
          bg-[size:72px_72px]
          [mask-image:linear-gradient(180deg,transparent,#000_10%,#000_75%,transparent)]
        "
      />

      <div className="relative mx-auto max-w-[1280px]">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="perf-head mx-auto flex max-w-[1180px] flex-col items-center gap-6 text-center max-sm:gap-4">
          <span className="perf-pill glass inline-flex items-center gap-[10px] rounded-full px-4 py-[10px] text-[var(--cyan)]">
            <TrendingUp size={16} strokeWidth={1.8} aria-hidden="true" />
            <span className="font-[family-name:var(--font-display)] text-[12px] font-bold uppercase leading-none tracking-[0.2em] text-[var(--text)]">
              Performance Marketing
            </span>
          </span>

          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-balance text-white">
            {/* Each line rises out of its own mask */}
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <span className="perf-line block">Reels earn attention.</span>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <span className="perf-line block bg-[linear-gradient(90deg,var(--cyan),#c9feff_45%,#4f9bff)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(79,155,255,0.35)]">
                Ads turn it into site visits.
              </span>
            </span>
          </h2>

          <p className="perf-sub max-w-[620px] text-[clamp(1rem,1.3vw,1.125rem)] leading-[1.65] text-[var(--muted)]">
            We run the paid side too — Meta and Google campaigns plus your Google Maps listing, built from the
            same proof content and tuned for <span className="text-white">qualified leads and booked site visits</span>, not vanity clicks.
          </p>

          {/* Platforms */}
          <div className="perf-sub flex flex-wrap items-center justify-center gap-2">
            {[
              ['meta', 'Facebook'],
              ['meta', 'Instagram'],
              ['google', 'Search'],
              ['google', 'YouTube'],
              ['google', 'Performance Max'],
              ['maps', 'Google Maps'],
            ].map(([p, label]) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/70">
                {p === 'meta' ? <MetaGlyph size={15} /> : p === 'maps' ? <MapsGlyph size={15} /> : <GoogleGlyph size={13} />}
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Headline numbers ───────────────────────────── */}
        <div className="perf-stats relative mt-14 max-sm:mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(120deg,rgba(83,247,251,0.06),rgba(79,155,255,0.05)_50%,rgba(255,255,255,0.02))]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(83,247,251,0.5)] to-transparent" />
          <dl className="m-0 grid grid-cols-2 lg:grid-cols-4">
            {headlineStats.map((s, i) => (
              <div
                key={s.label}
                className={`
                  perf-stat flex flex-col-reverse items-center gap-1.5 px-4 py-7 text-center max-sm:py-5
                  ${i % 2 ? 'border-l border-white/[0.07]' : ''}
                  ${i > 1 ? 'max-lg:border-t max-lg:border-white/[0.07]' : ''}
                  ${i === 2 ? 'lg:border-l lg:border-white/[0.07]' : ''}
                `}
              >
                <dt className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">{s.label}</dt>
                <dd className="m-0 bg-[linear-gradient(180deg,#fff,#a9f9fb)] bg-clip-text font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.4vw,3rem)] font-extrabold leading-none tracking-[-0.03em] text-transparent">
                  <CountUp {...s} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Platforms: pinned horizontal slide on desktop ── */}
      <div ref={pinRef} className="perf-pin relative mx-[calc(50%-50vw)] mt-24 overflow-x-clip max-sm:mt-12">
        {/* Progress rail (desktop slide only) */}
        <div className="perf-rail mx-auto hidden w-full max-w-[1280px] items-center gap-4 px-[var(--gutter)] pb-6 [@media(min-width:1024px)_and_(min-height:700px)]:flex">
          {PLATFORMS.map((label, i) => (
            <span key={label} className="contents">
              {i > 0 && (
                <span aria-hidden="true" className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <span className="perf-rail-fill absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--cyan),#4f9bff)] shadow-[0_0_12px_rgba(83,247,251,0.8)]" />
                </span>
              )}
              <button
                type="button"
                onClick={() => goToStep(i)}
                className={`
                  flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-display)] text-[13px] font-semibold
                  transition-colors duration-500
                  ${step === i ? 'text-white' : 'text-white/35 hover:text-white/70'}
                `}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border text-[10.5px] transition-[background-color,border-color,color] duration-500 ${
                    step === i ? 'border-transparent bg-[var(--cyan)] text-[var(--navy)]' : 'border-white/15'
                  }`}
                >
                  {pad(i + 1)}
                </span>
                {label}
              </button>
            </span>
          ))}
          <span className="ml-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">
            Scroll
            <ArrowRight size={13} className="perf-nudge" aria-hidden="true" />
          </span>
        </div>

        <div ref={trackRef} className="perf-track flex flex-col gap-28 max-sm:gap-14">
          <div className="perf-panel shrink-0 px-[var(--gutter)]">
            <div className="perf-panel-inner mx-auto max-w-[1280px]">
              <MetaAds />
            </div>
          </div>
          <div className="perf-panel shrink-0 px-[var(--gutter)]">
            <div className="perf-panel-inner mx-auto max-w-[1280px]">
              <GoogleAds onOpen={setLightbox} />
            </div>
          </div>
          <div className="perf-panel shrink-0 px-[var(--gutter)]">
            <div className="perf-panel-inner mx-auto max-w-[1280px]">
              <BusinessProfile />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1280px]">
        {/* ── What you get ───────────────────────────────── */}
        <ul className="perf-promises m-0 mt-24 max-sm:mt-12 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="perf-promise group flex gap-4 rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5 transition-[border-color,background-color] duration-500 hover:border-[rgba(83,247,251,0.25)] hover:bg-[rgba(83,247,251,0.04)]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.08)] text-[var(--cyan)] transition-transform duration-500 group-hover:scale-110">
                <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-white">{title}</span>
                <span className="text-[13.5px] leading-[1.5] text-[var(--muted)]">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* ── CTA ────────────────────────────────────────── */}
        <div className="perf-cta mt-6 flex flex-wrap items-center justify-between gap-5 rounded-[26px] border border-white/[0.08] bg-[linear-gradient(120deg,rgba(83,247,251,0.08),rgba(79,155,255,0.06)_50%,rgba(255,122,80,0.07))] px-[clamp(20px,3vw,36px)] py-6">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.1rem,1.7vw,1.4rem)] font-bold leading-snug text-white">
            Want results like these for your project?
            <span className="block font-[family-name:var(--font-ui)] text-[14px] font-normal text-[var(--muted)]">
              We'll plan the campaign, the creatives and the budget with you.
            </span>
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="
              group inline-flex h-14 items-center gap-3 rounded-full pl-2 pr-7
              bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)]
              font-[family-name:var(--font-display)] text-[15px] font-semibold text-[var(--navy)]
              shadow-[0_0_34px_-6px_rgba(83,247,251,0.75),inset_0_1px_0_rgba(255,255,255,0.6)]
              transition-[transform,box-shadow] duration-300 ease-[var(--ease)]
              hover:-translate-y-0.5 hover:shadow-[0_0_44px_-4px_rgba(83,247,251,0.9),inset_0_1px_0_rgba(255,255,255,0.6)]
            "
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--navy)] text-[var(--cyan)]">
              <WhatsAppIcon size={19} />
            </span>
            Plan my campaign
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {lightbox && <Lightbox {...lightbox} onClose={closeLightbox} />}
    </section>
  )
}

/* ============================================================
   META — real client reels, best performers first.
   Auto-plays through each tab, then hands over to the next;
   the bar under the active tab shows how far it got.
   Clicking the centred reel opens the on-site player.
============================================================ */

export const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// Shape the on-site player (VideoModal) expects
const toModalReel = (r) => ({
  key: `perf-${r.id}`,
  type: 'instagram',
  id: r.id,
  url: r.url,
  video: `/videos/${r.id}.mp4`,
  poster: r.cover,
  caption: r.caption,
  handle: r.handle,
  name: `${r.name} · ${r.place}`,
  likes: r.likes,
  comments: r.comments,
  views: r.views,
})

export const showCount = (n) => n != null && n >= SHOW_COUNT_FROM

function MetaAds() {
  const { open } = useModal()
  const rootRef = useRef(null)
  const inView = useInView(rootRef, '-10% 0px')
  const [groupIndex, setGroupIndex] = useState(0)
  const [active, setActive] = useState(0)
  const [swiper, setSwiper] = useState(null)
  const barRefs = useRef([])
  const shown = useRef({ count: 0, last: 0 })
  const seen = useRef(false)

  const group = reelGroups[groupIndex]
  const n = group.reels.length
  // Loop mode needs spare slides on wide screens — repeat short lists
  const slides = Array.from({ length: Math.ceil(8 / n) * n }, (_, i) => group.reels[i % n])
  const current = group.reels[active]

  const pickGroup = (i) => {
    shown.current = { count: 0, last: 0 }
    barRefs.current.forEach((bar) => bar && (bar.style.transform = 'scaleX(0)'))
    setActive(0)
    setGroupIndex(i)
  }

  // Only run the carousel while it's on screen
  useEffect(() => {
    if (!swiper || swiper.destroyed || !swiper.autoplay) return
    if (!inView) {
      swiper.autoplay.stop()
      return
    }
    // First time it's seen, always open on the #1 reel
    if (!seen.current) {
      seen.current = true
      swiper.slideToLoop(0, 0, false)
    }
    swiper.autoplay.start()
  }, [swiper, inView])

  const onRealIndexChange = (s) => {
    const real = s.realIndex % n
    setActive(real)
    if (real === shown.current.last) return
    shown.current.last = real
    shown.current.count += 1
    // Played through every reel → move on to the next tab
    if (shown.current.count >= n) pickGroup((groupIndex + 1) % reelGroups.length)
  }

  const onTimeLeft = (_s, _time, progress) => {
    const bar = barRefs.current[groupIndex]
    if (bar) bar.style.transform = `scaleX(${Math.min(1, (shown.current.count + (1 - progress)) / n)})`
  }

  return (
    <div ref={rootRef} className="grid items-center gap-10 lg:grid-cols-[minmax(300px,380px)_1fr] lg:gap-6">
      {/* ── Left: copy + tabs ───────────────────────────── */}
      <div className="perf-meta-copy flex min-w-0 flex-col gap-7">
        <BlockHeading num="01" glyph={<MetaGlyph size={26} />} title="Meta Ads" sub="Real client reels · Instagram & Facebook" />

        <p className="text-[15px] leading-[1.65] text-[var(--muted)]">
          Reels we made for real brands — with the likes and comments they actually earned.
          Our best performer passed <span className="text-white">{compact(reelGroups[0].reels[0].likes)} likes</span>.
        </p>

        <div role="tablist" aria-label="Client reels" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {reelGroups.map((g, i) => {
            const Icon = groupIcons[g.icon]
            const on = i === groupIndex
            const likes = g.reels.reduce((s, r) => s + r.likes, 0)
            return (
              <button
                key={g.id}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => pickGroup(i)}
                className={`
                  group relative flex shrink-0 items-center gap-3 overflow-hidden rounded-[18px] border py-3 pl-3 pr-4 text-left
                  transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease)]
                  ${
                    on
                      ? 'border-[rgba(83,247,251,0.45)] bg-[linear-gradient(110deg,rgba(83,247,251,0.16),rgba(79,155,255,0.08))] shadow-[0_14px_40px_-18px_rgba(83,247,251,0.6)]'
                      : 'border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05] lg:hover:translate-x-1'
                  }
                `}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] transition-colors duration-500 ${
                    on ? 'bg-[var(--cyan)] text-[var(--navy)] shadow-[0_0_20px_-4px_rgba(83,247,251,0.8)]' : 'bg-white/[0.06] text-[var(--cyan)]'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className={`whitespace-nowrap font-[family-name:var(--font-display)] text-[14.5px] font-semibold ${on ? 'text-white' : 'text-white/75'}`}>
                    {g.label}
                  </span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-[var(--faint)]">
                    {pad(g.reels.length)} reels
                    {showCount(likes / g.reels.length) && (
                      <>
                        {' · '}
                        <Heart size={10} className="fill-current" aria-hidden="true" /> {compact(likes)}
                      </>
                    )}
                  </span>
                </span>
                <ChevronRight
                  size={17}
                  className={`transition-[transform,color] duration-500 max-lg:hidden ${on ? 'translate-x-0.5 text-[var(--cyan)]' : 'text-white/25'}`}
                />

                {/* Progress through this tab's reels */}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.04]">
                  <span
                    ref={(el) => (barRefs.current[i] = el)}
                    className="block h-full origin-left bg-[linear-gradient(90deg,var(--cyan),#4f9bff)] shadow-[0_0_10px_rgba(83,247,251,0.8)]"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </span>
              </button>
            )
          })}
        </div>

        <p className="flex items-center gap-2.5 text-[12px] uppercase tracking-[0.18em] text-[var(--faint)] max-lg:hidden">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cyan)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cyan)]" />
          </span>
          Auto-playing · tap a reel to watch
        </p>
      </div>

      {/* ── Right: stage ─────────────────────────────────── */}
      <div className="perf-meta-stage relative min-w-0">
        {/* Decorative rings + glow behind the cards */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[46%] h-[min(640px,120vw)] w-[min(640px,120vw)] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(79,155,255,0.24),rgba(83,247,251,0.06)_45%,transparent_68%)]" />
          <div className="perf-ring absolute inset-[8%] rounded-full border border-dashed border-[rgba(83,247,251,0.16)]" />
          <div className="perf-ring perf-ring--rev absolute inset-[22%] rounded-full border border-[rgba(79,155,255,0.14)]" />
        </div>

        <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
          <Swiper
            key={group.id}
            modules={[EffectCoverflow, Autoplay, Keyboard, A11y]}
            effect="coverflow"
            loop
            centeredSlides
            slidesPerView="auto"
            speed={900}
            grabCursor
            slideToClickedSlide
            keyboard={{ enabled: true, onlyInViewport: true }}
            autoplay={{ delay: SLIDE_MS, disableOnInteraction: false, pauseOnMouseEnter: true }}
            coverflowEffect={{ rotate: 0, stretch: 70, depth: 240, modifier: 1, scale: 0.9, slideShadows: false }}
            onSwiper={setSwiper}
            onRealIndexChange={onRealIndexChange}
            onAutoplayTimeLeft={onTimeLeft}
            className="perf-swiper !py-8 [animation:fade_0.7s_var(--ease)_both]"
          >
            {slides.map((reel, i) => (
              <SwiperSlide key={`${group.id}-${i}`} className="!w-[clamp(210px,19vw,272px)] max-sm:!w-[58vw]">
                {({ isActive }) => (
                  <ReelCard
                    reel={reel}
                    rank={group.id === 'top' ? (i % n) + 1 : null}
                    isActive={isActive}
                    onOpen={() => isActive && open(toModalReel(reel))}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Floating numbers for the centred reel */}
        {showCount(current?.likes) && (
          <div key={`a-${group.id}-${active}`} className="perf-float pointer-events-none absolute left-[3%] top-[14%] z-10 max-md:hidden">
            <ResultBadge icon={Heart} label="Likes" value={compact(current.likes)} tone="pink" />
          </div>
        )}
        {showCount(current?.views ?? current?.comments) && (
          <div key={`b-${group.id}-${active}`} className="perf-float perf-float--late pointer-events-none absolute bottom-[24%] right-[3%] z-10 max-md:hidden">
            {current.views ? (
              <ResultBadge icon={Eye} label="Views" value={compact(current.views)} tone="blue" />
            ) : (
              <ResultBadge icon={MessageCircle} label="Comments" value={compact(current.comments)} tone="blue" />
            )}
          </div>
        )}

        {/* Arrows */}
        {[
          { dir: 'prev', Icon: ChevronLeft, cls: 'left-0', go: () => swiper?.slidePrev() },
          { dir: 'next', Icon: ChevronRight, cls: 'right-0', go: () => swiper?.slideNext() },
        ].map(({ dir, Icon, cls, go }) => (
          <button
            key={dir}
            type="button"
            onClick={go}
            aria-label={dir === 'prev' ? 'Previous reel' : 'Next reel'}
            className={`
              absolute top-[46%] z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full
              border border-white/15 bg-[rgba(11,18,41,0.75)] text-white backdrop-blur-md
              transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease)]
              hover:scale-105 hover:border-[var(--cyan)] hover:bg-[var(--cyan)] hover:text-[var(--navy)] hover:shadow-[0_0_28px_-4px_rgba(83,247,251,0.8)]
              max-sm:h-10 max-sm:w-10
              ${cls}
            `}
          >
            <Icon size={20} />
          </button>
        ))}

        {/* Client + dots */}
        <div className="relative flex flex-col items-center gap-3 text-center">
          <p key={`${group.id}-${active}`} className="text-[13px] text-[var(--faint)] [animation:fade_0.5s_var(--ease)_both]">
            <span className="font-semibold text-white">{current?.name}</span> · {current?.kind} · {current?.place}
          </p>
          {showCount(current?.likes) && (
            <div className="flex gap-2 md:hidden">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[12px] text-white/70">
                Likes <b className="text-white">{compact(current.likes)}</b>
              </span>
              {showCount(current.comments) && (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[12px] text-white/70">
                  Comments <b className="text-white">{compact(current.comments)}</b>
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {group.reels.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-7 bg-[var(--cyan)] shadow-[0_0_10px_rgba(83,247,251,0.7)]' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const badgeTones = {
  pink: 'bg-[rgba(255,77,109,0.16)] text-[#ff6b86]',
  blue: 'bg-[rgba(79,155,255,0.18)] text-[#7db6ff]',
}

export function ResultBadge({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-white/[0.12] bg-[rgba(11,18,41,0.72)] py-3 pl-3 pr-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <span className={`grid h-10 w-10 place-items-center rounded-[12px] ${badgeTones[tone]}`}>
        <Icon size={18} strokeWidth={2} className={tone === 'pink' ? 'fill-current' : ''} aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/50">{label}</span>
        <span className="font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-tight text-white">{value}</span>
      </span>
    </div>
  )
}

/* One client reel, styled like an Instagram reel */
function ReelCard({ reel, rank, isActive, onOpen }) {
  const counts = [
    { key: 'likes', Icon: Heart, n: reel.likes, like: true },
    { key: 'comments', Icon: MessageCircle, n: reel.comments },
  ]

  return (
    <div
      onClick={onOpen}
      className={`
        group relative aspect-[9/16] w-full overflow-hidden rounded-[26px] border bg-[var(--navy-2)]
        transition-[border-color,box-shadow] duration-700 ease-[var(--ease)]
        ${
          isActive
            ? 'cursor-pointer border-[rgba(83,247,251,0.6)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_70px_-14px_rgba(83,247,251,0.55)]'
            : 'border-white/10 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)]'
        }
      `}
    >
      {/* Cover (slow push-in while centred) */}
      <div className={`absolute inset-0 transition-transform duration-[6000ms] ease-out ${isActive ? 'scale-[1.1]' : 'scale-100'}`}>
        <img className="h-full w-full object-cover" src={reel.cover} alt="" loading="lazy" decoding="async" draggable="false" />
      </div>

      {/* Shades for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(5,8,26,0.8),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-[linear-gradient(0deg,rgba(5,8,26,0.95),rgba(5,8,26,0.5)_55%,transparent)]" />

      {/* Header: client account */}
      <div className="absolute inset-x-3 top-3 flex items-center gap-2.5">
        <span className="shrink-0 rounded-full bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy)] font-[family-name:var(--font-display)] text-[11px] font-bold text-white">
            {initials(reel.name)}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-[family-name:var(--font-display)] text-[12.5px] font-bold text-white">{reel.name}</span>
          <span className="truncate text-[10.5px] text-white/70">@{reel.handle}</span>
        </span>
        {rank && (
          <span
            className={`shrink-0 rounded-full px-2 py-1 font-[family-name:var(--font-display)] text-[10.5px] font-bold ${
              rank === 1 ? 'bg-[linear-gradient(135deg,#ffd166,#ff7a50)] text-[var(--navy)]' : 'bg-black/50 text-white/80 backdrop-blur-md'
            }`}
          >
            #{rank}
          </span>
        )}
      </div>

      {/* Reel actions with real counts */}
      <div className="absolute bottom-[96px] right-2.5 flex flex-col items-center gap-3.5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]" aria-hidden="true">
        {counts.map(({ key, Icon, n, like }) => (
          <span key={key} className="flex flex-col items-center gap-0.5">
            <Icon size={22} className={like && isActive && showCount(n) ? 'perf-like fill-[#ff4d6d] text-[#ff4d6d]' : ''} />
            {showCount(n) && <span className="text-[10.5px] font-semibold">{compact(n)}</span>}
          </span>
        ))}
        <Send size={20} />
      </div>

      {/* Caption + watch */}
      <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2.5">
        <p className="line-clamp-2 pr-10 text-[12.5px] font-medium leading-snug text-white/95">{reel.caption}</p>
        <span className="flex items-center justify-between rounded-[12px] bg-[linear-gradient(100deg,#962fbf,#d62976_45%,#fa7e1e)] px-3.5 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(214,41,118,0.9)]">
          <span className="flex items-center gap-2">
            <Play size={12} fill="currentColor" aria-hidden="true" />
            Watch reel
          </span>
          {showCount(reel.views) ? (
            <span className="flex items-center gap-1 text-white/90">
              <Eye size={13} aria-hidden="true" /> {compact(reel.views)}
            </span>
          ) : (
            <ChevronRight size={15} aria-hidden="true" />
          )}
        </span>
      </div>

      {/* Dims the cards that aren't centred */}
      <div className="perf-dim pointer-events-none absolute inset-0 bg-[#05081a] transition-opacity duration-700" />
    </div>
  )
}

/* ============================================================
   GOOGLE ADS — dashboard preview + auto-cycling portfolio list
============================================================ */

function GoogleAds({ onOpen }) {
  const rootRef = useRef(null)
  const inView = useInView(rootRef, '-10% 0px')
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false)
  const item = googleItems[index]
  const paused = hover || !inView

  const next = () => setIndex((i) => (i + 1) % googleItems.length)
  const screenshots = googleItems.filter((g) => g.src)

  return (
    <div
      ref={rootRef}
      className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(300px,380px)] lg:gap-14"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* ── Right on desktop: copy + portfolio list ─────── */}
      <div className="perf-g-copy flex min-w-0 flex-col gap-7 lg:order-2">
        <BlockHeading num="02" glyph={<GoogleGlyph size={24} />} title="Google Ads" sub="Search · Performance Max · YouTube" />

        <p className="text-[15px] leading-[1.65] text-[var(--muted)]">
          Catch buyers the moment they search — <span className="text-white">“3 BHK near metro”</span>,{' '}
          <span className="text-white">“plots on highway”</span> — and turn the click into a call.
        </p>

        <div role="tablist" aria-label="Google Ads portfolio" className="flex flex-col gap-2">
          {googleItems.map((g, i) => {
            const on = i === index
            return (
              <button
                key={g.title}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => setIndex(i)}
                className={`
                  relative flex items-center gap-4 overflow-hidden rounded-[18px] border px-4 py-3.5 text-left
                  transition-[background-color,border-color,box-shadow] duration-500 ease-[var(--ease)]
                  ${
                    on
                      ? 'border-[rgba(79,155,255,0.45)] bg-[linear-gradient(110deg,rgba(79,155,255,0.16),rgba(83,247,251,0.06))] shadow-[0_14px_40px_-18px_rgba(79,155,255,0.6)]'
                      : 'border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]'
                  }
                `}
              >
                <span className={`font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-none tracking-[-0.03em] ${on ? 'text-[var(--cyan)]' : 'text-white/25'}`}>
                  {pad(i + 1)}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">Portfolio · {g.kind}</span>
                  <span className={`font-[family-name:var(--font-display)] text-[14.5px] font-semibold ${on ? 'text-white' : 'text-white/75'}`}>{g.title}</span>
                </span>
                {on && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.04]">
                    <span
                      key={index}
                      onAnimationEnd={next}
                      className="block h-full origin-left bg-[linear-gradient(90deg,#4f9bff,var(--cyan))] shadow-[0_0_10px_rgba(79,155,255,0.8)]"
                      style={{ animation: `perf-fill ${PORTFOLIO_MS}ms linear both`, animationPlayState: paused ? 'paused' : 'running' }}
                    />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Left on desktop: the dashboard ──────────────── */}
      <div className="perf-g-dash relative min-w-0 lg:order-1">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-10 rounded-[60px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(79,155,255,0.18),transparent_70%)]" />

        <div
          role={item.src ? 'button' : undefined}
          tabIndex={item.src ? 0 : undefined}
          aria-label={item.src ? `View ${item.title}` : undefined}
          onClick={item.src ? () => onOpen({ items: screenshots, index: screenshots.indexOf(item) }) : undefined}
          className={`relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0c1433] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)] ${item.src ? 'cursor-zoom-in' : ''}`}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] bg-black/30 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
            </span>
            <span className="mx-auto flex max-w-[340px] flex-1 items-center justify-center gap-1.5 truncate rounded-full bg-white/[0.06] px-3 py-1 text-[11.5px] text-white/50">
              <GoogleGlyph size={11} />
              ads.google.com/aw/overview
            </span>
          </div>

          <div key={index} className="relative [animation:fade_0.6s_var(--ease)_both] sm:aspect-[16/10]">
            {item.src ? (
              <img className="h-full w-full object-cover object-top max-sm:aspect-[16/10] sm:absolute sm:inset-0" src={item.src} alt={item.title} loading="lazy" decoding="async" />
            ) : (
              <Dashboard item={item} />
            )}
          </div>
        </div>

        {/* Floating highlight */}
        <div key={`hl-${index}`} className="perf-float pointer-events-none absolute -right-3 -top-6 z-10 max-sm:hidden">
          <div className="flex items-center gap-2.5 rounded-full border border-[rgba(52,168,83,0.4)] bg-[rgba(11,18,41,0.85)] py-2 pl-2 pr-4 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(52,168,83,0.2)] text-[#5ee08a]">
              <TrendingUp size={16} aria-hidden="true" />
            </span>
            <span className="text-[13px] text-white/70">
              <b className="font-[family-name:var(--font-display)] text-[16px] text-white">{item.kpis[1].delta}</b> {item.kpis[1].label.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   GOOGLE BUSINESS PROFILE — a Google Maps search with the client
   ranked first in the 3-pack, plus the profile's insights
============================================================ */

function Stars({ value, size = 10 }) {
  return (
    <span className="flex text-[#fbbc05]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill={i < Math.round(value) ? 'currentColor' : 'none'} strokeWidth={1.8} />
      ))}
    </span>
  )
}

function BusinessProfile() {
  const bp = businessProfile
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(300px,400px)_1fr] lg:gap-14">
      {/* ── Left on desktop: copy + insights ─────────────── */}
      <div className="perf-b-copy flex min-w-0 flex-col gap-7">
        <BlockHeading num="03" glyph={<MapsGlyph size={26} />} title="Google Business Profile" sub="Google Maps · Local SEO · Reviews" />

        <p className="text-[15px] leading-[1.65] text-[var(--muted)]">
          Be the first pin buyers see when they search <span className="text-white">“{bp.search}”</span> — with fresh photos, real
          reviews and one-tap directions to your site.
        </p>

        <dl className="m-0 grid grid-cols-2 gap-2.5">
          {bp.stats.map((k) => (
            <div key={k.label} className="rounded-[16px] border border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <dt className="text-[11px] text-white/50">{k.label}</dt>
              <dd className="m-0 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-display)] text-[22px] font-bold leading-tight text-white">{k.value}</span>
                <span className="text-[11px] font-semibold text-[#5ee08a]">{k.delta}</span>
              </dd>
            </div>
          ))}
        </dl>

        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {bp.work.map((w) => (
            <li key={w} className="flex items-center gap-1.5 rounded-full border border-[rgba(234,67,53,0.3)] bg-[rgba(234,67,53,0.08)] px-3 py-1.5 text-[12.5px] text-white/80">
              <Check size={12} strokeWidth={3} className="text-[#ff8a7a]" aria-hidden="true" />
              {w}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right on desktop: the Maps search ────────────── */}
      <div className="perf-b-map relative min-w-0">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-10 rounded-[60px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(234,67,53,0.16),transparent_70%)]" />

        <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0c1433] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] bg-black/30 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
            </span>
            <span className="mx-auto flex max-w-[340px] flex-1 items-center justify-center gap-1.5 truncate rounded-full bg-white/[0.06] px-3 py-1 text-[11.5px] text-white/50">
              <MapsGlyph size={12} />
              google.com/maps
            </span>
          </div>

          <div className="relative grid sm:aspect-[16/10] sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            {/* Results: search box + the 3-pack */}
            <div className="relative z-10 flex flex-col gap-2.5 border-white/[0.07] bg-[#0e1738] p-[clamp(12px,1.6vw,18px)] max-sm:order-2 sm:border-r">
              <div className="flex h-9 items-center gap-2 rounded-full bg-white px-3 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.8)]">
                <MapsGlyph size={15} />
                <span className="flex-1 truncate text-[12.5px] text-[#3c4043]">{bp.search}</span>
                <Search size={14} className="text-[#4285f4]" aria-hidden="true" />
              </div>
              {bp.pack.map((r, i) => (
                <div
                  key={r.name}
                  className={`rounded-[14px] border px-3 py-2.5 ${
                    i === 0 ? 'border-[rgba(234,67,53,0.5)] bg-[linear-gradient(120deg,rgba(234,67,53,0.16),rgba(255,255,255,0.03))]' : 'border-white/[0.06] bg-white/[0.025]'
                  }`}
                  style={{ animation: `pop 0.6s var(--ease) ${i * 110}ms both` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate font-[family-name:var(--font-display)] text-[13.5px] font-semibold ${i === 0 ? 'text-white' : 'text-white/60'}`}>{r.name}</span>
                    {i === 0 && <span className="shrink-0 rounded-full bg-[#ea4335] px-2 py-0.5 text-[10px] font-bold text-white">#1 on Maps</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/50">
                    <span className={i === 0 ? 'font-semibold text-[#fbbc05]' : ''}>{r.rating}</span>
                    <Stars value={r.rating} />
                    <span>({r.reviews})</span>
                  </div>
                  <p className={`mt-0.5 truncate text-[11px] ${i === 0 ? 'text-[#5ee08a]' : 'text-white/40'}`}>{r.note}</p>
                  {i === 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[
                        [Navigation, 'Directions'],
                        [Phone, 'Call'],
                        [Globe, 'Website'],
                      ].map(([Icon, t]) => (
                        <span key={t} className="flex items-center justify-center gap-1 rounded-full border border-[rgba(138,180,248,0.35)] py-1 text-[10.5px] font-semibold text-[#8ab4f8]">
                          <Icon size={10} aria-hidden="true" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Stylised map with the client's pin pulsing */}
            <div aria-hidden="true" className="relative min-h-[200px] overflow-hidden bg-[#101b42] max-sm:order-1">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <rect width="400" height="300" fill="#101b42" />
                <path d="M-20 230 C 80 200, 140 260, 240 225 S 380 180, 430 200 L430 320 L-20 320 Z" fill="#14305a" />
                <ellipse cx="300" cy="70" rx="70" ry="38" fill="#163b33" />
                <ellipse cx="70" cy="90" rx="45" ry="28" fill="#163b33" />
                <g stroke="rgba(255,255,255,0.12)" strokeWidth="9" fill="none" strokeLinecap="round">
                  <path d="M-10 150 L410 120" />
                  <path d="M150 -10 L190 310" />
                </g>
                <g stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" strokeLinecap="round">
                  <path d="M-10 60 L410 40" />
                  <path d="M60 -10 L90 310" />
                  <path d="M290 -10 L320 310" />
                  <path d="M-10 260 L410 240" />
                </g>
                <path d="M-10 190 C 120 170, 240 210, 410 175" stroke="rgba(251,188,5,0.35)" strokeWidth="5" fill="none" />
              </svg>

              {/* Competitors */}
              {[
                ['26%', '34%'],
                ['74%', '58%'],
              ].map(([l, t]) => (
                <span key={l} className="absolute -translate-x-1/2 -translate-y-full opacity-55" style={{ left: l, top: t }}>
                  <MapsGlyph size={20} />
                </span>
              ))}

              {/* The client */}
              <span className="absolute left-[52%] top-[48%] -translate-x-1/2 -translate-y-full">
                <span className="absolute bottom-0 left-1/2 h-4 w-10 -translate-x-1/2 translate-y-1/2 animate-ping rounded-[50%] bg-[rgba(234,67,53,0.45)]" />
                <span className="perf-float relative block drop-shadow-[0_8px_14px_rgba(234,67,53,0.6)]">
                  <MapsGlyph size={40} />
                </span>
                <span className="absolute bottom-full left-1/2 mb-1 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#202124] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.8)]">
                  {bp.name}
                  <span className="text-[#e37400]">★ {bp.rating}</span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Floating highlight */}
        <div className="perf-float pointer-events-none absolute -right-3 -top-6 z-10 max-sm:hidden">
          <div className="flex items-center gap-2.5 rounded-full border border-[rgba(234,67,53,0.4)] bg-[rgba(11,18,41,0.85)] py-2 pl-2 pr-4 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(234,67,53,0.18)] text-[#ff8a7a]">
              <Navigation size={15} aria-hidden="true" />
            </span>
            <span className="text-[13px] text-white/70">
              <b className="font-[family-name:var(--font-display)] text-[16px] text-white">{bp.stats[1].delta}</b> direction requests
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Google-Ads-style overview drawn from the item's numbers */
function Dashboard({ item }) {
  const W = 600
  const H = 170
  const max = Math.max(...item.series) * 1.1
  const pts = item.series.map((v, i) => [(i / (item.series.length - 1)) * W, H - (v / max) * H])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const ghost = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${(y + 26 + Math.sin(i) * 8).toFixed(1)}`).join(' ')

  return (
    <div className="flex h-full flex-col gap-3 p-[clamp(12px,2vw,22px)] sm:absolute sm:inset-0">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <GoogleGlyph size={18} />
          <span className="truncate font-[family-name:var(--font-display)] text-[14px] font-semibold text-white">{item.project}</span>
          <span className="shrink-0 rounded-full bg-[rgba(79,155,255,0.15)] px-2 py-0.5 text-[10.5px] font-semibold text-[#8fc1ff]">{item.kind}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/60 max-[420px]:hidden">
          <CalendarDays size={12} aria-hidden="true" /> Last 30 days
        </span>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {item.kpis.map((k, i) => (
          <div
            key={k.label}
            className={`rounded-[12px] border px-3 py-2.5 ${i === 0 ? 'border-[rgba(79,155,255,0.5)] bg-[rgba(79,155,255,0.14)]' : 'border-white/[0.06] bg-white/[0.03]'}`}
            style={{ animation: `pop 0.6s var(--ease) ${i * 80}ms both` }}
          >
            <span className="block text-[10.5px] text-white/55">{k.label}</span>
            <span className="block font-[family-name:var(--font-display)] text-[clamp(15px,1.6vw,20px)] font-bold leading-tight text-white">{k.value}</span>
            <span className="text-[10.5px] font-semibold text-[#5ee08a]">{k.delta}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative min-h-[120px] flex-1 overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.02]">
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_25%]" />
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="perf-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#4f9bff" stopOpacity="0.4" />
              <stop offset="1" stopColor="#4f9bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={ghost} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
          <path d={area} fill="url(#perf-area)" className="[animation:fade_1.2s_var(--ease)_0.3s_both]" />
          <path d={line} fill="none" stroke="#53f7fb" strokeWidth="2.4" vectorEffect="non-scaling-stroke" pathLength="1" className="perf-draw" />
        </svg>
      </div>

      {/* Campaign rows */}
      <div className="grid gap-1 text-[11.5px] max-sm:hidden">
        <div className="grid grid-cols-[1fr_70px_60px] px-2 text-white/40">
          <span>Campaign</span>
          <span className="text-right">{item.kind === 'YouTube' ? 'Views' : 'Clicks'}</span>
          <span className="text-right">Conv.</span>
        </div>
        {item.campaigns.map(([name, a, b], i) => (
          <div
            key={name}
            className="grid grid-cols-[1fr_70px_60px] items-center rounded-[8px] bg-white/[0.03] px-2 py-1.5 text-white/80"
            style={{ animation: `pop 0.6s var(--ease) ${300 + i * 90}ms both` }}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5ee08a]" />
              {name}
            </span>
            <span className="text-right tabular-nums">{a}</span>
            <span className="text-right tabular-nums">{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   LIGHTBOX — full-size creatives / screenshots, ← → to browse
============================================================ */

function Lightbox({ items, index: startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const closeRef = useRef(null)
  const item = items[index]
  const many = items.length > 1
  const go = (d) => setIndex((i) => (i + d + items.length) % items.length)

  useEffect(() => {
    lockScroll(true)
    const prev = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % items.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
      prev?.focus?.({ preventScroll: true })
    }
  }, [items.length, onClose])

  const isVideo = item.type === 'video'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(5,9,22,0.85)] p-4 backdrop-blur-[16px] [animation:fade_0.35s_var(--ease)_both]"
    >
      <figure key={index} onClick={(e) => e.stopPropagation()} className="m-0 flex flex-col items-center gap-4 [animation:pop_0.45s_var(--ease)_both]">
        <div className="glass overflow-hidden rounded-[20px] border-[rgba(83,247,251,0.35)] bg-black shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(83,247,251,0.35)]">
          {isVideo ? (
            <video className="block max-h-[80svh] max-w-[calc(100vw-32px)] bg-black" src={item.src} poster={item.poster} controls autoPlay playsInline />
          ) : (
            <img className="block max-h-[80svh] max-w-[min(1200px,calc(100vw-32px))] object-contain" src={item.src} alt={item.title} />
          )}
        </div>
        <figcaption className="flex flex-wrap items-center justify-center gap-3 text-center">
          {item.project && <span className="text-[13px] text-[var(--faint)]">{item.project}</span>}
          <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-white">{item.title}</span>
          {item.stats?.map(([k, v]) => (
            <span key={k} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[12px] text-white/70">
              {k} <b className="text-white">{v}</b>
            </span>
          ))}
          {many && <span className="text-[12px] tracking-[0.2em] text-[var(--faint)]">{pad(index + 1)} / {pad(items.length)}</span>}
        </figcaption>
      </figure>

      {many &&
        [
          { d: -1, Icon: ChevronLeft, cls: 'left-3 sm:left-6', label: 'Previous' },
          { d: 1, Icon: ChevronRight, cls: 'right-3 sm:right-6', label: 'Next' },
        ].map(({ d, Icon, cls, label }) => (
          <button
            key={d}
            type="button"
            aria-label={label}
            onClick={(e) => {
              e.stopPropagation()
              go(d)
            }}
            className={`fixed top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[rgba(11,18,41,0.7)] text-white backdrop-blur-md transition-colors hover:bg-[var(--cyan)] hover:text-[var(--navy)] ${cls}`}
          >
            <Icon size={20} />
          </button>
        ))}

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-[18px] top-[18px] grid h-[50px] w-[50px] place-items-center rounded-full border border-[var(--glass-border)] bg-white/5 text-[var(--text)] backdrop-blur-[12px] transition-[color,border-color] duration-300 hover:border-[rgba(255,122,80,0.7)] hover:text-[var(--amber)]"
      >
        <X size={20} />
      </button>
    </div>,
    document.body,
  )
}

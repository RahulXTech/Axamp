import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Play, Send } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Autoplay, EffectCoverflow, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

import { resolveReel } from '../data/work'
import { compact } from '../data/reels'
import { useVideoAvailable } from '../lib/hooks'
import { useModal } from '../lib/modal'
import { PillarIcon } from './icons'
import IntroPanel, { PillLabel } from './IntroPanel'
import { ResultBadge, initials, showCount } from './Performance'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/*
 * Pillar section as a reel showcase (used by the Hospital pillars):
 * copy on one side, an Instagram-style coverflow on the other — the
 * centred reel plays, side reels sit back in the dark, a heartbeat line
 * runs behind them. Desktop pins it briefly so the objection gets struck
 * through on scroll; phones stack it.
 */

const SLIDE_MS = 4200
const pad = (n) => String(n).padStart(2, '0')

export default function PillarShowcase({ pillar, index, inView, stacked }) {
  const flip = !stacked && index % 2 === 1
  const warm = pillar.tone === 'warm'

  const reels = useMemo(
    () =>
      pillar.reels?.length
        ? pillar.reels.map((r) => resolveReel(r, pillar))
        : Array.from({ length: 3 }, (_, i) => ({ key: `${pillar.id}-soon-${i}`, placeholder: true })),
    [pillar],
  )

  const sectionRef = useRef(null)
  const introRef = useRef(null)
  const stageRef = useRef(null)
  const progressRef = useRef(null)

  useGSAP(
    () => {
      if (stacked) return
      const section = sectionRef.current

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 0.9}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          section.style.setProperty('--p', self.progress) // IntroPanel strike + answer
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`
        },
      })

      const enter = { trigger: section, start: 'top 85%', end: 'top 15%', scrub: 0.6 }
      gsap.fromTo(
        introRef.current,
        { autoAlpha: 0, x: flip ? 120 : -120 },
        { autoAlpha: 1, x: 0, ease: 'power3.out', scrollTrigger: enter },
      )
      gsap.fromTo(
        stageRef.current,
        { autoAlpha: 0, x: flip ? -160 : 160, scale: 0.86, rotateY: flip ? 16 : -16, transformPerspective: 1400 },
        { autoAlpha: 1, x: 0, scale: 1, rotateY: 0, ease: 'power3.out', scrollTrigger: enter },
      )
    },
    { scope: sectionRef, dependencies: [stacked, flip] },
  )

  return (
    <section
      ref={sectionRef}
      className={`
        relative w-full overflow-hidden
        ${stacked ? 'pb-3 pt-7' : 'flex h-[100svh] min-h-[720px] items-center'}
      `}
      style={{
        '--tone-rgb': warm ? 'var(--amber-rgb)' : 'var(--cyan-rgb)',
        // Phones: no scroll scrub, reveal the strikethrough once in view
        ...(stacked && { '--p': inView ? 1 : 0, transition: '--p 1.8s var(--ease)' }),
      }}
    >
      {/* Backdrop: tone glow behind the stage + faint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background: `radial-gradient(circle at ${stacked ? '50% 70%' : flip ? '34% 50%' : '66% 50%'}, rgba(var(--tone-rgb), 0.10), transparent 55%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
          bg-[size:72px_72px]
          [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]
        "
      />

      <div
        className={`
          relative mx-auto grid w-full max-w-[1440px] items-center px-[var(--gutter)]
          ${stacked ? 'gap-1' : flip ? 'gap-10 grid-cols-[1fr_minmax(300px,460px)]' : 'gap-10 grid-cols-[minmax(300px,460px)_1fr]'}
        `}
      >
        {/* ── Copy ───────────────────────────────────── */}
        <div ref={introRef} className={`flex flex-col gap-8 ${flip ? 'order-2 items-end' : 'items-start'}`}>
          {!stacked && <PillLabel pillar={pillar} />}
          <IntroPanel pillar={pillar} index={index} align={flip ? 'right' : 'left'} compact={stacked} />
        </div>

        {/* ── Reel stage ─────────────────────────────── */}
        <div ref={stageRef} className={`min-w-0 ${flip ? 'order-1' : ''}`}>
          <ReelStage pillar={pillar} reels={reels} inView={inView} />
        </div>
      </div>

      {/* Scroll progress through the pin */}
      {!stacked && (
        <div className="absolute bottom-5 left-[var(--gutter)] right-[var(--gutter)] h-[2px] overflow-hidden rounded-full bg-white/10">
          <div
            ref={progressRef}
            className={`h-full w-full scale-x-0 ${flip ? 'origin-right' : 'origin-left'}`}
            style={{
              background: `linear-gradient(${flip ? 270 : 90}deg, rgb(var(--tone-rgb)), rgba(var(--tone-rgb), 0.3))`,
              boxShadow: '0 0 16px rgba(var(--tone-rgb), 0.6)',
            }}
          />
        </div>
      )}
    </section>
  )
}

/* ============================================================
   STAGE — coverflow of reels with arrows, badges and dots
============================================================ */

function ReelStage({ pillar, reels, inView }) {
  const { open, reel: openReel } = useModal()
  const [swiper, setSwiper] = useState(null)
  const [active, setActive] = useState(0)

  const n = reels.length
  const soon = reels[0].placeholder
  // Loop mode needs spare slides on wide screens — repeat short lists
  const slides = Array.from({ length: Math.ceil(8 / n) * n }, (_, i) => reels[i % n])
  const current = reels[active]

  // Only auto-advance while on screen and the player is closed
  useEffect(() => {
    if (!swiper || swiper.destroyed || !swiper.autoplay) return
    if (inView && !openReel) swiper.autoplay.start()
    else swiper.autoplay.stop()
  }, [swiper, inView, openReel])

  return (
    <div className="relative">
      {/* Glow, slow rings and a heartbeat line behind the cards */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[46%] h-[min(620px,120vw)] w-[min(620px,120vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(var(--tone-rgb), 0.22), rgba(var(--tone-rgb), 0.05) 45%, transparent 68%)' }} />
        <div className="perf-ring absolute inset-[8%] rounded-full border border-dashed border-[rgba(var(--tone-rgb),0.18)]" />
        <div className="perf-ring perf-ring--rev absolute inset-[22%] rounded-full border border-[rgba(var(--tone-rgb),0.12)]" />
      </div>
      <Heartbeat />

      <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <Swiper
          key={pillar.id}
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
          coverflowEffect={{ rotate: 0, stretch: 70, depth: 240, modifier: 1, scale: 0.88, slideShadows: false }}
          onSwiper={setSwiper}
          onRealIndexChange={(s) => setActive(s.realIndex % n)}
          className="perf-swiper !py-8 max-sm:!py-4"
        >
          {slides.map((reel, i) => (
            <SwiperSlide
              key={`${reel.key}-${i}`}
              className="!w-[min(clamp(210px,19vw,280px),calc(54svh*9/16))] max-sm:!w-[min(68vw,calc(62svh*9/16))]"
            >
              {({ isActive }) =>
                reel.placeholder ? (
                  <SoonCard pillar={pillar} isActive={isActive} />
                ) : (
                  <ShowcaseCard
                    reel={reel}
                    rank={(i % n) + 1}
                    isActive={isActive}
                    playing={isActive && inView && !openReel}
                    onOpen={() => isActive && open(reel)}
                  />
                )
              }
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Floating numbers for the centred reel */}
      {showCount(current?.likes) && (
        <div key={`l-${active}`} className="perf-float pointer-events-none absolute left-[2%] top-[12%] z-10 max-md:hidden">
          <ResultBadge icon={Heart} label="Likes" value={compact(current.likes)} tone="pink" />
        </div>
      )}
      {showCount(current?.comments) && (
        <div key={`c-${active}`} className="perf-float perf-float--late pointer-events-none absolute bottom-[26%] right-[2%] z-10 max-md:hidden">
          <ResultBadge icon={MessageCircle} label="Comments" value={compact(current.comments)} tone="blue" />
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
            hover:scale-105 hover:border-[rgb(var(--tone-rgb))] hover:bg-[rgb(var(--tone-rgb))] hover:text-[var(--navy)]
            hover:shadow-[0_0_28px_-4px_rgba(var(--tone-rgb),0.8)]
            max-sm:h-10 max-sm:w-10
            ${cls}
          `}
        >
          <Icon size={20} />
        </button>
      ))}

      {/* Client + dots */}
      <div className="relative flex flex-col items-center gap-3 text-center max-sm:gap-2">
        <p key={active} className="text-[13px] text-[var(--faint)] [animation:fade_0.5s_var(--ease)_both]">
          {soon ? (
            <span className="uppercase tracking-[0.22em]">Reels coming soon</span>
          ) : (
            <>
              <span className="font-semibold text-white">{current.client}</span>
              {current.kind && ` · ${current.kind}`}
              {current.place && ` · ${current.place}`}
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {reels.map((r, i) => (
            <span
              key={r.key}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? 'w-7 bg-[rgb(var(--tone-rgb))] shadow-[0_0_10px_rgba(var(--tone-rgb),0.7)]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
          {!soon && (
            <span className="ml-2 text-[11px] uppercase tracking-[0.2em] text-[var(--faint)] tabular-nums">
              {pad(active + 1)} / {pad(n)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ECG trace with a bright pulse running along it */
const ECG =
  'M0 50 H150 L162 44 L172 50 H190 L200 62 L214 8 L228 88 L240 50 H270 L286 38 L302 50 H500 ' +
  'L512 44 L522 50 H540 L550 62 L564 8 L578 88 L590 50 H620 L636 38 L652 50 H850 ' +
  'L862 44 L872 50 H890 L900 62 L914 8 L928 88 L940 50 H970 L986 38 L1002 50 H1200'

function Heartbeat() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -inset-x-[6%] top-[46%] h-[90px] w-[112%] -translate-y-1/2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
    >
      <path d={ECG} fill="none" stroke="rgba(var(--tone-rgb), 0.14)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path
        d={ECG}
        pathLength="1"
        fill="none"
        stroke="rgb(var(--tone-rgb))"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="hs-ecg"
        style={{ filter: 'drop-shadow(0 0 6px rgba(var(--tone-rgb), 0.9))' }}
      />
    </svg>
  )
}

/* ============================================================
   CARDS
============================================================ */

/* One reel, styled like an Instagram reel; the centred one plays */
function ShowcaseCard({ reel, rank, isActive, playing, onOpen }) {
  const hasMp4 = useVideoAvailable(isActive && !reel.image ? reel.video : null)
  const [poster, setPoster] = useState(reel.poster)
  const [ready, setReady] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!isActive) setReady(false)
  }, [isActive])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, hasMp4])

  const counts = [
    { key: 'likes', Icon: Heart, n: reel.likes, like: true },
    { key: 'comments', Icon: MessageCircle, n: reel.comments },
  ]

  return (
    <div
      onClick={onOpen}
      role={isActive ? 'button' : undefined}
      tabIndex={isActive ? 0 : -1}
      aria-label={isActive ? `Play video: ${reel.caption}` : undefined}
      onKeyDown={(e) => isActive && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      className={`
        group relative aspect-[9/16] w-full overflow-hidden rounded-[26px] border bg-[var(--navy-2)]
        transition-[border-color,box-shadow] duration-700 ease-[var(--ease)]
        ${
          isActive
            ? 'cursor-pointer border-[rgba(var(--tone-rgb),0.6)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_70px_-14px_rgba(var(--tone-rgb),0.55)]'
            : 'border-white/10 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)]'
        }
      `}
    >
      {/* Cover (slow push-in while centred), then the muted loop on top */}
      <div className={`absolute inset-0 transition-transform duration-[6000ms] ease-out ${isActive ? 'scale-[1.08]' : 'scale-100'}`}>
        {poster && (
          <img
            className={`h-full w-full ${reel.image ? 'object-contain' : 'object-cover'}`}
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setPoster((s) => (s !== reel.posterFallback ? reel.posterFallback : null))}
          />
        )}
        {isActive && hasMp4 && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
            src={reel.video}
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setReady(true)}
          />
        )}
      </div>

      {/* Shades for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(5,8,26,0.8),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-[linear-gradient(0deg,rgba(5,8,26,0.95),rgba(5,8,26,0.5)_55%,transparent)]" />

      {/* Header: client account */}
      <div className="absolute inset-x-3 top-3 flex items-center gap-2.5">
        <span className="shrink-0 rounded-full bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy)] font-[family-name:var(--font-display)] text-[11px] font-bold text-white">
            {initials(reel.client ?? 'AXAMP')}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-[family-name:var(--font-display)] text-[12.5px] font-bold text-white">{reel.client}</span>
          {reel.handle && <span className="truncate text-[10.5px] text-white/70">@{reel.handle}</span>}
        </span>
        <span className="shrink-0 rounded-full bg-black/50 px-2 py-1 font-[family-name:var(--font-display)] text-[10.5px] font-bold text-white/80 backdrop-blur-md">
          #{rank}
        </span>
      </div>

      {/* Centre play — fades once the loop is running */}
      <span
        aria-hidden="true"
        className={`
          absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full
          border border-white/25 bg-white/15 pl-1 text-white backdrop-blur-md
          transition-[opacity,transform,background-color] duration-500 ease-[var(--ease)]
          group-hover:scale-110 group-hover:bg-white/25
          ${isActive && ready ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
        `}
      >
        <Play size={22} fill="currentColor" />
      </span>

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
            {reel.image ? 'View post' : 'Watch reel'}
          </span>
          <ChevronRight size={15} aria-hidden="true" />
        </span>
      </div>

      {/* Dims the cards that aren't centred */}
      <div className="perf-dim pointer-events-none absolute inset-0 bg-[#05081a] transition-opacity duration-700" />
    </div>
  )
}

/* Stand-in while a pillar has no reels yet */
function SoonCard({ pillar, isActive }) {
  return (
    <div
      className={`
        relative grid aspect-[9/16] w-full place-items-center overflow-hidden rounded-[26px] border border-dashed
        bg-[linear-gradient(160deg,rgba(var(--tone-rgb),0.16),rgba(11,18,41,0.95)_60%)]
        transition-[border-color,box-shadow] duration-700 ease-[var(--ease)]
        ${isActive ? 'border-[rgba(var(--tone-rgb),0.55)] shadow-[0_0_70px_-14px_rgba(var(--tone-rgb),0.5)]' : 'border-white/15'}
      `}
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:14px_14px]" />
      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <span className="relative grid h-20 w-20 place-items-center rounded-[24px] border border-[rgba(var(--tone-rgb),0.45)] bg-[rgba(var(--tone-rgb),0.12)] text-[rgb(var(--tone-rgb))] shadow-[0_0_40px_-8px_rgba(var(--tone-rgb),0.7)]">
          <span className="absolute inset-0 animate-ping rounded-[24px] border border-[rgba(var(--tone-rgb),0.35)] [animation-duration:2.4s]" />
          <PillarIcon name={pillar.icon} size={34} />
        </span>
        <span className="font-[family-name:var(--font-display)] text-[20px] font-bold text-white">{pillar.label}</span>
        <span className="rounded-full border border-[rgba(var(--tone-rgb),0.45)] bg-[rgba(11,18,41,0.6)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--tone-rgb))]">
          Coming soon
        </span>
      </div>
      <div className="perf-dim pointer-events-none absolute inset-0 bg-[#05081a] transition-opacity duration-700" />
    </div>
  )
}

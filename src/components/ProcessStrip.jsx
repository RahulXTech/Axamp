import { useEffect, useRef, useState } from 'react'
import { resolveReel } from '../data/work'
import { useInView, useVideoAvailable } from '../lib/hooks'
import { scrollToTarget } from '../lib/scroll'
import { PillarIcon } from './icons'

/* ------------------------------------------------------------------
   Tracks which pillar section is currently centered in the viewport
   so the strip can highlight the matching card.
------------------------------------------------------------------ */
function useActivePillar(pillars) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const sections = pillars
      .map((p) => document.getElementById(p.id))
      .filter(Boolean)

    if (!sections.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          )

        if (visible[0]) setActiveId(visible[0].target.id)
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      },
    )

    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [pillars])

  return activeId
}

/* ------------------------------------------------------------------
   Instagram reel embed — same trick VideoCard uses (for pillars whose
   reel has no MP4 of its own).
   The IG embed is a fixed 340px wide, 4:5 media block under a
   ~54px header. We scale it so the media fills the card and the
   header/footer chrome is cropped off.
------------------------------------------------------------------ */
const IG_WIDTH = 340

function InstagramReelEmbed({ id }) {
  const mediaRef = useRef(null)

  useEffect(() => {
    const el = mediaRef.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height
      el.style.setProperty('--ig-s', (h / (IG_WIDTH * 1.25)).toFixed(4))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={mediaRef} className="absolute inset-0 overflow-hidden">
      <iframe
        style={{
          position: 'absolute',
          left: '50%',
          width: `${IG_WIDTH}px`,
          height: '1100px',
          transformOrigin: 'top center',
          border: 0,
          pointerEvents: 'none',
          transform: `translateX(-50%) translateY(calc(-54px * var(--ig-s, 1.4))) scale(var(--ig-s, 1.4))`,
        }}
        src={`https://www.instagram.com/reel/${id}/embed/`}
        title=""
        loading="lazy"
        tabIndex={-1}
        scrolling="no"
        allow="autoplay; encrypted-media"
      />
    </div>
  )
}

/* ------------------------------------------------------------------
   The pillar's first reel. The cover shows straight away; our own MP4
   then plays on top as a muted loop while the card is on screen. A
   reel with no MP4 falls back to its Instagram embed.
------------------------------------------------------------------ */
function ReelMedia({ reel, playing }) {
  const hasMp4 = useVideoAvailable(reel.image ? null : reel.video)
  const [poster, setPoster] = useState(reel.poster)
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, hasMp4])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {poster && (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setPoster((p) => (p !== reel.posterFallback ? reel.posterFallback : null))}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
        />
      )}
      {hasMp4 && (
        <video
          ref={videoRef}
          src={reel.video}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
        />
      )}
      {hasMp4 === false && reel.type === 'instagram' && !reel.image && <InstagramReelEmbed id={reel.id} />}
    </div>
  )
}

/* ------------------------------------------------------------------
   One card — plays the reel inline, overlaid with step number,
   icon chip, and label.
------------------------------------------------------------------ */
function PillarCard({ pillar, index, isActive }) {
  const warm = pillar.tone === 'warm'

  /* First reel in the pillar — we play that one inline */
  const reel = (() => {
    const first = pillar.reels?.[0]
    if (!first) return null
    try {
      return resolveReel(first, pillar)
    } catch {
      return null
    }
  })()

  /* Load the media once the card is roughly on screen (keeps the first
     page load light with six cards); play only while it's visible. */
  const cardRef = useRef(null)
  const near = useInView(cardRef, '300px 0px')
  const visible = useInView(cardRef)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (near) setLoaded(true)
  }, [near])

  const accent = warm
    ? {
        text: 'text-[var(--amber)]',
        border: 'rgba(255,122,80,0.65)',
        glow: 'rgba(255,122,80,0.55)',
        soft: 'rgba(255,122,80,0.22)',
        grad:
          'bg-gradient-to-r from-[var(--amber)] via-[rgba(255,122,80,0.4)] to-transparent',
      }
    : {
        text: 'text-[var(--cyan)]',
        border: 'rgba(83,247,251,0.65)',
        glow: 'rgba(83,247,251,0.55)',
        soft: 'rgba(83,247,251,0.20)',
        grad:
          'bg-gradient-to-r from-[var(--cyan)] via-[rgba(83,247,251,0.4)] to-transparent',
      }

  return (
    <li className="flex">
      <button
        ref={cardRef}
        type="button"
        onClick={() => scrollToTarget(`#${pillar.id}`)}
        aria-current={isActive ? 'true' : undefined}
        className={`
          group
          relative
          w-full
          min-h-[240px]
          rounded-[20px]
          overflow-hidden
          cursor-pointer
          text-left
          bg-[#0f1836]
          isolate

          transition-[transform,border-color,box-shadow]
          duration-[450ms] ease-[var(--ease)]

          hover:-translate-y-[6px]

          max-[1400px]:min-h-[220px]
          max-[600px]:min-h-[200px]
        `}
        style={{
          border: `1px solid ${
            isActive ? accent.border : 'rgba(255,255,255,0.08)'
          }`,
          boxShadow: isActive
            ? `0 30px 60px -24px rgba(0,0,0,0.65), 0 0 34px -6px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.09)`
            : '0 30px 60px -24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Layer 0 — tone gradient base */}
        <div
          aria-hidden="true"
          className={`
            absolute inset-0 z-0
            ${
              warm
                ? 'bg-[linear-gradient(140deg,rgba(255,122,80,0.35),rgba(18,13,22,0.95))]'
                : 'bg-[linear-gradient(140deg,rgba(83,247,251,0.22),rgba(11,18,41,0.95))]'
            }
          `}
        />

        {/* Layer 1 — dot texture */}
        <div
          aria-hidden="true"
          className="
            absolute inset-0 z-0 opacity-[0.06]
            bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_0)]
            [background-size:14px_14px]
          "
        />

        {/* Layer 2 — the reel: cover, then the video (fills the card) */}
        {reel && loaded && (
          <div className="absolute inset-0 z-[1]">
            <ReelMedia reel={reel} playing={visible} />
          </div>
        )}

        {/* Layer 3 — readability gradient so text stays readable */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0 z-[2]
            bg-[linear-gradient(180deg,rgba(11,18,41,0.10)_0%,rgba(11,18,41,0.35)_45%,rgba(11,18,41,0.90)_100%)]
          "
        />

        {/* Layer 4 — tone wash */}
        <div
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute inset-0 z-[3]
            opacity-30
            mix-blend-soft-light
            ${
              warm
                ? 'bg-gradient-to-tr from-[rgba(255,122,80,0.6)] to-transparent'
                : 'bg-gradient-to-tr from-[rgba(83,247,251,0.5)] to-transparent'
            }
          `}
        />

        {/* Bottom accent line */}
        <span
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute left-0 right-0 bottom-0 z-[5]
            h-[2px]
            origin-left
            transition-transform duration-[600ms] ease-[var(--ease)]
            ${isActive ? 'scale-x-100' : 'scale-x-0'}
            group-hover:scale-x-100
            ${accent.grad}
          `}
        />

        {/* Active corner dot */}
        {isActive && (
          <span
            aria-hidden="true"
            className={`
              absolute top-3 left-3 z-[5]
              w-2 h-2 rounded-full
              ${warm ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]'}
              shadow-[0_0_10px_currentColor]
            `}
          />
        )}

        {/* Content */}
        <div
          className="
            relative z-[6]
            flex flex-col justify-between
            w-full h-full
            p-5
            min-h-[inherit]
            max-[600px]:p-4
          "
        >
          {/* Top row: step number + icon chip */}
          <div className="flex items-start justify-between w-full gap-3">
            <span
              className="
                font-[700] text-[12px] leading-none
                tracking-[0.18em]
                font-[family-name:var(--font-display)]
                text-white/85
                drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]
                transition-colors duration-500
                group-hover:text-white
              "
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <span
              className={`
                grid place-items-center
                w-10 h-10
                rounded-[12px]
                border
                backdrop-blur-md
                transition-[transform,border-color,background,box-shadow]
                duration-[450ms] ease-[var(--ease)]
                ${accent.text}
                group-hover:scale-[1.06]
              `}
              style={{
                borderColor: isActive
                  ? accent.border
                  : 'rgba(255,255,255,0.22)',
                background: isActive
                  ? accent.soft
                  : 'rgba(11,18,41,0.55)',
                boxShadow: isActive
                  ? `0 0 18px -4px ${accent.glow}`
                  : 'none',
              }}
            >
              <PillarIcon name={pillar.icon} size={18} />
            </span>
          </div>

          {/* Bottom block: label + tag */}
          <div className="flex flex-col gap-2 w-full">
            <span
              className="
                font-[600] text-[16px] leading-[1.22]
                font-[family-name:var(--font-display)]
                text-white
                drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]
                max-[600px]:text-[15px]
              "
            >
              {pillar.label}
            </span>

            {pillar.tag && (
              <>
                <span
                  aria-hidden="true"
                  className="
                    block
                    h-px w-6
                    bg-white/30
                    transition-[width,background] duration-500
                    group-hover:w-10
                    group-hover:bg-white/55
                  "
                />
                <span
                  className="
                    block
                    text-[11px] leading-none
                    tracking-[0.16em] uppercase
                    text-white/70
                    font-[family-name:var(--font-ui)]
                    drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]
                  "
                >
                  {pillar.tag}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}

// Grid columns per card count — six on one row, four on one row, etc.
const gridCols = {
  4: 'grid-cols-4 max-[900px]:grid-cols-2',
  6: 'grid-cols-6 max-[1400px]:grid-cols-3 max-[900px]:grid-cols-3 max-[600px]:grid-cols-2',
}

export default function ProcessStrip({ pillars, eyebrow, title }) {
  const activeId = useActivePillar(pillars)

  return (
    <section
      id="process"
      className="
        relative
        z-10
        overflow-x-clip
        flex flex-col
        bg-[var(--navy)]
        rounded-t-[clamp(28px,4vw,56px)]
        border-t border-[rgba(83,247,251,0.14)]
        shadow-[0_-40px_90px_-20px_rgba(0,0,0,0.75)]
        gap-8
        px-[var(--gutter)]
        py-[14vh]

        max-[900px]:gap-7
        max-[600px]:gap-5
        max-[600px]:pt-12
        max-[600px]:pb-6
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0 top-1/2 -translate-y-1/2
          h-[420px] -z-10
          bg-[radial-gradient(ellipse_at_center,rgba(83,247,251,0.06),transparent_70%)]
        "
      />

      {/* Header */}
      <header className="flex items-end justify-between gap-6">
        <div data-slide="left" className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent"
            />
            <p className="font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
              {eyebrow}
            </p>
          </div>

          <h2 className="text-[clamp(20px,2.4vw,28px)] leading-[1.15] font-[600] tracking-[-0.01em] text-[var(--text)] font-[family-name:var(--font-display)] max-w-[520px]">
            {title}
          </h2>
        </div>

        <p data-slide="right" className="hidden md:block shrink-0 text-[12px] leading-none tracking-[0.28em] uppercase text-[var(--faint)] font-[family-name:var(--font-ui)]">
          Tap to jump ↓
        </p>
      </header>

      {/* Grid */}
      <ol data-slide="right" data-slide-stagger className={`list-none m-0 p-0 grid gap-[14px] items-stretch max-[900px]:gap-4 max-[600px]:gap-[12px] ${gridCols[pillars.length] ?? gridCols[6]}`}>
        {pillars.map((p, i) => (
          <PillarCard
            key={p.id}
            pillar={p}
            index={i}
            isActive={activeId === p.id}
          />
        ))}
      </ol>

      {/* Progress rail */}
      <div data-slide="up" className="flex items-center gap-4">
        <div className="relative flex-1 h-px bg-white/[0.07] overflow-hidden rounded-full">
          <div
            className="
              absolute inset-y-0 left-0
              bg-gradient-to-r
              from-[rgba(83,247,251,0.55)]
              via-[rgba(83,247,251,0.35)]
              to-transparent
              transition-[width] duration-700 ease-[var(--ease)]
            "
            style={{
              width: `${
                ((pillars.findIndex((x) => x.id === activeId) + 1) /
                  pillars.length) *
                100
              }%`,
            }}
          />
        </div>

        <span className="shrink-0 text-[11px] leading-none tracking-[0.24em] uppercase text-[var(--faint)] font-[family-name:var(--font-ui)] tabular-nums">
          {String(
            Math.max(1, pillars.findIndex((x) => x.id === activeId) + 1),
          ).padStart(2, '0')}
          {' / '}
          {String(pillars.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}
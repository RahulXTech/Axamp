import { useEffect, useRef, useState } from 'react'
import { Images, Play } from 'lucide-react'
import { useModal } from '../lib/modal'
import { useVideoAvailable } from '../lib/hooks'
import { LogoMark } from './Logo'

const IG_WIDTH = 340

// `near`    → this card may load/decode media (active ± 1)
// `playing` → muted loop should run (near + section on screen)
export default function VideoCard({ reel, near, playing, active }) {
  const { reel: openReel, open } = useModal()
  const hasMp4 = useVideoAvailable(reel.video)
  // Local /posters file first, then the remote fallback, then nothing.
  const [posterSrc, setPosterSrc] = useState(reel.poster)
  const onPosterError = () =>
    setPosterSrc((s) => (s !== reel.posterFallback ? reel.posterFallback : null))
  const videoRef = useRef(null)
  const shouldPlay = playing && !openReel

  const showMp4 = near && hasMp4 === true
  const showIg  = near && hasMp4 === false && reel.type === 'instagram' && !reel.image
  const showYt  = shouldPlay && reel.type === 'youtube'

  const mediaRef = useRef(null)

  useEffect(() => {
    const el = mediaRef.current
    if (!showIg || !el) return

    const ro = new ResizeObserver(([e]) => {
      el.style.setProperty(
        '--ig-s',
        (e.contentRect.height / (IG_WIDTH * 1.25)).toFixed(4),
      )
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [showIg])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (shouldPlay) v.play().catch(() => {})
    else v.pause()
  }, [shouldPlay, showMp4])

  const soon = reel.placeholder
  const onKey = (e) => {
    if (soon) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open(reel)
    }
  }

  const activeCls = active
    ? reel.warm
      ? 'border-[rgba(255,122,80,0.60)] shadow-[var(--glass-shadow),0_0_70px_-8px_rgba(255,122,80,0.45)]'
      : 'border-[rgba(83,247,251,0.55)] shadow-[var(--glass-shadow),0_0_60px_-10px_rgba(83,247,251,0.45)]'
    : 'border-transparent'

  return (
    <div
      className={`
        glass
        group
        relative
        w-full
        h-full
        rounded-[26px]
        ${soon ? 'cursor-default' : 'cursor-pointer'}
        overflow-hidden
        will-change-[transform,opacity]
        transition-[border-color,box-shadow]
        duration-500
        ease-[var(--ease)]
        ${activeCls}
      `}
      role={soon ? undefined : 'button'}
      tabIndex={soon ? -1 : 0}
      aria-label={soon ? reel.caption : `${reel.image ? 'View post' : 'Play video'}: ${reel.caption}`}
      onClick={soon ? undefined : () => open(reel)}
      onKeyDown={onKey}
    >
      {/* ── Media area ─────────────────────────────────────── */}
      <div
        ref={mediaRef}
        className="
          absolute
          inset-[7px]
          rounded-[19px]
          overflow-hidden
          isolate
          bg-[radial-gradient(circle_at_50%_40%,rgba(83,247,251,0.08),transparent_60%),var(--navy-2)]
        "
      >
        <div className="absolute inset-0 grid place-items-center opacity-50">
          <LogoMark size={44} />
        </div>

        {posterSrc && reel.image && (
          // Photo posts aren't 9:16 — show the whole image over a blurred fill
          <>
            <img
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-70"
              src={posterSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <img
              className="absolute inset-0 w-full h-full object-contain"
              src={posterSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={onPosterError}
            />
          </>
        )}

        {posterSrc && !reel.image && (
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={posterSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onError={onPosterError}
          />
        )}

        {showIg && (
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
            src={`https://www.instagram.com/reel/${reel.id}/embed/`}
            title={reel.caption}
            loading="lazy"
            tabIndex={-1}
            scrolling="no"
          />
        )}

        {showYt && (
          <iframe
            className="absolute inset-0 w-full h-full border-0 pointer-events-none bg-[var(--navy-2)]"
            src={`https://www.youtube-nocookie.com/embed/${reel.id}?autoplay=1&mute=1&loop=1&playlist=${reel.id}&controls=0&modestbranding=1&playsinline=1&rel=0`}
            title={reel.caption}
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        )}

        {showMp4 && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={reel.video}
            poster={posterSrc ?? undefined}
            muted
            loop
            playsInline
            preload="auto"
          />
        )}

        {/* Bottom shade */}
        <div
          className="
            absolute
            inset-0
            pointer-events-none
            bg-[linear-gradient(0deg,rgba(11,18,41,0.55)_0%,transparent_30%)]
          "
        />
      </div>

      {/* ── Coming soon (pillar has no reels yet) ──────────── */}
      {soon && (
        <span
          className={`
            absolute left-1/2 bottom-6 -translate-x-1/2
            whitespace-nowrap rounded-full border px-3 py-1.5
            bg-[rgba(11,18,41,0.6)] backdrop-blur-[10px]
            text-[10px] font-semibold uppercase tracking-[0.22em]
            ${reel.warm ? 'text-[var(--amber)] border-[rgba(255,122,80,0.45)]' : 'text-[var(--cyan)] border-[rgba(83,247,251,0.4)]'}
          `}
        >
          Coming soon
        </span>
      )}

      {/* ── Play button ────────────────────────────────────── */}
      {!soon && <span
        className={`
          absolute
          right-5
          bottom-5
          grid
          place-items-center
          w-11
          h-11
          pl-0.5
          rounded-full
          border
          bg-[rgba(11,18,41,0.55)]
          backdrop-blur-[10px]
          transition-[background,color,box-shadow,transform]
          duration-[350ms]
          ease-[var(--ease)]
          group-hover:bg-[var(--amber)]
          group-hover:text-[var(--navy)]
          group-hover:border-[var(--amber)]
          group-hover:shadow-[0_0_28px_rgba(255,122,80,0.65)]
          group-hover:scale-[1.08]
          group-focus-visible:bg-[var(--amber)]
          group-focus-visible:text-[var(--navy)]
          ${
            reel.warm
              ? 'text-[var(--amber)] border-[rgba(255,122,80,0.50)]'
              : 'text-[var(--cyan)]  border-[rgba(83,247,251,0.45)]'
          }
        `}
        aria-hidden="true"
      >
        {reel.image ? <Images size={16} /> : <Play size={16} fill="currentColor" />}
      </span>}
    </div>
  )
}
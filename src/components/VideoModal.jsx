import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bookmark, Check, Heart, MessageCircle, Send, X } from 'lucide-react'
import { useModal } from '../lib/modal'
import { useVideoAvailable } from '../lib/hooks'
import { lockScroll } from '../lib/scroll'
import { site } from '../data/site'
import { InstagramIcon, YouTubeIcon } from './icons'
import { LogoMark } from './Logo'

const igHandle = site.instagram.match(/instagram\.com\/([^/?#]+)/)?.[1] || 'axamp'

export default function VideoModal() {
  const { reel, close } = useModal()
  if (!reel) return null
  return createPortal(<ModalBody reel={reel} close={close} />, document.body)
}

function ModalBody({ reel, close }) {
  const hasMp4 = useVideoAvailable(reel.video)
  const closeRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    lockScroll(true)
    const prev = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
      prev?.focus?.({ preventScroll: true })
    }
  }, [close])

  // Play with sound; if the browser refuses, fall back to muted.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {
      v.muted = true
      v.play().catch(() => {})
    })
  }, [hasMp4])

  /* ── Player ─────────────────────────────────────────────────────── */
  // Loading spinner (shown while hasMp4 is still null)
  let player = (
    <div
      className="
        relative w-full h-full

        after:content-['']
        after:absolute
        after:left-1/2 after:top-1/2
        after:w-[34px] after:h-[34px]
        after:-ml-[17px] after:-mt-[17px]
        after:rounded-full
        after:border-2
        after:border-[rgba(83,247,251,0.20)]
        after:border-t-[var(--cyan)]
        after:[animation:spin_0.9s_linear_infinite]
      "
    />
  )

  if (reel.image) {
    // Photo post: the full image over a blurred fill of itself
    player = (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img src={reel.poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
        <img src={reel.poster} alt={reel.caption} className="absolute inset-0 h-full w-full object-contain" />
      </div>
    )
  } else if (reel.type === 'youtube') {
    player = (
      <iframe
        className="absolute inset-0 w-full h-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${reel.id}?autoplay=1&playsinline=1&rel=0`}
        title={reel.caption}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  } else if (hasMp4) {
    // Self-hosted file: always plays right here, with sound and controls
    player = (
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        src={reel.video}
        poster={reel.poster ?? undefined}
        controls
        playsInline
        autoPlay
        loop
      />
    )
  } else if (hasMp4 === false && reel.type === 'instagram') {
    // No MP4 yet: Instagram's own post embed (video, likes, caption,
    // comments). Instagram decides whether a reel may play inside it.
    player = (
      <iframe
        className="absolute inset-0 w-full h-full border-0 bg-white"
        src={`https://www.instagram.com/reel/${reel.id}/embed/captioned/`}
        title={reel.caption}
        allow="autoplay; encrypted-media; fullscreen; clipboard-write"
        allowFullScreen
      />
    )
  }

  const isWide = reel.type === 'youtube'
  const glow = reel.warm
    ? 'border-[rgba(255,122,80,0.40)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.80),0_0_80px_-20px_rgba(255,122,80,0.40)]'
    : 'border-[rgba(83,247,251,0.35)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.80),0_0_80px_-20px_rgba(83,247,251,0.35)]'

  return (
    /* Backdrop — scrolls on small screens where video + panel stack */
    <div
      className="
        fixed inset-0 z-[100]
        overflow-y-auto overscroll-contain

        bg-[rgba(5,9,22,0.74)]
        backdrop-blur-[16px]

        [animation:fade_0.35s_var(--ease)_both]
      "
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={reel.caption}
      onClick={close}
    >
      <div className="grid min-h-full place-items-center p-4 py-[76px] lg:py-4">
        {isWide ? (
          /* ── YouTube: wide frame + caption bar ─────────────── */
          <div
            className="flex flex-col gap-[14px] [animation:pop_0.5s_var(--ease)_both]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`
                glass relative overflow-hidden rounded-[22px] bg-black
                h-auto w-[min(1200px,calc(100vw-32px))] aspect-[16/9]
                ${glow}
              `}
            >
              {player}
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="font-[500] text-[14px] leading-[1.3] tracking-[0.06em] font-[family-name:var(--font-ui)] text-[var(--muted)]">
                {reel.caption}
              </p>
              <a
                className="
                  inline-grid place-items-center w-[42px] h-[42px] rounded-full
                  text-[var(--text)] bg-white/5 border border-[var(--glass-border)] backdrop-blur-[12px]
                  transition-[color,border-color,box-shadow] duration-300 ease-[var(--ease)]
                  hover:text-[var(--amber)] hover:border-[rgba(255,122,80,0.70)] hover:shadow-[0_0_24px_-6px_rgba(255,122,80,0.60)]
                "
                href={reel.url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on YouTube"
              >
                <YouTubeIcon size={16} />
              </a>
            </div>
          </div>
        ) : (
          /* ── Instagram: post view — video + post panel ─────── */
          <div
            className={`
              glass
              flex flex-col lg:flex-row
              overflow-hidden
              rounded-[22px]
              w-[min(420px,calc(100vw-32px))] lg:w-auto
              [animation:pop_0.5s_var(--ease)_both]
              ${glow}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media */}
            <div
              className={`
                relative shrink-0 bg-black
                w-full ${reel.image ? 'aspect-[3/4]' : 'aspect-[9/16]'}
                lg:w-auto lg:h-[min(84svh,860px)]
                ${hasMp4 === false && !reel.image ? 'max-lg:aspect-auto max-lg:h-[min(78svh,720px)] lg:aspect-[400/720]' : ''}
              `}
            >
              {player}
            </div>

            <PostPanel reel={reel} />
          </div>
        )}
      </div>

      {/* Close button (fixed corner) */}
      <button
        ref={closeRef}
        className="
          fixed top-[18px] right-[18px] z-[1]

          inline-grid place-items-center
          w-[50px] h-[50px]
          rounded-full
          text-[var(--text)]
          bg-[rgba(11,18,41,0.6)]
          border border-[var(--glass-border)]
          backdrop-blur-[12px]

          transition-[color,border-color,box-shadow]
          duration-300 ease-[var(--ease)]

          hover:text-[var(--amber)]
          hover:border-[rgba(255,122,80,0.70)]
          hover:shadow-[0_0_24px_-6px_rgba(255,122,80,0.60)]
        "
        onClick={close}
        aria-label="Close video"
      >
        <X size={20} />
      </button>
    </div>
  )
}

/* Instagram-style side panel. The video plays on the site; liking,
 * commenting and saving need an Instagram login, so those open the post.
 * AXAMP's own videos (type 'file') have no post: they offer the profile. */
function PostPanel({ reel }) {
  const [shared, setShared] = useState(false)
  const hasPost = reel.type === 'instagram'

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: reel.caption, url: reel.url })
      else {
        await navigator.clipboard.writeText(reel.url)
        setShared(true)
        setTimeout(() => setShared(false), 1800)
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  const accent = reel.warm ? 'var(--amber)' : 'var(--cyan)'
  // Client reels carry their own account + public counts; ours fall back to AXAMP
  const handle = reel.handle || igHandle
  const name = reel.name || site.legalName
  const profile = reel.handle ? `https://www.instagram.com/${reel.handle}/` : site.instagram
  const fmt = (n) => (n >= 1e4 ? `${+(n / 1e3).toFixed(1)}K` : n.toLocaleString('en-IN'))
  const counts = [
    reel.views >= 100 && `${fmt(reel.views)} views`,
    reel.likes >= 100 && `${fmt(reel.likes)} likes`,
    reel.comments >= 100 && `${fmt(reel.comments)} comments`,
  ].filter(Boolean)

  const action = `
    grid place-items-center w-11 h-11 rounded-full
    text-white/85
    transition-[color,background-color,transform] duration-300 ease-[var(--ease)]
    hover:bg-white/[0.07] hover:text-white hover:scale-110
  `

  return (
    <aside
      className="
        flex flex-col
        w-full lg:w-[340px]
        bg-[rgba(11,18,41,0.72)]
        border-t border-white/[0.08] lg:border-t-0 lg:border-l
      "
    >
      {/* Account */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
        {reel.handle ? (
          <span className="shrink-0 rounded-full bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-[var(--navy)] font-[family-name:var(--font-display)] text-[12px] font-bold text-white">
              {handle.slice(0, 1).toUpperCase()}
            </span>
          </span>
        ) : (
          <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-[var(--navy)] border border-[rgba(83,247,251,0.35)]">
            <LogoMark size={22} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-white truncate">
            {handle}
          </p>
          <p className="text-[12px] text-[var(--faint)] truncate">{name}</p>
        </div>
        <a
          href={profile}
          target="_blank"
          rel="noreferrer"
          className="
            rounded-full px-4 py-2
            font-[family-name:var(--font-display)] text-[12.5px] font-semibold
            text-[var(--navy)]
            transition-[filter,transform] duration-300 hover:brightness-110 hover:-translate-y-px
          "
          style={{ background: accent }}
        >
          Follow
        </a>
      </div>

      {/* Caption */}
      <div className="flex-1 px-5 py-4 max-lg:pb-2">
        <p className="text-[14px] leading-[1.6] text-white/85">
          <span className="mr-2 font-semibold text-white">{handle}</span>
          {reel.caption}
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-white/[0.08] px-3 pt-2 pb-4">
        <div className="flex items-center">
          {hasPost && (
            <>
              <a className={action} href={reel.url} target="_blank" rel="noreferrer" aria-label="Like on Instagram" title="Like on Instagram">
                <Heart size={22} />
              </a>
              <a className={action} href={reel.url} target="_blank" rel="noreferrer" aria-label="Comment on Instagram" title="Comment on Instagram">
                <MessageCircle size={22} />
              </a>
            </>
          )}
          <button type="button" className={action} onClick={share} aria-label="Share this reel" title="Share">
            {shared ? <Check size={22} style={{ color: accent }} /> : <Send size={21} />}
          </button>
          {hasPost && (
            <a className={`${action} ml-auto`} href={reel.url} target="_blank" rel="noreferrer" aria-label="Save on Instagram" title="Save on Instagram">
              <Bookmark size={22} />
            </a>
          )}
        </div>

        {counts.length > 0 && (
          <p className="px-2 pt-1 font-[family-name:var(--font-display)] text-[14px] font-semibold text-white">
            {counts.join(' · ')}
          </p>
        )}

        <p aria-live="polite" className="px-2 pt-1 text-[12px] text-[var(--faint)]">
          {shared ? 'Link copied' : hasPost ? 'Likes & comments happen on Instagram' : 'An official AXAMP video'}
        </p>

        <a
          href={reel.url}
          target="_blank"
          rel="noreferrer"
          className="
            mx-2 mt-4 flex items-center justify-center gap-2.5
            rounded-full border border-white/12 bg-white/[0.04]
            py-3
            font-[family-name:var(--font-display)] text-[13.5px] font-semibold text-white
            transition-[border-color,background-color,box-shadow] duration-300 ease-[var(--ease)]
            hover:border-[rgba(255,122,80,0.7)] hover:bg-white/[0.07] hover:shadow-[0_0_24px_-6px_rgba(255,122,80,0.6)]
          "
        >
          <InstagramIcon size={17} />
          {hasPost ? 'View post on Instagram' : 'More on our Instagram'}
        </a>
      </div>
    </aside>
  )
}

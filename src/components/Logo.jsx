// Official AXAMP artwork, cut out from public/assets/AXAMP_LOGO.png
export const LOGO = {
  mark: '/assets/brand/axamp-mark.webp',       // 738×720 — large uses
  markSm: '/assets/brand/axamp-mark-sm.webp',  // 131×128 — nav, cards
  wordmark: '/assets/brand/axamp-wordmark.webp', // 733×96
}

const MARK_RATIO = 738 / 720
const WORD_RATIO = 733 / 96

export function LogoMark({ size = 34, className = '' }) {
  return (
    <img
      className={`shrink-0 drop-shadow-[0_0_12px_rgba(83,247,251,0.35)] ${className}`}
      src={size > 64 ? LOGO.mark : LOGO.markSm}
      width={Math.round(size * MARK_RATIO)}
      height={size}
      alt=""
      aria-hidden="true"
      draggable="false"
      decoding="async"
    />
  )
}

// `wordHeight` sets the wordmark's height (px) on its own; `wordClassName`
// can resize it per breakpoint (keep `w-auto` so it stays in proportion).
export default function Logo({ onClick, size = 34, wordHeight, wordClassName = '' }) {
  const wordH = wordHeight ?? Math.round(size * 0.44)
  return (
    <a
      href="/"
      className="inline-flex items-center gap-[12px]"
      onClick={onClick}
      aria-label="AXAMP home"
    >
      <LogoMark size={size} />
      <img
        className={`shrink-0 ${wordClassName}`}
        src={LOGO.wordmark}
        width={Math.round(wordH * WORD_RATIO)}
        height={wordH}
        alt=""
        aria-hidden="true"
        draggable="false"
        decoding="async"
      />
    </a>
  )
}

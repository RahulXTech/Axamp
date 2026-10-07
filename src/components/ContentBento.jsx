import { useEffect, useRef } from 'react'
import { BookOpen, Clapperboard, Clock, MessagesSquare, Smile, Sparkles } from 'lucide-react'

/* ------------------------------------------------------------------
   "Content that matters" — a bento grid. Each card carries a small,
   looping preview of the idea, and a spotlight (fill + border) follows
   the cursor across the card. Animations live in styles.css (bento-*).

   Desktop layout (3 columns):
     [ Video quality ······ ][ Peak  ]
     [ Story   ][ Fun      ][ hours ]
     [ Trend   ][ Interaction ······ ]
------------------------------------------------------------------ */

const icons = {
  clapperboard: Clapperboard, clock: Clock, book: BookOpen,
  smile: Smile, sparkles: Sparkles, messages: MessagesSquare,
}

const pad = (n) => String(n).padStart(2, '0')

// Spotlight position, in px from the card's top-left
const track = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* ── Previews ──────────────────────────────────────────────────── */

// Three real AXAMP reels fanned out; the front one plays (muted) while
// the card is on screen, and only then downloads.
function VideoPreview() {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.3 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const side = `
    absolute h-[170px] w-[96px] rounded-[16px] border border-white/10 object-cover
    opacity-55 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]
    transition-[transform,opacity] duration-700 ease-[var(--ease)]
    group-hover:opacity-80
  `

  return (
    <div className="relative flex h-full min-h-[236px] items-center justify-center">
      <div className="absolute h-[140px] w-[70%] rounded-full bg-[radial-gradient(ellipse,rgba(83,247,251,0.18),transparent_70%)] blur-xl" />

      <img
        src="/posters/DcolKzgveyY.webp"
        alt=""
        loading="lazy"
        decoding="async"
        className={`${side} -translate-x-[78%] -rotate-[9deg] group-hover:-translate-x-[100%] group-hover:-rotate-[13deg]`}
      />
      <img
        src="/posters/DdYKEi4y4tV.webp"
        alt=""
        loading="lazy"
        decoding="async"
        className={`${side} translate-x-[78%] rotate-[9deg] group-hover:translate-x-[100%] group-hover:rotate-[13deg]`}
      />

      <div className="relative z-[1] h-[214px] w-[120px] overflow-hidden rounded-[18px] border border-[rgba(83,247,251,0.45)] bg-[var(--navy)] shadow-[0_24px_50px_-14px_rgba(0,0,0,0.85),0_0_34px_-10px_rgba(83,247,251,0.6)] transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.05]">
        <video
          ref={videoRef}
          src="/videos/DYrgVitzsF_.mp4"
          poster="/posters/DYrgVitzsF_.webp"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,41,0.35),transparent_30%,transparent_70%,rgba(11,18,41,0.7))]" />
        <span className="bento-shine pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.16em] text-white backdrop-blur-sm">
          <span className="bento-blink h-1 w-1 rounded-full bg-[#ff4d4d] shadow-[0_0_6px_#ff4d4d]" />
          REC
        </span>
        <span className="absolute right-2 top-2 rounded border border-[rgba(83,247,251,0.5)] bg-black/55 px-1 py-px text-[8px] font-bold tracking-[0.08em] text-[var(--cyan)] backdrop-blur-sm">
          4K
        </span>

        <div className="absolute inset-x-2 bottom-2 h-[3px] overflow-hidden rounded-full bg-white/25">
          <span className="bento-progress block h-full origin-left rounded-full bg-[var(--cyan)] shadow-[0_0_6px_var(--cyan)]" />
        </div>
      </div>
    </div>
  )
}

// Audience activity through the day — the peak glows
const BARS = [18, 24, 30, 26, 38, 34, 30, 46, 62, 92, 100, 70]
function PeakPreview() {
  return (
    <div className="flex h-full min-h-[200px] flex-col gap-3">
      <div className="relative flex flex-1 items-end gap-[6px] pt-8">
        <span className="absolute right-[10%] top-0 rounded-full border border-[rgba(255,122,80,0.45)] bg-[rgba(255,122,80,0.12)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--amber)]">
          Post here
        </span>
        {BARS.map((h, i) => {
          const peak = h >= 90
          return (
            <span
              key={i}
              className={`
                bento-bar flex-1 origin-bottom rounded-t-[6px]
                ${peak
                  ? 'bg-gradient-to-t from-[rgba(255,122,80,0.35)] to-[var(--amber)] shadow-[0_0_18px_rgba(255,122,80,0.55)]'
                  : 'bg-gradient-to-t from-[rgba(83,247,251,0.06)] to-[rgba(83,247,251,0.45)]'}
              `}
              style={{ height: `${h}%`, animationDelay: `${i * 110}ms` }}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] font-semibold tracking-[0.14em] text-[var(--faint)]">
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
    </div>
  )
}

// Hook → story → payoff, a dot riding the arc
const ARC = 'M14 104 C 70 104, 86 34, 150 40 S 232 92, 286 22'
function StoryPreview() {
  return (
    <svg viewBox="0 -4 300 132" className="h-[140px] w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="bento-arc" x1="0" x2="1">
          <stop offset="0" stopColor="#53f7fb" stopOpacity="0.2" />
          <stop offset="0.6" stopColor="#53f7fb" />
          <stop offset="1" stopColor="#ff7a50" />
        </linearGradient>
      </defs>
      <path d={ARC} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
      <path d={ARC} fill="none" stroke="url(#bento-arc)" strokeWidth="2.5" strokeLinecap="round" className="bento-draw" pathLength="1" />
      {[
        [14, 104, 'Hook', 22, 'start'],
        [150, 40, 'Story', -14, 'middle'],
        [286, 22, 'Payoff', -14, 'end'],
      ].map(([x, y, label, dy, anchor]) => (
        <g key={label}>
          <circle cx={x} cy={y} r="4" fill="#0b1229" stroke="#53f7fb" strokeWidth="1.5" />
          <text x={anchor === 'start' ? x - 6 : anchor === 'end' ? x + 6 : x} y={y + dy} textAnchor={anchor} fill="rgba(232,241,255,0.55)" fontSize="11" fontWeight="600" letterSpacing="1">
            {label.toUpperCase()}
          </text>
        </g>
      ))}
      <circle r="6" fill="#ff7a50" style={{ filter: 'drop-shadow(0 0 6px #ff7a50)' }}>
        <animateMotion dur="4s" repeatCount="indefinite" path={ARC} />
      </circle>
    </svg>
  )
}

// Reactions floating up
const EMOJI = [
  ['😂', '12%', '0s'], ['❤️', '30%', '1.1s'], ['🔥', '50%', '0.5s'],
  ['😍', '68%', '1.7s'], ['👏', '84%', '0.9s'], ['✨', '40%', '2.2s'],
]
function FunPreview() {
  return (
    <div className="relative h-[140px] overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-12 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,122,80,0.25),transparent_70%)]" />
      {EMOJI.map(([e, left, delay]) => (
        <span
          key={e}
          className="bento-float absolute bottom-0 text-[26px]"
          style={{ left, animationDelay: delay }}
          aria-hidden="true"
        >
          {e}
        </span>
      ))}
    </div>
  )
}

// Hashtags drifting both ways
const TAGS = ['#Trending', '#Reels', '#Viral', '#BehindTheScenes', '#ForYou', '#Inspiration']
function TrendPreview() {
  const row = (reverse) => (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
      <div
        className="bento-marquee flex shrink-0 gap-2 pr-2"
        style={reverse ? { animationDirection: 'reverse', animationDelay: '-7s' } : undefined}
      >
        {[...TAGS, ...TAGS].map((t, i) => (
          <span
            key={i}
            className={`
              whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold
              ${i % 3 === 0
                ? 'border-[rgba(83,247,251,0.4)] bg-[rgba(83,247,251,0.08)] text-[var(--cyan)]'
                : 'border-white/10 bg-white/[0.04] text-white/70'}
            `}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <div className="flex h-[140px] flex-col justify-center gap-2.5">
      {row(false)}
      {row(true)}
    </div>
  )
}

// A comment thread that becomes a visit
const CHAT = [
  { me: false, text: 'Where is this place? 😍' },
  { me: true, text: 'Sent you the location 📍' },
  { me: false, text: 'Coming this weekend!' },
]
function ChatPreview() {
  return (
    <div className="flex h-full min-h-[190px] flex-col justify-center gap-2.5 rounded-[18px] border border-white/[0.08] bg-[rgba(5,9,22,0.45)] p-4">
      {CHAT.map((m, i) => (
        <div
          key={i}
          className={`bento-chat flex items-end gap-2 ${m.me ? 'flex-row-reverse' : ''}`}
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
              m.me ? 'bg-[var(--cyan)] text-[var(--navy)]' : 'bg-white/10 text-white/80'
            }`}
          >
            {m.me ? 'AX' : 'U'}
          </span>
          <span
            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
              m.me
                ? 'rounded-br-md bg-[linear-gradient(135deg,rgba(83,247,251,0.25),rgba(83,247,251,0.12))] text-white'
                : 'rounded-bl-md bg-white/[0.07] text-white/85'
            }`}
          >
            {m.text}
          </span>
        </div>
      ))}
      <div className="bento-chat flex items-center gap-1 pl-9" style={{ animationDelay: '2.7s' }}>
        {[0, 1, 2].map((d) => (
          <span key={d} className="bento-typing h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: `${d * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

const previews = {
  video: VideoPreview, peak: PeakPreview, story: StoryPreview,
  fun: FunPreview, trend: TrendPreview, chat: ChatPreview,
}

// Grid placement + inner layout per card (desktop: 3 columns, tablet: 2)
const layout = {
  video: { cell: 'min-[640px]:col-span-2', inner: 'min-[900px]:flex-row min-[900px]:items-stretch', text: 'min-[900px]:w-[40%] min-[900px]:justify-end' },
  peak: { cell: 'min-[900px]:row-span-2', inner: '', text: '' },
  story: { cell: '', inner: '', text: '' },
  fun: { cell: '', inner: '', text: '', warm: true },
  trend: { cell: '', inner: '', text: '' },
  chat: { cell: 'min-[640px]:col-span-2', inner: 'min-[900px]:flex-row min-[900px]:items-stretch', text: 'min-[900px]:w-[40%] min-[900px]:justify-end' },
}

function BentoCard({ item, index }) {
  const Icon = icons[item.icon]
  const Preview = previews[item.visual]
  const l = layout[item.visual] ?? layout.story
  const warm = l.warm || item.visual === 'peak'

  return (
    <li
      onPointerMove={track}
      className={`
        bento-card group relative isolate overflow-hidden
        rounded-[28px] border border-white/[0.08]
        bg-[linear-gradient(160deg,rgba(22,33,74,0.7),rgba(11,18,41,0.92))]
        shadow-[0_30px_60px_-28px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]
        transition-transform duration-500 ease-[var(--ease)]
        hover:-translate-y-1
        ${l.cell}
      `}
      style={{ '--spot': warm ? '255,122,80' : '83,247,251' }}
    >
      <div className={`flex h-full flex-col gap-6 p-6 ${l.inner}`}>
        {/* Preview first on stacked cards, beside the text on wide ones */}
        <div className={`order-1 flex-1 ${l.inner ? 'min-[900px]:order-2' : ''}`}>
          {Preview && <Preview />}
        </div>

        <div className={`order-2 flex flex-col gap-2 ${l.inner ? 'min-[900px]:order-1' : ''} ${l.text}`}>
          <div className="mb-1 flex items-center gap-3">
            <span
              className={`
                grid h-10 w-10 place-items-center rounded-xl border
                transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110
                ${warm
                  ? 'border-[rgba(255,122,80,0.4)] bg-[rgba(255,122,80,0.10)] text-[var(--amber)]'
                  : 'border-[rgba(83,247,251,0.35)] bg-[rgba(83,247,251,0.08)] text-[var(--cyan)]'}
              `}
            >
              {Icon && <Icon size={18} strokeWidth={1.9} aria-hidden="true" />}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[var(--faint)]">{pad(index + 1)}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.2rem,1.6vw,1.45rem)] font-[700] tracking-[-0.02em] text-white">
            {item.title}
          </h3>
          <p className="max-w-[420px] text-[14.5px] leading-[1.6] text-[var(--muted)]">{item.text}</p>
        </div>
      </div>
    </li>
  )
}

export default function ContentBento({ items }) {
  return (
    <ul
      data-slide="up"
      data-slide-stagger
      className="m-0 mt-12 max-[640px]:mt-6 grid list-none grid-cols-1 gap-4 p-0 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3"
    >
      {items.map((item, i) => (
        <BentoCard key={item.title} item={item} index={i} />
      ))}
    </ul>
  )
}


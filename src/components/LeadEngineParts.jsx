import { useLayoutEffect, useState } from 'react'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

import { site } from '../data/site'
import { WhatsAppIcon } from './icons'

/* ============================================================
   Shared pieces of the lead engine diagrams (LeadEngine.jsx):
   card shell, connector lines, labels and phone arrows.
============================================================ */

export const pad = (n) => String(n).padStart(2, '0')

/* Live WhatsApp lead-flow demo (real estate only), styled for the
   proof-video card: a solid "now playing" panel with a big play button. It's the main action of the card, so it
   sits clearly above the videos (near-opaque fill, orbiting rim light,
   sheen) and grows with the room it gets: the anchor is a size container,
   so the overlay on wide desktops gets the large size and phones the compact one. */
export function ProofDemoButton({ className = '', ...rest }) {
  return (
    <a
      href={site.whatsappDemo}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the live WhatsApp lead-flow demo"
      {...rest}
      className={`
        proof-demo group @container block rounded-[22px] text-left @lg:rounded-[26px]
        border-[1.5px] border-[rgba(37,211,102,0.7)]
        bg-[linear-gradient(120deg,rgba(8,46,30,0.97),rgba(8,14,34,0.97)_62%)] backdrop-blur-xl
        shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_60px_-16px_rgba(0,0,0,0.95),0_0_60px_-10px_rgba(37,211,102,0.8)]
        transition-[border-color,box-shadow,translate] duration-500 ease-[var(--ease)]
        hover:-translate-y-1 hover:border-[#3ee07f] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_32px_64px_-16px_rgba(0,0,0,0.95),0_0_80px_-6px_rgba(37,211,102,1)]
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3ee07f]
        ${className}
      `}
    >
      <span aria-hidden="true" className="proof-demo__sheen" />

      <span className="relative flex items-center gap-3.5 p-2.5 pr-4 @md:gap-4 @md:p-3 @md:pr-5 @lg:gap-5 @lg:p-3.5 @lg:pr-5">
        {/* Play button with a pulsing ring */}
        <span className="relative grid h-14 w-14 shrink-0 place-items-center @md:h-16 @md:w-16 @lg:h-[76px] @lg:w-[76px]">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-30" />
          <span className="relative grid h-full w-full place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#5cf095,#25d366_55%,#14a84d)] text-[#062b14] shadow-[0_0_32px_-2px_rgba(37,211,102,1)] transition-transform duration-500 ease-[var(--ease)] group-hover:scale-105">
            <Play fill="currentColor" strokeWidth={0} className="h-[22px] w-[22px] translate-x-[2px] @md:h-[26px] @md:w-[26px] @lg:h-[30px] @lg:w-[30px]" aria-hidden="true" />
          </span>
          {/* WhatsApp badge */}
          <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-[#0b1a22] bg-white text-[#25d366] @lg:h-7 @lg:w-7">
            <WhatsAppIcon size={13} />
          </span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1 @lg:gap-1.5">
          <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#3ee07f] @lg:text-[12px]">
            <span className="relative flex h-1.5 w-1.5 @lg:h-2 @lg:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ee07f] opacity-70" />
              <span className="relative inline-flex h-full w-full rounded-full bg-[#3ee07f]" />
            </span>
            Live demo
          </span>
          <span className="font-[family-name:var(--font-display)] text-[16px] font-bold leading-tight tracking-[-0.01em] text-white @md:text-[19px] @lg:text-[23px]">
            Watch the live WhatsApp demo
          </span>
          <span className="text-[12px] leading-snug text-white/65 @md:text-[13px] @lg:text-[14.5px]">See what every buyer receives</span>
        </span>

        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25d366] text-[#062b14] shadow-[0_0_20px_-4px_rgba(37,211,102,0.9)] transition-[background-color,transform] duration-300 group-hover:scale-105 group-hover:bg-white @md:h-11 @md:w-11 @lg:h-12 @lg:w-12">
          <ArrowRight strokeWidth={2.6} className="proof-demo__icon h-[18px] w-[18px] @lg:h-5 @lg:w-5" aria-hidden="true" />
        </span>
      </span>
    </a>
  )
}

export const STROKES = {
  cyan: ['#53f7fb', '#4f9bff'],
  blue: ['#4f9bff', '#53f7fb'],
  google: ['#fbbc05', '#53f7fb'],
  maps: ['#ea4335', '#53f7fb'],
  green: ['#25d366', '#53f7fb'],
  mint: ['#7dffb3', '#53f7fb'],
  amber: ['#53f7fb', '#ffb347'],
}

/* Measures nodes (ignoring transforms, so mid-animation cards don't skew
   the lines) and returns a curved path for each link.
   A link is [id, from node, from side, to node, to side, colour]. */
export function useFlowPaths(rootRef, enabled, links) {
  const [flow, setFlow] = useState({ w: 0, h: 0, paths: [] })

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) {
      setFlow({ w: 0, h: 0, paths: [] })
      return
    }

    const box = (el) => {
      let x = 0
      let y = 0
      let n = el
      while (n && n !== root) {
        x += n.offsetLeft
        y += n.offsetTop
        n = n.offsetParent
      }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight }
    }
    const anchor = (b, side) =>
      side === 'top' ? [b.x + b.w / 2, b.y]
      : side === 'bottom' ? [b.x + b.w / 2, b.y + b.h]
      : side === 'left' ? [b.x, b.y + b.h / 2]
      : [b.x + b.w, b.y + b.h / 2]

    const measure = () => {
      const node = (id) => root.querySelector(`[data-node="${id}"]`)
      const paths = links.map(([id, from, fs, to, ts, tone]) => {
        const a = node(from)
        const b = node(to)
        if (!a || !b) return null
        const [ax, ay] = anchor(box(a), fs)
        const [bx, by] = anchor(box(b), ts)
        const vertical = fs === 'bottom'
        const k = vertical ? Math.max(28, (by - ay) * 0.55) : Math.max(24, (bx - ax) * 0.5)
        const d = vertical
          ? `M${ax},${ay} C${ax},${ay + k} ${bx},${by - k} ${bx},${by}`
          : `M${ax},${ay} C${ax + k},${ay} ${bx - k},${by} ${bx},${by}`
        return { id, d, tone, a: [ax, ay], b: [bx, by] }
      }).filter(Boolean)
      setFlow({ w: root.offsetWidth, h: root.offsetHeight, paths })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [rootRef, enabled, links])

  return flow
}

/* Connector layer (desktop): faint dashed track, the line drawn on
   scroll, and "lead" dots travelling it once drawn. */
export function FlowLines({ flow }) {
  return (
    <svg className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible" width={flow.w} height={flow.h} aria-hidden="true">
      <defs>
        {flow.paths.map(({ id, tone, a, b }) => (
          <linearGradient key={id} id={`le-g-${id}`} gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
            <stop offset="0" stopColor={STROKES[tone][0]} />
            <stop offset="1" stopColor={STROKES[tone][1]} />
          </linearGradient>
        ))}
      </defs>
      {flow.paths.map(({ id, d, b }) => (
        <g key={id}>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" strokeDasharray="4 6" />
          <path
            id={`le-p-${id}`}
            data-line={id}
            d={d}
            fill="none"
            stroke={`url(#le-g-${id})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            className="le-glow"
          />
          <g data-dots={id}>
            {[0, 1].map((k) => (
              <circle key={k} r="3.5" fill="#e9feff" className="le-glow">
                <animateMotion dur="2.6s" begin={`${k * 1.3}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#le-p-${id}`} />
                </animateMotion>
              </circle>
            ))}
            <circle cx={b[0]} cy={b[1]} r="4.5" fill="#53f7fb" className="le-glow" />
          </g>
        </g>
      ))}
    </svg>
  )
}

/* ─── Card shell: gradient hairline border, corner glow, hover lift ─── */

export const TONES = {
  cyan: { border: 'rgba(83,247,251,0.55)', glow: 'rgba(83,247,251,0.35)', orb: 'from-[#53f7fb] to-[#2bb6d8]' },
  blue: { border: 'rgba(79,155,255,0.6)', glow: 'rgba(79,155,255,0.35)', orb: 'from-[#6aa9ff] to-[#3b6ff5]' },
  google: { border: 'rgba(251,188,5,0.55)', glow: 'rgba(52,168,83,0.3)', orb: 'from-white to-[#e8eefc]' },
  maps: { border: 'rgba(234,67,53,0.55)', glow: 'rgba(234,67,53,0.28)', orb: 'from-white to-[#e8eefc]' },
  green: { border: 'rgba(37,211,102,0.6)', glow: 'rgba(37,211,102,0.3)', orb: 'from-[#3ee07f] to-[#14a650]' },
  mint: { border: 'rgba(125,255,179,0.6)', glow: 'rgba(125,255,179,0.3)', orb: 'from-[#9dffc6] to-[#3ccf86]' },
  gold: { border: 'rgba(255,190,90,0.75)', glow: 'rgba(255,179,71,0.4)', orb: 'from-[#ffd166] to-[#ff9f43]' },
}

export function Shell({ node, anim, tone = 'cyan', className = '', innerClass = '', children }) {
  const t = TONES[tone]
  return (
    <div
      data-node={node}
      data-anim={anim}
      className={`le-card group relative z-10 rounded-[26px] p-px transition-[translate,box-shadow] duration-500 ease-[var(--ease)] hover:-translate-y-1 ${className}`}
      style={{
        background: `linear-gradient(155deg, ${t.border}, rgba(255,255,255,0.07) 32%, rgba(255,255,255,0.03) 68%, ${t.border.replace(/[\d.]+\)$/, '0.25)')})`,
        '--le-glow': t.glow,
      }}
    >
      <div className={`relative h-full overflow-hidden rounded-[25px] bg-[linear-gradient(165deg,#141f4b_0%,#0c1534_55%,#0a1129_100%)] ${innerClass}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div aria-hidden="true" className="glow pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: t.glow, opacity: 0.55 }} />
        {children}
      </div>
    </div>
  )
}

export function Orb({ tone = 'cyan', children, size = 'h-12 w-12' }) {
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center rounded-[16px] bg-gradient-to-br ${TONES[tone].orb} text-[var(--navy)] shadow-[0_10px_24px_-8px_var(--le-glow),inset_0_1px_0_rgba(255,255,255,0.6)]`}>
      {children}
    </span>
  )
}

export function Tag({ children }) {
  return <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{children}</span>
}

/* Numbered mini stepper: ① Reel ── ② Profile ── ③ Enquiry */
export function Stepper({ items }) {
  return (
    <ol className="m-0 flex list-none items-center gap-2 p-0">
      {items.map((t, i) => (
        <li key={t} className={`flex items-center gap-2 ${i < items.length - 1 ? 'flex-1' : ''}`}>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white/80">{i + 1}</span>
            <span className="text-[12px] font-semibold text-white/85">{t}</span>
          </span>
          {i < items.length - 1 && <span aria-hidden="true" className="h-px min-w-3 flex-1 bg-gradient-to-r from-white/25 to-white/5" />}
        </li>
      ))}
    </ol>
  )
}

/* ─── Section labels ───────────────────────────────────────────────── */

export function StepLabel({ n, title, sub }) {
  return (
    <div data-anim="label" className="relative z-10 mb-6 flex items-center gap-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(83,247,251,0.35)] bg-[rgba(83,247,251,0.08)] font-[family-name:var(--font-display)] text-[12px] font-bold text-[var(--cyan)]">
        {pad(n)}
      </span>
      <span className="rounded-full bg-[var(--navy)] px-2 py-1 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.2em] text-white">{title}</span>
      <span className="hidden rounded-full bg-[var(--navy)] px-2 py-1 text-[13px] text-[var(--faint)] sm:inline">— {sub}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  )
}

export function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

/* Desktop timeline helper: draws the given links in order, then sets
   their "lead" dots travelling. */
export const makeDraw = (tl, q) => (ids, pos, stagger = 0.12) =>
  tl
    .to(ids.flatMap((id) => q(`[data-line="${id}"]`)), { strokeDashoffset: 0, stagger, ease: 'none' }, pos)
    .to(ids.flatMap((id) => q(`[data-dots="${id}"]`)), { autoAlpha: 1, duration: 0.15 })

/* ─── Source card: a channel with a preview and its steps ──────────── */

export function SourceCard({ node, tone, icon, title, note, tag, steps, children }) {
  return (
    <Shell node={node} anim="src" tone={tone}>
      <div className="flex h-full flex-col gap-4 p-5 max-lg:gap-3 max-lg:p-4">
        <div className="flex items-center gap-3">
          <Orb tone={tone}>{icon}</Orb>
          <div className="flex-1">
            <p className="font-[family-name:var(--font-display)] text-[18px] font-bold leading-tight text-white">{title}</p>
            <p className="text-[12.5px] text-[var(--faint)]">{note}</p>
          </div>
          <Tag>{tag}</Tag>
        </div>

        {/* Channel preview */}
        <div className="relative h-[104px] overflow-hidden rounded-[16px] border border-white/[0.07] bg-[rgba(5,9,26,0.55)] max-lg:h-[96px]">{children}</div>

        <div className="mt-auto">
          <Stepper items={steps} />
        </div>
      </div>
    </Shell>
  )
}

/* ─── Step card: one step with a mini UI of what happens ───────────── */

export function StepCard({ node, n, tone = 'cyan', icon: Icon, title, text, children }) {
  const gold = tone === 'gold'
  return (
    <Shell node={node} anim="step" tone={tone} className={`h-full ${gold ? 'deal-card' : ''}`}>
      <div className="flex h-full flex-col gap-3 p-5 max-lg:gap-2 max-lg:p-4">
        <div className="flex items-center justify-between">
          <Orb tone={tone}>
            <Icon size={21} strokeWidth={2} aria-hidden="true" />
          </Orb>
          <span className={`font-[family-name:var(--font-display)] text-[10.5px] font-bold uppercase tracking-[0.2em] ${gold ? 'text-[#ffcf86]' : 'text-white/35'}`}>
            Step {pad(n)}
          </span>
        </div>
        <p className={`font-[family-name:var(--font-display)] text-[17px] font-bold leading-tight ${gold ? 'text-[#ffe0ae]' : 'text-white'}`}>{title}</p>
        <p className="text-[13px] leading-[1.55] text-[var(--muted)]">{text}</p>
        <div className="mt-auto rounded-[14px] border border-white/[0.07] bg-[rgba(5,9,26,0.55)] p-3">{children}</div>
      </div>
      {gold && (
        <>
          <Sparkles size={18} className="deal-spark absolute -right-2 -top-2 z-20 text-[#ffd166]" aria-hidden="true" />
          <Sparkles size={12} className="deal-spark deal-spark--b absolute -left-1.5 bottom-10 z-20 text-[#ffd166]" aria-hidden="true" />
        </>
      )}
    </Shell>
  )
}

import { Fragment, memo, useCallback, useId, useState } from 'react'
import { FaArrowRight, FaBoxOpen, FaBullseye, FaCheck, FaChevronDown } from 'react-icons/fa6'

import CompactHero from '../components/CompactHero'
import PackageDetail, { PackageIcon, packageMessage } from '../components/PackageDetail'
import { WhatsAppIcon } from '../components/icons'
import { SHOW_PRICES, cards, faqs, inr, planById } from '../data/packages'
import { whatsappLink } from '../data/site'
import { useGo } from '../lib/nav'

function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <div data-slide="up" className={`flex flex-col gap-3 ${center ? 'items-center text-center' : ''}`}>
      <p className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
        <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent" />
        {eyebrow}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.8vw,3.2rem)] font-[800] leading-[1.05] tracking-[-0.035em] text-white text-balance">{title}</h2>
      {text && <p className="max-w-[600px] text-[15.5px] leading-[1.6] text-[var(--muted)]">{text}</p>}
    </div>
  )
}

/* ── Package cards ───────────────────────────────────────────────
   Performance Marketing and Branding are columns holding their two
   packages, one above the other; Top 1% Realtors is one tall card.

   The cards are flat and static, kept light for low-end phones,
   tablets and laptops. The 3D pointer/scroll tilt, the
   spinning rim, the moving swirl and the blurred glows were dropped
   (4 Nov 2026): they kept the page repainting and janky. A mouse
   still lifts a card slightly on hover (CSS only).
------------------------------------------------------------------ */

function Card({ children, radius, className = '' }) {
  return (
    <div
      className={`relative transition-transform duration-300 ease-[var(--ease)] hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
      style={{ borderRadius: radius }}
    >
      {children}
    </div>
  )
}

// Liquid glass (styles.css .lg*): soft rounded corners — cards 26px, columns 36px, buttons pills
const R = 26

// Accent for a glass element (.lg, .lg-chip, .lg-btn)
const glass = (rgb, fill) => ({ '--lg': rgb, ...(fill && { '--lg-fill': fill }) })

const SECONDARY = 'lg-ghost relative'

function BestFor({ text, hex, rgb, style }) {
  return (
    <div className="lg-chip relative mt-5 flex items-center gap-3.5 rounded-[18px] py-2.5 pl-2.5 pr-4" style={{ ...glass(rgb), ...style }}>
      <span className="lg-chip relative grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ ...glass(rgb), color: hex }}>
        <FaBullseye size={17} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase leading-none tracking-[0.22em]" style={{ color: hex }}>Best for</span>
        <span className="mt-1.5 block font-[family-name:var(--font-display)] text-[15.5px] font-[700] leading-[1.25] tracking-[-0.01em] text-white">{text}</span>
      </span>
    </div>
  )
}

// Green tick on the regular cards
const TICK = (
  <span className="lg-chip relative mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#34d399]" style={glass('52, 211, 153')}>
    <FaCheck size={11} aria-hidden="true" />
  </span>
)

function Highlights({ items, mark = TICK, className = 'mt-5 flex flex-col', style }) {
  return (
    <ul className={`m-0 list-none gap-2.5 p-0 ${className}`} style={style}>
      {items.map((h) => (
        <li key={h} className="flex gap-3 text-[14px] leading-[1.45] text-white/85">
          {mark}
          {h}
        </li>
      ))}
    </ul>
  )
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]'

/* Metal finishes, one per price tier (a card's `finish`): Performance is
   rose bronze lit brand coral, Branding is midnight platinum lit brand cyan,
   Top 1% is black and gold. Each finish drives the dark face, the swirl behind
   it (`aura`: how strongly — the higher the tier, the brighter), the seal
   ticks, icon, name and button. */
const FINISH = {
  gold: {
    stops: [['0', '#fff1c4'], ['0.35', '#f5cd5f'], ['0.7', '#d49a2c'], ['1', '#f3d27e']],
    text: 'linear-gradient(100deg, #fff1c4, #f5cd5f 40%, #e0a63a 75%, #fbe3a2)',
    btn: 'linear-gradient(95deg, #ffe08a, #ffbe4d 50%, #ff9a3c)',
    ink: '#1c1305', // button text
    check: '#fff', // the tick on the seal
    shade: '#8a5a12', // shadow under the tick
    rgb: '245, 196, 81', // the metal
    warm: '255, 154, 60', // second light
    lite: '255, 241, 196', // rim highlight
    ring: ['#f5c451', '#ffbe4d'],
    face: 'linear-gradient(180deg, #18130b, #0c0a07 55%, #110d08)',
    pane: 'linear-gradient(180deg, #130f09, #080604)', // a column's outer pane
    well: 'radial-gradient(circle at 50% 28%, #2c2314, #0d0a06 72%)',
    pill: '#140f08',
    aura: 1,
  },
  platinum: {
    stops: [['0', '#ffffff'], ['0.35', '#dce6f1'], ['0.7', '#8ea4bc'], ['1', '#c8f7fb']],
    text: 'linear-gradient(100deg, #ffffff, #dce6f1 40%, #a3b6ca 72%, #c8f7fb)',
    btn: 'linear-gradient(95deg, #f5f9fd, #c6dceb 45%, #53f7fb)',
    ink: '#071226',
    check: '#0b1730',
    shade: '#ffffff',
    rgb: '190, 210, 232',
    warm: '83, 247, 251',
    lite: '240, 247, 255',
    ring: ['#53f7fb', '#c6dceb'],
    face: 'linear-gradient(180deg, #141c29, #0b111b 55%, #0e1520)',
    pane: 'linear-gradient(180deg, #0d1420, #070b12)',
    well: 'radial-gradient(circle at 50% 28%, #26323f, #0a0f17 72%)',
    pill: '#0d141f',
    aura: 0.7,
  },
  bronze: {
    stops: [['0', '#ffe0c7'], ['0.35', '#f0a273'], ['0.7', '#b0603a'], ['1', '#ffc3a0']],
    text: 'linear-gradient(100deg, #ffe4d1, #f6a878 40%, #d07a4e 72%, #ffcfb3)',
    btn: 'linear-gradient(95deg, #ffd2b0, #ff9a6b 50%, #ff7a50)',
    ink: '#2a0f05',
    check: '#fff',
    shade: '#6b2c10',
    rgb: '232, 150, 105',
    warm: '255, 122, 80',
    lite: '255, 228, 210',
    ring: ['#ff7a50', '#f0a273'],
    face: 'linear-gradient(180deg, #1d1410, #0f0a08 55%, #150e0b)',
    pane: 'linear-gradient(180deg, #150e0b, #0a0706)',
    well: 'radial-gradient(circle at 50% 28%, #35241b, #0e0907 72%)',
    pill: '#150d09',
    aura: 0.55,
  },
}

const metalStops = (f) => f.stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)
const metalText = (f) => ({ backgroundImage: f.text, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' })
const ringFor = (f) => `conic-gradient(from 0deg, ${f.stops[0][1]}, rgba(${f.rgb},0.25) 20%, ${f.ring[0]} 42%, rgba(${f.rgb},0.15) 66%, ${f.ring[1]} 85%, ${f.stops[0][1]})`
const useSvgId = (prefix) => `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`

// A "verified" seal in the metal with a tick, instead of the green tick
const SEAL = '12.00,1.10 13.47,2.72 15.37,1.63 16.27,3.62 18.41,3.18 18.65,5.35 20.82,5.59 20.38,7.73 22.37,8.63 21.28,10.53 22.90,12.00 21.28,13.47 22.37,15.37 20.38,16.27 20.82,18.41 18.65,18.65 18.41,20.82 16.27,20.38 15.37,22.37 13.47,21.28 12.00,22.90 10.53,21.28 8.63,22.37 7.73,20.38 5.59,20.82 5.35,18.65 3.18,18.41 3.62,16.27 1.63,15.37 2.72,13.47 1.10,12.00 2.72,10.53 1.63,8.63 3.62,7.73 3.18,5.59 5.35,5.35 5.59,3.18 7.73,3.62 8.63,1.63 10.53,2.72'

function SealTick({ f, className = 'h-6 w-6' }) {
  const id = useSvgId('st')
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      style={{ filter: `drop-shadow(0 3px 5px rgba(${f.rgb},0.5))` }}
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">{metalStops(f)}</linearGradient>
        <radialGradient id={`${id}h`} cx="0.35" cy="0.2" r="0.55">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={SEAL} fill={`url(#${id}g)`} stroke={`url(#${id}g)`} strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points={SEAL} fill={`url(#${id}h)`} />
      <path d="M7.6 12.4l3 3 5.9-6.2" fill="none" stroke={f.shade} strokeOpacity="0.35" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 0.6)" />
      <path d="M7.6 12.4l3 3 5.9-6.2" fill="none" stroke={f.check} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// A package icon in the metal, glowing softly
function MetalIcon({ f, name, size }) {
  const id = useSvgId('mi')
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">{metalStops(f)}</linearGradient>
        </defs>
      </svg>
      <PackageIcon
        name={name}
        size={size}
        style={{ fill: `url(#${id})`, filter: `drop-shadow(0 2px 6px rgba(${f.rgb},0.6))` }}
      />
    </>
  )
}

// A round dark well with a fine metal ring, holding the icon
function MetalWell({ f, name, size, className }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full ${className}`}
      style={{
        background: f.well,
        boxShadow: `inset 0 1px 0 rgba(${f.lite},0.4), inset 0 0 18px rgba(${f.rgb},0.14), 0 0 0 1px rgba(${f.rgb},0.4), 0 0 32px -6px rgba(${f.rgb},0.6)`,
      }}
    >
      <MetalIcon f={f} name={name} size={size} />
    </span>
  )
}

// Fine metal rings behind a card, spilling past its edges (static)
function Swirl({ f, className = 'left-[-16%] top-[-7%] h-[114%] w-[132%]', strength = 1 }) {
  const id = useSvgId('sw')
  return (
    <svg viewBox="-100 -100 200 200" preserveAspectRatio="none" aria-hidden="true" className={`absolute ${className}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">{metalStops(f)}</linearGradient>
      </defs>
      <g>
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse
            key={i}
            rx={64 + i * 3}
            ry={40 + i * 4.5}
            transform={`rotate(${i * 9 - 40})`}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth="1.2"
            strokeOpacity={(0.9 - i * 0.06) * strength}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  )
}

// A soft glow (a plain gradient, no blur filter) and the swirl, behind a card
function Aura({ f, swirl, strength }) {
  return (
    <>
      <span className="absolute -inset-10 rounded-[60px]" style={{ background: `radial-gradient(closest-side, rgba(${f.rgb},${0.5 * strength}), rgba(${f.warm},${0.2 * strength}) 60%, transparent)` }} />
      <Swirl f={f} className={swirl} strength={strength} />
    </>
  )
}

// A hand-drawn metal underline under a name
function Swoosh({ f, className = 'mt-1.5 h-2.5 w-[62%] max-w-[210px]' }) {
  return (
    <svg viewBox="0 0 150 10" preserveAspectRatio="none" aria-hidden="true" className={`block ${className}`}>
      <path d="M2 8 C 40 2, 105 0.5, 148 5" fill="none" stroke={`rgb(${f.rgb})`} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// A metal line round the edge (rounded like its parent) — static, no spinning ring
function MetalRim({ f }) {
  return (
    <div aria-hidden="true" className="pkg-rim pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: ringFor(f) }} />
  )
}

function PlanCard({ plan: p, card, index, open }) {
  const [hex, rgb] = card.accent
  const f = FINISH[card.finish]

  return (
    <Card radius={R} className="flex flex-1 flex-col">
      {/* Face: a pane of liquid glass with an accent glow in the top corner — or, with a finish, dark metal with a fine rim.
          Decoration only, so it never takes taps from the content floating above it. */}
      {f ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            borderRadius: R,
            background: `radial-gradient(90% 45% at 100% 0%, rgba(${f.warm},0.16), transparent 65%), radial-gradient(80% 50% at 0% 100%, rgba(${f.rgb},0.09), transparent 70%), ${f.face}`,
            boxShadow: `inset 0 1px 0 rgba(${f.lite},0.3), inset 0 0 0 1px rgba(${f.rgb},0.22), 0 30px 60px -32px rgba(0,0,0,0.9), 0 22px 50px -30px rgba(${f.warm},0.35)`,
          }}
        />
      ) : (
        <div aria-hidden="true" className="lg pointer-events-none absolute inset-0 overflow-hidden" style={{ ...glass(rgb), borderRadius: R }}>
          <span className="absolute -right-16 -top-20 h-48 w-48 rounded-full" style={{ background: `radial-gradient(circle, rgba(${rgb},0.28), transparent 68%)` }} />
        </div>
      )}

      {/* Content, floating at different depths */}
      <div className="relative flex h-full flex-col p-6 max-[640px]:p-5">
        <div className="relative flex items-center gap-3">
          {f ? (
            <MetalWell f={f} name={p.icon} size={19} className="h-11 w-11" />
          ) : (
            <span className="lg-chip relative grid h-11 w-11 shrink-0 place-items-center rounded-[15px]" style={{ ...glass(rgb), color: hex }}>
              <PackageIcon name={p.icon} size={20} />
            </span>
          )}
          <h3 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-[clamp(1.25rem,1.7vw,1.45rem)] font-[800] leading-[1.1] tracking-[-0.03em] text-white" style={f && metalText(f)}>{p.label}</h3>
          <span className="shrink-0 self-start text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/35">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {SHOW_PRICES && (
          <p className="relative mt-5 border-t border-white/[0.08] pt-4 font-[family-name:var(--font-display)] text-[clamp(1.9rem,2.6vw,2.2rem)] font-[800] leading-none tracking-[-0.035em] text-white">
            {inr(p.fee)}
            <span className="ml-1.5 text-[14px] font-semibold tracking-normal text-white/50">/ month</span>
          </p>
        )}

        <BestFor text={p.bestFor} hex={hex} rgb={rgb} />
        <Highlights items={p.highlights} mark={f ? <SealTick f={f} className="h-5 w-5" /> : TICK} className="mt-5 flex flex-col" />

        <div className="relative mt-auto flex flex-wrap gap-2.5 pt-6">
          <a
            href={p.demo || whatsappLink(packageMessage(p))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.demo ? `View the ${p.name} demo` : `Get ${p.name} on WhatsApp`}
            className={`lg-btn inline-flex h-11 min-w-[128px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 font-[family-name:var(--font-display)] text-[14px] font-[700] text-[var(--navy)] ${FOCUS}`}
            style={f ? { ...glass(f.warm, f.btn), color: f.ink } : glass(rgb, hex)}
          >
            <WhatsAppIcon size={16} />
            {p.demo ? 'View Demo' : 'Get Started'}
          </a>
          <button
            type="button"
            onClick={() => open(p.id)}
            className={`group/more inline-flex h-11 min-w-[128px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold text-white ${SECONDARY} ${FOCUS}`}
          >
            View Full Details
            <FaArrowRight size={15} className="transition-transform duration-300 group-hover/more:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  )
}

// A column: the card's name on top, its two packages stacked below
function PackageGroup({ card, open }) {
  const [hex, rgb] = card.accent
  const f = FINISH[card.finish]
  return (
    <li className="relative h-full">
      {/* With a finish: a glow and swirl behind the column, kept close so it stays clear of its neighbours */}
      {f && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <Aura f={f} swirl="left-[-8%] top-[-4%] h-[108%] w-[116%]" strength={f.aura} />
        </div>
      )}

      {/* A larger, fainter pane of glass holding the two cards — with a finish, darker metal with a fine rim */}
      <div
        className={`relative flex h-full flex-col rounded-[36px] p-3 max-[640px]:rounded-[32px] max-[640px]:p-2.5 ${f ? '' : 'lg'}`}
        style={
          f
            ? {
                background: `radial-gradient(100% 30% at 50% 0%, rgba(${f.rgb},0.13), transparent 70%), radial-gradient(70% 30% at 100% 100%, rgba(${f.warm},0.1), transparent 70%), ${f.pane}`,
                boxShadow: `inset 0 1px 0 rgba(${f.lite},0.3), 0 40px 80px -30px rgba(${f.warm},0.35), 0 30px 60px -32px rgba(0,0,0,0.9)`,
              }
            : { ...glass(rgb), backgroundColor: 'rgba(255,255,255,0.015)' }
        }
      >
        {f && <MetalRim f={f} />}
        <div className="relative flex items-center gap-4 px-3 pb-4 pt-3">
          {f ? (
            <MetalWell f={f} name={card.icon} size={28} className="h-16 w-16" />
          ) : (
            <span className="lg-chip relative grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ ...glass(rgb), color: hex }}>
              <PackageIcon name={card.icon} size={28} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.7rem,2.4vw,2.1rem)] font-[800] leading-[1.08] tracking-[-0.035em] text-balance text-white" style={f && metalText(f)}>{card.name}</h2>
            {f && <Swoosh f={f} />}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col">
          {card.plans.map((pid, i) => (
            <Fragment key={pid}>
              {i > 0 && (
                <div aria-hidden="true" className="flex items-center gap-3 px-4 py-3">
                  <span className="h-px flex-1" style={{ background: f ? `rgba(${f.rgb},0.22)` : 'rgba(255,255,255,0.1)' }} />
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/45">or</span>
                  <span className="h-px flex-1" style={{ background: f ? `rgba(${f.rgb},0.22)` : 'rgba(255,255,255,0.1)' }} />
                </div>
              )}
              <PlanCard plan={planById[pid]} card={card} index={i} open={open} />
            </Fragment>
          ))}
        </div>
      </div>
    </li>
  )
}

// Top 1% Realtors: one tall card down the whole column, in its finish (gold)
function PremiumCard({ card, open }) {
  const [hex] = card.accent
  const f = FINISH[card.finish]
  const p = planById[card.plans[0]]

  return (
    <li className="h-full pt-4 min-[700px]:col-span-2 min-[1024px]:col-span-1 min-[1024px]:pt-0">
      <Card radius={34} className="flex h-full flex-col">
        {/* Behind the card: a warm glow and the swirl */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Aura f={f} strength={f.aura} />
        </div>

        {/* Face: near-black, lit from the top, with a metal line running round the edge.
            Never a tap target: tilted on phones, its big icon was hit-tested in front
            of "View Full Details" and swallowed the tap. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[34px]"
          style={{
            background: `radial-gradient(120% 50% at 50% 0%, rgba(${f.rgb},0.17), transparent 62%), radial-gradient(80% 40% at 100% 100%, rgba(${f.warm},0.12), transparent 70%), ${f.face}`,
            boxShadow: `inset 0 1px 0 rgba(${f.lite},0.35), 0 40px 80px -30px rgba(${f.rgb},0.45), 0 30px 60px -32px rgba(0,0,0,0.9)`,
          }}
        >
          <span className="absolute -bottom-8 -right-8 rotate-[-12deg] opacity-[0.06]" style={{ color: hex }}>
            <PackageIcon name={card.icon} size={230} />
          </span>
          <MetalRim f={f} />
        </div>

        <div className="relative flex h-full flex-col p-7 max-[640px]:p-5">
          <div className="relative flex items-center gap-4">
            <MetalWell f={f} name={card.icon} size={28} className="h-16 w-16" />
            <div className="min-w-0 flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.7rem,2.4vw,2.1rem)] font-[800] leading-[1.08] tracking-[-0.035em] text-balance" style={metalText(f)}>
                {card.name}
              </h2>
              <Swoosh f={f} />
            </div>
          </div>

          <p className="relative mt-4 text-[13.5px] text-white/60">{p.bestFor}</p>

          <div
            className="relative mt-6 flex items-center gap-3 rounded-[20px] py-3.5 pl-4 pr-4"
            style={{ background: `linear-gradient(120deg, rgba(${f.rgb},0.14), rgba(${f.warm},0.06))`, boxShadow: `inset 0 0 0 1px rgba(${f.rgb},0.32), inset 0 1px 0 rgba(${f.lite},0.18)` }}
          >
            <SealTick f={f} className="h-7 w-7" />
            <span className="font-[family-name:var(--font-display)] text-[16px] font-[800] leading-[1.25] text-white">{p.guarantee}</span>
          </div>

          {SHOW_PRICES && (
            <p className="relative mt-6 border-t pt-5 font-[family-name:var(--font-display)] text-[clamp(2.1rem,3vw,2.6rem)] font-[800] leading-none tracking-[-0.035em] text-white" style={{ borderColor: `rgba(${f.rgb},0.14)` }}>
              {inr(p.fee)}
              <span className="ml-1.5 text-[14px] font-semibold tracking-normal text-white/50">/ month</span>
            </p>
          )}

          <p className="relative mt-5 text-[14.5px] leading-[1.6] text-white/70">{p.headline}</p>

          <p className="relative mt-6 border-t pt-5 text-[10.5px] font-bold uppercase tracking-[0.24em]" style={{ color: hex, borderColor: `rgba(${f.rgb},0.14)` }}>Everything included</p>
          <Highlights
            items={p.highlights}
            mark={<SealTick f={f} />}
           
            className="relative mt-4 grid grid-cols-1 gap-x-5 gap-y-3.5 min-[480px]:grid-cols-2 min-[1024px]:grid-cols-1" />
          {p.footnote && <p className="relative mt-5 text-[11.5px] leading-[1.5] text-white/45">{p.footnote}</p>}

          <div className="relative mt-auto flex flex-col gap-2.5 pt-8">
            <a
              href={whatsappLink(packageMessage(p))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Book your 15-day trial of ${p.name} on WhatsApp`}
              className={`lg-btn inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-[family-name:var(--font-display)] text-[15px] font-[700] ${FOCUS}`}
              style={{ ...glass(f.rgb, f.btn), color: f.ink }}
            >
              <WhatsAppIcon size={17} />
              Book Your 15-Day Trial
            </a>
            <button
              type="button"
              onClick={() => open(p.id)}
              className={`group/more inline-flex h-11 items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold text-white ${SECONDARY} ${FOCUS}`}
            >
              View Full Details
              <FaArrowRight size={15} className="transition-transform duration-300 group-hover/more:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card>
    </li>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */

// Opening or switching the drawer only changes `openId`. The cards get a
// fixed card and the stable setter, so they skip re-rendering and the
// drawer opens without redoing every card.
const Group = memo(PackageGroup)
const Premium = memo(PremiumCard)

export default function Packages() {
  const go = useGo()
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])

  return (
    <>
      <CompactHero
        icon={FaBoxOpen}
        eyebrow="Packages"
        title={['Three ways to grow.', 'Pick the package that fits.']}
        text="Five packages built only for real estate — take any one on its own."
      />

      {/* ── The three cards ── */}
      <section id="plans" className="relative isolate overflow-x-clip scroll-mt-24 px-[var(--gutter)] pb-[clamp(72px,12vh,130px)] max-[640px]:pb-14">
        {/* Soft colour behind the glass cards, for them to catch */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <span className="absolute left-[2%] top-[6%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(255,122,80,0.2),transparent_65%)]" />
          <span className="absolute left-[34%] top-[30%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(139,123,255,0.22),transparent_65%)]" />
          <span className="absolute right-[0%] top-[2%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.18),transparent_65%)]" />
          <span className="absolute bottom-[4%] right-[22%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(236,130,255,0.14),transparent_65%)]" />
        </div>
        <div className="mx-auto max-w-[1320px]">
          <ul
            data-slide="up"
            data-slide-stagger
            className="m-0 grid list-none grid-cols-1 gap-6 p-0 min-[700px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1024px]:items-stretch"
          >
            {cards.map((c) => (c.premium ? <Premium key={c.id} card={c} open={setOpenId} /> : <Group key={c.id} card={c} open={setOpenId} />))}
          </ul>
          <p data-slide="up" className="mt-6 text-center text-[13px] text-[var(--faint)]">
            Ad spend and WhatsApp messaging charges are paid directly by you to the platforms — so you see every rupee.
          </p>
          <a
            data-slide="up"
            href="/build-package"
            onClick={(e) => {
              e.preventDefault()
              go('/build-package')
            }}
            className="group mx-auto mt-6 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.06)] px-5 py-3 text-center text-[14px] text-white/80 transition-colors hover:border-[rgba(83,247,251,0.6)] hover:bg-[rgba(83,247,251,0.1)]"
          >
            Want your exact budget?
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--cyan)]">
              Build Your Own Package
              <FaArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-[var(--gutter)] pb-[clamp(72px,12vh,130px)] max-[640px]:pb-14">
        <div className="mx-auto flex max-w-[860px] flex-col gap-10 max-[640px]:gap-6">
          <SectionHeading eyebrow="Questions" title="Good to know." center />
          <div data-slide="up" data-slide-stagger className="flex flex-col gap-2.5">
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-[20px] border border-white/[0.08] bg-white/[0.03] transition-colors open:border-[rgba(83,247,251,0.3)] open:bg-white/[0.05]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-[family-name:var(--font-display)] text-[15.5px] font-[700] text-white [&::-webkit-details-marker]:hidden">
                  {q}
                  <FaChevronDown size={18} className="shrink-0 text-white/50 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-5 text-[14.5px] leading-[1.65] text-[var(--muted)]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Close ── */}
      <section className="px-[var(--gutter)] pb-[clamp(96px,14vh,150px)] max-[640px]:pb-12">
        <div
          data-slide="scale"
          className="relative mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[30px] border border-[rgba(83,247,251,0.2)] bg-[linear-gradient(120deg,rgba(83,247,251,0.10),rgba(15,24,54,0.9)_50%,rgba(255,122,80,0.10))] px-8 py-10 max-[640px]:px-6"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.18),transparent_65%)]" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2.1rem)] font-[800] leading-[1.15] tracking-[-0.03em] text-white">Need something in between?</h2>
            <p className="mt-2 text-[15.5px] text-[var(--muted)]">Build your own package — pick your project and lead target, and see your budget instantly.</p>
          </div>
          <a
            href="/build-package"
            onClick={(e) => {
              e.preventDefault()
              go('/build-package')
            }}
            className="group relative inline-flex h-13 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] px-6 py-3.5 font-[family-name:var(--font-display)] text-[15px] font-[700] text-[var(--navy)] shadow-[0_0_30px_-8px_rgba(83,247,251,0.8)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Build Your Package
            <FaArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </section>

      {openId && <PackageDetail id={openId} onChange={setOpenId} onClose={close} />}
    </>
  )
}

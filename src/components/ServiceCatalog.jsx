import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AppWindow, ArrowUpDown, Bike, Bot, Box, Briefcase, Check, ChevronUp, Clapperboard, GalleryHorizontalEnd, Globe,
  Handshake, Image, Images, LayoutDashboard, Mail, MapPin, Megaphone, MessageSquareText, MessagesSquare, Mic,
  Newspaper, Package, PanelTop, Palette, PartyPopper, PenTool, Plug, Plus, RectangleHorizontal, RectangleVertical,
  Search, Send, Share2, ShoppingCart, Smartphone, Sparkles, StickyNote, Target, Trash2, Users, Video, Workflow, X,
  Drone, Film, Podcast,
} from 'lucide-react'

import { catalog } from '../data/pricing'
import { site } from '../data/site'
import { lockScroll, scrollToTarget } from '../lib/scroll'
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon, YouTubeIcon } from './icons'

/* ------------------------------------------------------------------
   Services catalog — every service as a card, grouped by category.
   A sticky bar jumps between categories (and follows your scroll);
   "Add" collects services into a list that floats at the bottom
   and goes out as one WhatsApp quote request. No prices are shown.
------------------------------------------------------------------ */

const brand = (C) => ({ size = 18 }) => <C size={size} />
const ICONS = {
  share: Share2, target: Target, clapperboard: Clapperboard, palette: Palette, video: Video, elevator: ArrowUpDown,
  newspaper: Newspaper, send: Send, globe: Globe, pen: PenTool, app: AppWindow, users: Users, megaphone: Megaphone,
  search: Search, briefcase: Briefcase, handshake: Handshake, sparkles: Sparkles, messages: MessagesSquare, bot: Bot,
  image: Image, gallery: GalleryHorizontalEnd, box: Box, mic: Mic, drone: Drone, party: PartyPopper, poster: StickyNote,
  portrait: RectangleVertical, landscape: RectangleHorizontal, bike: Bike, pin: MapPin, sms: MessageSquareText,
  mail: Mail, panel: PanelTop, cart: ShoppingCart, workflow: Workflow, package: Package, images: Images,
  phone: Smartphone, dashboard: LayoutDashboard, plug: Plug, film: Film, podcast: Podcast,
  instagram: brand(InstagramIcon), linkedin: brand(LinkedInIcon), whatsapp: brand(WhatsAppIcon),
  facebook: brand(FacebookIcon), youtube: brand(YouTubeIcon),
}

export function CatalogIcon({ name, size = 18 }) {
  const I = ICONS[name] ?? Sparkles
  return <I size={size} strokeWidth={1.9} aria-hidden="true" />
}

const pad = (n) => String(n).padStart(2, '0')

// How a service is billed, in words (per-unit services run as campaigns)
const kindLabel = (s, kind) => (s.rate ? 'Per campaign' : kind === 'monthly' ? 'Monthly' : 'One-time')

// service id → service + its category and kind
const index = {}
for (const kind of ['monthly', 'oneTime']) {
  for (const c of catalog[kind]) {
    for (const s of c.services) index[s.id] = { ...s, kind, label: kindLabel(s, kind), category: c.name, accent: c.accent }
  }
}

const allCats = [...catalog.monthly, ...catalog.oneTime]
export const serviceCount = Object.keys(index).length
export const categoryCount = allCats.length

// Selected services, grouped the way they're billed
function computePlan(selected) {
  const items = selected.map((id) => index[id]).filter(Boolean)
  return {
    items,
    groups: [
      ['Monthly', items.filter((i) => i.label === 'Monthly')],
      ['One-time', items.filter((i) => i.label === 'One-time')],
      ['Campaigns', items.filter((i) => i.label === 'Per campaign')],
    ].filter(([, list]) => list.length),
  }
}

function quoteMessage(p) {
  const lines = ["Hi AXAMP, I'd like a quote for these services:", '']
  p.groups.forEach(([title, list]) => {
    lines.push(`${title}:`)
    list.forEach((i) => lines.push(`• ${i.name} (${i.category})`))
    lines.push('')
  })
  return lines.join('\n').trim()
}

const waLink = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

// Room for the fixed nav + the sticky category bar when jumping to a category
const JUMP_OFFSET = 168

/* ── Sticky category bar (follows the scroll) ───────────────────── */

function CategoryBar({ active, countFor }) {
  const trackRef = useRef(null)
  const chipRefs = useRef({})

  // Keep the active chip in view inside the scrolling row
  useEffect(() => {
    const track = trackRef.current
    const chip = chipRefs.current[active]
    if (!track || !chip) return
    const left = chip.offsetLeft - track.clientWidth / 2 + chip.offsetWidth / 2
    track.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  const jump = (id) => {
    const el = document.getElementById(`cat-${id}`)
    if (el) scrollToTarget(el.getBoundingClientRect().top + window.scrollY - JUMP_OFFSET)
  }

  const chip = (c) => {
    const on = c.id === active
    const n = countFor(c)
    return (
      <button
        key={c.id}
        ref={(el) => (chipRefs.current[c.id] = el)}
        type="button"
        aria-current={on ? 'true' : undefined}
        onClick={() => jump(c.id)}
        className={`
          group relative flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5
          text-[13px] font-semibold whitespace-nowrap
          transition-[border-color,background-color,color,box-shadow] duration-300
          ${on ? 'text-white' : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'}
        `}
        style={
          on
            ? {
                borderColor: `rgba(${c.accent[1]}, 0.6)`,
                background: `rgba(${c.accent[1]}, 0.12)`,
                boxShadow: `0 0 22px -10px rgba(${c.accent[1]}, 0.9)`,
              }
            : undefined
        }
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-full transition-colors"
          style={on ? { background: c.accent[0], color: 'var(--navy)' } : { background: 'rgba(255,255,255,0.06)', color: c.accent[0] }}
        >
          <CatalogIcon name={c.icon} size={14} />
        </span>
        {c.name}
        {n > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--amber)] px-1 text-[10.5px] font-bold text-[var(--navy)] [animation:pop_0.4s_var(--ease)_both]">
            {n}
          </span>
        )}
      </button>
    )
  }

  const label = (t) => (
    <span className="shrink-0 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--faint)]">{t}</span>
  )

  return (
    <div className="sticky top-[84px] z-30 -mx-[var(--gutter)] px-[var(--gutter)] py-3 transition-[top] duration-500 ease-[var(--ease)] [html[data-nav-hidden]_&]:top-0">
      {/* Frosted strip behind the chips */}
      <div aria-hidden="true" className="absolute inset-0 border-y border-white/[0.06] bg-[rgba(8,13,32,0.78)] backdrop-blur-xl" />
      <div
        ref={trackRef}
        className="no-scrollbar relative mx-auto flex max-w-[1240px] items-center gap-2 overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)] px-6"
      >
        {label('Monthly')}
        {catalog.monthly.map(chip)}
        <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-white/15" />
        {label('One-time')}
        {catalog.oneTime.map(chip)}
      </div>
    </div>
  )
}

/* ── Service card ───────────────────────────────────────────────── */

function ServiceCard({ s, i, accent, kind, on, toggle }) {
  const [hex, rgb] = accent
  const ref = useRef(null)
  // Photo lives at public/services/<service id>.webp; without one the card keeps its drawn artwork
  const [photoOk, setPhotoOk] = useState(true)

  // Mouse: the card tilts toward the pointer and a spotlight follows it
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--my', `${(y + 0.5) * 100}%`)
    el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
  }
  const onLeave = () => {
    ref.current.style.setProperty('--rx', '0deg')
    ref.current.style.setProperty('--ry', '0deg')
  }

  return (
    <li className="h-full">
      <article
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="svc-card group relative flex h-full flex-col rounded-[28px] p-px transition-[transform,box-shadow,translate] duration-300 ease-out hover:-translate-y-1.5"
        style={{
          '--acc': hex,
          '--acc-rgb': rgb,
          transform: 'perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
          background: on
            ? `linear-gradient(150deg, rgba(${rgb},0.95), rgba(${rgb},0.3) 40%, rgba(255,255,255,0.06) 70%, rgba(${rgb},0.6))`
            : `linear-gradient(150deg, rgba(${rgb},0.45), rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.03) 70%, rgba(${rgb},0.25))`,
          boxShadow: on ? `0 30px 70px -32px rgba(${rgb},0.95)` : '0 28px 60px -38px rgba(0,0,0,0.95)',
        }}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-[linear-gradient(170deg,#121c45_0%,#0c1534_50%,#0a1129_100%)] p-2.5">
          {/* Pointer spotlight over the whole card */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 0%), rgba(${rgb},0.14), transparent 70%)` }}
          />

          {/* ── Artwork: the service photo (falls back to a glowing stage with orbiting rings) ── */}
          <div
            className="relative h-[184px] overflow-hidden rounded-[21px] max-[719px]:h-[150px]"
            style={{
              background: `radial-gradient(120% 95% at 50% 0%, rgba(${rgb},0.42), transparent 62%), radial-gradient(80% 70% at 50% 120%, rgba(${rgb},0.2), transparent 70%), linear-gradient(160deg, #18235a, #0b1230)`,
            }}
          >
            {photoOk ? (
              <>
                <img
                  src={`/services/${s.id}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setPhotoOk(false)}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.07]"
                />
                {/* Shade so the chips stay readable, tinted with the category colour */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, rgba(8,13,32,0.55) 0%, rgba(8,13,32,0) 32%, rgba(8,13,32,0) 55%, rgba(8,13,32,0.8) 100%), radial-gradient(90% 80% at 0% 100%, rgba(${rgb},0.38), transparent 65%)`,
                  }}
                />
                <span aria-hidden="true" className="absolute inset-0 rounded-[21px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
              </>
            ) : (
              <>
                {/* Dotted grid */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.13)_1px,transparent_1.3px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000_25%,transparent_75%)]"
                />
                {/* Orbit rings with a travelling dot each */}
                <span aria-hidden="true" className="svc-ring absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" style={{ borderColor: `rgba(${rgb},0.45)` }}>
                  <span className="absolute -top-[4px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: hex, boxShadow: `0 0 12px ${hex}` }} />
                </span>
                <span aria-hidden="true" className="svc-ring svc-ring--rev absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ borderColor: `rgba(${rgb},0.18)` }}>
                  <span className="absolute bottom-[22px] right-[22px] h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_10px_white]" />
                </span>
              </>
            )}
            {/* Light sweep on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.16)_50%,transparent_65%)] transition-transform duration-[1100ms] ease-[var(--ease)] group-hover:translate-x-full"
            />

            {/* Icon — a small glass badge over the photo, or centred on the fallback stage */}
            <span className={photoOk ? 'absolute bottom-3 left-3' : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}>
              <span
                className={`grid place-items-center backdrop-blur-md transition-transform duration-500 ease-[var(--ease)] group-hover:scale-110 ${photoOk ? 'h-11 w-11 rounded-[14px]' : 'svc-float h-[68px] w-[68px] rounded-[22px]'}`}
                style={{
                  animationDelay: `${i * -1.3}s`,
                  color: on ? 'var(--navy)' : hex,
                  background: on ? hex : photoOk ? 'rgba(8,13,32,0.6)' : `linear-gradient(145deg, rgba(255,255,255,0.14), rgba(${rgb},0.12))`,
                  boxShadow: `inset 0 0 0 1px rgba(${rgb},0.55), inset 0 1px 0 rgba(255,255,255,0.25), 0 18px 40px -14px rgba(${rgb},0.95)`,
                }}
              >
                <CatalogIcon name={s.icon} size={photoOk ? 20 : 28} />
              </span>
            </span>

            {/* Number + billing */}
            <span className="absolute left-3.5 top-3 font-[family-name:var(--font-display)] text-[12px] font-bold tracking-[0.18em] text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">{pad(i + 1)}</span>
            <span className="absolute right-3 top-2.5 rounded-full border border-white/15 bg-[rgba(8,13,32,0.5)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75 backdrop-blur-sm">
              {kindLabel(s, kind)}
            </span>

            {/* Added stamp */}
            <span
              aria-hidden="true"
              className={`absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-[var(--navy)] transition-[opacity,transform] duration-300 ${on ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
              style={{ background: hex }}
            >
              <Check size={11} strokeWidth={3.2} /> In your quote
            </span>
          </div>

          {/* ── Copy ── */}
          <div className="relative z-[2] flex flex-1 flex-col px-2.5 pb-1.5 pt-4 max-[719px]:pb-1 max-[719px]:pt-3">
            <h4 className="font-[family-name:var(--font-display)] text-[19px] font-[700] leading-snug tracking-[-0.015em] text-white">{s.name}</h4>
            {s.bestFor && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-bold uppercase leading-[1.45] tracking-[0.14em]" style={{ color: hex }}>
                <span aria-hidden="true" className="mt-[0.62em] h-[2px] w-4 shrink-0 rounded-full" style={{ background: hex }} />
                Best for {s.bestFor}
              </p>
            )}
            <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--muted)]">{s.desc}</p>

            {/* Add */}
            <div className="mt-auto pt-5 max-[719px]:pt-3.5">
            <button
              type="button"
              aria-pressed={on}
              onClick={toggle}
              aria-label={`${on ? 'Remove' : 'Add'} ${s.name} ${on ? 'from' : 'to'} your quote`}
              className={`
                relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full text-[14px] font-[700] max-[719px]:h-10
                transition-[background-color,color,border-color,transform,box-shadow] duration-300 active:scale-[0.97]
                ${on ? 'text-[var(--navy)]' : 'border border-white/15 bg-white/[0.03] text-white hover:border-[rgba(var(--acc-rgb),0.75)] hover:bg-[rgba(var(--acc-rgb),0.1)] hover:text-[var(--acc)]'}
              `}
              style={on ? { background: hex, boxShadow: `0 10px 26px -10px rgba(${rgb},0.9)` } : undefined}
            >
              {on && <span key="burst" aria-hidden="true" className="svc-burst absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${hex}` }} />}
              <span className={`grid transition-transform duration-300 ${on ? 'rotate-0' : 'rotate-90'}`}>
                {on ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.6} />}
              </span>
              {on ? 'Added' : 'Add to quote'}
            </button>
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

/* ── Category block ─────────────────────────────────────────────── */

function CategoryBlock({ c, kind, selected, toggle }) {
  const [hex, rgb] = c.accent
  return (
    <section id={`cat-${c.id}`} data-cat={c.id} className="scroll-mt-44">
      <header data-slide="up" className="mb-5 flex items-center gap-4 max-[719px]:mb-4">
        <span
          className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[18px]"
          style={{
            color: 'var(--navy)',
            background: `linear-gradient(135deg, ${hex}, rgba(${rgb},0.65))`,
            boxShadow: `0 14px 34px -14px rgba(${rgb},0.9), inset 0 1px 0 rgba(255,255,255,0.5)`,
          }}
        >
          <CatalogIcon name={c.icon} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.3rem,2.2vw,1.7rem)] font-[800] leading-tight tracking-[-0.025em] text-white">{c.name}</h3>
          <p className="text-[14.5px] text-[var(--muted)]">{c.tagline}</p>
        </div>
        <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-r from-white/10 to-transparent min-[900px]:block" />
        <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 min-[560px]:block">
          {c.services.length} services
        </span>
      </header>

      <ul data-slide="up" data-slide-stagger className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[720px]:grid-cols-3 min-[720px]:gap-5">
        {c.services.map((s, i) => (
          <ServiceCard key={s.id} s={s} i={i} accent={c.accent} kind={kind} on={selected.includes(s.id)} toggle={() => toggle(s.id)} />
        ))}
      </ul>
    </section>
  )
}

function GroupHeading({ eyebrow, title, text }) {
  return (
    <div data-slide="up" className="flex flex-col gap-3">
      <p className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
        <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent" />
        {eyebrow}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.8vw,3.2rem)] font-[800] leading-[1.05] tracking-[-0.035em] text-white">{title}</h2>
      <p className="max-w-[560px] text-[15.5px] text-[var(--muted)]">{text}</p>
    </div>
  )
}

/* ── Quote list: floating tray + panel ──────────────────────────── */

function PlanList({ plan, remove }) {
  return (
    <div className="flex flex-col gap-4">
      {plan.groups.map(([title, items]) => (
        <div key={title} className="flex flex-col gap-2">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[var(--faint)]">{title}</p>
          {items.map((i) => (
            <div key={i.id} className="svc-row-in flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-2.5 pr-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ color: i.accent[0], background: `rgba(${i.accent[1]},0.14)` }}>
                <CatalogIcon name={i.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-white">{i.name}</span>
                <span className="block truncate text-[11.5px] text-[var(--faint)]">{i.category}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i.id)}
                aria-label={`Remove ${i.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function QuoteButton({ plan, className = '' }) {
  return (
    <a
      href={waLink(quoteMessage(plan))}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25d366] font-[family-name:var(--font-display)] font-[700] text-[#062b14] shadow-[0_0_30px_-8px_rgba(37,211,102,0.85)] transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
    >
      <WhatsAppIcon size={19} />
      Get quote on WhatsApp
    </a>
  )
}

function PlanPanel({ plan, remove, clear, onClose }) {
  useEffect(() => {
    lockScroll(true)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Your quote list">
      <button type="button" aria-label="Close" onClick={onClose} className="svc-fade absolute inset-0 bg-[rgba(3,6,18,0.7)] backdrop-blur-sm" />
      <div
        data-lenis-prevent
        className="
          svc-panel absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col gap-5 overflow-y-auto overscroll-contain
          rounded-t-[30px] border-t border-[rgba(83,247,251,0.25)] bg-[#0b1229] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3
          shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)]

          min-[768px]:inset-x-auto min-[768px]:bottom-3 min-[768px]:right-3 min-[768px]:top-3
          min-[768px]:max-h-none min-[768px]:w-[430px] min-[768px]:rounded-[30px] min-[768px]:border min-[768px]:p-6
        "
      >
        <div className="flex items-center justify-between gap-3">
          <span aria-hidden="true" className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/20 min-[768px]:hidden" />
          <h3 className="mt-5 font-[family-name:var(--font-display)] text-[22px] font-[800] tracking-[-0.02em] text-white min-[768px]:mt-0">
            Your quote <span className="text-white/40">· {plan.items.length}</span>
          </h3>
          <div className="mt-5 flex items-center gap-1 min-[768px]:mt-0">
            <button type="button" onClick={clear} className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-white/50 transition-colors hover:text-[#ff8a8a]">
              <Trash2 size={14} aria-hidden="true" /> Clear
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.07] text-white/70 transition-colors hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        <PlanList plan={plan} remove={remove} />

        <div className="mt-auto flex flex-col gap-3 border-t border-white/[0.08] pt-4">
          <p className="text-[13.5px] leading-[1.55] text-[var(--muted)]">
            We’ll send you a tailored quote for these {plan.items.length} {plan.items.length === 1 ? 'service' : 'services'} on WhatsApp.
          </p>
          <QuoteButton plan={plan} className="h-14 text-[15.5px]" />
          <p className="text-center text-[12px] text-[var(--faint)]">No payment now — just a quick chat.</p>
        </div>
      </div>
    </div>
  )
}

function PlanTray({ plan, open }) {
  const show = plan.items.length > 0
  const shown = plan.items.slice(-4)
  const n = plan.items.length

  return (
    <div
      className={`
        fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-40 w-[min(600px,calc(100%-24px))] -translate-x-1/2
        transition-[translate,opacity] duration-500 ease-[var(--ease)]
        ${show ? 'opacity-100' : 'pointer-events-none translate-y-[160%] opacity-0'}
      `}
      inert={!show}
    >
      <div className="flex items-center gap-3 rounded-full border border-[rgba(83,247,251,0.3)] bg-[rgba(8,13,32,0.9)] p-2 pl-2.5 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95),0_0_34px_-12px_rgba(83,247,251,0.6)] backdrop-blur-xl">
        <button type="button" onClick={open} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`View your quote list, ${n} services`}>
          {/* Last few added, stacked */}
          <span className="flex shrink-0 -space-x-2.5">
            {shown.map((i) => (
              <span
                key={i.id}
                className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#0a1129] [animation:pop_0.4s_var(--ease)_both]"
                style={{ background: i.accent[0], color: 'var(--navy)' }}
              >
                <CatalogIcon name={i.icon} size={15} />
              </span>
            ))}
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">Your quote</span>
            <span className="block truncate font-[family-name:var(--font-display)] text-[16px] font-[800] text-white">
              {n} {n === 1 ? 'service' : 'services'}
            </span>
          </span>
          <span className="ml-auto hidden h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[13.5px] font-[700] text-white min-[520px]:flex">
            View <ChevronUp size={15} strokeWidth={2.6} aria-hidden="true" />
          </span>
        </button>
        <QuoteButton plan={plan} className="h-11 shrink-0 px-4 text-[13.5px] max-[519px]:hidden" />
        <button
          type="button"
          onClick={open}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[var(--cyan)] px-4 font-[family-name:var(--font-display)] text-[13.5px] font-[700] text-[var(--navy)] min-[520px]:hidden"
        >
          View <ChevronUp size={15} strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ── Catalog ────────────────────────────────────────────────────── */

export default function ServiceCatalog() {
  const [selected, setSelected] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeCat, setActiveCat] = useState(allCats[0].id)
  const rootRef = useRef(null)

  const plan = useMemo(() => computePlan(selected), [selected])
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const remove = (id) => setSelected((s) => s.filter((x) => x !== id))
  const clear = () => setSelected([])
  const closePanel = useCallback(() => setPanelOpen(false), [])
  const countFor = (c) => c.services.filter((s) => selected.includes(s.id)).length

  useEffect(() => {
    if (!selected.length) setPanelOpen(false)
  }, [selected.length])

  // Highlight the category in the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveCat(e.target.dataset.cat)),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    rootRef.current.querySelectorAll('[data-cat]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const block = (kind) => (c) => <CategoryBlock key={c.id} c={c} kind={kind} selected={selected} toggle={toggle} />

  return (
    <div id="catalog" ref={rootRef} className="relative scroll-mt-24 px-[var(--gutter)] pb-[clamp(72px,12vh,130px)] max-[640px]:pb-12">
      <CategoryBar active={activeCat} countFor={countFor} />

      <div className="mx-auto mt-14 flex max-w-[1240px] flex-col gap-[clamp(56px,8vh,88px)] max-[640px]:mt-8 max-[640px]:gap-10">
        <GroupHeading eyebrow="Monthly services" title="Grow every month." text="Social, ads, content, automation and local reach — run for you, month after month." />
        {catalog.monthly.map(block('monthly'))}

        <div className="pt-[clamp(8px,3vh,32px)] max-[640px]:pt-0">
          <GroupHeading eyebrow="One-time services" title="Build it once." text="Projects delivered in full — websites, brand kits and apps." />
        </div>
        {catalog.oneTime.map(block('oneTime'))}
      </div>

      <PlanTray plan={plan} open={() => setPanelOpen(true)} />
      {panelOpen && <PlanPanel plan={plan} remove={remove} clear={clear} onClose={closePanel} />}
    </div>
  )
}

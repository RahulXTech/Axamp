import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarX,
  Check,
  Coins,
  CornerDownLeft,
  Crown,
  Diamond,
  FileBarChart,
  Gem,
  HandCoins,
  Handshake,
  HardHat,
  House,
  KeyRound,
  LandPlot,
  Landmark,
  MapPin,
  MessageCircleOff,
  PencilLine,
  PhoneOff,
  PiggyBank,
  RotateCcw,
  Sofa,
  Sparkles,
  Store,
  ThumbsDown,
  TrendingUp,
  UserX,
  Wallet,
  WalletCards,
} from 'lucide-react'

import CompactHero from '../components/CompactHero'
import { GoogleAdsIcon, MetaIcon } from '../components/icons'
import {
  DAYS_PER_MONTH, categories, changeDrop, dropOptions, fromQuery, funnel, funnelDone, funnelShares, funnelSteps, leadTargets, platforms, projectTypes, ticketsFor, toQuery, visitBoostFor,
} from '../data/packageBuilder'
import { useGo } from '../lib/nav'
import { scrollToTarget } from '../lib/scroll'

/* ------------------------------------------------------------------
   Build your own package — the form, as a wizard like the contact
   form: one question per step. First five picks about the project
   (who you are, project type, ticket size, platform, leads per day) as
   clickable cards, then the sales funnel one step at a time (out of 100
   leads, how many drop out there, drawn as a strip of 100 cells). Each
   funnel question has 3 options, in leads, that follow from the answers
   before it, so the funnel ends at 3–5 site visits (dropOptions in
   packageBuilder.js); nothing is pre-picked. A tap only picks —
   Continue moves on. The card is kept short enough to fit a laptop
   screen, and its buttons stay pinned to the bottom when it doesn't.
   Beside it, a live preview draws the funnel as the answers change.
   "Get my report" opens the report on its own page (LeadReport.jsx)
   with the answers in the URL; "Edit answers" there brings them back.
------------------------------------------------------------------ */

const num = (n) => n.toLocaleString('en-IN')

// Card tiles and one-line hints for the project picks, and icons for the funnel steps.
// "Who are you?" and the project type get a tile each: its own colour (RGB), a main icon and a small badge
const TILES = {
  developer: { tint: '83,247,251', Icon: Building2, Badge: HardHat },
  'channel-partner': { tint: '255,122,80', Icon: Handshake, Badge: KeyRound },
  other: { tint: '167,139,250', Icon: BriefcaseBusiness, Badge: Sparkles },
  residential: { tint: '52,211,153', Icon: House, Badge: Sofa },
  commercial: { tint: '96,165,250', Icon: Store, Badge: BadgeIndianRupee },
  plot: { tint: '250,204,21', Icon: LandPlot, Badge: MapPin },
}
// Ticket sizes: a smaller tile whose icon steps up with the price (a ₹ badge for any size not listed);
// luxury (₹2Cr+) turns gold with a sparkle
const TICKET_ICONS = { 'upto-20l': Wallet, '30l': PiggyBank, 'upto-50l': Wallet, '50l': Banknote, '70l': WalletCards, '1cr': Coins, '1.5cr': HandCoins, '2cr': Gem, '3cr': Diamond, '5cr': Crown, '10cr': Landmark }
const ticketTile = (o) => ({ tint: o.luxury ? '251,191,36' : '83,247,251', Icon: TICKET_ICONS[o.id] ?? BadgeIndianRupee, Badge: o.luxury ? Sparkles : null })
// Platform logos, in brand colours on a white tile
const BRANDS = { meta: MetaIcon, google: GoogleAdsIcon }
const HINTS = {
  developer: 'Building and launching the project',
  'channel-partner': 'Selling projects for developers',
  other: 'Consultant, agency or anything else',
  residential: 'Apartments, villas and floors',
  commercial: 'Shops, offices and retail',
  plot: 'Land and plotted townships',
  meta: 'Facebook and Instagram ads',
  google: 'Buyers searching on Google',
}
const STEP_ICONS = { answered: PhoneOff, interested: ThumbsDown, details: MessageCircleOff, 'follow-up': UserX, 'site-visit': CalendarX }

const PICKS = [
  { key: 'category', short: 'You', title: 'Who are you?', sub: 'Pick the one that fits best.', options: categories, cols: 'grid-cols-1 min-[560px]:grid-cols-3' },
  { key: 'project', short: 'Project', title: 'What type of project is it?', sub: 'Pick the project you’re marketing.', options: projectTypes, cols: 'grid-cols-1 min-[560px]:grid-cols-3' },
  // Ticket options depend on the project type — see `optionsFor` below
  { key: 'ticket', short: 'Ticket', title: 'What’s the ticket size?', sub: 'The price of one unit.', cols: 'grid-cols-2 min-[560px]:grid-cols-4' },
  { key: 'platform', short: 'Platform', title: 'What’s your preferred platform for leads?', sub: 'Pick where you want your leads to come from.', options: platforms, cols: 'grid-cols-1 min-[560px]:grid-cols-2' },
  { key: 'leads', short: 'Leads / day', title: 'How many leads do you need per day?', sub: 'We’ll work out a month of ads from this.', options: leadTargets, cols: 'grid-cols-2 min-[560px]:grid-cols-4' },
]

// Every question in order: the project picks, then each funnel step
const STEPS = [
  ...PICKS.map((p) => ({ ...p, kind: 'pick' })),
  ...funnelSteps.map((s) => ({
    key: s.id,
    kind: 'drop',
    title: s.question,
    // The options and the line under the title depend on the earlier answers — see `dropAt` below
    step: s,
  })),
]

// The two parts of the stepper at the top of the card
const SECTIONS = [
  { label: 'Your project', short: 'Project', from: 0, to: PICKS.length },
  { label: 'Your sales funnel', short: 'Sales funnel', from: PICKS.length, to: STEPS.length },
]

// The cards for a question; ticket sizes narrow to the picked project type
const optionsFor = (s, picks) => (s.key === 'ticket' ? ticketsFor(picks.project) : s.options)

// 4 per row on wider screens, or 3 when the count splits better that way (e.g. 6 commercial ticket sizes)
const colsFor = (s, count) => (s.key === 'ticket' && count % 4 && !(count % 3) ? 'grid-cols-2 min-[560px]:grid-cols-3' : s.cols)

const pickLabel = (key, o) => (key === 'leads' ? `${o.perDay}${o.plus ? '+' : ''} / day` : o.label)

// The live preview's summary: a label per project question, and a small extra beside some answers
const SUMMARY_LABELS = { category: 'You are', project: 'Project', ticket: 'Ticket size', platform: 'Platform', leads: 'Leads' }
const pickExtra = (key, o) =>
  key === 'leads' ? `${num(o.perDay * DAYS_PER_MONTH)}${o.plus ? '+' : ''} / mo` : key === 'ticket' && o.luxury ? 'Luxury' : key === 'platform' ? (o.id === 'meta' ? 'FB + Insta' : 'Search') : null

// The small icon beside a pick in the live preview: the option's own tile (or brand logo),
// or the question's number while it's still unanswered
function PickIcon({ pickKey, option, n }) {
  if (!option) {
    return (
      <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border border-dashed border-white/20 text-[9px] font-bold text-white/35">{n}</span>
    )
  }
  const Brand = BRANDS[option.id]
  if (Brand) {
    return (
      <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] bg-white">
        <Brand size={11} />
      </span>
    )
  }
  const { tint, Icon } = pickKey === 'ticket' ? ticketTile(option) : (TILES[option.id] ?? { tint: '83,247,251', Icon: TrendingUp })
  return (
    <span
      className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px]"
      style={{ background: `radial-gradient(circle at 30% 20%, rgba(${tint},0.65), rgba(${tint},0.2) 72%)` }}
    >
      <Icon size={11} strokeWidth={2.2} className="text-white" aria-hidden="true" />
    </span>
  )
}

const CTA =
  'group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] px-6 font-[family-name:var(--font-display)] text-[16px] font-[800] text-[var(--navy)] shadow-[0_10px_40px_-10px_rgba(83,247,251,0.9),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[transform,box-shadow] duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_14px_44px_-8px_rgba(83,247,251,0.95)]'

// One clickable card — a radio underneath, so it works with the keyboard too.
// `compact` cards (numbers) only show the tick once picked, to keep room for the number
function Choice({ name, index, checked, onPick, compact, className = '', children }) {
  return (
    <label className={`bp-card group relative block cursor-pointer select-none ${className}`} style={{ '--i': index }}>
      <input type="radio" name={name} checked={checked} onChange={onPick} className="peer sr-only" />
      <span
        className={`relative flex h-full overflow-hidden rounded-2xl border transition-[transform,border-color,background-color,box-shadow] duration-300 ease-[var(--ease)] active:scale-[0.97] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--cyan)]/70 ${
          checked
            ? 'border-[rgba(83,247,251,0.75)] bg-[linear-gradient(165deg,rgba(83,247,251,0.2),rgba(83,247,251,0.04)_70%)] shadow-[0_0_0_1px_rgba(83,247,251,0.3),0_18px_40px_-18px_rgba(83,247,251,0.85)]'
            : 'border-white/10 bg-white/[0.03] hover:-translate-y-1 hover:border-[rgba(83,247,251,0.35)] hover:bg-white/[0.06] hover:shadow-[0_16px_36px_-20px_rgba(83,247,251,0.6)]'
        }`}
      >
        {/* Soft light from the top when picked */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_0%,rgba(83,247,251,0.22),transparent_70%)] transition-opacity duration-300 ${checked ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Radio dot → tick */}
        <span
          aria-hidden="true"
          className={`absolute grid place-items-center rounded-full border transition-colors duration-300 ${compact ? 'right-1.5 top-1.5 h-4 w-4' : 'right-2.5 top-2.5 h-5 w-5'} ${
            checked ? 'border-[var(--cyan)] bg-[var(--cyan)] text-[var(--navy)]' : compact ? 'border-transparent' : 'border-white/20 group-hover:border-white/40'
          }`}
        >
          {checked && <Check size={compact ? 10 : 12} strokeWidth={3.4} className="bp-tick" />}
        </span>
        {children}
      </span>
    </label>
  )
}

// A card's tile: a glowing colour block with the main icon and a badge on its corner
// (`small` for the compact ticket-size cards)
function Tile({ tile: { tint, Icon, Badge }, checked, small }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center transition-[transform,box-shadow] duration-300 ${
        small ? 'h-11 w-11 rounded-[14px]' : 'mb-1 h-14 w-14 rounded-[18px] min-[560px]:h-[76px] min-[560px]:w-[76px] min-[560px]:rounded-[22px]'
      } ${checked ? 'scale-105' : 'group-hover:-rotate-3 group-hover:scale-105'}`}
      style={{
        background: `radial-gradient(circle at 30% 20%, rgba(${tint},0.6), rgba(${tint},0.14) 72%)`,
        boxShadow: checked
          ? `0 0 0 2px #0d1532, 0 0 0 4px rgb(${tint}), 0 0 32px -4px rgba(${tint},0.9)`
          : `inset 0 1px 0 rgba(255,255,255,0.28), 0 12px 26px -14px rgba(${tint},0.9)`,
      }}
    >
      <Icon
        strokeWidth={1.8}
        className={`text-white [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.35))] ${small ? 'h-[22px] w-[22px]' : 'h-7 w-7 min-[560px]:h-9 min-[560px]:w-9'}`}
        aria-hidden="true"
      />
      {Badge && (
        <span
          className={`absolute grid place-items-center rounded-full border-2 border-[#0f1838] text-[#0b1229] ${
            small ? '-bottom-1 -right-1 h-5 w-5' : '-bottom-1.5 -right-1.5 h-6 w-6 min-[560px]:h-8 min-[560px]:w-8'
          }`}
          style={{ background: `rgb(${tint})` }}
        >
          <Badge strokeWidth={2.4} className={small ? 'h-2.5 w-2.5' : 'h-3 w-3 min-[560px]:h-4 min-[560px]:w-4'} aria-hidden="true" />
        </span>
      )}
    </span>
  )
}

// The inside of a card, by question
function ChoiceBody({ pickKey, option, checked }) {
  if (pickKey === 'leads') {
    return (
      <span className="relative flex w-full flex-col items-center px-2 pb-4 pt-6">
        <span className={`font-[family-name:var(--font-display)] text-[clamp(1.6rem,2.8vw,2.1rem)] font-[800] leading-none tracking-[-0.04em] ${checked ? 'text-[var(--cyan)]' : 'text-white'}`}>
          {option.perDay}
          {option.plus && '+'}
        </span>
        <span className="mt-1.5 text-[11.5px] font-medium text-white/55">leads / day</span>
        <span className={`mt-3 rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums ${checked ? 'bg-[var(--cyan)]/15 text-[var(--cyan)]' : 'bg-white/[0.05] text-white/45'}`}>
          {num(option.perDay * DAYS_PER_MONTH)}
          {option.plus && '+'} / month
        </span>
        <span className="sr-only">{option.label}</span>
      </span>
    )
  }
  if (pickKey === 'ticket') {
    return (
      <span className="relative flex min-h-[92px] w-full flex-col items-center justify-center gap-1.5 px-2 py-5 text-center">
        <span className="mb-1.5">
          <Tile tile={ticketTile(option)} checked={checked} small />
        </span>
        <span className={`font-[family-name:var(--font-display)] text-[15px] font-[700] tracking-[-0.01em] ${checked ? 'text-white' : 'text-white/85'}`}>{option.label}</span>
        {option.luxury && (
          <span className="rounded-full border border-[#ffb59c]/30 bg-[#ffb59c]/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#ffb59c]">Luxury</span>
        )}
      </span>
    )
  }
  const Brand = BRANDS[option.id]
  const tile = TILES[option.id]
  return (
    <span className="relative flex w-full items-center gap-3.5 p-4 pr-10 text-left min-[560px]:flex-col min-[560px]:gap-3 min-[560px]:px-4 min-[560px]:py-7 min-[560px]:text-center">
      {tile ? (
        <Tile tile={tile} checked={checked} />
      ) : (
        Brand && (
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white transition-[box-shadow,transform] duration-300 min-[560px]:h-14 min-[560px]:w-14 ${
              checked
                ? 'scale-105 shadow-[0_0_0_2px_#0d1532,0_0_0_4px_var(--cyan),0_0_28px_-4px_rgba(83,247,251,0.9)]'
                : 'shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] group-hover:scale-105'
            }`}
          >
            <Brand size={28} />
          </span>
        )
      )}
      <span className="min-w-0">
        <span className={`block font-[family-name:var(--font-display)] text-[15.5px] font-[700] leading-tight ${checked ? 'text-white' : 'text-white/90'}`}>{option.label}</span>
        {HINTS[option.id] && <span className="mt-1 block text-[12.5px] leading-snug text-white/50">{HINTS[option.id]}</span>}
      </span>
    </span>
  )
}

// Every 100 leads as a strip of 100 cells (two rows of 50 on phones): still in (cyan),
// dropping out at this step (amber), gone at earlier steps (dim)
function LeadMeter({ before, after }) {
  const rows = [
    ['bg-[var(--cyan)]', 'Still in', after],
    ['bg-[var(--amber)]', 'Drop out here', before - after],
    ['bg-white/15', 'Gone before', 100 - before],
  ]
  return (
    <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[rgba(8,14,34,0.55)] px-4 py-3.5 max-[640px]:px-3.5 max-[640px]:py-3">
      <p className="flex items-baseline gap-2 text-[13.5px] text-white/55">
        Leads remaining:
        <span className="font-[family-name:var(--font-display)] text-[22px] font-[800] tracking-[-0.03em] text-white">{after}</span>
        out of 100
      </p>
      <div className="mt-2.5 grid grid-cols-50 gap-[3px] min-[641px]:grid-cols-100 min-[641px]:gap-[2px]" aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className={`h-4 rounded-[2px] transition-colors duration-500 max-[640px]:h-3 ${
              i < after ? 'bg-[var(--cyan)] shadow-[0_0_5px_rgba(83,247,251,0.55)]' : i < before ? 'bp-drop bg-[var(--amber)]' : 'bg-white/[0.08]'
            }`}
          />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        {rows.map(([dot, label, n]) => (
          <li key={label} className="flex items-center gap-1.5 text-white/55">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {label}
            <span className="font-semibold tabular-nums text-white/85">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Share of leads reaching a site visit, as a ring ("–" and an empty ring until the funnel is answered)
function Gauge({ value }) {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid h-[84px] w-[84px] shrink-0 place-items-center">
      <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="bp-gauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9dfcfd" />
            <stop offset="100%" stopColor="#2bd4dc" />
          </linearGradient>
        </defs>
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,122,80,0.16)" strokeWidth="9" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="url(#bp-gauge)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={value == null ? c : c * (1 - Math.max(value, 1) / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-[var(--ease)] [filter:drop-shadow(0_0_6px_rgba(83,247,251,0.7))]"
        />
      </svg>
      <span className="flex flex-col items-center">
        <span className={`font-[family-name:var(--font-display)] text-[28px] font-[800] leading-none tracking-[-0.04em] ${value == null ? 'text-white/30' : 'text-white'}`}>
          {value ?? '–'}
        </span>
        <span className="mt-0.5 text-[9.5px] font-semibold text-white/40">of 100</span>
      </span>
    </div>
  )
}

export default function BuildPackage() {
  const go = useGo()
  const { search } = useLocation()
  // Back from the report with "Edit answers" → start from those answers
  const [start] = useState(() => fromQuery(search))
  const [picks, setPicks] = useState(start.picks)
  // Nothing is pre-picked: the funnel starts empty unless the report sent its answers back
  const [drops, setDrops] = useState(() => (new URLSearchParams(search).has('funnel') ? start.drops : {}))

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const rootRef = useRef(null)
  const headingRef = useRef(null)
  const touched = useRef(false)

  // On each step change: focus the question, and on phones bring the card
  // back into view if it scrolled above the fold
  useEffect(() => {
    if (!touched.current) return
    headingRef.current?.focus({ preventScroll: true })
    const top = rootRef.current?.getBoundingClientRect().top ?? 0
    if (top < 70) scrollToTarget(window.scrollY + top - 110)
  }, [step])

  // Live preview: leads (of 100) still in at each stage — null past the first unanswered
  // question — and a month of leads / site visits once those are known.
  // Google Ads multiplies the site visits (1.8× / 2× Meta)
  const boost = visitBoostFor(picks.project, picks.ticket, picks.platform)
  const shares = funnelShares(drops, boost)
  const visitShare = shares.at(-1)
  const done = funnelDone(drops)
  const leadsPerMonth = picks.leads ? picks.leads.perDay * DAYS_PER_MONTH : null
  const visitsPerMonth = leadsPerMonth != null && visitShare != null ? Math.round((leadsPerMonth * visitShare) / 100) : null
  const plus = picks.leads?.plus ? '+' : ''
  const answered = PICKS.filter(({ key }) => picks[key]).length
  // First unanswered pick — the answer chips can't jump past it
  const gap = PICKS.findIndex(({ key }) => !picks[key])

  const s = STEPS[step]
  const options = s.kind === 'pick' ? optionsFor(s, picks) : null
  const last = step === STEPS.length - 1
  const canContinue = s.kind === 'drop' ? drops[s.key] != null : !!picks[s.key]

  const show = (to) => {
    touched.current = true
    setDir(to > step ? 1 : -1)
    setStep(to)
  }

  // A tap only picks — the visitor moves on with Continue
  const pick = (key, o) => {
    setPicks((p) => {
      const next = { ...p, [key]: o }
      // A ticket size the new project type doesn't offer (₹5Cr+ for commercial) has to be picked again;
      // one it does is swapped for that type's own (plots price ₹50L differently)
      if (key === 'project' && p.ticket) next.ticket = ticketsFor(o).find((t) => t.id === p.ticket.id) ?? null
      return next
    })
  }

  // The answers after this one are worked out again from the new number
  const drop = (id, v) => setDrops((d) => changeDrop(d, id, v))

  // Back to the first funnel question with every funnel answer cleared
  // (the project picks are kept)
  const startAgain = () => {
    setDrops({})
    show(PICKS.length)
  }

  // Only reachable once every question is answered
  const getReport = () => go(`/build-package/report?${toQuery(picks, drops)}`)

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canContinue) return
    if (last) getReport()
    else show(step + 1)
  }

  const StepIcon = s.kind === 'drop' ? STEP_ICONS[s.key] : null
  const at = s.kind === 'drop' ? funnel.indexOf(s.step) : -1
  // This funnel question's options, worked out from the leads still in before it
  const dropAt = s.kind === 'drop' ? dropOptions(shares[at - 1], step - PICKS.length) : null
  const lastDrop = s.kind === 'drop' && last
  const sub =
    s.kind === 'pick'
      ? s.sub
      : at === 1
        ? 'Let’s suppose you received 100 leads. Answer 5 quick questions and see how many of them actually turn into site visits.'
        : lastDrop
          ? `Leads remaining: ${shares[at - 1]} out of 100. Whoever’s left after this are your site visits.`
          : `Leads remaining: ${shares[at - 1]} out of 100.`

  return (
    <>
      <CompactHero
        icon={Calculator}
        eyebrow="Package calculator"
        title={['Track Your Real Estate', 'Business Growth']}
        text="Discover What's Holding Back Your Leads, Sales, and Site Visits with Your Free Business Audit Report."
      />

      <section id="builder" className="scroll-mt-24 px-[var(--gutter)] pb-[clamp(96px,14vh,150px)] max-[640px]:pb-16">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-6 min-[1024px]:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── The wizard: one question at a time, in a card with a light running round its edge ── */}
          <div data-slide="up" className="cta-border min-w-0 rounded-[30px] p-px shadow-[0_40px_100px_-40px_rgba(83,247,251,0.35)] max-[640px]:rounded-[23px]">
            <form
              ref={rootRef}
              noValidate
              onSubmit={onSubmit}
              className="relative flex flex-col overflow-clip rounded-[29px] bg-[linear-gradient(160deg,#131e44_0%,#0d1532_55%,#0b1229_100%)] p-8 max-[640px]:rounded-[22px] max-[640px]:p-5 min-[1024px]:min-h-[620px]"
            >
              {/* Backdrop: faint grid + glows */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_80%_0%,#000_5%,transparent_60%)]"
              />
              <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.16),transparent_70%)]" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,122,80,0.09),transparent_70%)]" />

              {/* Stepper: the two parts, each with a bar per question */}
              <div
                className="relative grid gap-4 max-[640px]:gap-3"
                style={{ gridTemplateColumns: SECTIONS.map((sec) => `${sec.to - sec.from}fr`).join(' ') }}
              >
                {SECTIONS.map((sec, n) => {
                  const done = step >= sec.to
                  const active = step >= sec.from && !done
                  return (
                    <div key={sec.label} className="min-w-0">
                      <p
                        className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 max-[640px]:text-[10px] max-[640px]:tracking-[0.1em] ${
                          active ? 'text-[var(--cyan)]' : done ? 'text-white/75' : 'text-white/35'
                        }`}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] transition-colors duration-300 ${
                            done ? 'bg-[var(--cyan)] text-[var(--navy)]' : active ? 'border border-[var(--cyan)] text-[var(--cyan)]' : 'border border-white/20'
                          }`}
                        >
                          {done ? <Check size={11} strokeWidth={3.4} aria-hidden="true" /> : n + 1}
                        </span>
                        <span className="truncate max-[640px]:hidden">{sec.label}</span>
                        <span className="truncate min-[641px]:hidden">{sec.short}</span>
                      </p>
                      <div className="mt-2.5 flex gap-1" aria-hidden="true">
                        {STEPS.slice(sec.from, sec.to).map((x, j) => {
                          const i = sec.from + j
                          return (
                            <span key={x.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                              <span
                                className={`block h-full origin-left rounded-full bg-gradient-to-r from-[#2bd4dc] to-[var(--cyan)] transition-transform duration-500 ease-[var(--ease)] ${i === step ? 'shadow-[0_0_12px_rgba(83,247,251,0.9)]' : ''}`}
                                style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
                              />
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Step — keyed so each one slides in */}
              <div key={step} className="cf-step relative mb-8 mt-8 max-[640px]:mb-6 max-[640px]:mt-6" style={{ '--dir': dir }}>
                <p className="flex items-center gap-2.5 text-[12.5px] font-semibold text-white/50">
                  {StepIcon ? (
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[rgba(255,122,80,0.14)] text-[var(--amber)] shadow-[0_0_20px_-6px_rgba(255,122,80,0.7)]">
                      <StepIcon size={16} aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="grid h-8 min-w-8 place-items-center rounded-xl border border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.08)] px-1.5 font-[family-name:var(--font-display)] text-[12px] font-[800] text-[var(--cyan)]">
                      {String(step + 1).padStart(2, '0')}
                    </span>
                  )}
                  Question {step + 1} of {STEPS.length}
                </p>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className={`mt-3.5 font-[family-name:var(--font-display)] font-[800] tracking-[-0.035em] text-white outline-none text-balance ${
                    // The funnel questions are long — a smaller size keeps them to 2–3 lines
                    s.kind === 'drop' ? 'text-[clamp(1.3rem,2.1vw,1.8rem)] leading-[1.18]' : 'text-[clamp(1.55rem,2.8vw,2.25rem)] leading-[1.1]'
                  }`}
                >
                  {s.title}
                </h2>
                <p className="mt-2.5 max-w-[540px] text-[14.5px] leading-[1.55] text-white/55 max-[640px]:mt-1.5 max-[640px]:text-[14px]">{sub}</p>

                <fieldset className="m-0 mt-6 border-0 p-0 max-[640px]:mt-4">
                  <legend className="sr-only">{s.title}</legend>

                  {s.kind === 'pick' ? (
                    <div className={`grid gap-3 max-[640px]:gap-2.5 ${colsFor(s, options.length)}`}>
                      {options.map((o, i) => {
                        const on = picks[s.key]?.id === o.id
                        // Odd count on the two-column phone grid: the last ticket card spans the row
                        const span = s.key === 'ticket' && options.length % 2 && i === options.length - 1 ? 'max-[559px]:col-span-2' : ''
                        return (
                          <Choice key={o.id} index={i} name={s.key} checked={on} compact={s.key === 'leads' || s.key === 'ticket'} onPick={() => pick(s.key, o)} className={span}>
                            <ChoiceBody pickKey={s.key} option={o} checked={on} />
                          </Choice>
                        )
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2.5 max-[640px]:gap-2">
                        {dropAt.options.map((v, i) => {
                          const on = drops[s.key] === v
                          return (
                            <Choice key={v} index={i} name={s.key} checked={on} compact onPick={() => drop(s.key, v)}>
                              <span className="relative flex w-full items-baseline justify-center gap-1.5 px-1 py-4 max-[640px]:flex-col max-[640px]:items-center max-[640px]:gap-1 max-[640px]:py-3.5">
                                <span className={`font-[family-name:var(--font-display)] text-[clamp(1.45rem,2.4vw,1.85rem)] font-[800] leading-none tracking-[-0.04em] tabular-nums ${on ? 'text-[var(--cyan)]' : 'text-white'}`}>
                                  {v}
                                </span>
                                <span className="text-[12.5px] font-medium text-white/55">{v === 1 ? 'lead' : 'leads'}</span>
                              </span>
                            </Choice>
                          )
                        })}
                      </div>
                      {/* Last question: the result card takes the meter's place */}
                      {/* Before a pick, nobody has dropped out here yet */}
                      {!lastDrop && <LeadMeter before={shares[at - 1]} after={shares[at] ?? shares[at - 1]} />}
                    </>
                  )}
                </fieldset>

                {/* Last question, once answered: the result and the whole journey, from 100 leads to site visits */}
                {lastDrop && done && (
                  <div className="mt-4 rounded-2xl border border-[rgba(83,247,251,0.3)] bg-[linear-gradient(165deg,rgba(83,247,251,0.12),rgba(83,247,251,0.02)_70%)] p-5 max-[640px]:p-4">
                    <p className="font-[family-name:var(--font-display)] text-[19px] font-[800] leading-snug tracking-[-0.02em] text-white max-[640px]:text-[16.5px]">
                      Out of 100 leads, only <span className="text-[var(--cyan)]">{visitShare}</span> actually visited the site.
                    </p>
                    {boost > 1 && (
                      <p className="mt-1.5 text-[13px] leading-snug text-white/60">
                        Includes the <span className="font-semibold text-white">{boost}× site visits</span> Google Ads brings over Meta Ads — its buyers are already searching.
                      </p>
                    )}
                    <ol className="mt-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[12.5px]" aria-label="Your lead journey">
                      {funnel.map((f, i) => {
                        const end = i === funnel.length - 1
                        return (
                          <li key={f.id} className="flex items-center gap-1.5">
                            {i > 0 && <ArrowRight size={12} className="text-white/30" aria-hidden="true" />}
                            <span className={`rounded-full px-2.5 py-1 ${end ? 'bg-[var(--cyan)]/15 text-[var(--cyan)]' : 'bg-white/[0.05] text-white/65'}`}>
                              <span className={`font-semibold tabular-nums ${end ? '' : 'text-white'}`}>{shares[i]}</span> {f.journey}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <a
                        href="/contact"
                        onClick={(e) => {
                          e.preventDefault()
                          go('/contact')
                        }}
                        className="group inline-flex h-10 items-center gap-2 rounded-xl border border-[rgba(83,247,251,0.45)] bg-[rgba(83,247,251,0.1)] px-4 text-[13.5px] font-semibold text-[var(--cyan)] transition-[border-color,background-color] hover:border-[rgba(83,247,251,0.8)] hover:bg-[rgba(83,247,251,0.16)]"
                      >
                        Get more site visits – Contact us
                        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={startAgain}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 text-[13.5px] font-semibold text-white/80 transition-[border-color,background-color,color] hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
                      >
                        <RotateCcw size={15} aria-hidden="true" />
                        Start again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions — pinned to the bottom of the screen whenever the card is taller than it */}
              <div
                className="
                  sticky bottom-0 z-10 -mx-8 -mb-8 mt-auto flex flex-col gap-3 rounded-b-[29px] border-t border-white/[0.08] bg-[rgba(11,18,41,0.9)] px-8 pb-7 pt-5 backdrop-blur-xl
                  max-[640px]:-mx-5 max-[640px]:-mb-5 max-[640px]:rounded-b-[22px] max-[640px]:px-5 max-[640px]:pb-[max(16px,env(safe-area-inset-bottom))] max-[640px]:pt-4
                "
              >
                <div className="flex items-center gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => show(step - 1)}
                      aria-label="Back"
                      className="inline-flex h-14 shrink-0 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 text-[14.5px] font-semibold text-white/80 transition-[border-color,background-color,color] hover:border-white/30 hover:bg-white/[0.07] hover:text-white max-[640px]:w-14 max-[640px]:justify-center max-[640px]:px-0"
                    >
                      <ArrowLeft size={18} aria-hidden="true" />
                      <span className="max-[640px]:hidden">Back</span>
                    </button>
                  )}
                  <p className="hidden flex-1 items-center gap-2 text-[13px] text-white/40 min-[641px]:flex">
                    {!canContinue ? (
                      'Tap an option to continue'
                    ) : last ? (
                      'That’s the last one — your report is ready.'
                    ) : (
                      <>
                        Press <kbd className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.05] px-1.5 py-0.5 font-sans text-[11.5px] text-white/70">Enter <CornerDownLeft size={11} aria-hidden="true" /></kbd>
                      </>
                    )}
                  </p>
                  <button
                    type="submit"
                    disabled={!canContinue}
                    className={`${CTA} flex-1 min-[641px]:flex-none min-[641px]:px-9 disabled:cursor-not-allowed disabled:border disabled:border-white/10 disabled:bg-none disabled:bg-white/[0.04] disabled:text-white/30 disabled:shadow-none`}
                  >
                    {last ? (
                      <>
                        <FileBarChart size={18} aria-hidden="true" />
                        Get my report
                      </>
                    ) : (
                      'Continue'
                    )}
                    <ArrowRight size={18} className="transition-transform duration-300 group-enabled:group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </div>
                {!canContinue && <p className="text-center text-[12.5px] text-white/45 min-[641px]:hidden">Tap an option to continue</p>}
              </div>
            </form>
          </div>

          {/* ── Live preview (sticky beside the form on desktop) — kept short enough to fit one laptop
                screen; on a very short window it scrolls inside itself rather than running off the bottom ── */}
          <aside
            data-slide="up"
            className="glass relative overflow-hidden rounded-[28px] p-5 [scrollbar-width:thin] max-[640px]:rounded-[22px] min-[1024px]:sticky min-[1024px]:top-24 min-[1024px]:max-h-[calc(100svh-7rem)] min-[1024px]:overflow-y-auto"
            aria-live="polite"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.18),transparent_70%)]" />
            <p className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cyan)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cyan)]" />
              </span>
              Live preview
            </p>

            {/* Your project: one thin row per answer, filled in as it's picked — tap a row to change it */}
            <div className="relative mt-3.5">
              <p className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                Your project
                <span className="flex items-center gap-1.5 tabular-nums tracking-normal">
                  <span className="flex gap-0.5" aria-hidden="true">
                    {PICKS.map((p) => (
                      <span key={p.key} className={`h-1 w-2.5 rounded-full transition-colors ${picks[p.key] ? 'bg-[var(--cyan)]' : 'bg-white/15'}`} />
                    ))}
                  </span>
                  <span>
                    <span className="text-[var(--cyan)]">{answered}</span>/{PICKS.length}
                  </span>
                </span>
              </p>
              <div className="mt-2 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]">
                {PICKS.map((p, i) => {
                  const o = picks[p.key]
                  const here = step === i
                  const extra = o && pickExtra(p.key, o)
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => show(i)}
                      disabled={gap !== -1 && i > gap}
                      className={`group relative flex h-7 w-full items-center gap-2 px-2.5 text-left text-[12px] transition-colors disabled:cursor-default ${
                        here ? 'bg-[rgba(83,247,251,0.08)]' : 'enabled:hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* A cyan edge marks the question on screen */}
                      {here && <span aria-hidden="true" className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[var(--cyan)]" />}
                      <PickIcon pickKey={p.key} option={o} n={i + 1} />
                      <span className="w-[68px] shrink-0 text-[11px] text-white/45">{SUMMARY_LABELS[p.key]}</span>
                      <span className={`min-w-0 flex-1 truncate font-semibold ${o ? 'text-white' : here ? 'text-[var(--cyan)]/80' : 'text-white/25'}`}>
                        {o ? pickLabel(p.key, o) : here ? 'Picking…' : '—'}
                      </span>
                      {extra && (
                        <span className={`shrink-0 text-[10.5px] tabular-nums ${extra === 'Luxury' ? 'font-semibold text-[#fbbf24]' : 'text-white/40'}`}>{extra}</span>
                      )}
                      {o && <PencilLine size={10} className="shrink-0 text-white/25 transition-colors group-hover:text-[var(--cyan)]" aria-hidden="true" />}
                      <span className="sr-only">— {o ? 'change' : 'answer'}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Site visits: the ring beside a month's numbers at your chosen leads per day */}
            <div className="relative mt-4 flex items-center gap-3.5 border-t border-white/[0.07] pt-4">
              <Gauge value={visitShare} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-snug text-white/60">
                  of every 100 leads reach a <span className="font-semibold text-white">site visit</span>
                  {boost > 1 && <span className="ml-1 font-semibold text-[var(--cyan)]">· {boost}× with Google</span>}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5">
                    <p className="text-[10px] leading-3 text-white/50">Leads / mo</p>
                    <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-[15px] font-[800] leading-5 tracking-[-0.02em] text-white">
                      {leadsPerMonth != null ? `${num(leadsPerMonth)}${plus}` : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.07)] px-2 py-1.5">
                    <p className="text-[10px] leading-3 text-white/50">Visits / mo</p>
                    <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-[15px] font-[800] leading-5 tracking-[-0.02em] text-[var(--cyan)]">
                      {visitsPerMonth != null ? `${num(visitsPerMonth)}${plus}` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Where the 100 leads drop out, one funnel question per row — the bar fills behind its text */}
            <p className="relative mt-4 flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
              Where 100 leads drop out
              {visitShare != null && <span className="tabular-nums tracking-normal text-[#ffb59c]">−{100 - visitShare}</span>}
            </p>
            <ol className="relative mt-2 flex flex-col gap-1">
              {funnelSteps.map((f, i) => {
                // funnelSteps[i] is funnel stage i + 1, so it loses shares[i] − shares[i + 1] (null until answered)
                const lost = shares[i + 1] == null ? null : shares[i] - shares[i + 1]
                const here = i + 1 === at
                return (
                  <li
                    key={f.id}
                    className={`relative flex h-6 items-center justify-between gap-2 overflow-hidden rounded-md bg-white/[0.04] px-2 text-[11.5px] transition-shadow ${
                      here ? 'shadow-[inset_0_0_0_1px_rgba(255,122,80,0.55)]' : ''
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgba(255,122,80,0.18),rgba(255,122,80,0.42))] transition-[width] duration-700 ease-[var(--ease)]"
                      style={{ width: `${lost == null ? 0 : Math.max(lost, 1.5)}%` }}
                    />
                    <span className={`relative truncate transition-colors ${here ? 'font-semibold text-white' : 'text-white/65'}`}>{f.lost}</span>
                    <span className={`relative shrink-0 tabular-nums font-semibold ${lost == null ? 'text-white/30' : 'text-[#ffb59c]'}`}>{lost ?? '—'}</span>
                  </li>
                )
              })}
            </ol>

            {/* Every question answered (e.g. back from the report to edit) — the report is one tap away from any step */}
            {answered === PICKS.length && done && !last && (
              <button type="button" onClick={getReport} className={`${CTA} relative mt-4 h-12! w-full`}>
                <FileBarChart size={18} aria-hidden="true" />
                Get my report
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </button>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}

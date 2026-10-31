import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'motion/react'
import {
  ArrowDown, ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronUp, Copy, FileBarChart, Pencil, Search,
} from 'lucide-react'

import { WhatsAppIcon } from '../components/icons'
import ReasonForm from '../components/ReasonForm'
import { inr } from '../data/packages'
import { fromQuery, funnelSteps, report, toQuery } from '../data/packageBuilder'
import { whatsappLink } from '../data/site'
import { useGo } from '../lib/nav'
import { scrollToTarget } from '../lib/scroll'

/* ------------------------------------------------------------------
   The lead loss report — opened by "Get result" on Build Package, with
   the answers in the URL (see toQuery / fromQuery). Reads like a report:
   a cover, the main numbers and Before vs After AXAMP.

   Colours were checked with the dataviz palette validator on the
   card surface (#101a3f, dark): teal for leads that move on, red for
   leads lost. Text never wears them — values stay white / muted.

   "Share" sends the report to AXAMP on WhatsApp.
------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1]

const num = (n) => n.toLocaleString('en-IN')

const CTA =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] px-6 font-[family-name:var(--font-display)] text-[15px] font-[700] text-[var(--navy)] shadow-[0_0_30px_-8px_rgba(83,247,251,0.8)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-70'
const GHOST =
  'inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-[13px] font-semibold text-white/80 transition-colors hover:border-white/25 hover:text-white'

// Eases a number to its new value (instant with reduced motion)
function useCountUp(value, ms = 900) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = value
      setShown(value)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - start) / ms)
      const v = Math.round(a + (value - a) * (1 - (1 - k) ** 3))
      from.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return shown
}

/* ── The report, as a WhatsApp message ────────────────── */

function resultLines(picks, drops, r) {
  const from = r.plus ? 'from ' : ''
  const plus = r.plus ? '+' : ''
  return [
    `I am: ${picks.category.label}`,
    `Project type: ${picks.project.label}`,
    `Ticket size: ${picks.ticket.label}`,
    `Preferred platform: ${picks.platform.label}`,
    `Leads needed: ${picks.leads.label}`,
    '',
    'My sales funnel (out of 100 leads):',
    ...funnelSteps.map((s) => `- ${s.lost}: ${drops[s.id]} leads`),
    '',
    `Total Ad Spend: ${from}${inr(r.adSpend)} a month`,
    `Total Leads: ${num(r.leadsPerMonth)}${plus} a month`,
    `Total Site Visits: ${num(r.siteVisits)}${plus}${r.visitBoost > 1 ? ` (${boostNote(r)})` : ''}`,
    `Cost Per Visit: ${r.costPerVisit ? inr(r.costPerVisit) : '—'}`,
    `Total Loss: ${from}${inr(r.moneyLoss)} a month (${num(r.leadLoss)}${plus} leads lost)`,
    '',
    `Suggested package: ${r.plan.name} (${inr(r.plan.fee)} + GST a month)`,
  ]
}

// Google Ads multiplies the site visits over Meta Ads (packageBuilder.js: visitBoostFor)
const boostNote = (r) => `${r.visitBoost}× the site visits of Meta Ads, with Google Ads`

const whatsappResult = (picks, drops, r) => ['Hi AXAMP, I got my lead loss report on your website.', '', ...resultLines(picks, drops, r)].join('\n')

// How each red number is worked out — behind its warning sign on the report, and in the email
function lossNotes(r) {
  const plus = r.plus ? '+' : ''
  return {
    visit: r.costPerVisit
      ? `${inr(r.adSpend)} ad spend ÷ ${num(r.siteVisits)} site visits = ${inr(r.costPerVisit)}. That’s what each site visit really costs you today.`
      : null,
    leadsLost: `${num(r.leadsPerMonth)}${plus} leads − ${num(r.siteVisits)}${plus} site visits = ${num(r.leadLoss)}${plus} leads every month that never reach your site.`,
    loss: `${num(r.leadLoss)}${plus} lost leads × ${inr(r.cpl)} per lead = ${inr(r.moneyLoss)} of ad spend wasted every month.`,
  }
}

/* ── The whole report for the "Find the reason" email ──────────────
   Section by section, as [label, value, note?] rows: every project
   answer, every funnel question with its answer and the leads left
   after it, every number on the report with how it's worked out,
   and the suggested package. api/contact.js lays it out as tables.
------------------------------------------------------------------ */
function reportSections(picks, drops, r) {
  const from = r.plus ? 'from ' : ''
  const plus = r.plus ? '+' : ''
  const notes = lossNotes(r)
  return [
    {
      title: 'Your project',
      rows: [
        ['I am', picks.category.label],
        ['Project type', picks.project.label],
        ['Ticket size', picks.ticket.label],
        ['Preferred platform', picks.platform.label],
        ['Leads needed', `${picks.leads.label} (${num(r.leadsPerMonth)}${plus} a month)`],
      ],
    },
    {
      title: 'Your sales funnel (out of 100 leads)',
      rows: [
        // funnelSteps[i] is funnel stage i + 1 — its share is what's left after the question
        ...funnelSteps.map((s, i) => [s.question, `${drops[s.id]} leads`, `Leads remaining: ${r.stages[i + 1].share} out of 100`]),
        ['Site visits', `${r.stages.at(-1).share} out of 100 leads`, r.visitBoost > 1 ? boostNote(r) : undefined],
      ],
    },
    {
      title: 'Your numbers (every month)',
      rows: [
        ['Cost Per Lead', inr(r.cpl)],
        ['Total Ad Spend', `${from}${inr(r.adSpend)} / Month`],
        ['Total Leads', `${num(r.leadsPerMonth)}${plus} Leads / Month`],
        ['Total Site Visits', `${num(r.siteVisits)}${plus} ${r.siteVisits === 1 && !plus ? 'Visit' : 'Visits'} / Month`, r.visitBoost > 1 ? boostNote(r) : undefined],
        ['Cost Per Visit', r.costPerVisit ? `${inr(r.costPerVisit)} / Visit` : '—', notes.visit],
        ['Total Leads Lost', `${num(r.leadLoss)}${plus} Leads / Month`, notes.leadsLost],
        ['Total Loss', `${from}${inr(r.moneyLoss)} / Month`, notes.loss],
      ],
    },
    // A fixed label, as each row is a column in the Google Sheet (api/_sheets.js)
    { title: 'Suggested package', rows: [['Package', `${r.plan.name} — ${inr(r.plan.fee)} + GST a month`]] },
  ]
}

/* ── Pieces ─────────────────────────────────────────────────────── */

function Card({ id, eyebrow, title, action, className = '', children }) {
  return (
    <section id={id} className={`relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(170deg,#121c47_0%,#101a3f_45%,#0c1433_100%)] p-7 max-[640px]:p-5 ${className}`}>
      {(eyebrow || title || action) && (
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--cyan)]">{eyebrow}</p>}
            {title && <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(1.15rem,2vw,1.4rem)] font-[800] tracking-[-0.02em] text-white">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

/* ── The main numbers, written out (founder's note: "Total Ads spends = …") ── */

// Warning sign: a red rounded triangle with a white inner outline and a white "!"
function WarningSign({ className }) {
  return (
    <svg viewBox="0 0 100 92" className={className} aria-hidden="true">
      <path d="M50 8 L94 84 H6 Z" fill="#e5232b" stroke="#e5232b" strokeWidth="12" strokeLinejoin="round" />
      <path d="M50 21 L83 77 H17 Z" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinejoin="round" />
      <rect x="45.5" y="37" width="9" height="25" rx="4.5" fill="#fff" />
      <circle cx="50" cy="69.5" r="4.8" fill="#fff" />
    </svg>
  )
}

// Blinking warning sign on the right of a row (styles.css: .warn-blink);
// hover, focus or tap shows how the number is worked out
function AlertTip({ text }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const tipId = useId()

  // Close on a tap/click anywhere else or on Escape. (iPhone Safari never focuses a tapped
  // button, so onBlur alone would leave the box open.)
  useEffect(() => {
    if (!open) return
    const away = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false)
    }
    const esc = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <span ref={wrap} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 max-[639px]:right-3 max-[639px]:top-3 max-[639px]:translate-y-0">
      <button
        type="button"
        aria-label="How is this worked out?"
        aria-expanded={open}
        aria-describedby={tipId}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="peer grid h-11 w-11 place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-[#ff9a9d] max-[639px]:h-9 max-[639px]:w-9"
      >
        <WarningSign className="warn-blink h-9 w-9 max-[639px]:h-8 max-[639px]:w-8" />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`absolute bottom-full right-0 mb-2.5 w-[min(17rem,calc(100vw-4rem))] rounded-xl border border-white/10 bg-[#1b1638] p-3.5 text-[12.5px] leading-[1.5] text-white/85 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] transition-opacity duration-200 peer-hover:opacity-100 peer-focus-visible:opacity-100 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {text}
      </span>
    </span>
  )
}

// Scroll to Before vs After AXAMP, stopping just under the fixed menu
const showReasons = () => {
  const el = document.getElementById('loss-reasons')
  if (el) scrollToTarget(el.getBoundingClientRect().top + window.scrollY - 96)
}

function MainNumbers({ r, onFindReason }) {
  const from = r.plus ? 'from ' : ''
  const plus = r.plus ? '+' : ''
  // How each red number is worked out, shown behind its warning sign
  const { visit: visitInfo, leadsLost: leadsLostInfo, loss: lossInfo } = lossNotes(r)
  const rows = [
    ['Total Ad Spend', `${from}${inr(r.adSpend)}`, 'Month'],
    ['Total Leads', `${num(r.leadsPerMonth)}${plus} Leads`, 'Month'],
    ['Total Site Visits', `${num(r.siteVisits)}${plus} ${r.siteVisits === 1 && !plus ? 'Visit' : 'Visits'}`, 'Month', r.visitBoost > 1 ? boostNote(r) : null],
    ['Cost Per Visit', r.costPerVisit ? inr(r.costPerVisit) : '—', 'Visit', null, true, visitInfo],
    ['Total Leads Lost', `${num(r.leadLoss)}${plus} Leads`, 'Month', null, true, leadsLostInfo],
    ['Total Loss', `${from}${inr(r.moneyLoss)}`, 'Month', null, true, lossInfo],
  ]
  // The red rows blink like an alert the first time they're on screen (styles.css: .loss-alert)
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.5 })
  const firstLoss = rows.findIndex((row) => row[4])
  return (
    <Card>
      <dl ref={ref} className="m-0 flex flex-col">
        {rows.map(([label, value, per, note, loss, info], i) => (
          <div
            key={label}
            style={loss ? { '--alert-delay': `${(i - firstLoss) * 0.15}s` } : undefined}
            // Every row has the same side padding, so labels, "=" and numbers line up between the plain and red rows
            className={`relative grid items-center gap-x-4 px-5 max-[639px]:px-4 min-[640px]:grid-cols-[minmax(0,15rem)_auto_minmax(0,1fr)] ${info ? 'pr-16 max-[639px]:pr-4' : ''} ${
              loss
                ? `${seen ? 'loss-alert' : ''} mt-3 rounded-2xl border border-[rgba(229,72,77,0.55)] bg-[linear-gradient(100deg,rgba(229,72,77,0.22),rgba(229,72,77,0.07))] py-4 shadow-[0_12px_40px_-16px_rgba(229,72,77,0.7)]`
                : `border border-transparent py-4 max-[639px]:py-3 ${i ? 'border-t-white/[0.07]' : ''}`
            }`}
          >
            <dt className={`font-[family-name:var(--font-display)] text-[clamp(1.05rem,2vw,1.35rem)] font-[700] ${loss ? 'text-white' : 'text-white/80'}`}>{label}</dt>
            <span aria-hidden="true" className={`font-[family-name:var(--font-display)] text-[clamp(1.05rem,2vw,1.35rem)] font-[700] max-[639px]:hidden ${loss ? 'text-[#ff9a9d]/60' : 'text-white/35'}`}>
              =
            </span>
            <dd className="m-0 flex items-center gap-3 max-[639px]:mt-1.5">
              {/* The plain rows keep an empty slot the size of the red rows' ↓ icon, so every number starts in the same
                  place (not on phones, where each number sits under its own label) */}
              {!loss && <span aria-hidden="true" className="h-10 w-10 shrink-0 max-[639px]:hidden" />}
              {loss && (
                <span
                  className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5484d] text-white shadow-[0_0_20px_-2px_rgba(229,72,77,0.8)] max-[639px]:h-8 max-[639px]:w-8 ${seen ? 'loss-beacon' : ''}`}
                >
                  <ArrowDown size={20} strokeWidth={2.8} aria-hidden="true" />
                </span>
              )}
              <span>
                <span
                  className={`font-[family-name:var(--font-display)] font-[800] tabular-nums tracking-[-0.03em] ${
                    loss ? 'text-[clamp(1.75rem,3.6vw,2.6rem)] text-[#ff6b70] max-[379px]:text-[1.5rem]' : 'text-[clamp(1.5rem,3vw,2.1rem)] text-white'
                  }`}
                >
                  {value}
                </span>
                <span className={`ml-1 text-[clamp(0.95rem,1.6vw,1.1rem)] font-semibold ${loss ? 'text-[#ff9a9d]/80' : 'text-white/50'}`}>/ {per}</span>
                {note && <span className="mt-0.5 block text-[12.5px] text-white/45">{note}</span>}
              </span>
            </dd>
            {info && <AlertTip text={info} />}
          </div>
        ))}
      </dl>

      {/* Next step: where the loss comes from (scrolls to Before vs After AXAMP, which has the fix) */}
      {/* A solid red button: it glows in and out, a light sweeps across it every few
          seconds (styles.css: .reason-btn) and its ↓ bobs. It opens the details form
          (ReasonForm) — once that's sent, it goes straight to Before vs After AXAMP */}
      <div className="mt-7 flex flex-col items-center gap-2.5">
        <p className="text-center text-[13px] text-white/55">
          See where your <span className="font-semibold text-[#ff9a9d]">{num(r.leadLoss)}{plus} lost leads</span> drop out
        </p>
        <button
          type="button"
          onClick={onFindReason}
          aria-haspopup="dialog"
          className="reason-btn group relative inline-flex h-[60px] w-full max-w-[460px] items-center justify-center gap-3 overflow-hidden rounded-full bg-[linear-gradient(135deg,#ff8a8e_0%,#ff5a60_40%,#e5484d_70%,#c9353a_100%)] pl-2.5 pr-2.5 font-[family-name:var(--font-display)] text-[17.5px] font-[800] tracking-[-0.015em] text-white transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff9a9d] max-[479px]:h-14 max-[479px]:gap-2 max-[479px]:text-[15px] max-[379px]:text-[13.5px]"
        >
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] max-[479px]:h-9 max-[479px]:w-9">
            <Search size={18} strokeWidth={2.8} aria-hidden="true" />
          </span>
          {/* "reason" sits in a white highlight, like the white ↓ circle beside it */}
          <span className="relative flex-1 text-center leading-tight">
            Find the{' '}
            <span className="mx-0.5 inline-block -rotate-2 rounded-md bg-white px-1.5 py-0.5 text-[#d63a40] shadow-[0_3px_10px_-3px_rgba(120,10,20,0.7)] transition-transform duration-300 group-hover:rotate-0 max-[379px]:px-1">
              reason
            </span>{' '}
            behind this loss
          </span>
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#d63a40] shadow-[0_4px_12px_-4px_rgba(120,10,20,0.6)] transition-transform duration-300 group-hover:scale-110 max-[479px]:h-9 max-[479px]:w-9">
            <ArrowUp size={19} strokeWidth={2.8} className="reason-bob-up" aria-hidden="true" />
          </span>
        </button>
      </div>
    </Card>
  )
}

/* ── Before vs After AXAMP ───────────────────────────────────────────
   The founder's sketch: the visitor's month top to bottom — leads, each
   funnel step, site visits, deal closed — with a bracket from the site
   visit back up to the leads: "AXAMP will full fill this gap up to 50%*".
   Drawn as a column of numbers with arrows between them, the bracket
   with a light running up it, and a panel with the gap and the 50%
   ring. Numbers count up when the card scrolls into view.
------------------------------------------------------------------ */

const GAP_SHARE = 50 // "up to 50%*" — the founder's figure

// A number that counts up from 0 once `on` turns true
function CountUp({ value, on }) {
  return num(useCountUp(on ? value : 0, 1100))
}

// One stop on the funnel. Wide screens: leads and the deal in a ring, the site
// visit as a pill. Phones: every stage is a pill that narrows with its share,
// so the funnel visibly shrinks from leads down to site visits.
const FLOW_NODE = {
  start: 'h-10 border-2 border-[var(--cyan)] bg-[rgba(83,247,251,0.1)] px-2 text-[15px] text-white shadow-[0_0_24px_-6px_rgba(83,247,251,0.8)] min-[480px]:h-11 min-[480px]:text-[19px] min-[960px]:h-[76px] min-[960px]:w-[76px] min-[960px]:px-0 min-[960px]:text-[23px]',
  step: 'h-10 border border-white/10 bg-white/[0.05] px-2 text-[15px] text-white/75 min-[480px]:h-11 min-[480px]:text-[19px] min-[960px]:border-0 min-[960px]:bg-transparent min-[960px]:px-0 min-[960px]:text-[21px]',
  visit: 'h-10 border border-[rgba(83,247,251,0.6)] bg-[rgba(83,247,251,0.12)] px-2 text-[15px] text-[var(--cyan)] shadow-[0_0_20px_-6px_rgba(83,247,251,0.8)] min-[480px]:h-11 min-[480px]:text-[19px] min-[960px]:px-4 min-[960px]:text-[22px]',
  deal: 'h-[60px] w-[60px] border-2 border-[#25d366] bg-[rgba(37,211,102,0.12)] text-center text-[11px] leading-tight text-white shadow-[0_0_24px_-8px_rgba(37,211,102,0.9)] min-[960px]:h-[76px] min-[960px]:w-[76px] min-[960px]:text-[12.5px]',
}

// Pill width on phones for a stage with `share`% of the leads
const pillWidth = (share) => ({ '--w': `${70 + (34 * share) / 100}px`, '--w2': `${96 + (54 * share) / 100}px` })
const PILL = 'min-w-max w-[var(--w)] min-[480px]:w-[var(--w2)] min-[960px]:min-w-0'

function FlowNode({ kind, row, delay, on, share, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={on ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.45, delay, ease: EASE }}
      style={{ gridRow: row, gridColumn: 2, ...(share != null && pillWidth(share)) }}
      className={`grid place-items-center self-center justify-self-center rounded-full font-[family-name:var(--font-display)] font-[800] tabular-nums tracking-[-0.03em] ${FLOW_NODE[kind]} ${
        share == null ? '' : kind === 'start' ? PILL : `${PILL} min-[960px]:w-auto`
      }`}
    >
      {children}
    </motion.div>
  )
}

function JourneyCard({ r, solutionHref }) {
  const ref = useRef(null)
  const on = useInView(ref, { once: true, amount: 0.25 })
  const still = useReducedMotion()
  const plus = r.plus ? '+' : ''
  const visit = r.stages.length - 1
  const row = (i) => 1 + i * 2 // arrows sit between the nodes
  const gauge = 2 * Math.PI * 52

  return (
    <Card id="loss-reasons" eyebrow="Before vs After AXAMP" title={`Where your ${num(r.leadsPerMonth)}${plus} leads go every month`}>
      {/* Wide screens: the funnel and the panel split the card evenly */}
      <div ref={ref} className="grid gap-8 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[960px]:gap-10">
        {/* Today: the funnel, top to bottom (wide screens: pushed right, so the bracket meets the panel) */}
        <div className="min-w-0">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff9a9d]">
            <span className="h-2 w-2 rounded-full bg-[#ff6b70] shadow-[0_0_10px_#ff6b70]" />
            Today, without AXAMP
          </p>

          {/* Columns: label · stage · bracket · (phones only) "AXAMP will full fill this gap" beside the bracket */}
          <div className="mx-auto grid w-full max-w-[540px] grid-cols-[minmax(0,1fr)_104px_18px_82px] min-[480px]:grid-cols-[minmax(0,1fr)_150px_28px_132px] min-[960px]:mr-0 min-[960px]:grid-cols-[minmax(0,1fr)_150px_48px]">
            {r.stages.map((st, i) => (
              <div key={st.id} className="contents">
                <p
                  style={{ gridRow: row(i), gridColumn: 1 }}
                  className={`self-center pr-2 text-right text-[12px] leading-snug min-[480px]:pr-3 min-[480px]:text-[13.5px] ${i === 0 || i === visit ? 'font-semibold text-white' : 'text-white/55'}`}
                >
                  {i === 0 ? 'Leads' : i === visit ? 'Site visit' : st.label}
                </p>
                <FlowNode kind={i === 0 ? 'start' : i === visit ? 'visit' : 'step'} row={row(i)} delay={i * 0.15} on={on} share={st.share}>
                  {/* The count with its share of all leads — "210 / 70%"; the wide-screen leads ring stacks it as "300" over "100%" */}
                  <span className={`flex items-baseline gap-1 whitespace-nowrap ${i === 0 ? 'leading-none min-[960px]:flex-col min-[960px]:items-center min-[960px]:gap-0' : ''}`}>
                    <span>
                      <CountUp value={st.count} on={on} />
                      {plus}
                    </span>
                    <span
                      className={`text-[11px] font-semibold tracking-normal min-[480px]:text-[12.5px] ${
                        i === 0
                          ? 'text-[var(--cyan)] min-[960px]:mt-1 min-[960px]:text-[11px]'
                          : `min-[960px]:text-[14px] ${i === visit ? 'text-[var(--cyan)]/75' : 'text-white/45'}`
                      }`}
                    >
                      <span className={i === 0 ? 'min-[960px]:hidden' : undefined}>/ </span>
                      {st.share}%
                    </span>
                  </span>
                </FlowNode>
                <motion.div
                  style={{ gridRow: row(i) + 1, gridColumn: 2 }}
                  className="flex flex-col items-center py-1 text-white/30"
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={on ? { opacity: 1 } : undefined}
                  transition={{ duration: 0.3, delay: i * 0.15 + 0.2 }}
                >
                  <span className="h-4 w-px bg-current" />
                  <ChevronDown size={14} className="-mt-1.5" />
                </motion.div>
              </div>
            ))}
            <FlowNode kind="deal" row={row(visit + 1)} delay={(visit + 1) * 0.15} on={on}>
              <span>
                Deal
                <br />
                closed
              </span>
            </FlowNode>

            {/* The sketch's bracket: from the site visit back up to the leads (half a pill: 20/22px; 38px = half the wide-screen leads ring) */}
            <div style={{ gridRow: `${row(0)} / ${row(visit) + 1}`, gridColumn: 3 }} className="relative h-full" aria-hidden="true">
              <div className="absolute bottom-[20px] left-0 right-1 top-[20px] min-[480px]:bottom-[22px] min-[480px]:right-2 min-[480px]:top-[22px] min-[960px]:top-[38px]">
                <motion.span
                  className="absolute inset-0 rounded-r-[14px] border-2 border-l-0 border-[var(--cyan)] [filter:drop-shadow(0_0_6px_rgba(83,247,251,0.75))]"
                  initial={{ clipPath: 'inset(100% 0 0 0)' }}
                  animate={on ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                  transition={{ duration: 1.1, delay: visit * 0.15 + 0.4, ease: EASE }}
                />
                <ChevronLeft size={18} strokeWidth={3} className="absolute -left-2.5 -top-[10px] text-[var(--cyan)]" />
                {/* A light running up the bracket, back to the leads */}
                {!still && on && (
                  <motion.span
                    className="absolute -right-[5px] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_3px_rgba(83,247,251,0.95)]"
                    initial={{ top: '100%', opacity: 0 }}
                    animate={{ top: ['100%', '0%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2.4, delay: visit * 0.15 + 1.5, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
                  />
                )}
                {/* Wide screens: the bracket reaches across to the panel (8px past the box + the 40px gap) */}
                <motion.span
                  className="absolute left-full top-1/2 hidden h-[2px] w-12 origin-left bg-[var(--cyan)] shadow-[0_0_10px_rgba(83,247,251,0.8)] min-[960px]:block"
                  initial={{ scaleX: 0 }}
                  animate={on ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.4, delay: visit * 0.15 + 1.5 }}
                />
              </div>
            </div>

            {/* Phones: the promise sits right beside the bracket (wide screens have it in the panel) */}
            <motion.div
              style={{ gridRow: `${row(0)} / ${row(visit) + 1}`, gridColumn: 4 }}
              className="flex flex-col justify-center pl-1.5 min-[480px]:pl-3 min-[960px]:hidden"
              initial={{ opacity: 0, x: -8 }}
              animate={on ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, delay: visit * 0.15 + 1.2, ease: EASE }}
            >
              <p className="font-[family-name:var(--font-display)] text-[15px] font-[800] leading-[1.2] text-white min-[480px]:text-[20px]">
                AXAMP will full fill <span className="text-[var(--cyan)]">this gap</span>
              </p>
              <p className="mt-3 leading-none">
                <span className="block text-[10.5px] font-semibold text-white/55 min-[480px]:text-[12px]">up to</span>
                <span className="mt-1 block font-[family-name:var(--font-display)] text-[30px] font-[800] tracking-[-0.04em] text-white min-[480px]:text-[38px]">
                  <CountUp value={GAP_SHARE} on={on} />
                  <span className="text-[17px] text-[var(--cyan)] min-[480px]:text-[21px]">%*</span>
                </span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* The gap, and what AXAMP does about it */}
        <motion.aside
          className="relative flex flex-col overflow-hidden rounded-[22px] border border-[rgba(83,247,251,0.3)] bg-[linear-gradient(170deg,rgba(83,247,251,0.12),rgba(12,20,51,0.4)_45%,rgba(12,20,51,0.2))] p-6 max-[640px]:p-5"
          initial={{ opacity: 0, y: 24 }}
          animate={on ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.22),transparent_70%)]" />

          {/* The gap today */}
          <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff9a9d]">The gap today</p>
          <p className="relative mt-2 font-[family-name:var(--font-display)] text-[34px] font-[800] min-[960px]:text-[46px] leading-none tracking-[-0.03em] text-[#ff6b70]">
            <CountUp value={r.leadLoss} on={on} />
            {plus} <span className="text-[18px] text-[#ff9a9d] min-[960px]:text-[22px]">{r.leadLoss === 1 && !plus ? 'lead' : 'leads'} lost</span>
          </p>
          <p className="relative mt-1.5 text-[13px] text-white/55 max-[959px]:hidden">
            Out of {num(r.leadsPerMonth)}
            {plus} leads, only {num(r.siteVisits)}
            {plus} {r.siteVisits === 1 && !plus ? 'reaches' : 'reach'} a site visit.
          </p>
          <div className="relative mt-4 flex h-3 overflow-hidden rounded-full bg-[rgba(229,72,77,0.25)]" role="img" aria-label={`${r.stages[visit].share}% reach a site visit`}>
            <motion.span
              className="h-full rounded-full bg-[var(--cyan)] shadow-[0_0_10px_rgba(83,247,251,0.8)]"
              initial={{ width: 0 }}
              animate={on ? { width: `${Math.max(r.stages[visit].share, 2)}%` } : undefined}
              transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
            />
            <motion.span
              className="h-full flex-1 bg-[linear-gradient(90deg,#e5484d,#ff6b70)]"
              initial={{ opacity: 0 }}
              animate={on ? { opacity: 1 } : undefined}
              transition={{ duration: 0.6, delay: 0.9 }}
            />
          </div>

          {/* AXAMP closes it — centred in whatever height the funnel gives the panel
              (phones: the promise is already beside the bracket, so just the button) */}
          <div className="relative flex flex-1 flex-col justify-center">
            <div className="relative my-6 flex items-center gap-3 text-[var(--cyan)] max-[959px]:hidden" aria-hidden="true">
              <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(83,247,251,0.5))]" />
              <span className="flex flex-col items-center leading-none">
                {[0, 1, 2].map((k) => (
                  <motion.span
                    key={k}
                    className="-my-1"
                    animate={still || !on ? undefined : { opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.4, delay: (2 - k) * 0.2, repeat: Infinity }}
                  >
                    <ChevronUp size={16} strokeWidth={3} />
                  </motion.span>
                ))}
              </span>
              <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(83,247,251,0.5),transparent)]" />
            </div>

            <div className="relative flex items-center gap-5 max-[959px]:hidden">
              <div className="relative grid h-[124px] w-[124px] shrink-0 min-[960px]:h-[156px] min-[960px]:w-[156px] place-items-center">
                <svg viewBox="0 0 124 124" className="absolute inset-0 -rotate-90" aria-hidden="true">
                  <circle cx="62" cy="62" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <motion.circle
                    cx="62"
                    cy="62"
                    r="52"
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={gauge}
                    initial={{ strokeDashoffset: gauge }}
                    animate={on ? { strokeDashoffset: gauge * (1 - GAP_SHARE / 100) } : undefined}
                    transition={{ duration: 1.4, delay: 1.1, ease: EASE }}
                    className="[filter:drop-shadow(0_0_8px_rgba(83,247,251,0.8))]"
                  />
                </svg>
                <span className="text-center leading-none">
                  <span className="block text-[11px] font-semibold text-white/55">up to</span>
                  <span className="mt-1 block font-[family-name:var(--font-display)] text-[34px] font-[800] min-[960px]:text-[44px] tracking-[-0.04em] text-white">
                    <CountUp value={GAP_SHARE} on={on} />
                    <span className="text-[20px] text-[var(--cyan)]">%*</span>
                  </span>
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-[21px] font-[800] min-[960px]:text-[27px] leading-[1.2] text-white">
                  AXAMP will full fill <span className="text-[var(--cyan)]">this gap</span>
                </p>
                <p className="mt-2 text-[13px] leading-snug min-[960px]:text-[14.5px] text-white/55">We turn the leads you lose today into site visits.</p>
              </div>
            </div>

            {/* The fix, on WhatsApp — the report goes along with the message */}
            <a
              href={solutionHref}
              target="_blank"
              rel="noopener noreferrer"
              className="sol-cta group relative mt-6 flex min-h-[64px] w-full items-center gap-3 max-[379px]:gap-2.5 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] py-2.5 pl-2.5 pr-2.5 text-left font-[family-name:var(--font-display)] text-[var(--navy)] transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {/* WhatsApp badge, with a live dot */}
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl max-[379px]:h-[38px] max-[379px]:w-[38px] bg-[var(--navy)] text-[#25d366] shadow-[inset_0_0_0_1px_rgba(37,211,102,0.35)]">
                <WhatsAppIcon size={22} />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--navy)] bg-[#25d366]" aria-hidden="true" />
              </span>
              {/* Phones: two set lines; wider: one line */}
              <span className="block min-w-0 flex-1 leading-[1.15] tracking-[-0.01em]">
                <span className="block whitespace-nowrap text-[16px] font-[800] max-[379px]:text-[15px] min-[480px]:inline min-[480px]:text-[16.5px]">Get the solution</span>{' '}
                <span className="block text-[13.5px] font-[700] text-[var(--navy)]/70 min-[480px]:inline min-[480px]:text-[16.5px] min-[480px]:font-[800] min-[480px]:text-[var(--navy)]">to this loss</span>
              </span>
              <span className="sol-cta-arrow grid h-10 w-10 shrink-0 max-[379px]:h-[34px] max-[379px]:w-[34px] place-items-center rounded-full bg-[var(--navy)]/90 text-[var(--cyan)]" aria-hidden="true">
                <ArrowRight size={18} strokeWidth={2.75} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </a>
          </div>

          <p className="relative pt-6 text-[11.5px] leading-[1.5] text-white/40">* Projected with the AXAMP system. Results depend on your project and team.</p>
        </motion.aside>
      </div>
    </Card>
  )
}

/* ── Empty: opened without answers ──────────────────────────────── */

function NoReport({ go }) {
  return (
    <section className="px-[var(--gutter)] pb-24 pt-[clamp(130px,18vh,170px)]">
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 text-center">
        <FileBarChart size={36} className="text-[var(--cyan)]" aria-hidden="true" />
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2rem)] font-[800] tracking-[-0.03em] text-white">No report yet</h1>
        <p className="text-[15px] text-[var(--muted)]">Answer a few quick questions and we’ll build your lead loss report.</p>
        <button type="button" onClick={() => go('/build-package')} className={CTA}>
          Build my report
          <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function LeadReport() {
  const go = useGo()
  const { search } = useLocation()
  const { picks, drops } = useMemo(() => fromQuery(search), [search])
  const r = report(picks, drops)

  const [copied, setCopied] = useState(false)
  // "Find the reason": the details form, and whether it's been sent (then the button just scrolls)
  const [formOpen, setFormOpen] = useState(false)
  const [formSent, setFormSent] = useState(false)

  if (!r) return <NoReport go={go} />

  const findReason = () => (formSent ? showReasons() : setFormOpen(true))
  // Close the form, then scroll once the page is unlocked
  const seeReasons = () => {
    setFormOpen(false)
    setTimeout(showReasons, 60)
  }

  const plus = r.plus ? '+' : ''
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <>
      <section className="px-[var(--gutter)] pb-[clamp(96px,14vh,150px)] pt-[clamp(112px,15vh,140px)] max-[640px]:pb-16 max-[640px]:pt-[100px]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
          {/* ── Cover ── */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative overflow-hidden rounded-[28px] border border-[rgba(83,247,251,0.22)] bg-[linear-gradient(120deg,rgba(83,247,251,0.10),rgba(15,24,54,0.9)_45%,rgba(229,72,77,0.10))] p-7 max-[640px]:p-5"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:linear-gradient(90deg,#000,transparent)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.22em] text-[var(--cyan)]">
                  <FileBarChart size={15} aria-hidden="true" />
                  Lead loss report
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.2vw,2.5rem)] font-[800] leading-[1.1] tracking-[-0.035em] text-white">
                  {picks.category.label} · {picks.project.label}
                </h1>
                <p className="mt-2 text-[14px] text-white/60">
                  Ticket size {picks.ticket.label} · {picks.platform.label} · {picks.leads.label} · {date}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => go(`/build-package?${toQuery(picks, drops)}`)} className={GHOST}>
                  <Pencil size={14} aria-hidden="true" />
                  Edit answers
                </button>
                <button type="button" onClick={copyLink} className={GHOST}>
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
                <a href={whatsappLink(whatsappResult(picks, drops, r))} target="_blank" rel="noopener noreferrer" className={`${GHOST} hover:text-[#25d366]`}>
                  <WhatsAppIcon size={15} />
                  Share
                </a>
              </div>
            </div>
          </motion.header>

          {/* ── The main numbers ── */}
          <MainNumbers r={r} onFindReason={findReason} />
          {formOpen && (
            <ReasonForm report={reportSections(picks, drops, r)}onClose={() => setFormOpen(false)} onSent={() => setFormSent(true)} onSeeReasons={seeReasons} />
          )}

          {/* ── Before vs After AXAMP ── */}
          <JourneyCard r={r} solutionHref={whatsappLink(whatsappResult(picks, drops, r))} />

          {/* ── How it was worked out ── */}
          <p className="px-2 text-[12px] leading-[1.6] text-white/40">
            How we worked this out: {inr(r.cpl)} per lead for a {picks.ticket.label} {picks.project.label.toLowerCase()} project on {picks.platform.label} × {num(r.leadsPerMonth)}
            {plus} leads a month (30 days) = ad spend. Site visits come from your funnel answers. Total loss = leads that never reach the site × cost per lead. An estimate, not a
            quote — ad spend is paid by you directly to Meta / Google.
          </p>
        </div>
      </section>
    </>
  )
}

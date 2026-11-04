import { useEffect, useRef, useState } from 'react'
import {
  FaArrowDown, FaArrowRight, FaBolt, FaBuilding, FaBullseye, FaCalculator, FaCalendarDays, FaCamera, FaChartLine, FaCheck,
  FaChessKnight, FaCircleCheck, FaCircleInfo, FaCircleXmark, FaClock, FaCrown, FaEye, FaGem, FaGoogle, FaIdBadge, FaLaptop,
  FaLayerGroup, FaLightbulb, FaMeta, FaPlus, FaQuoteLeft, FaRocket, FaRoute, FaShieldHalved, FaTriangleExclamation, FaUserTie,
  FaVideo, FaWallet, FaWandMagicSparkles, FaXmark,
} from 'react-icons/fa6'

import { SHOW_PRICES, cardOf, cards, inr, inrShort, planById, plans, withGst } from '../data/packages'
import { whatsappLink } from '../data/site'
import { useGo } from '../lib/nav'
import { lockScroll } from '../lib/scroll'
import { WhatsAppIcon } from './icons'

/* ------------------------------------------------------------------
   "Full details" for one package — everything from its proposal:
   the problem, how it works, every deliverable, the first month
   week by week, and the investment. A sheet from the bottom on
   phones, a wide drawer from the right on bigger screens.

   <PackageDetail id="meta-ads" onChange={setId} onClose={close} />

   The tabs at the top switch between the three cards; a switch under
   them picks one of the packages inside a card.
------------------------------------------------------------------ */

const ICONS = { zap: FaBolt, rocket: FaRocket, user: FaUserTie, building: FaBuilding, crown: FaCrown, sparkles: FaWandMagicSparkles }
export function PackageIcon({ name, size = 20, style }) {
  const I = ICONS[name] ?? FaWandMagicSparkles
  return <I size={size} style={style} aria-hidden="true" />
}

export const packageMessage = (p) =>
  `Hi AXAMP, I'm interested in the ${p.name} package${SHOW_PRICES ? ` (${inr(p.fee)}/month + GST)` : ''}. Can we talk?`

const SECTIONS = [
  ['overview', 'Overview', FaRoute],
  ['deliverables', 'What You Get', FaLayerGroup],
  ['first-month', 'First Month', FaCalendarDays],
  ['investment', 'Investment', FaWallet],
]

// An icon for each deliverable group, picked from its title (first match wins)
const GROUP_ICONS = [
  [/whatsapp/i, WhatsAppIcon],
  [/google/i, FaGoogle],
  [/meta/i, FaMeta],
  [/verification/i, FaShieldHalved],
  [/creative|content/i, FaVideo],
  [/landing/i, FaLaptop],
  [/profile/i, FaIdBadge],
  [/shoot/i, FaCamera],
  [/report/i, FaChartLine],
  [/brand|trust/i, FaGem],
  [/strategy/i, FaChessKnight],
  [/lead/i, FaBullseye],
]
const groupIcon = (title) => GROUP_ICONS.find(([re]) => re.test(title))?.[1] ?? FaCheck

// Section title: a numbered eyebrow over the heading
function SectionTitle({ n, title, sub, hex }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: hex }}>
        <span className="tabular-nums">{String(n).padStart(2, '0')}</span>
        <span aria-hidden="true" className="h-px w-8" style={{ background: `linear-gradient(90deg, ${hex}, transparent)` }} />
      </p>
      <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.35rem,2.4vw,1.7rem)] font-[800] leading-[1.15] tracking-[-0.025em] text-white">{title}</h3>
      {sub && <p className="text-[14px] leading-[1.55] text-[var(--muted)]">{sub}</p>}
    </div>
  )
}

// Small label above a block inside a section
function Label({ children, icon: I, color }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--faint)]">
      {I && <I size={13} style={color ? { color } : undefined} aria-hidden="true" />}
      {children}
    </p>
  )
}

// Rounded square holding an icon, tinted in the card's colour
function IconTile({ icon: I, rgb, hex, size = 'h-10 w-10', iconSize = 17 }) {
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-xl`}
      style={{ background: `linear-gradient(145deg, rgba(${rgb},0.24), rgba(${rgb},0.08))`, boxShadow: `inset 0 0 0 1px rgba(${rgb},0.3)`, color: hex }}
    >
      <I size={iconSize} aria-hidden="true" />
    </span>
  )
}

/* Sticky section bar. Lights up the section being read: the last one whose
   top has passed a line just under the bar, or the last section once the
   body is scrolled to the end. Worked out from the scroll position, so fast
   jumps (back to the top, to the end) can't leave a stale tab lit. Its own
   component, so scrolling re-renders only the bar. Opaque rather than
   frosted: a blur here is redrawn on every scroll frame. */
function SectionNav({ bodyRef, sections, hex }) {
  const navRef = useRef(null)
  const [active, setActive] = useState(sections[0][0])

  useEffect(() => {
    const body = bodyRef.current
    let frame = 0
    const update = () => {
      frame = 0
      const line = body.scrollTop + navRef.current.offsetHeight + body.clientHeight * 0.2
      const atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 2
      let key = sections[0][0]
      for (const [k] of sections) {
        const el = body.querySelector(`[data-section="${k}"]`)
        if (el && (el.offsetTop <= line || atEnd)) key = k
      }
      setActive(key)
    }
    const onScroll = () => (frame ||= requestAnimationFrame(update))
    update()
    body.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      body.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [bodyRef, sections])

  // Land the section's heading just under the bar
  const jump = (key) => {
    const body = bodyRef.current
    const el = body.querySelector(`[data-section="${key}"]`)
    if (el) body.scrollTo({ top: el.offsetTop - navRef.current.offsetHeight, behavior: 'smooth' })
  }

  return (
    <nav ref={navRef} aria-label="Sections" className="sticky top-0 z-10 border-y border-white/[0.06] bg-[rgba(11,18,41,0.97)] px-5 py-3 min-[768px]:px-8">
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {sections.map(([key, label, I]) => (
          <button
            key={key}
            type="button"
            onClick={() => jump(key)}
            aria-current={active === key ? 'true' : undefined}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-300 ${
              active === key ? 'text-[var(--navy)]' : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'
            }`}
            style={active === key ? { background: hex } : undefined}
          >
            <I size={12} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function PackageDetail({ id, onChange, onClose }) {
  const go = useGo()
  const p = planById[id] ?? plans[0]
  const card = cardOf(p)
  const [hex, rgb] = card.accent
  const { gst, total } = withGst(p.fee)
  const sections = SECTIONS.filter(([key]) => key !== 'first-month' || p.weeks)
  const panelRef = useRef(null)
  const bodyRef = useRef(null)

  // Keyboard focus moves into the drawer and stays there — tabbing out would
  // scroll the locked page behind it — and goes back to the opener on close
  useEffect(() => {
    const panel = panelRef.current
    const opener = document.activeElement
    lockScroll(true)
    panel.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab') return
      const items = panel.querySelectorAll('a[href], button:not([disabled])')
      const first = items[0]
      const last = items[items.length - 1]
      const at = document.activeElement
      if (!panel.contains(at) || (e.shiftKey ? at === first || at === panel : at === last)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  }, [onClose])

  // New package → back to the top
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [id])

  const pairWith = p.pairing && planById[p.pairing.with]
  const against = p.versus && planById[p.versus.against]
  const itemCount = p.groups.reduce((n, g) => n + g.items.length, 0)
  const num = (key) => sections.findIndex(([k]) => k === key) + 1

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`${p.name} — full details`}>
      <button type="button" aria-label="Close" onClick={onClose} className="svc-fade absolute inset-0 bg-[rgba(3,6,18,0.85)]" />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="
          svc-panel absolute inset-x-0 bottom-0 flex h-[92svh] flex-col overflow-hidden outline-none
          rounded-t-[30px] border-t bg-[#0b1229] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)]
          min-[768px]:inset-x-auto min-[768px]:bottom-3 min-[768px]:right-3 min-[768px]:top-3 min-[768px]:h-auto
          min-[768px]:w-[min(780px,calc(100%-24px))] min-[768px]:rounded-[30px] min-[768px]:border
        "
        style={{ borderColor: `rgba(${rgb},0.35)` }}
      >
        {/* ── Top: switch package + close ── */}
        <div className="relative flex shrink-0 items-center gap-2 border-b border-white/[0.07] px-4 pb-3 pt-5 min-[768px]:px-6 min-[768px]:pt-4">
          <span aria-hidden="true" className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/20 min-[768px]:hidden" />
          <div role="tablist" aria-label="Packages" className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
            {cards.map((x) => {
              const on = x.id === card.id
              return (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => !on && onChange(x.plans[0])}
                  className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-[12.5px] max-[479px]:px-3 max-[479px]:text-[12px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                    on ? 'text-white' : 'border-white/[0.08] bg-white/[0.03] text-white/55 hover:text-white'
                  }`}
                  style={on ? { borderColor: `rgba(${x.accent[1]},0.6)`, background: `rgba(${x.accent[1]},0.14)` } : undefined}
                >
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full max-[479px]:hidden"
                    style={on ? { background: x.accent[0], color: 'var(--navy)' } : { background: 'rgba(255,255,255,0.06)', color: x.accent[0] }}
                  >
                    <PackageIcon name={x.icon} size={13} />
                  </span>
                  {x.short}
                </button>
              )
            })}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white">
            <FaXmark size={18} />
          </button>
        </div>

        {/* ── Scrolling body ── */}
        {/* overflow-x-hidden: the intro slides in from the side when switching packages,
            which otherwise let the body wobble sideways for a moment */}
        <div ref={bodyRef} data-lenis-prevent className="relative flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* Intro */}
          <header key={p.id} className="relative overflow-hidden px-5 pb-8 pt-6 svc-row-in min-[768px]:px-8 min-[768px]:pt-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full" style={{ background: `radial-gradient(circle, rgba(${rgb},0.3), transparent 65%)` }} />
            <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full" style={{ background: `radial-gradient(circle, rgba(${rgb},0.1), transparent 70%)` }} />

            {card.plans.length > 1 && (
              <div role="group" aria-label={card.pick} className="relative mb-6 flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">{card.pick}</p>
                <div className="grid w-full max-w-[460px] grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
                  {card.plans.map((pid) => {
                    const x = planById[pid]
                    const on = pid === p.id
                    return (
                      <button
                        key={pid}
                        type="button"
                        aria-pressed={on}
                        onClick={() => onChange(pid)}
                        className={`truncate rounded-full px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 ${on ? 'text-[var(--navy)]' : 'text-white/60 hover:text-white'}`}
                        style={on ? { background: hex, boxShadow: `0 6px 20px -8px rgba(${rgb},0.9)` } : undefined}
                      >
                        {x.label}
                        {SHOW_PRICES && <span className={on ? 'opacity-70' : 'text-white/35'}> · {inrShort(x.fee)}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="relative flex items-start gap-4">
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl max-[420px]:h-12 max-[420px]:w-12"
                style={{ background: `linear-gradient(145deg, ${hex}, rgba(${rgb},0.55))`, color: 'var(--navy)', boxShadow: `0 12px 30px -10px rgba(${rgb},0.9), inset 0 1px 0 rgba(255,255,255,0.4)` }}
              >
                <PackageIcon name={p.icon} size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold uppercase tracking-[0.22em]" style={{ color: hex }}>
                  {card.name}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.6rem)] font-[800] leading-[1.05] tracking-[-0.035em] text-white">
                  {p.name}
                </h2>
              </div>
            </div>

            <p className="relative mt-4 max-w-[600px] text-[16px] leading-[1.6] text-white/80">{p.headline}</p>

            {p.guarantee && (
              <p className="relative mt-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13.5px] font-bold text-white" style={{ borderColor: `rgba(${rgb},0.5)`, background: `rgba(${rgb},0.12)` }}>
                <FaCircleCheck size={17} style={{ color: hex }} aria-hidden="true" />
                {p.guarantee}
              </p>
            )}

            {/* At a glance */}
            <div className={`relative mt-6 grid grid-cols-1 gap-2.5 ${SHOW_PRICES ? 'min-[560px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : ''}`}>
              {SHOW_PRICES && (
                <div className="rounded-[20px] border p-4" style={{ borderColor: `rgba(${rgb},0.35)`, background: `linear-gradient(140deg, rgba(${rgb},0.16), rgba(${rgb},0.03))` }}>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/55">Monthly fee</p>
                  <p className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(1.7rem,3.2vw,2.1rem)] font-[800] leading-none tracking-[-0.03em] text-white">
                    {inr(p.fee)}
                    <span className="ml-1.5 text-[13px] font-semibold tracking-normal text-white/50">+ GST</span>
                  </p>
                  <p className="mt-2 text-[12.5px] text-white/55">{inr(total)} / month incl. 18% GST</p>
                </div>
              )}
              <div className="flex flex-col justify-between gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/55">Built for</p>
                  <p className="mt-1.5 text-[14.5px] font-semibold leading-[1.45] text-white">{p.builtFor}</p>
                </div>
                {p.summary && (
                  <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                    {p.summary.split(' · ').map((s) => (
                      <li key={s} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-medium text-white/75">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: hex }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </header>

          <SectionNav key={p.id} bodyRef={bodyRef} sections={sections} hex={hex} />

          <div className="flex flex-col gap-14 px-5 pb-12 pt-9 min-[768px]:px-8">
            {/* ── Overview ── */}
            <section data-section="overview" className="flex flex-col gap-6">
              <SectionTitle n={num('overview')} title="Why this package" hex={hex} />

              {/* Problem → solution */}
              {p.situation && (
                <div className="overflow-hidden rounded-[22px] border border-[rgba(255,122,122,0.18)] bg-[linear-gradient(160deg,rgba(255,110,110,0.07),rgba(255,255,255,0.015)_55%)]">
                  <p className="flex items-center gap-2.5 px-5 pb-1 pt-4 font-[family-name:var(--font-display)] text-[16px] font-[700] text-white">
                    <FaTriangleExclamation size={15} className="text-[#ff8a8a]" aria-hidden="true" />
                    Sound familiar?
                  </p>
                  <ul className="m-0 flex list-none flex-col p-0 px-5 pb-4">
                    {p.situation.map((s) => (
                      <li key={s} className="flex gap-3 border-b border-white/[0.05] py-3 text-[14.5px] leading-[1.55] text-white/80 last:border-0">
                        <FaCircleXmark size={15} className="mt-1 shrink-0 text-[#ff8a8a]/80" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="border-t border-[rgba(255,122,122,0.16)] bg-[rgba(255,110,110,0.07)] px-5 py-3.5 text-[14px] leading-[1.6] text-white/80">
                    <strong className="text-[#ffb0b0]">The result: </strong>
                    {p.result}
                  </p>
                </div>
              )}

              {p.situation && (
                <div aria-hidden="true" className="-my-3 flex justify-center">
                  <span className="grid h-9 w-9 place-items-center rounded-full border bg-[#0b1229]" style={{ borderColor: `rgba(${rgb},0.45)`, color: hex, boxShadow: `0 0 24px -6px rgba(${rgb},0.8)` }}>
                    <FaArrowDown size={14} />
                  </span>
                </div>
              )}

              <div className="relative overflow-hidden rounded-[22px] border p-5 min-[768px]:p-6" style={{ borderColor: `rgba(${rgb},0.4)`, background: `linear-gradient(140deg, rgba(${rgb},0.16), rgba(${rgb},0.03) 65%)` }}>
                <div className="flex items-center gap-3">
                  <IconTile icon={FaLightbulb} rgb={rgb} hex={hex} size="h-9 w-9" iconSize={15} />
                  <p className="font-[family-name:var(--font-display)] text-[16px] font-[700] text-white">Our solution</p>
                </div>
                <p className="mt-3 text-[16px] leading-[1.6] text-white/90">{p.solution}</p>
              </div>

              {p.why && (
                <figure className="relative m-0 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5 min-[768px]:p-6">
                  <FaQuoteLeft size={64} aria-hidden="true" className="pointer-events-none absolute -right-1 -top-1 opacity-[0.08]" style={{ color: hex }} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: hex }}>
                    {p.why.title}
                  </p>
                  {p.why.quote && (
                    <blockquote className="m-0 mt-2.5 font-[family-name:var(--font-display)] text-[clamp(1.25rem,2.4vw,1.6rem)] font-[800] leading-[1.25] tracking-[-0.02em] text-white">
                      “{p.why.quote}”
                    </blockquote>
                  )}
                  <figcaption className="mt-2.5 text-[14px] leading-[1.7] text-[var(--muted)]">{p.why.text}</figcaption>
                </figure>
              )}

              {/* How it works: a connected stepper */}
              <div className="flex flex-col gap-4 pt-2">
                <Label icon={FaRoute} color={hex}>How it works</Label>
                <ol className="m-0 flex list-none flex-col p-0">
                  {p.flow.map((step, i) => {
                    const last = i === p.flow.length - 1
                    return (
                      <li key={step} className="relative flex gap-4 pb-3 last:pb-0">
                        {!last && (
                          <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-9 w-[2px] rounded-full" style={{ background: `linear-gradient(rgba(${rgb},0.6), rgba(${rgb},0.15))` }} />
                        )}
                        <span
                          className="relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full font-[family-name:var(--font-display)] text-[13.5px] font-[800]"
                          style={
                            last
                              ? { background: hex, color: 'var(--navy)', boxShadow: `0 0 22px -4px rgba(${rgb},0.9)` }
                              : { background: '#0b1229', color: hex, boxShadow: `inset 0 0 0 2px rgba(${rgb},0.55)` }
                          }
                        >
                          {last ? <FaCheck size={14} aria-hidden="true" /> : i + 1}
                        </span>
                        <span
                          className={`flex-1 rounded-2xl px-4 py-2.5 text-[14.5px] leading-[1.5] ${last ? 'font-semibold text-white' : 'text-white/85'}`}
                          style={last ? { background: `rgba(${rgb},0.12)`, boxShadow: `inset 0 0 0 1px rgba(${rgb},0.35)` } : { background: 'rgba(255,255,255,0.03)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
                        >
                          {step}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>

              {p.process && (
                <div className="flex flex-col gap-4 pt-2">
                  <Label icon={FaCalendarDays} color={hex}>Our process, every month</Label>
                  <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 min-[700px]:grid-cols-4">
                    {p.process.map(([title, text], i) => (
                      <li key={title} className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 transition-colors hover:border-white/[0.15] min-[480px]:p-3.5">
                        <span className="font-[family-name:var(--font-display)] text-[20px] font-[800] leading-none tabular-nums" style={{ color: `rgba(${rgb},0.75)` }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[14px] font-semibold leading-[1.3] text-white">{title}</span>
                        <span className="text-[12.5px] leading-[1.5] text-[var(--muted)]">{text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>

            {/* ── What you get ── */}
            <section data-section="deliverables" className="flex flex-col gap-5">
              <SectionTitle
                n={num('deliverables')}
                title="What you get every month"
                sub={`${itemCount} deliverables across ${p.groups.length} areas — all handled by AXAMP.`}
                hex={hex}
              />

              {p.groups.map((g) => {
                const I = groupIcon(g.title)
                return (
                  <div key={g.title} className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.02]">
                    <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
                      <IconTile icon={I} rgb={rgb} hex={hex} size="h-9 w-9" iconSize={16} />
                      <p className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-[15.5px] font-[700] leading-[1.3] text-white">{g.title}</p>
                      <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11.5px] font-semibold tabular-nums text-white/60">
                        {g.items.length} {g.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <ul className={`m-0 grid list-none grid-cols-1 gap-px bg-white/[0.05] p-0 ${g.items.length > 1 ? 'min-[620px]:grid-cols-2' : ''}`}>
                      {g.items.map(([title, text], i) => (
                        <li
                          key={title}
                          className={`flex gap-3 bg-[#0b1229] px-4 py-3.5 ${g.items.length > 1 && g.items.length % 2 === 1 && i === g.items.length - 1 ? 'min-[620px]:col-span-2' : ''}`}
                        >
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: `rgba(${rgb},0.16)`, color: hex }}>
                            <FaCheck size={10} aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-[14.5px] font-semibold leading-[1.35] text-white">{title}</span>
                            <span className="mt-0.5 block text-[13px] leading-[1.55] text-[var(--muted)]">{text}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}

              {p.pillars && (
                <div className="flex flex-col gap-3 pt-3">
                  <Label icon={FaLayerGroup} color={hex}>What we’ll talk about — your content pillars</Label>
                  <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 min-[700px]:grid-cols-3">
                    {p.pillars.map(([title, text]) => (
                      <div key={title} className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 pl-4">
                        <span aria-hidden="true" className="absolute inset-y-3 left-0 w-[3px] rounded-r-full" style={{ background: hex }} />
                        <p className="text-[14px] font-semibold text-white">{title}</p>
                        <p className="mt-1 text-[12.5px] leading-[1.5] text-[var(--muted)]">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {p.versus && (
                <div className="flex flex-col gap-3 pt-3">
                  <Label icon={FaPlus} color={hex}>What’s extra compared with {against.name}</Label>
                  <div className="overflow-x-auto rounded-[20px] border border-white/[0.08]">
                    <table className="w-full min-w-[420px] border-collapse text-left text-[13.5px]">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-[0.12em]">
                          <th className="bg-white/[0.04] px-4 py-3 font-semibold text-[var(--faint)]">Feature</th>
                          <th className="bg-white/[0.04] px-3 py-3 text-center font-semibold text-[var(--faint)]">{against.name}</th>
                          <th className="px-3 py-3 text-center font-bold" style={{ color: hex, background: `rgba(${rgb},0.14)` }}>
                            {p.name}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.versus.rows.map(([f, a, b]) => (
                          <tr key={f} className="border-t border-white/[0.05]">
                            <td className="px-4 py-3 text-white/85">{f}</td>
                            <td className="px-3 py-3 text-center text-white/45">
                              <VersusCell value={a} />
                            </td>
                            <td className="px-3 py-3 text-center font-semibold text-white" style={{ background: `rgba(${rgb},0.06)` }}>
                              <VersusCell value={b} hex={hex} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {p.note && (
                <p className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[13.5px] leading-[1.55] text-white/70">
                  <FaCircleInfo size={16} className="mt-0.5 shrink-0" style={{ color: hex }} aria-hidden="true" />
                  {p.note}
                </p>
              )}
            </section>

            {/* ── First month ── */}
            {p.weeks && (
              <section data-section="first-month" className="flex flex-col gap-5">
                <SectionTitle n={num('first-month')} title="Your first month, week by week" sub="What we do, and what you’ll see at every step." hex={hex} />
                <ol className="m-0 flex list-none flex-col p-0">
                  {p.weeks.map(([when, what, see], i) => {
                    const last = i === p.weeks.length - 1
                    return (
                      <li key={when} className="relative flex gap-4 pb-4 last:pb-0">
                        {!last && <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-10 w-[2px] rounded-full bg-white/[0.08]" />}
                        <span
                          className="relative z-[1] mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full"
                          style={last ? { background: hex, color: 'var(--navy)' } : { background: '#0b1229', color: hex, boxShadow: `inset 0 0 0 2px rgba(${rgb},0.5)` }}
                        >
                          {last ? <FaRocket size={13} aria-hidden="true" /> : <FaCalendarDays size={13} aria-hidden="true" />}
                        </span>
                        <div className="flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                          <div className="px-4 pb-3 pt-3.5">
                            <p className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: hex, background: `rgba(${rgb},0.12)` }}>
                              {when}
                            </p>
                            <p className="mt-2 text-[14.5px] leading-[1.5] text-white">{what}</p>
                          </div>
                          <p className="flex gap-2 border-t border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-[13px] leading-[1.5] text-white/75">
                            <FaEye size={13} className="mt-[3px] shrink-0" style={{ color: hex }} aria-hidden="true" />
                            <span>
                              <span className="font-semibold text-white/90">You see: </span>
                              {see}
                            </span>
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
                {p.timeNeeded && (
                  <div className="flex gap-3.5 rounded-[20px] border p-4" style={{ borderColor: `rgba(${rgb},0.3)`, background: `rgba(${rgb},0.08)` }}>
                    <IconTile icon={FaClock} rgb={rgb} hex={hex} size="h-9 w-9" iconSize={15} />
                    <p className="text-[14px] leading-[1.55] text-white/85">
                      <strong className="block text-white">Your time needed</strong>
                      {p.timeNeeded}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ── Investment ── */}
            <section data-section="investment" className="flex flex-col gap-5">
              <SectionTitle n={num('investment')} title="Investment" sub="Simple, transparent pricing — no hidden costs." hex={hex} />

              {SHOW_PRICES && (
                <div className="overflow-hidden rounded-[22px] border" style={{ borderColor: `rgba(${rgb},0.35)` }}>
                  {[
                    [`${p.name} — monthly fee`, inr(p.fee)],
                    ['GST @ 18%', inr(gst)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 border-b border-dashed border-white/[0.1] px-5 py-3.5 text-[14.5px]">
                      <span className="text-white/75">{k}</span>
                      <span className="font-semibold tabular-nums text-white">{v}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ background: `linear-gradient(120deg, rgba(${rgb},0.2), rgba(${rgb},0.06))` }}>
                    <span className="font-semibold text-white">Total payable per month</span>
                    <span className="font-[family-name:var(--font-display)] text-[22px] font-[800] tabular-nums text-white">{inr(total)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Label icon={FaWallet} color={hex}>Not included in the fee — paid directly by you</Label>
                <div className={`grid grid-cols-1 gap-2 ${p.notIncluded.length > 1 ? 'min-[620px]:grid-cols-2' : ''}`}>
                  {p.notIncluded.map((n) => (
                    <div key={n.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <p className="text-[14.5px] font-semibold text-white">{n.title}</p>
                      <p className="mt-1 text-[13px] leading-[1.55] text-[var(--muted)]">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3.5 rounded-[20px] border border-white/[0.08] bg-[linear-gradient(140deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-4">
                <IconTile icon={FaCalculator} rgb={rgb} hex={hex} size="h-9 w-9" iconSize={15} />
                <p className="text-[14.5px] leading-[1.6] text-white/85">
                  <strong className="block text-white">Simple math</strong>
                  {p.math}
                </p>
              </div>

              {p.footnote && <p className="px-1 text-[12px] leading-[1.5] text-white/45">{p.footnote}</p>}

              {pairWith && <Pairing p={p} pairWith={pairWith} onChange={onChange} hex={hex} />}
            </section>
          </div>
        </div>

        {/* ── Bottom: act on it ── */}
        <div className="flex shrink-0 items-center gap-2.5 border-t border-white/[0.08] bg-[#0a1027] px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 max-[359px]:gap-2 max-[359px]:px-3 min-[768px]:px-6">
          <div className="mr-auto hidden min-w-0 min-[640px]:block">
            <p className="truncate text-[12px] font-semibold text-white/55">{p.name}</p>
            {SHOW_PRICES && (
              <p className="font-[family-name:var(--font-display)] text-[17px] font-[800] leading-tight text-white">
                {inr(p.fee)}
                <span className="ml-1 text-[12px] font-semibold text-white/45">/ month + GST</span>
              </p>
            )}
          </div>
          <a
            href={whatsappLink(packageMessage(p))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-[#25d366] px-5 font-[family-name:var(--font-display)] text-[14.5px] font-[700] text-[#062b14] shadow-[0_0_30px_-8px_rgba(37,211,102,0.85)] transition-transform duration-300 hover:-translate-y-0.5 max-[400px]:gap-2 max-[400px]:px-4 max-[400px]:text-[14px] max-[359px]:gap-1.5 max-[359px]:px-2.5 max-[359px]:text-[13.5px] min-[640px]:flex-none"
          >
            <WhatsAppIcon size={18} />
            Get This Package
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault()
              onClose()
              go('/contact')
            }}
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 px-5 text-[14px] font-semibold text-white transition-colors hover:border-white/35 max-[420px]:px-4 max-[400px]:px-3.5 max-[400px]:text-[13.5px] max-[359px]:px-3 max-[359px]:text-[13px]"
          >
            Ask a Question
          </a>
        </div>
      </div>
    </div>
  )
}

// A cell in the comparison table: a tick for "Included", a dash for "—"
function VersusCell({ value, hex }) {
  if (value === '—') return <span className="text-white/25">—</span>
  if (value === 'Included')
    return (
      <span className="inline-flex items-center gap-1.5">
        <FaCircleCheck size={14} style={hex ? { color: hex } : undefined} aria-hidden="true" />
        Included
      </span>
    )
  return <span className="tabular-nums">{value}</span>
}

// "Recommended pairing": this package + the one it works best with
function Pairing({ p, pairWith, onChange, hex }) {
  const [pairHex, pairRgb] = cardOf(pairWith).accent
  return (
    <div className="relative overflow-hidden rounded-[22px] border p-5" style={{ borderColor: `rgba(${pairRgb},0.3)`, background: `linear-gradient(140deg, rgba(${pairRgb},0.1), rgba(255,255,255,0.02) 60%)` }}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: pairHex }}>
        Recommended pairing
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-3 text-[13px] font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: hex, color: 'var(--navy)' }}>
            <PackageIcon name={p.icon} size={13} />
          </span>
          {p.name}
        </span>
        <FaPlus size={12} className="text-white/40" aria-hidden="true" />
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-3 text-[13px] font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: pairHex, color: 'var(--navy)' }}>
            <PackageIcon name={pairWith.icon} size={13} />
          </span>
          {pairWith.name}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6] text-white/85">{p.pairing.text}</p>
      {SHOW_PRICES && (
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          Together: <span className="font-semibold text-white">{inr(p.fee + pairWith.fee)}</span> / month + GST ({inr(withGst(p.fee + pairWith.fee).total)} incl. GST)
        </p>
      )}
      <button
        type="button"
        onClick={() => onChange(pairWith.id)}
        className="group mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors"
        style={{ color: pairHex, borderColor: `rgba(${pairRgb},0.45)`, background: `rgba(${pairRgb},0.08)` }}
      >
        See {pairWith.name}
        <FaArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </div>
  )
}

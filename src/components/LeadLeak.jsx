import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import {
  FaCommentSlash,
  FaHouseChimney,
  FaHouseChimneyUser,
  FaHouseCircleXmark,
  FaInbox,
  FaIndianRupeeSign,
  FaPhoneSlash,
  FaRegThumbsDown,
  FaTriangleExclamation,
  FaUserTie,
} from 'react-icons/fa6'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { leadLeak } from '../data/leadLeak'
import { useInView } from '../lib/hooks'
import { useGo } from '../lib/nav'

/* ------------------------------------------------------------------
   "Where your 100 leads go" — sits right above the proof strip.
   Set against a night skyline (the properties the leads never reach).
   The panel plays through the stages on its own: a stepper on top,
   the 100 leads as dots on the left (each stage's leads blink red and
   drop out) and the stage in focus on the right, with a funnel chart
   of what's left. Viewers can pause, step back/forward or tap a stage.
------------------------------------------------------------------ */

gsap.registerPlugin(ScrollTrigger, useGSAP)

const { total, stages } = leadLeak
const LAST = stages.length // the summary step, after the final stage
const visits = stages[LAST - 1].from - stages[LAST - 1].lost

const INTRO_MS = 2200 // all 100 leads, before anything leaks
const STAGE_MS = 3200
const END_MS = 5000 // the summary, before it starts over
const HOLD_MS = 7000 // after a tap, before autoplay carries on

// Which stage each dot drops out at (-1 = still there at the end).
// Shuffled with a fixed seed so the leak looks scattered but never changes.
const dotStage = (() => {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const order = Array.from({ length: total }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const out = Array(total).fill(-1)
  let n = 0
  stages.forEach((s, k) => {
    for (let c = 0; c < s.lost; c++) out[order[n++]] = k
  })
  return out
})()

const leadsAfter = (step) =>
  step < 0 ? total : step >= LAST ? visits : stages[step].from - stages[step].lost

// Leads left at the start and after each stage: 100, 70, 50, 30, 10, 5
const remaining = [total, ...stages.map((s) => s.from - s.lost)]

// One icon per leak (keys from data/leadLeak.js)
const ICONS = {
  'no-answer': FaPhoneSlash,
  'not-interested': FaRegThumbsDown,
  price: FaIndianRupeeSign,
  silent: FaCommentSlash,
  'no-visit': FaHouseCircleXmark,
}
const StageIcon = ({ stage }) => {
  const Icon = ICONS[stage.icon]
  return <Icon aria-hidden="true" />
}

// "struggle" in bold, "with these" lighter
const [titleFirst, ...titleWords] = leadLeak.title.split(' ')
const titleRest = titleWords.join(' ')

// "lead-related" never breaks at its hyphen
const [hlFirst, ...hlRest] = leadLeak.highlight.split(' ')

/* Counts up/down to `value` instead of jumping. Writes the number straight
 * into its text node each frame, so the 100-dot grid around it isn't
 * re-rendered ~45 times per stage change (it used to setState per frame). */
function CountTo({ value, ms = 750 }) {
  const ref = useRef(null)
  const shown = useRef(value)
  const [initial] = useState(value) // React renders this once and never rewrites it

  useEffect(() => {
    const node = ref.current?.firstChild
    const a = shown.current
    if (!node || a === value) return
    const set = (v) => {
      shown.current = v
      node.nodeValue = String(v)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return set(value)
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms)
      set(Math.round(a + (value - a) * (1 - (1 - t) ** 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])

  return <span ref={ref}>{initial}</span>
}

/* Low-resource devices (≤4 CPU cores or ≤4 GB memory, or Data Saver on) get
 * the same page with lighter decoration: the 99% shine, the tag sheen and
 * the warning pulse play twice then rest, and the panel skips its frosted
 * blur. The lead pipeline itself plays in full everywhere. */
const LITE =
  typeof navigator !== 'undefined' &&
  ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!navigator.connection?.saveData)

// False while the tab is in the background
function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  useEffect(() => {
    const on = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}

const ui = 'font-[family-name:var(--font-ui)]'
const display = 'font-[family-name:var(--font-display)]'

/* ── Top bar: title + playback controls ─────────────────────────── */
function ControlButton({ label, onClick, disabled, primary, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      // `before:` widens the tap area to 44px on touch screens without changing the look
      className={`relative grid shrink-0 place-items-center rounded-full transition-[background,color,transform,opacity] duration-300 ease-[var(--ease)] before:absolute before:-inset-1 before:rounded-full before:content-[''] disabled:pointer-events-none disabled:opacity-30 ${
        primary
          ? 'h-11 w-11 bg-[var(--cyan)] text-[var(--navy)] shadow-[0_8px_24px_-8px_rgba(83,247,251,0.8)] hover:scale-105'
          : 'h-9 w-9 border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.1] hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function TopBar({ step, playing, onTogglePlay, onPrev, onNext, onReplay }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3 max-[600px]:px-4 max-[600px]:py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="flex gap-1.5 max-[600px]:hidden">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b70]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffb347]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className={`${display} text-[15px] font-[700] leading-none text-white max-[600px]:text-[14px]`}>
            Your pipeline<span className="max-[600px]:hidden"> · {total} leads</span>
          </span>
          <span className={`${ui} text-[11.5px] leading-none text-[var(--faint)] max-[600px]:hidden`}>
            {playing ? 'Playing — tap any stage to look closer' : 'Paused — press play to continue'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ControlButton label="Start over" onClick={onReplay} disabled={step < 0}>
          <RotateCcw size={15} strokeWidth={2.2} />
        </ControlButton>
        <ControlButton label="Previous stage" onClick={onPrev} disabled={step < 0}>
          <ChevronLeft size={18} strokeWidth={2.2} />
        </ControlButton>
        <ControlButton label={playing ? 'Pause' : 'Play'} onClick={onTogglePlay} primary>
          {playing ? <Pause size={17} fill="currentColor" strokeWidth={0} /> : <Play size={17} fill="currentColor" strokeWidth={0} className="ml-0.5" />}
        </ControlButton>
        <ControlButton label="Next stage" onClick={onNext} disabled={step >= LAST}>
          <ChevronRight size={18} strokeWidth={2.2} />
        </ControlButton>
      </div>
    </div>
  )
}

/* ── Stepper: the five leaks, joined by a line that fills in red ── */
function Stepper({ step, onPick }) {
  const done = step >= LAST
  const fill = step < 0 ? 0 : Math.min(step, LAST - 1) / (LAST - 1)

  return (
    <ol className="relative m-0 grid list-none grid-cols-5 gap-2 p-0">
      <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-[23px] h-[2px] rounded-full bg-white/[0.08] max-[600px]:top-[19px]">
        <span
          className="block h-full origin-left rounded-full bg-[linear-gradient(90deg,#ff6b70,#ff7a50)] transition-transform duration-700 ease-[var(--ease)]"
          style={{ transform: `scaleX(${fill})` }}
        />
      </span>

      {stages.map((s, i) => {
        const now = i === step
        const reached = done || i <= step
        return (
          <li key={s.from}>
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-current={now ? 'step' : undefined}
              aria-label={`Stage ${i + 1}: ${s.short}, ${s.lost} leads lost`}
              className="group flex w-full flex-col items-center gap-2 text-center"
            >
              <span
                className={`relative grid h-12 w-12 place-items-center rounded-full border text-[19px] transition-[background,border-color,box-shadow,transform,color] duration-500 ease-[var(--ease)] max-[600px]:h-10 max-[600px]:w-10 max-[600px]:text-[16px] ${
                  now
                    ? 'scale-110 border-[#ff6b70] bg-[#ff6b70] text-[var(--navy)] shadow-[0_0_0_6px_rgba(255,107,112,0.15),0_0_30px_rgba(255,107,112,0.6)]'
                    : reached
                      ? 'border-[rgba(255,107,112,0.45)] bg-[#2a1426] text-[#ff8a8e]'
                      : 'border-white/10 bg-[var(--navy-2)] text-white/45 group-hover:border-white/30 group-hover:bg-[var(--navy-3)] group-hover:text-white/80'
                }`}
              >
                <span className={`grid place-items-center ${now ? 'll-wiggle' : ''}`}><StageIcon stage={s} /></span>
              </span>
              <span className="flex flex-col items-center gap-1">
                <span
                  className={`${ui} text-[12.5px] font-semibold leading-tight transition-colors duration-500 max-[600px]:hidden ${
                    now ? 'text-white' : reached ? 'text-white/70' : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  {s.short}
                </span>
                <span
                  className={`${display} text-[13px] font-[800] tabular-nums leading-none transition-colors duration-500 ${
                    reached ? 'text-[#ff6b70]' : 'text-white/25'
                  }`}
                >
                  −{s.lost}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/* ── Left: the counter and the 10 × 10 grid of leads ────────────── */
function LeadGrid({ step }) {
  const done = step >= LAST

  return (
    <div className="flex flex-col gap-4 max-[600px]:flex-row max-[600px]:items-center">
      <div className="flex items-end justify-between gap-4 max-[600px]:w-[92px] max-[600px]:shrink-0 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-2" aria-hidden="true">
        <div className="flex shrink-0 flex-col gap-2">
          <span className={`${ui} inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.22em] text-[var(--faint)]`}>
            <span className="ll-live h-2 w-2 rounded-full bg-[#ff6b70]" />
            Leads left
          </span>
          <span
            className={`${display} whitespace-nowrap text-[clamp(48px,4.2vw,76px)] font-[800] leading-[0.85] max-[600px]:text-[44px] tracking-[-0.05em] tabular-nums transition-[color,text-shadow] duration-500 ${
              step < 0
                ? 'text-[var(--cyan)] [text-shadow:0_0_40px_rgba(83,247,251,0.35)]'
                : done
                  ? 'text-[#ff6b70] [text-shadow:0_0_40px_rgba(255,107,112,0.4)]'
                  : 'text-white'
            }`}
          >
            <CountTo value={leadsAfter(step)} />
            <span className="ml-1 text-[0.3em] font-[600] tracking-normal text-[var(--faint)] [text-shadow:none]">/ {total}</span>
          </span>
        </div>
        {/* All three captions share one grid cell (only the current one visible),
            so the counter doesn't shift when the caption's line count changes */}
        <span className={`${ui} mb-1 grid min-w-0 max-w-[150px] text-right text-[12.5px] leading-[1.4] text-[var(--muted)] max-[600px]:mb-0 max-[600px]:text-left max-[600px]:text-[11.5px]`}>
          {['Fresh leads in your CRM', 'Still in play', 'Actually visit the property'].map((t, k) => (
            <span key={t} className={`[grid-area:1/1] ${k === (step < 0 ? 0 : done ? 2 : 1) ? '' : 'invisible'}`}>{t}</span>
          ))}
        </span>
      </div>

      {/* The 100 leads */}
      <div
        className="grid grid-cols-10 rounded-[18px] border border-white/[0.06] bg-[rgba(5,9,26,0.6)] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-[600px]:min-w-0 max-[600px]:flex-1 max-[600px]:p-2"
        aria-hidden="true"
      >
        {dotStage.map((k, i) => {
          const state =
            k === -1 ? (done ? 'win' : 'live') : k < step ? 'gone' : k === step ? 'leak' : 'live'
          return (
            <span
              key={i}
              className={`ll-dot is-${state} mx-auto my-[14%] w-[46%]`}
              style={{ '--d': `${(i * 37) % 420}ms` }}
            />
          )
        })}
      </div>

      <div className={`${ui} flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[var(--muted)] max-[600px]:hidden`}>
        <span className="inline-flex items-center gap-2"><span className="ll-dot is-live w-2.5" />In play</span>
        <span className="inline-flex items-center gap-2"><span className="ll-dot is-leak static-dot w-2.5" />Leaking now</span>
        <span className="inline-flex items-center gap-2"><span className="ll-dot is-gone w-2.5" />Lost</span>
        <span className="inline-flex items-center gap-2"><span className="ll-dot is-win static-dot w-2.5" />Site visit</span>
      </div>
    </div>
  )
}

/* ── Right: the stage in focus, in plain words ──────────────────── */
// [icon, kicker, headline, sub] for a step (-1 = start, LAST = the result)
function spotlightFor(step) {
  const stage = stages[step]
  return step < 0
    ? [<FaInbox aria-hidden="true" />, 'Day 1', <>{total} fresh leads land in your CRM.</>, 'Watch what happens to them, one stage at a time.']
    : step >= LAST
      ? [
          <FaHouseChimneyUser aria-hidden="true" />,
          'The result',
          <>Only <span className="text-[var(--cyan)]">{visits}</span> of {total} leads visit the property.</>,
          `${total - visits} leaked away before anyone saw the site.`,
        ]
      : [
          <StageIcon stage={stage} />,
          `Stage ${step + 1} of ${LAST} · out of ${stage.from}`,
          <><span className="text-[#ff6b70]">{stage.lost}</span> {stage.text}</>,
          `${stage.from - stage.lost} leads left after this stage.`,
        ]
}
const ALL_STEPS = Array.from({ length: LAST + 2 }, (_, i) => i - 1)

function Spotlight({ step }) {
  const done = step >= LAST
  const [icon, kicker] = spotlightFor(step)

  return (
    <div
      key={step}
      className={`ll-chip flex items-start gap-4 rounded-[20px] border p-4 max-[600px]:gap-3 max-[600px]:p-3.5 ${
        done
          ? 'border-[rgba(83,247,251,0.35)] bg-[linear-gradient(130deg,rgba(83,247,251,0.14),rgba(83,247,251,0.02))]'
          : step < 0
            ? 'border-white/10 bg-white/[0.035]'
            : 'border-[rgba(255,107,112,0.4)] bg-[linear-gradient(130deg,rgba(229,72,77,0.2),rgba(229,72,77,0.03))]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-[16px] border text-[23px] max-[600px]:h-11 max-[600px]:w-11 max-[600px]:text-[18px] ${
          done
            ? 'border-[rgba(83,247,251,0.4)] bg-[rgba(83,247,251,0.12)] text-[var(--cyan)]'
            : step < 0
              ? 'border-white/10 bg-[rgba(5,9,26,0.6)] text-white/80'
              : 'border-[rgba(255,107,112,0.5)] bg-[rgba(229,72,77,0.18)] text-[#ff8a8e]'
        }`}
      >
        <span className={`grid place-items-center ${step >= 0 ? 'll-wiggle' : ''}`}>{icon}</span>
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className={`${ui} text-[11px] font-semibold uppercase leading-none tracking-[0.2em] ${done ? 'text-[var(--cyan)]' : step < 0 ? 'text-[var(--faint)]' : 'text-[#ff8a8e]'}`}>
          {kicker}
        </span>
        {/* Every step's text sits in the same grid cell, only the current one
            visible, so the card is always as tall as its tallest step. It used
            to grow a line for the longer stages, jumping the whole panel
            (layout shift). Hidden copies stay out of the accessibility tree. */}
        <div className="grid">
          {ALL_STEPS.map((s) => {
            const [, , headline, sub] = spotlightFor(s)
            return (
              <div key={s} className={`flex flex-col gap-1.5 [grid-area:1/1] ${s === step ? '' : 'invisible'}`}>
                <p className={`${display} min-h-[3.9em] text-[clamp(17px,1.5vw,20px)] font-[700] leading-[1.3] tracking-[-0.01em] text-white max-[600px]:text-[16px]`}>{headline}</p>
                <p className={`${ui} text-[13px] leading-[1.5] text-[var(--muted)] max-[600px]:hidden`}>{sub}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Right: leads left after each stage, as shrinking columns ───── */
function FunnelChart({ step, onPick }) {
  // Column in focus: 0 = start, 1…5 = after that stage
  const current = step < 0 ? 0 : step >= LAST ? LAST : step + 1

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-[20px] border border-white/[0.06] bg-[rgba(5,9,26,0.45)] p-4 max-[600px]:hidden">
      <div className="flex items-center justify-between">
        <span className={`${ui} text-[11px] font-semibold uppercase leading-none tracking-[0.2em] text-[var(--faint)]`}>Leads left per stage</span>
        <span className={`${ui} inline-flex items-center gap-1.5 text-[11px] text-[var(--faint)]`}>
          <span className="h-2 w-2 rounded-sm bg-[#ff6b70]" /> lost
        </span>
      </div>

      <div className="grid min-h-[100px] flex-1 grid-cols-6 items-end gap-3" aria-hidden="true">
        {remaining.map((left, i) => {
          const lost = i === 0 ? 0 : remaining[i - 1] - left
          const reached = i <= current
          const now = i === current
          return (
            <div key={i} className="flex h-full flex-col items-center justify-end gap-1.5">
              <span
                className={`${display} text-[13px] font-[800] tabular-nums leading-none transition-colors duration-500 ${
                  now ? (i === LAST ? 'text-[var(--cyan)]' : 'text-white') : reached ? 'text-white/60' : 'text-white/20'
                }`}
              >
                {left}
              </span>
              <div className="flex w-full max-w-[52px] flex-1 flex-col justify-end">
                {/* What leaked at this stage, sitting on top of what's left */}
                <span
                  className="block w-full rounded-t-[6px] bg-[repeating-linear-gradient(135deg,rgba(255,107,112,0.55)_0_4px,rgba(255,107,112,0.25)_4px_8px)] transition-opacity duration-500"
                  style={{ height: `${lost}%`, opacity: reached ? 1 : 0 }}
                />
                <span
                  className={`block w-full transition-[background,box-shadow] duration-500 ${lost && reached ? '' : 'rounded-t-[6px]'} rounded-b-[4px] ${
                    now
                      ? 'bg-[var(--cyan)] shadow-[0_0_20px_rgba(83,247,251,0.55)]'
                      : reached
                        ? 'bg-[rgba(83,247,251,0.45)]'
                        : 'bg-white/[0.08]'
                  }`}
                  style={{ height: `${Math.max(left, 3)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-6 gap-3 border-t border-white/[0.06] pt-2.5">
        {remaining.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i - 1)}
            aria-label={i === 0 ? 'Back to the start' : `Stage ${i}: ${stages[i - 1].short}`}
            // The icons are small: an invisible layer gives each a ~40px-tall tap area
            className={`${ui} relative text-center text-[11px] font-semibold leading-none transition-colors before:absolute before:-inset-x-1.5 before:-inset-y-3 before:content-[''] ${i === current ? 'text-white' : 'text-white/35 hover:text-white/70'}`}
          >
            {i === 0 ? 'Start' : <span className="inline-grid place-items-center text-[14px]"><StageIcon stage={stages[i - 1]} /></span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// `standalone`: the section is its own page (/lead-leak), not pinned under the
// home page's proof strip — no pin or dimming, no rounded top edge.
export default function LeadLeak({ standalone = false }) {
  const ref = useRef(null)
  const contentRef = useRef(null)
  const goTo = useGo()
  const fitRef = useRef(null)
  const shadeRef = useRef(null)
  const active = useInView(ref, '-15% 0px')
  const pageVisible = usePageVisible()
  // Home page: true once the proof strip has fully covered the section
  const [covered, setCovered] = useState(false)

  /* Like the hero: the section is one screen tall and stays pinned
   * (no extra spacing) while the proof strip slides up over it,
   * shrinking back and dimming underneath. One scrubbed timeline drives
   * both (it used to be two tweens, each with its own ScrollTrigger);
   * useGSAP's context reverts the pin and the timeline on unmount. */
  useGSAP(
    () => {
      if (standalone) return
      const el = ref.current
      const range = {
        trigger: el,
        start: 'top top',
        // An element, not '#process': selectors only look inside the scope
        endTrigger: document.getElementById('process'),
        end: 'top top',
      }

      // Once fully covered, hide it (saves GPU) and pause its animations
      const cover = (yes) => {
        gsap.set(el, { visibility: yes ? 'hidden' : 'visible' })
        setCovered(yes)
      }

      ScrollTrigger.create({
        ...range,
        pin: true,
        pinSpacing: false,
        onLeave: () => cover(true),
        onEnterBack: () => cover(false),
      })

      gsap
        .timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...range, scrub: true } })
        .to(contentRef.current, { scale: 0.94 }, 0)
        .fromTo(shadeRef.current, { opacity: 0 }, { opacity: 0.75 }, 0)
    },
    { scope: ref },
  )

  /* Still taller than the space under the nav (short laptops, phones)?
   * Shrink the whole layout to fit the one-screen section. Re-measured when
   * the screen changes size, not per stage, so it doesn't jump around while
   * the panel plays. On its own page the section is one screen tall only on
   * desktop (over 1024px); below that it grows to fit its content, so this
   * works out to 1 and text and buttons keep their real size. */
  useEffect(() => {
    const box = contentRef.current
    const inner = fitRef.current
    const fit = () => {
      const s = Math.min(1, box.clientHeight / inner.offsetHeight)
      inner.style.scale = s < 1 ? s.toFixed(3) : ''
    }
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    let alive = true // the fonts promise can settle after the page is left
    document.fonts?.ready.then(() => alive && fit())
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [])

  // -1 = all 100 leads, 0…4 = that stage leaking, LAST = the summary.
  // Always autoplays — even with reduced motion on (Windows with animation
  // effects off reports that), since the stages are the content.
  const [step, setStep] = useState(-1)
  const [held, setHeld] = useState(false)
  const [paused, setPaused] = useState(false)

  const ms = held ? HOLD_MS : step < 0 ? INTRO_MS : step >= LAST ? END_MS : STAGE_MS
  // On screen, in a visible tab and not covered: only then does anything run.
  // Off screen, the stage timer stops and every looping animation is paused
  // (the `ll-paused` class), so the page does no work nobody can see.
  const live = active && pageVisible && !covered
  const running = live && !paused

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => {
      setHeld(false)
      setStep((s) => (s >= LAST ? -1 : s + 1))
    }, ms)
    return () => clearTimeout(t)
  }, [running, step, ms])

  // Jumping somewhere holds it there a while before autoplay carries on
  const go = (i) => {
    setStep(Math.max(-1, Math.min(LAST, i)))
    setHeld(true)
  }

  // The underline draws itself the first time the section shows up
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (active) setSeen(true)
  }, [active])

  const done = step >= LAST

  return (
    <section
      id="lead-leak"
      ref={ref}
      className={`
        relative z-10
        flex flex-col
        overflow-hidden
        bg-[var(--navy)]
        ${standalone
          ? 'min-h-screen min-h-[100svh] min-[1025px]:h-screen min-[1025px]:h-[100svh] min-[1025px]:min-h-[520px] max-[600px]:min-h-0 max-[600px]:pb-6'
          : `
          h-screen h-[100svh] min-h-[520px]
          rounded-t-[clamp(28px,4vw,56px)]
          border-t border-[rgba(255,107,112,0.22)]
          shadow-[0_-40px_90px_-20px_rgba(0,0,0,0.75)]
          max-[600px]:pb-[92px]
        `}
        px-[var(--gutter)]
        pt-[96px]
        pb-[96px]

        max-[600px]:pt-[84px]
        ${live ? '' : 'll-paused'}
        ${LITE ? 'll-lite' : ''}
      `}
    >
      {/* ── Backdrop: city towers at blue hour + red haze ──────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Photo: Unsplash (photo-1513563326940), free to use.
            Phones (narrower than 600px, the same breakpoint as the phone
            layout) always get the 900px file: with `sizes="100vw"` alone a
            3× phone asked for the 1800px one (370 KB vs 122 KB) to fill a
            darkened backdrop ~510px wide. */}
        <picture>
          <source media="(max-width: 599.98px)" srcSet="/assets/lead-leak-city-sm.webp" />
          <img
            src="/assets/lead-leak-city.webp"
            srcSet="/assets/lead-leak-city-sm.webp 900w, /assets/lead-leak-city.webp 1800w"
            sizes="100vw"
            alt=""
            width="1800"
            height="1200"
            loading={standalone ? 'eager' : 'lazy'}
            fetchPriority={standalone ? 'high' : 'auto'}
            decoding="async"
            className="absolute inset-x-0 top-0 h-[70%] w-full object-cover object-[50%_100%] [mask-image:linear-gradient(180deg,#000_60%,transparent)] max-[1000px]:h-[45%]"
          />
        </picture>
        {/* Tint the photo navy so the panel and text stay readable */}
        <div className="absolute inset-0 bg-[rgba(11,18,41,0.42)]" />
        {/* Darker pool behind the headline */}
        <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_25%_50%,rgba(11,18,41,0.8),transparent)] max-[1000px]:bg-[radial-gradient(85%_20%_at_50%_13%,rgba(11,18,41,0.8),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,41,0.7)_0%,rgba(11,18,41,0.15)_25%,rgba(11,18,41,0.3)_60%,rgba(11,18,41,0.6)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(229,72,77,0.16),transparent_70%),radial-gradient(35%_35%_at_8%_70%,rgba(229,72,77,0.1),transparent_70%),radial-gradient(35%_35%_at_95%_40%,rgba(83,247,251,0.07),transparent_70%)]" />
        {/* Faint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(70%_60%_at_50%_30%,#000,transparent)]" />
      </div>

      {/* Dims the section as the proof strip slides over it (home page only) */}
      {!standalone && <div ref={shadeRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[#05091a] opacity-0" />}

      <div ref={contentRef} className="relative flex min-h-0 flex-1 items-center justify-center">
        {/* Header | panel side by side on desktop, stacked below that */}
        <div
          ref={fitRef}
          className="grid w-full max-w-[1320px] grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-[clamp(32px,4vw,64px)] max-[1000px]:max-w-[720px] max-[1000px]:grid-cols-1 max-[1000px]:gap-6 max-[600px]:gap-4"
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <header data-slide="left" className="flex flex-col items-start gap-6 text-left max-[1000px]:items-center max-[1000px]:text-center max-[600px]:gap-3">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,107,112,0.35)] bg-[rgba(229,72,77,0.1)] px-4 py-2 max-[600px]:px-3 max-[600px]:py-1.5">
              <span className="ll-live h-2 w-2 rounded-full bg-[#ff6b70]" />
              <span className={`${ui} text-[12px] font-semibold uppercase leading-none tracking-[0.26em] text-[#ff8a8e] max-[600px]:text-[11px]`}>
                {leadLeak.eyebrow}
              </span>
            </span>

            <h2 className="sr-only">
              {leadLeak.stat} of {leadLeak.who} {leadLeak.title} {leadLeak.highlight}
            </h2>

            {/* 99% card, then the statement — side by side on tablets and phones */}
            <div className={`${display} flex flex-col items-start gap-6 max-[1000px]:flex-row max-[1000px]:items-center max-[1000px]:text-left max-[600px]:gap-4`}>
              {/* "99% of realtors" — the number that matters, on its own card */}
              <span aria-hidden="true" className="w-full max-w-[440px] min-w-0 rounded-[28px] bg-[linear-gradient(140deg,rgba(255,107,112,0.85),rgba(255,122,80,0.3)_40%,rgba(255,255,255,0.08)_75%,rgba(255,107,112,0.4))] p-px shadow-[0_30px_80px_-28px_rgba(229,72,77,0.8)] max-[1000px]:w-auto max-[1000px]:shrink-0 max-[600px]:rounded-[20px]">
                <span className="flex flex-col gap-4 rounded-[27px] bg-[linear-gradient(160deg,rgba(62,20,38,0.94),rgba(11,18,41,0.94)_70%)] px-6 pb-5 pt-4 text-left max-[600px]:gap-2 max-[600px]:rounded-[19px] max-[600px]:px-3.5 max-[600px]:py-3.5 [@media(max-height:780px)]:gap-3">
                  {/* Realtor badge */}
                  <span aria-hidden="true" className="flex items-center gap-3 max-[1000px]:hidden [@media(max-height:780px)]:hidden">
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,#ff8a8e,#ff6b70)] text-[19px] text-[var(--navy)] shadow-[0_0_26px_rgba(255,107,112,0.65)]">
                      <FaUserTie />
                      <span className="absolute -bottom-1 -right-1 grid h-[22px] w-[22px] place-items-center rounded-full bg-[var(--navy)] text-[10px] text-[#ffc9a8] ring-2 ring-[#ff6b70]">
                        <FaHouseChimney />
                      </span>
                    </span>
                    <span className={`${ui} text-[11px] font-semibold uppercase leading-[1.3] tracking-[0.22em] text-[#ff8a8e]`}>
                      Real estate
                      <span className="block text-white/45">The hard truth</span>
                    </span>
                  </span>

                  {/* "99%" on top, "REALTORS" stamped underneath */}
                  <span className="flex flex-col items-start gap-3 max-[600px]:gap-2">
                    {/* "99%": static red → amber text, a red glow behind it (a blurred copy,
                        .ll-stat-wrap::before) and a light sweeping across (.ll-shine: a pale
                        copy seen through a moving window). The sweep is transforms only, run
                        by the compositor; it used to animate the gradient (repainted every
                        frame) with a drop-shadow filter re-blurred along with it. */}
                    <span data-text={leadLeak.stat} className="ll-stat-wrap text-[clamp(72px,7vw,112px)] max-[600px]:text-[50px] font-[800] leading-[0.8] tracking-[-0.06em]">
                      <span className="ll-stat block pb-[0.04em] pr-[0.08em]">{leadLeak.stat}</span>
                      <span aria-hidden="true" className="ll-shine">
                        <span className="pb-[0.04em] pr-[0.08em]">{leadLeak.stat}</span>
                      </span>
                    </span>
                    <span className="ll-tag ml-1 inline-block rounded-[10px] bg-[linear-gradient(120deg,#ff8a8e,#ff6b70_45%,#ffb38a)] px-4 py-2 text-[clamp(20px,2vw,28px)] font-[800] uppercase leading-none tracking-[0.12em] text-[var(--navy)] shadow-[0_10px_30px_-8px_rgba(255,107,112,0.85),inset_0_1px_0_rgba(255,255,255,0.45)] max-[600px]:ml-0.5 max-[600px]:rounded-[7px] max-[600px]:px-2.5 max-[600px]:py-1.5 max-[600px]:text-[14px]">
                      {leadLeak.who}
                    </span>
                  </span>

                  {/* 99 out of 100 */}
                  <span aria-hidden="true" className="flex items-center gap-3 max-[600px]:hidden">
                    <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <span className={`ll-meter absolute inset-y-0 left-0 w-[99%] rounded-full bg-[linear-gradient(90deg,#ff6b70,#ffb38a)] shadow-[0_0_12px_rgba(255,107,112,0.7)] ${seen ? 'is-drawn' : ''}`} />
                    </span>
                    <span className={`${ui} text-[12px] font-semibold tabular-nums text-white/55`}>99 / 100</span>
                  </span>
                </span>
              </span>

              {/* The statement */}
              <span className="flex min-w-0 flex-col gap-1.5">
                <span aria-hidden="true" className="inline-flex items-center gap-3 text-[clamp(22px,2vw,30px)] leading-[1.15] tracking-[-0.02em] max-[600px]:gap-2 max-[600px]:text-[18px]">
                  <span className="ll-warn grid h-[1.25em] w-[1.25em] shrink-0 place-items-center rounded-full border border-[rgba(255,107,112,0.5)] bg-[rgba(229,72,77,0.18)] text-[0.5em] text-[#ff8a8e] shadow-[0_0_20px_rgba(255,107,112,0.35)]">
                    <FaTriangleExclamation />
                  </span>
                  <span>
                    <span className="font-[800] text-white">{titleFirst}</span>{' '}
                    <span className="font-[500] text-white/65">{titleRest}</span>
                  </span>
                </span>
                <span aria-hidden="true" className="relative w-fit">
                  <span className="ll-em block font-[family-name:var(--font-serif)] text-[clamp(34px,3.2vw,50px)] font-normal italic leading-[1.02] tracking-[-0.01em] max-[600px]:text-[27px]">
                    <span className="whitespace-nowrap">{hlFirst}</span> {hlRest.join(' ')}
                  </span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 400 18"
                    preserveAspectRatio="none"
                    className={`ll-brush absolute -bottom-[0.3em] left-0 h-[14px] w-[96%] overflow-visible max-[600px]:h-[10px] ${seen ? 'is-drawn' : ''}`}
                  >
                    <path
                      d="M3 12 C 70 4, 150 3, 230 6 S 360 11, 397 5"
                      pathLength="1"
                      fill="none"
                      stroke="url(#ll-brush-grad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="ll-brush-grad" x1="0" x2="1">
                        <stop offset="0" stopColor="#ff6b70" />
                        <stop offset="1" stopColor="#ffc9a8" stopOpacity="0.5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
            </div>

            {/* "These" problems as chips that open each stage (the stepper does this below desktop) */}
            <span className="flex max-w-[480px] flex-wrap gap-2 max-[1000px]:hidden">
              {stages.map((s, i) => (
                <button
                  key={s.from}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`See stage ${i + 1}: ${s.short}`}
                  className={`${ui} group inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold transition-[border-color,background,color,transform] duration-300 ease-[var(--ease)] hover:-translate-y-0.5 hover:border-[rgba(255,107,112,0.55)] hover:bg-[rgba(229,72,77,0.16)] hover:text-white ${
                    i === step ? 'border-[rgba(255,107,112,0.55)] bg-[rgba(229,72,77,0.16)] text-white' : 'border-white/[0.1] bg-[rgba(11,18,41,0.6)] text-white/80'
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[rgba(229,72,77,0.2)] text-[11px] text-[#ff8a8e] transition-colors duration-300 group-hover:bg-[#ff6b70] group-hover:text-[var(--navy)]">
                    <StageIcon stage={s} />
                  </span>
                  {s.short}
                </button>
              ))}
            </span>

            {/* Where that leaves you */}
            <div
              className={`flex w-full max-w-[520px] items-center justify-between gap-5 rounded-[20px] border px-5 py-4 text-left transition-[background,border-color] duration-700 max-[600px]:hidden ${
                done
                  ? 'border-[rgba(83,247,251,0.4)] bg-[linear-gradient(100deg,rgba(83,247,251,0.16),rgba(83,247,251,0.03))]'
                  : 'border-white/[0.08] bg-[linear-gradient(100deg,rgba(83,247,251,0.07),rgba(11,18,41,0.4))]'
              }`}
            >
              <p className={`${display} text-[17px] font-[700] leading-[1.25] text-white`}>
                {total} leads in. Only <span className="text-[var(--cyan)]">{visits}</span> walk into the property.
                <span className={`${ui} mt-1 block text-[13px] font-[500] text-[var(--muted)]`}>
                  AXAMP plugs every one of these leaks.
                </span>
              </p>

              {/* Straight to the audit (Get Audit page) */}
              <a
                href="/build-package"
                onClick={(e) => {
                  e.preventDefault()
                  goTo('/build-package')
                }}
                className={`${display} group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--cyan)] px-5 py-3 text-[14px] font-[700] text-[var(--navy)] shadow-[0_14px_34px_-10px_rgba(83,247,251,0.75)] transition-transform duration-300 ease-[var(--ease)] hover:-translate-y-0.5`}
              >
                Plug the leak
                <ArrowRight size={16} strokeWidth={2.6} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </div>
          </header>

          {/* ── The pipeline panel ──────────────────────────────── */}
          <div
            id="lead-pipeline"
            data-slide="right"
            className="rounded-[30px] bg-[linear-gradient(150deg,rgba(255,107,112,0.55),rgba(255,255,255,0.07)_35%,rgba(255,255,255,0.04)_65%,rgba(83,247,251,0.45))] p-px shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95),0_0_80px_-30px_rgba(229,72,77,0.45)] max-[600px]:rounded-[22px]"
          >
            {/* Frosted over the city on mouse devices; solid on touch and low-resource
                devices, where re-blurring the backdrop every frame costs too much */}
            <div className={`overflow-hidden rounded-[29px] bg-[rgba(9,14,34,0.94)] max-[600px]:rounded-[21px] ${LITE ? '' : 'pointer-fine:bg-[rgba(9,14,34,0.78)] pointer-fine:backdrop-blur-xl'}`}>
              <TopBar
                step={step}
                playing={!paused}
                onTogglePlay={() => {
                  setPaused((p) => !p)
                  setHeld(false)
                }}
                onPrev={() => go(step - 1)}
                onNext={() => go(step + 1)}
                onReplay={() => {
                  setStep(-1)
                  setHeld(false)
                  setPaused(false)
                }}
              />

              {/* Time until the next stage */}
              <div aria-hidden="true" className="h-[2px] bg-white/[0.06]">
                <span
                  key={`${step}-${held}`}
                  className="ll-timer block h-full bg-[linear-gradient(90deg,#ff6b70,#ff7a50)]"
                  style={{ '--ms': `${ms}ms`, animationPlayState: running ? 'running' : 'paused' }}
                />
              </div>

              <div className="border-b border-white/[0.07] px-6 pb-4 pt-5 max-[600px]:px-3 max-[600px]:pb-3 max-[600px]:pt-3.5">
                <Stepper step={step} onPick={go} />
              </div>

              <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] max-[600px]:grid-cols-1">
                <div className="border-r border-white/[0.07] p-6 max-[600px]:border-b max-[600px]:border-r-0 max-[600px]:p-4">
                  <LeadGrid step={step} />
                </div>

                <div className="flex flex-col gap-4 p-6 max-[600px]:p-4" aria-live="polite">
                  <Spotlight step={step} />
                  <FunnelChart step={step} onPick={go} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

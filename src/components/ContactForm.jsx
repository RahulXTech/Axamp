import { useEffect, useId, useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowRight, Building2, Check, Clapperboard, Clock, GraduationCap, Hospital, Loader2,
  Mail, Megaphone, Mic, PencilLine, Phone, Plus, Send, Smartphone, Sparkles, User,
  UserRound, Users, UtensilsCrossed, Workflow,
} from 'lucide-react'

import { budgets, contactMethods, industries, industryFromSwitcher, needs } from '../data/contact'
import { site } from '../data/site'
import { useIndustry } from '../lib/industry'
import { scrollToTarget } from '../lib/scroll'
import { WhatsAppIcon } from './icons'

/* ------------------------------------------------------------------
   Contact form as a short, app-like wizard — one question per step,
   big tap targets, built phone-first.

   On submit the answers go to /api/contact (api/contact.js), which
   emails them to AXAMP. If that fails, the visitor can send the same
   details on WhatsApp instead, so no lead is lost.
------------------------------------------------------------------ */

const icons = {
  building: Building2, hospital: Hospital, graduation: GraduationCap, user: UserRound,
  food: UtensilsCrossed, sparkles: Sparkles, clapperboard: Clapperboard, phone: Smartphone,
  megaphone: Megaphone, mic: Mic, workflow: Workflow, users: Users,
}

const STEPS = [
  { key: 'industry', title: 'What’s your business?', sub: 'Pick the one that fits best.' },
  { key: 'needs', title: 'What do you need?', sub: 'Choose as many as you like.' },
  { key: 'budget', title: 'Monthly budget?', sub: 'A rough range is fine — or skip it.' },
  { key: 'details', title: 'Where can we reach you?', sub: 'We’ll get back to you on your preferred channel.' },
]

const methodIcons = { WhatsApp: WhatsAppIcon, Call: Phone, Email: Mail }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(v) {
  const e = {}
  if (!v.name.trim()) e.name = 'Please enter your name.'
  const digits = v.phone.replace(/\D/g, '')
  if (!digits) e.phone = 'Please enter your phone / WhatsApp number.'
  else if (digits.length < 10 || digits.length > 13) e.phone = 'That number looks incomplete.'
  if (!v.email.trim()) e.email = 'Please enter your email.'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email doesn’t look right.'
  return e
}

function compose(v) {
  const t = (x) => x.trim()
  const lines = ["Hi AXAMP, I'd like to discuss a project.", '', `Name: ${t(v.name)}`]
  if (t(v.business)) lines.push(`Business: ${t(v.business)}`)
  lines.push(`Phone: ${t(v.phone)}`)
  if (t(v.email)) lines.push(`Email: ${t(v.email)}`)
  if (v.industry) lines.push(`Industry: ${v.industry}`)
  if (v.needs.length) lines.push(`Looking for: ${v.needs.join(', ')}`)
  if (v.budget) lines.push(`Monthly budget: ${v.budget}`)
  lines.push(`Best way to reach me: ${v.method}`)
  if (t(v.message)) lines.push('', `About the project: ${t(v.message)}`)
  return lines.join('\n')
}

const waLink = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

// Emails the lead to AXAMP (api/contact.js); throws if it didn't go through
async function sendLead(v) {
  const t = (x) => x.trim()
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: t(v.name),
      phone: t(v.phone),
      email: t(v.email),
      business: t(v.business),
      industry: v.industry,
      needs: v.needs,
      budget: v.budget,
      method: v.method,
      message: t(v.message),
    }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.success) throw new Error(data?.message || `Request failed (${res.status})`)
}

/* ── Pieces ─────────────────────────────────────────────────────── */

// Big tap-to-select card (a real radio / checkbox underneath)
function Tile({ type, name, label, icon, checked, onChange, onReselect, className = '' }) {
  const Icon = icons[icon]
  return (
    <label className={`group relative block cursor-pointer ${className}`}>
      <input
        type={type}
        name={name}
        value={label}
        checked={checked}
        onChange={onChange}
        onClick={checked ? onReselect : undefined}
        className="peer sr-only"
      />
      <span
        className="
          flex h-full min-h-[108px] flex-col items-start justify-between gap-3 rounded-2xl border p-4 max-[640px]:min-h-[92px] max-[640px]:gap-2 max-[640px]:p-3.5
          border-white/10 bg-white/[0.03]
          transition-[border-color,background-color,box-shadow,transform] duration-200 ease-[var(--ease)]
          hover:border-white/25 hover:bg-white/[0.05]
          active:scale-[0.97]
          peer-checked:border-[rgba(83,247,251,0.65)] peer-checked:bg-[rgba(83,247,251,0.10)]
          peer-checked:shadow-[0_0_28px_-10px_rgba(83,247,251,0.8)]
          peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--cyan)]
        "
      >
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white/60 transition-colors duration-200 group-has-checked:bg-[var(--cyan)] group-has-checked:text-[var(--navy)]">
            <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
          </span>
        )}
        <span className="pr-2 text-[14.5px] font-semibold leading-snug text-white/80 transition-colors group-has-checked:text-white max-[380px]:text-[13.5px]">
          {label}
        </span>
      </span>

      {/* Tick */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute right-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full
          border border-white/20 text-transparent
          transition-[background-color,border-color,color,transform] duration-200
          group-has-checked:scale-110 group-has-checked:border-[var(--cyan)] group-has-checked:bg-[var(--cyan)] group-has-checked:text-[var(--navy)]
        "
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </label>
  )
}

function Field({ id, label, optional, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2 text-[13.5px] font-semibold text-white/90">
        {label}
        {optional && <span className="text-[11.5px] font-medium text-[var(--faint)]">optional</span>}
      </label>
      <div className="relative">
        <Icon
          size={18}
          aria-hidden="true"
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-[#ff8a8a]' : 'text-white/35'}`}
        />
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="cf-shake text-[12.5px] font-medium text-[#ff8a8a]">
          {error}
        </p>
      )}
    </div>
  )
}

// 16px text keeps iOS from zooming in on focus
const inputCls = (error) => `
  h-14 w-full rounded-2xl border bg-white/[0.04] pl-12 pr-4
  text-[16px] text-white placeholder:text-white/30
  outline-none transition-[border-color,box-shadow,background-color] duration-300
  focus:bg-white/[0.06]
  ${error
    ? 'border-[rgba(255,138,138,0.6)] focus:shadow-[0_0_0_4px_rgba(255,138,138,0.12)]'
    : 'border-white/10 hover:border-white/20 focus:border-[rgba(83,247,251,0.6)] focus:shadow-[0_0_0_4px_rgba(83,247,251,0.12)]'}
`

/* ── Form ───────────────────────────────────────────────────────── */

export default function ContactForm() {
  const uid = useId()
  const rootRef = useRef(null)
  const headingRef = useRef(null)
  const advanceTimer = useRef(null)
  const { industry: switcher } = useIndustry()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [v, setV] = useState({
    name: '',
    phone: '',
    email: '',
    business: '',
    industry: industryFromSwitcher[switcher] ?? '',
    needs: [],
    budget: '',
    method: 'WhatsApp',
    message: '',
  })
  const [noteOpen, setNoteOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(null) // composed message once submitted
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null) // composed message when the email failed
  const touched = useRef(false)

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  // On each step change: focus the question, and on phones bring the card
  // back into view if it scrolled above the fold
  useEffect(() => {
    if (!touched.current) return
    headingRef.current?.focus({ preventScroll: true })
    const top = rootRef.current?.getBoundingClientRect().top ?? 0
    if (top < 70) scrollToTarget(window.scrollY + top - 110)
  }, [step, sent])

  const set = (key, val) => {
    setV((s) => ({ ...s, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const go = (to) => {
    clearTimeout(advanceTimer.current)
    touched.current = true
    setDir(to > step ? 1 : -1)
    setStep(to)
  }

  // Single-choice steps move on by themselves after a tap
  const pickAndAdvance = (key, val) => {
    set(key, val)
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => go(step + 1), 320)
  }

  const canContinue = step === 0 ? !!v.industry : step === 1 ? v.needs.length > 0 : true
  const last = step === STEPS.length - 1

  const finish = () => {
    const e = validate(v)
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      rootRef.current?.querySelector(`#${CSS.escape(`${uid}-${first}`)}`)?.focus()
      return null
    }
    touched.current = true
    return compose(v)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!last) {
      if (canContinue) go(step + 1)
      return
    }
    if (sending) return
    const text = finish()
    if (!text) return

    setSending(true)
    setSendError(null)
    try {
      await sendLead(v)
      setSent(text)
    } catch (err) {
      console.error('Contact form:', err)
      setSendError(text)
    } finally {
      setSending(false)
    }
  }

  const startOver = () => {
    setSent(null)
    setSendError(null)
    setNoteOpen(false)
    setStep(0)
    setV((s) => ({ ...s, needs: [], budget: '', message: '' }))
  }

  const id = (k) => `${uid}-${k}`
  const aria = (k) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${id(k)}-error` : undefined,
  })

  /* ── Sent ─────────────────────────────────────────── */
  if (sent) {
    return (
      <div ref={rootRef} className="flex min-h-[480px] flex-col items-center justify-center gap-5 py-8 text-center" role="status">
        <span className="relative grid h-24 w-24 place-items-center">
          <span className="cf-ring absolute inset-0 rounded-full border-2 border-[var(--cyan)]" />
          <span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--cyan)] text-[var(--navy)] shadow-[0_0_60px_-8px_rgba(83,247,251,0.9)] [animation:pop_0.6s_var(--ease)_both]">
            <Check size={38} strokeWidth={3} aria-hidden="true" />
          </span>
        </span>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,2.6vw,2.1rem)] font-[800] tracking-[-0.03em] text-white outline-none"
        >
          Thanks, {v.name.trim().split(' ')[0]}!
        </h3>
        <p className="max-w-[420px] text-[15.5px] leading-[1.65] text-[var(--muted)]">
          We’ve got your details — the AXAMP team will reach you on{' '}
          <span className="font-semibold text-white">{v.method === 'Call' ? 'a call' : v.method}</span> soon. Want to talk sooner?
          Message us on WhatsApp.
        </p>
        <div className="mt-2 flex w-full flex-col items-center gap-3 min-[480px]:w-auto min-[480px]:flex-row">
          <a
            href={waLink(sent)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-7 font-[family-name:var(--font-display)] text-[15px] font-semibold text-[#062b14] shadow-[0_0_30px_-8px_rgba(37,211,102,0.8)] transition-transform duration-300 hover:-translate-y-px min-[480px]:w-auto"
          >
            <WhatsAppIcon size={19} />
            Chat on WhatsApp
          </a>
          <button
            type="button"
            onClick={startOver}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 font-[family-name:var(--font-display)] text-[15px] font-semibold text-white transition-colors hover:border-white/30 min-[480px]:w-auto"
          >
            <PencilLine size={16} aria-hidden="true" />
            Send another enquiry
          </button>
        </div>
      </div>
    )
  }

  const s = STEPS[step]

  /* ── Wizard ───────────────────────────────────────── */
  return (
    <form ref={rootRef} onSubmit={onSubmit} noValidate className="flex flex-col">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4">
        <p className="font-[family-name:var(--font-display)] text-[12px] font-semibold tracking-[0.2em] text-[var(--cyan)]">
          STEP {step + 1} <span className="text-white/35">/ {STEPS.length}</span>
        </p>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11.5px] font-medium text-white/60">
          <Clock size={13} aria-hidden="true" />
          ~1 min
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {STEPS.map((x, i) => (
          <span key={x.key} className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[#9dfcfd] shadow-[0_0_10px_rgba(83,247,251,0.7)] transition-transform duration-500 ease-[var(--ease)] origin-left"
              style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>

      {/* Step — keyed so each one slides in */}
      <div key={step} className="cf-step mt-7 max-[640px]:mt-5" style={{ '--dir': dir }}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-[family-name:var(--font-display)] text-[clamp(1.55rem,2.6vw,2.1rem)] font-[800] leading-[1.1] tracking-[-0.03em] text-white outline-none"
        >
          {s.title}
        </h2>
        <p className="mt-2 text-[15px] text-[var(--muted)] max-[640px]:mt-1">{s.sub}</p>

        <div className="mt-6 max-[640px]:mt-4">
          {s.key === 'industry' && (
            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">{s.title}</legend>
              <div className="grid grid-cols-2 gap-2.5 min-[640px]:grid-cols-3">
                {industries.map((o, i) => (
                  <Tile
                    key={o.label}
                    // Odd count on the two-column phone grid: the last tile ("Other") spans the row
                    className={industries.length % 2 && i === industries.length - 1 ? 'max-[639px]:col-span-2' : ''}
                    type="radio"
                    name={id('industry')}
                    label={o.label}
                    icon={o.icon}
                    checked={v.industry === o.label}
                    onChange={() => pickAndAdvance('industry', o.label)}
                    onReselect={() => go(step + 1)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {s.key === 'needs' && (
            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">{s.title}</legend>
              <div className="grid grid-cols-2 gap-2.5 min-[640px]:grid-cols-3">
                {needs.map((o) => {
                  const on = v.needs.includes(o.label)
                  return (
                    <Tile
                      key={o.label}
                      type="checkbox"
                      name={id('needs')}
                      label={o.label}
                      icon={o.icon}
                      checked={on}
                      onChange={() => set('needs', on ? v.needs.filter((x) => x !== o.label) : [...v.needs, o.label])}
                    />
                  )
                })}
              </div>
            </fieldset>
          )}

          {s.key === 'budget' && (
            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">{s.title}</legend>
              <div className="grid grid-cols-2 gap-2.5 min-[640px]:grid-cols-3">
                {budgets.map((b) => (
                  <label key={b} className="group relative block cursor-pointer">
                    <input
                      type="radio"
                      name={id('budget')}
                      value={b}
                      checked={v.budget === b}
                      onChange={() => pickAndAdvance('budget', b)}
                      onClick={v.budget === b ? () => set('budget', '') : undefined}
                      className="peer sr-only"
                    />
                    <span
                      className="
                        flex h-[60px] items-center justify-center rounded-2xl border px-3 text-center
                        border-white/10 bg-white/[0.03]
                        font-[family-name:var(--font-display)] text-[15px] font-semibold text-white/80
                        transition-[border-color,background-color,box-shadow,transform,color] duration-200
                        hover:border-white/25 active:scale-[0.97]
                        peer-checked:border-[rgba(83,247,251,0.65)] peer-checked:bg-[rgba(83,247,251,0.10)] peer-checked:text-white
                        peer-checked:shadow-[0_0_28px_-10px_rgba(83,247,251,0.8)]
                        peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--cyan)]
                      "
                    >
                      {b}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {s.key === 'details' && (
            <div className="flex flex-col gap-5 max-[640px]:gap-4">
              {/* What they picked — tap to change */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  [v.industry, 0],
                  [v.needs.length && `${v.needs.length} service${v.needs.length > 1 ? 's' : ''}`, 1],
                  [v.budget, 2],
                ]
                  .filter(([label]) => label)
                  .map(([label, to]) => (
                    <button
                      key={to}
                      type="button"
                      onClick={() => go(to)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.07)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--cyan)] transition-colors hover:border-[rgba(83,247,251,0.6)]"
                    >
                      {label}
                      <PencilLine size={12} aria-hidden="true" />
                      <span className="sr-only">— change</span>
                    </button>
                  ))}
              </div>

              <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 max-[640px]:gap-3">
                <Field id={id('name')} label="Your name" icon={User} error={errors.name}>
                  <input
                    id={id('name')}
                    type="text"
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="e.g. Rahul Sharma"
                    value={v.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={inputCls(errors.name)}
                    {...aria('name')}
                  />
                </Field>
                <Field id={id('phone')} label="Phone / WhatsApp" icon={Phone} error={errors.phone}>
                  <input
                    id={id('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    placeholder="+91 98765 43210"
                    value={v.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className={inputCls(errors.phone)}
                    {...aria('phone')}
                  />
                </Field>
                <Field id={id('business')} label="Business name" optional icon={Building2}>
                  <input
                    id={id('business')}
                    type="text"
                    autoComplete="organization"
                    enterKeyHint="next"
                    placeholder="e.g. Sharma Developers"
                    value={v.business}
                    onChange={(e) => set('business', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field id={id('email')} label="Email" icon={Mail} error={errors.email}>
                  <input
                    id={id('email')}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="send"
                    placeholder="you@company.com"
                    value={v.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={inputCls(errors.email)}
                    {...aria('email')}
                  />
                </Field>
              </div>

              {/* Preferred channel — segmented control */}
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-2 p-0 text-[13.5px] font-semibold text-white/90">Best way to reach you</legend>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
                  {contactMethods.map((m) => {
                    const Icon = methodIcons[m]
                    return (
                      <label key={m} className="cursor-pointer">
                        <input
                          type="radio"
                          name={id('method')}
                          value={m}
                          checked={v.method === m}
                          onChange={() => set('method', m)}
                          className="peer sr-only"
                        />
                        <span
                          className="
                            flex h-12 items-center justify-center gap-2 rounded-xl px-2
                            text-[13.5px] font-semibold text-white/60
                            transition-[background-color,color,box-shadow] duration-200
                            hover:text-white
                            peer-checked:bg-[var(--cyan)] peer-checked:text-[var(--navy)] peer-checked:shadow-[0_0_20px_-6px_rgba(83,247,251,0.8)]
                            peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--cyan)]
                          "
                        >
                          <span className="shrink-0"><Icon size={16} /></span>
                          <span className="whitespace-nowrap">{m}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              {/* Optional note, tucked away */}
              {noteOpen ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor={id('message')} className="flex items-baseline gap-2 text-[13.5px] font-semibold text-white/90">
                    Tell us about your project
                    <span className="text-[11.5px] font-medium text-[var(--faint)]">optional</span>
                  </label>
                  <textarea
                    id={id('message')}
                    rows={3}
                    autoFocus
                    placeholder="Goals, launch date, location — anything that helps."
                    value={v.message}
                    onChange={(e) => set('message', e.target.value)}
                    className={`${inputCls()} h-auto min-h-[110px] resize-y py-3.5 !pl-4 leading-[1.6]`}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="inline-flex w-fit items-center gap-2 text-[14px] font-semibold text-white/70 transition-colors hover:text-[var(--cyan)]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15">
                    <Plus size={15} aria-hidden="true" />
                  </span>
                  Add a note about your project
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions — pinned to the bottom of the screen on phones */}
      <div
        className="
          z-10 mt-8 flex flex-col gap-3 border-t border-white/[0.08] pt-5 max-[640px]:mt-5 max-[640px]:pt-4
          max-[640px]:sticky max-[640px]:bottom-0 max-[640px]:-mx-5 max-[640px]:-mb-5 max-[640px]:rounded-b-[26px]
          max-[640px]:bg-[rgba(11,18,41,0.88)] max-[640px]:px-5 max-[640px]:pb-[max(16px,env(safe-area-inset-bottom))] max-[640px]:backdrop-blur-xl
        "
      >
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              aria-label="Back"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-white transition-[border-color,background-color] hover:border-white/30 hover:bg-white/[0.07]"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <button
            type="submit"
            disabled={!canContinue || sending}
            aria-busy={sending || undefined}
            className={`
              group inline-flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full
              font-[family-name:var(--font-display)] text-[16px] font-[700]
              transition-[transform,box-shadow,background-color,color,opacity] duration-300 ease-[var(--ease)]
              disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/35 disabled:shadow-none
              ${last
                ? 'bg-[#25d366] text-[#062b14] shadow-[0_0_34px_-8px_rgba(37,211,102,0.8)] hover:-translate-y-0.5'
                : 'bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] text-[var(--navy)] shadow-[0_0_34px_-8px_rgba(83,247,251,0.8),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 enabled:hover:shadow-[0_0_44px_-6px_rgba(83,247,251,0.95)]'}
            `}
          >
            {last ? (
              sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  Send enquiry
                  <Send size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" aria-hidden="true" />
                </>
              )
            ) : (
              <>
                {step === 2 && !v.budget ? 'Skip' : 'Continue'}
                <ArrowRight size={18} className="transition-transform duration-300 group-enabled:group-hover:translate-x-1" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {last && sendError ? (
          // Email didn't go through — offer the same details on WhatsApp
          <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-[rgba(255,138,138,0.35)] bg-[rgba(255,138,138,0.08)] px-4 py-3.5 text-center">
            <p className="flex items-center gap-2 text-[13.5px] font-medium text-[#ffb3b3]">
              <AlertCircle size={16} aria-hidden="true" />
              We couldn’t send your details just now.
            </p>
            <a
              href={waLink(sendError)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25d366] px-5 font-[family-name:var(--font-display)] text-[14px] font-semibold text-[#062b14]"
            >
              <WhatsAppIcon size={17} />
              Send on WhatsApp instead
            </a>
          </div>
        ) : last ? (
          <p className="text-center text-[13px] leading-[1.5] text-[var(--faint)]">
            Your details go straight to the AXAMP team.{' '}
            <a
              href={waLink(compose(v))}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-[var(--cyan)]"
            >
              Prefer WhatsApp?
            </a>
          </p>
        ) : (
          !canContinue && (
            <p className="text-center text-[12.5px] text-[var(--faint)]">
              {step === 0 ? 'Tap an option to continue' : 'Pick at least one to continue'}
            </p>
          )
        )}
      </div>
    </form>
  )
}

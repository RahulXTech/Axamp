import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, ArrowDown, Check, Loader2, Mail, Phone, Search, Send, User, X } from 'lucide-react'

import { whatsappLink } from '../data/site'
import { lockScroll } from '../lib/scroll'
import { WhatsAppIcon } from './icons'

/* ------------------------------------------------------------------
   "Find the reason behind this loss" on the lead loss report opens this:
   a small pop-up asking for name, email and mobile number. On submit the
   details — with the visitor's whole report: every project answer, every
   funnel question and answer, every number — go to /api/contact
   (api/contact.js), which emails them to AXAMP like the contact form.
   Then it says thanks and offers to scroll to the reasons. If the email
   fails, the same details can go on WhatsApp instead, so no lead is lost.
------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(v) {
  const e = {}
  if (!v.name.trim()) e.name = 'Please enter your name.'
  if (!v.email.trim()) e.email = 'Please enter your email.'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email doesn’t look right.'
  const digits = v.phone.replace(/\D/g, '')
  if (!digits) e.phone = 'Please enter your mobile number.'
  else if (digits.length < 10 || digits.length > 13) e.phone = 'That number looks incomplete.'
  return e
}

const FIELDS = [
  { key: 'name', label: 'Your name', Icon: User, type: 'text', autoComplete: 'name', placeholder: 'e.g. Rahul Sharma', enterKeyHint: 'next' },
  { key: 'email', label: 'Email ID', Icon: Mail, type: 'email', inputMode: 'email', autoComplete: 'email', placeholder: 'you@company.com', enterKeyHint: 'next' },
  { key: 'phone', label: 'Mobile number', Icon: Phone, type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210', enterKeyHint: 'send' },
]

// 16px text keeps iOS from zooming in on focus
const inputCls = (error) =>
  `h-12 w-full rounded-xl border bg-white/[0.04] pl-11 pr-4 text-[16px] text-white outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-white/30 focus:bg-white/[0.06] ${
    error
      ? 'border-[rgba(255,138,138,0.6)] focus:shadow-[0_0_0_4px_rgba(255,138,138,0.12)]'
      : 'border-white/10 hover:border-white/20 focus:border-[rgba(255,154,157,0.7)] focus:shadow-[0_0_0_4px_rgba(229,72,77,0.15)]'
  }`

// The report as plain text (for WhatsApp): a heading per section, a line per row
const reportText = (sections) =>
  sections.flatMap((s) => ['', `${s.title}:`, ...s.rows.flatMap(([label, value, note]) => [`- ${label}: ${value}`, ...(note ? [`  (${note})`] : [])])])

// `report` is the visitor's whole report as sections of [label, value, note?] rows
// (LeadReport.jsx: reportSections); `onSent` runs once the email has gone;
// `onSeeReasons` closes this and scrolls to the reasons
export default function ReasonForm({ report, onClose, onSent, onSeeReasons }) {
  return createPortal(<Body report={report} onClose={onClose} onSent={onSent} onSeeReasons={onSeeReasons} />, document.body)
}

function Body({ report, onClose, onSent, onSeeReasons }) {
  const uid = useId()
  const formRef = useRef(null)
  const [v, setV] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [sent, setSent] = useState(false)

  // Lock the page behind, close on Escape, and hand focus back to the button on close
  // (the latest onClose via a ref, so a parent re-render doesn't run this again)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const opener = document.activeElement
    lockScroll(true)
    formRef.current?.querySelector('input')?.focus()
    const onKey = (e) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  }, [])

  const set = (key, val) => {
    setV((s) => ({ ...s, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const t = (x) => x.trim()
  const text = () => [`Name: ${t(v.name)}`, `Email: ${t(v.email)}`, `Mobile: ${t(v.phone)}`, ...reportText(report)].join('\n')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    const errs = validate(v)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      formRef.current?.querySelector(`#${CSS.escape(`${uid}-${first}`)}`)?.focus()
      return
    }
    setSending(true)
    setFailed(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: t(v.name),
          email: t(v.email),
          phone: t(v.phone),
          industry: 'Real Estate',
          source: 'Lead loss report — Find the reason',
          report,
          message: `Report link: ${window.location.href}`,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) throw new Error(data?.message || `Request failed (${res.status})`)
      setSent(true)
      onSent()
    } catch (err) {
      console.error('Find the reason form:', err)
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`} data-lenis-prevent>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="fixed inset-0 bg-[rgba(3,6,18,0.78)] backdrop-blur-sm [animation:fade_0.25s_ease_both]" />

      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[26px] border border-[rgba(255,154,157,0.3)] bg-[linear-gradient(165deg,#1d1838_0%,#111a3f_45%,#0c1433_100%)] p-6 shadow-[0_40px_100px_-30px_rgba(229,72,77,0.55)] [animation:pop_0.4s_var(--ease)_both] max-[400px]:p-5">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(229,72,77,0.25),transparent_70%)]" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <X size={17} aria-hidden="true" />
        </button>

        {sent ? (
          /* ── Sent ── */
          <div className="relative flex flex-col items-center py-3 text-center" role="status">
            <span className="relative grid h-[76px] w-[76px] place-items-center">
              <span className="cf-ring absolute inset-0 rounded-full border-2 border-[#25d366]" />
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#25d366] text-[#062b14] shadow-[0_0_44px_-6px_rgba(37,211,102,0.85)] [animation:pop_0.5s_var(--ease)_both]">
                <Check size={32} strokeWidth={3} aria-hidden="true" />
              </span>
            </span>
            <h2 id={`${uid}-title`} className="mt-5 font-[family-name:var(--font-display)] text-[24px] font-[800] tracking-[-0.03em] text-white">
              Submitted successfully!
            </h2>
            <p className="mt-2 max-w-[320px] text-[14px] leading-[1.6] text-white/60">
              Thanks, <span className="font-semibold text-white">{t(v.name).split(' ')[0]}</span>. Your details and report have reached the AXAMP team — we’ll call you on{' '}
              <span className="font-semibold text-white">{t(v.phone)}</span> soon.
            </p>
            <button
              type="button"
              onClick={onSeeReasons}
              className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ff8a8e_0%,#ff5a60_45%,#d63a40_100%)] font-[family-name:var(--font-display)] text-[15px] font-[800] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_12px_30px_-10px_rgba(229,72,77,0.85)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              See the reason now
              <ArrowDown size={17} className="reason-bob" aria-hidden="true" />
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form ref={formRef} onSubmit={onSubmit} noValidate className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(145deg,#ff6b70,#c9353a)] text-white shadow-[0_8px_24px_-8px_rgba(229,72,77,0.9)]">
              <Search size={20} strokeWidth={2.6} aria-hidden="true" />
            </span>
            <h2 id={`${uid}-title`} className="mt-4 pr-10 font-[family-name:var(--font-display)] text-[22px] font-[800] leading-[1.15] tracking-[-0.03em] text-white">
              Find the <span className="text-[#ff8a8e]">reason</span> behind this loss
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.55] text-white/55">Share your details — our team will walk you through where your leads drop out and how to fix it.</p>

            <div className="mt-5 flex flex-col gap-3.5">
              {FIELDS.map(({ key, label, Icon, ...input }) => {
                const id = `${uid}-${key}`
                const error = errors[key]
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label htmlFor={id} className="text-[13px] font-semibold text-white/85">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon
                        size={17}
                        aria-hidden="true"
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-[#ff8a8a]' : 'text-white/35'}`}
                      />
                      <input
                        id={id}
                        {...input}
                        value={v[key]}
                        onChange={(e) => set(key, e.target.value)}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `${id}-error` : undefined}
                        className={inputCls(error)}
                      />
                    </div>
                    {error && (
                      <p id={`${id}-error`} className="cf-shake text-[12px] font-medium text-[#ff8a8a]">
                        {error}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={sending}
              aria-busy={sending || undefined}
              className="group mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#ff8a8e_0%,#ff5a60_45%,#d63a40_100%)] font-[family-name:var(--font-display)] text-[16px] font-[800] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_12px_30px_-10px_rgba(229,72,77,0.85)] transition-[transform,opacity] duration-300 enabled:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-75"
            >
              {sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit
                  <Send size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" aria-hidden="true" />
                </>
              )}
            </button>

            {failed ? (
              // Email didn't go through — offer the same details on WhatsApp
              <div role="alert" className="mt-3.5 flex flex-col items-center gap-2.5 rounded-2xl border border-[rgba(255,138,138,0.35)] bg-[rgba(255,138,138,0.08)] px-4 py-3 text-center">
                <p className="flex items-center gap-2 text-[13px] font-medium text-[#ffb3b3]">
                  <AlertCircle size={15} aria-hidden="true" />
                  We couldn’t send your details just now.
                </p>
                <a
                  href={whatsappLink(['Hi AXAMP, I’d like to know the reason behind my lead loss.', '', text()].join('\n'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25d366] px-5 font-[family-name:var(--font-display)] text-[13.5px] font-semibold text-[#062b14]"
                >
                  <WhatsAppIcon size={16} />
                  Send on WhatsApp instead
                </a>
              </div>
            ) : (
              <p className="mt-3 text-center text-[12px] text-white/40">Your details go straight to the AXAMP team — no spam.</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

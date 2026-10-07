import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUp, ArrowUpRight, Check, Clock, Copy, Mail, MapPin, Phone } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { mapsLink, site, whatsappLink } from '../data/site'
import { useIndustry } from '../lib/industry'
import { scrollToTarget } from '../lib/scroll'
import { pages, useGo } from '../lib/nav'
import Logo, { LOGO } from './Logo'
import { FacebookIcon, InstagramIcon, LinkedInIcon, PillarIcon, WhatsAppIcon } from './icons'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// TODO(AXAMP): tweak these to match how you actually onboard a client.
const steps = [
  { title: 'Book a quick call', text: 'Message us on WhatsApp — tell us about the project and the launch date.' },
  { title: 'We map your proof', text: 'We pick which of the six proofs your buyers need to see first.' },
  { title: 'Shoot, edit, post', text: 'Drone, walkthroughs, faces and reviews — cut for reels that travel.' },
]

const pad = (n) => String(n).padStart(2, '0')

/* Link with an underline that draws in from the left on hover */
const underline = `
  bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat
  bg-[length:0%_1px] bg-[position:0_100%]
  transition-[background-size,color] duration-500 ease-[var(--ease)]
  hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]
`

function useCopy(text) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${text}`
    }
  }

  return [copied, copy]
}


/* ============================================================
   CLOSING CTA
============================================================ */

export function Closing() {
  const [copied, copy] = useCopy(site.email)

  return (
    <section
      id="contact"
      className="relative overflow-x-clip px-[var(--gutter)] pb-[12vh] pt-[16vh] max-sm:pb-10 max-sm:pt-10"
    >
      {/* Background: faint grid + two glows */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]
          bg-[size:64px_64px]
          [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]
        "
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-[rgba(83,247,251,0.10)] blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[10%] right-[6%] h-[380px] w-[380px] rounded-full bg-[rgba(255,122,80,0.10)] blur-[110px]"
      />

      {/* Card with a slowly orbiting gradient border */}
      <div
        data-slide="scale"
        className="cta-border relative mx-auto w-[min(1120px,100%)] rounded-[36px] p-px shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]"
      >
        <div
          className="
            relative overflow-hidden
            grid items-center gap-12 max-sm:gap-8
            lg:grid-cols-[1.25fr_1fr] lg:gap-16
            rounded-[35px]
            bg-[linear-gradient(160deg,#101a3d_0%,#0a1230_55%,#0b1229_100%)]
            px-[clamp(24px,5.5vw,72px)] py-[clamp(44px,7vw,88px)] max-sm:py-8
          "
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(83,247,251,0.12)] blur-[90px]"
          />

          {/* ── Left: pitch + actions ─────────────────── */}
          <div className="relative flex flex-col items-start gap-7 max-sm:gap-5">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(83,247,251,0.25)] bg-[rgba(83,247,251,0.06)] px-4 py-2 font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cyan)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cyan)]" />
              </span>
              Now booking shoots
            </span>

            <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.3vw,3.9rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
              See the next project{' '}
              <span className="bg-gradient-to-r from-[var(--cyan)] via-[#c9feff] to-[var(--cyan)] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(83,247,251,0.35)]">
                we make.
              </span>
            </h2>

            <p className="max-w-[460px] text-[clamp(1rem,1.3vw,1.125rem)] leading-[1.6] text-[var(--muted)]">
              Tell us about your project. We'll show you which proof your buyers
              need to see — and how we'd film it.
            </p>

            <div className="flex w-full flex-wrap items-center gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="
                  group inline-flex h-14 items-center gap-3 rounded-full
                  pl-2 pr-7
                  bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)]
                  font-[family-name:var(--font-display)] text-[15px] font-semibold text-[var(--navy)]
                  shadow-[0_0_34px_-6px_rgba(83,247,251,0.75),inset_0_1px_0_rgba(255,255,255,0.6)]
                  transition-[transform,box-shadow] duration-300 ease-[var(--ease)]
                  hover:-translate-y-0.5 hover:shadow-[0_0_44px_-4px_rgba(83,247,251,0.9),inset_0_1px_0_rgba(255,255,255,0.6)]
                "
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--navy)] text-[var(--cyan)]">
                  <WhatsAppIcon size={19} />
                </span>
                Book a Call
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              {/* Email: click to copy, with a mailto fallback */}
              <div className="inline-flex h-14 items-center rounded-full border border-white/10 bg-white/[0.04] pl-5 pr-1.5 backdrop-blur-md">
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-2.5 pr-3 text-[14px] font-medium text-white/85 transition-colors hover:text-white"
                >
                  <Mail size={16} className="text-[var(--cyan)]" />
                  {site.email}
                </a>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={copied ? 'Email copied' : 'Copy email address'}
                  className={`
                    grid h-11 w-11 place-items-center rounded-full
                    transition-[background-color,color] duration-300
                    ${copied ? 'bg-[rgba(83,247,251,0.18)] text-[var(--cyan)]' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white'}
                  `}
                >
                  {copied ? <Check size={16} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <p aria-live="polite" className="-mt-3 h-4 text-[12px] text-[var(--cyan)]">
              {copied ? 'Email copied to clipboard' : ''}
            </p>

            <p className="-mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-[var(--muted)]">
              <Phone size={14} className="text-[var(--cyan)]" />
              Or call
              <a href={`tel:${site.phoneTel}`} className="font-semibold text-white underline-offset-4 hover:underline">
                {site.phone}
              </a>
              <span className="text-[var(--faint)]">· Mon–Sat, 10 AM – 7 PM</span>
            </p>
          </div>

          {/* ── Right: what happens next ──────────────── */}
          <div className="relative">
            <p className="mb-5 font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--faint)]">
              What happens next
            </p>

            <ol data-slide="right" data-slide-stagger className="relative m-0 flex list-none flex-col gap-3 p-0">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="
                    group relative flex gap-4 rounded-[22px]
                    border border-white/[0.07] bg-white/[0.025]
                    p-5
                    transition-[border-color,background-color] duration-500
                    hover:border-[rgba(83,247,251,0.25)] hover:bg-[rgba(83,247,251,0.04)]
                  "
                >
                  <span
                    className={`
                      grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border
                      font-[family-name:var(--font-display)] text-[13px] font-bold
                      ${
                        i === steps.length - 1
                          ? 'border-[rgba(255,122,80,0.4)] bg-[rgba(255,122,80,0.1)] text-[var(--amber)]'
                          : 'border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.08)] text-[var(--cyan)]'
                      }
                    `}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-white">
                      {step.title}
                    </span>
                    <span className="text-[13.5px] leading-[1.55] text-[var(--muted)]">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ============================================================
   FOOTER
============================================================ */

export function Footer() {
  const footerRef = useRef(null)
  const wordRef = useRef(null)
  const markRef = useRef(null)
  const [copied, copy] = useCopy(site.email)

  // Proof links follow the hero switcher (Real Estate / Hospital …)
  const { pillars } = useIndustry().config
  // Footer shows on every page, so links route (and scroll) via useGo
  const goTo = useGo()
  const go = (to) => (e) => {
    e.preventDefault()
    goTo(to)
  }

  // Giant wordmark rises into place as the footer scrolls in
  useGSAP(
    () => {
      gsap.fromTo(
        wordRef.current,
        { yPercent: 55, opacity: 0.2 },
        {
          yPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        },
      )
      // The mark swings upright alongside it
      gsap.fromTo(
        markRef.current,
        { rotate: -14, scale: 0.82 },
        {
          rotate: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        },
      )
    },
    { scope: footerRef },
  )

  const socials = [
    { label: 'Instagram', href: site.instagram, icon: <InstagramIcon /> },
    { label: 'Facebook', href: site.facebook, icon: <FacebookIcon /> },
    { label: 'LinkedIn', href: site.linkedin, icon: <LinkedInIcon /> },
    { label: 'WhatsApp', href: whatsappLink(), icon: <WhatsAppIcon size={18} /> },
  ]

  const heading = 'mb-5 max-sm:mb-3 font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--faint)]'
  const linkCls = `w-fit text-[14.5px] text-white/70 hover:text-white ${underline}`

  return (
    <>
      {/* ── Proof marquee (slides left → right) ─────────── */}
      <div className="marquee relative overflow-hidden border-y border-white/[0.06] bg-[#080d20] py-7 max-sm:py-5">
        <div className="marquee-track">
          {[0, 1].map((copyIndex) => (
            <ul
              key={copyIndex}
              aria-hidden={copyIndex === 1 || undefined}
              className="m-0 flex shrink-0 list-none items-center p-0"
            >
              {pillars.map((p) => (
                <li key={p.id} className="flex items-center">
                  <a
                    href={`/#${p.id}`}
                    onClick={go(`/#${p.id}`)}
                    tabIndex={copyIndex === 1 ? -1 : undefined}
                    className="
                      marquee-word
                      px-8
                      font-[family-name:var(--font-display)]
                      text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-none tracking-[-0.03em]
                      whitespace-nowrap
                    "
                  >
                    {p.label}
                  </a>
                  <span
                    aria-hidden="true"
                    className={p.tone === 'warm' ? 'text-[var(--amber)]' : 'text-[var(--cyan)]'}
                  >
                    <PillarIcon name={p.icon} size={26} />
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <footer
        ref={footerRef}
        className="relative overflow-hidden bg-[#070c1c] px-[var(--gutter)] pt-20 max-sm:pt-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(83,247,251,0.35)] to-transparent"
        />

        <div
          data-slide="up"
          data-slide-stagger
          className="relative z-[1] mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-12 max-sm:gap-y-8 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]"
        >
          {/* Brand */}
          <div className="col-span-2 flex flex-col items-start gap-5 max-sm:gap-4 lg:col-span-1">
            <Logo onClick={go('/')} size={34} />
            <p className="max-w-[300px] text-[14.5px] leading-[1.65] text-[var(--muted)]">
              Viral video for real estate. We don't sell leads —{' '}
              <span className="text-white">we build proof.</span>
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="
                    grid h-11 w-11 place-items-center rounded-full
                    border border-white/10 bg-white/[0.04] text-white/80
                    transition-[transform,color,border-color,box-shadow,background-color] duration-300 ease-[var(--ease)]
                    hover:-translate-y-1 hover:border-[rgba(83,247,251,0.5)] hover:bg-[rgba(83,247,251,0.08)]
                    hover:text-[var(--cyan)] hover:shadow-[0_10px_24px_-8px_rgba(83,247,251,0.55)]
                  "
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Office */}
            <div className="mt-1 grid w-full gap-4 border-t border-white/[0.07] pt-5 sm:grid-cols-2 lg:grid-cols-1">
              <a href={mapsLink()} target="_blank" rel="noreferrer" className="group flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--cyan)]" />
                <span className="text-[13px] leading-[1.6] text-[var(--muted)] transition-colors group-hover:text-white">
                  {site.address.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
              </a>
              <div className="flex gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-[var(--cyan)]" />
                <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] leading-[1.5]">
                  {site.hours.map(([d, t]) => (
                    <Fragment key={d}>
                      <dt className="text-[var(--faint)]">{d}</dt>
                      <dd className="m-0 text-white/80">{t}</dd>
                    </Fragment>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Proof */}
          <nav aria-label="Proof sections">
            <p className={heading}>The proof</p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {pillars.map((p) => (
                <li key={p.id}>
                  <a href={`/#${p.id}`} onClick={go(`/#${p.id}`)} className={linkCls}>
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Explore */}
          <nav aria-label="Footer">
            <p className={heading}>Explore</p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {pages.map(({ to, label }) => (
                <li key={to}>
                  <a href={to} onClick={go(to)} className={linkCls}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="col-span-2 sm:max-w-[420px] lg:col-span-1 lg:max-w-none">
            <p className={heading}>Start a project</p>
            <div className="flex flex-col gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="
                  group flex items-center justify-between gap-3 rounded-[18px]
                  border border-[rgba(83,247,251,0.25)] bg-[rgba(83,247,251,0.06)]
                  px-4 py-3.5
                  transition-[background-color,border-color] duration-300
                  hover:border-[rgba(83,247,251,0.5)] hover:bg-[rgba(83,247,251,0.1)]
                "
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--cyan)] text-[var(--navy)]">
                    <WhatsAppIcon size={17} />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-white">Chat on WhatsApp</span>
                    <span className="text-[12px] text-[var(--faint)]">Fastest way to reach us</span>
                  </span>
                </span>
                <ArrowUpRight size={16} className="text-[var(--cyan)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              <button
                type="button"
                onClick={copy}
                className="
                  group flex items-center justify-between gap-3 rounded-[18px]
                  border border-white/[0.08] bg-white/[0.03]
                  px-4 py-3.5 text-left
                  transition-[background-color,border-color] duration-300
                  hover:border-white/20 hover:bg-white/[0.06]
                "
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-[var(--cyan)]">
                    <Mail size={16} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[14px] font-medium text-white">{site.email}</span>
                    <span aria-live="polite" className={`text-[12px] ${copied ? 'text-[var(--cyan)]' : 'text-[var(--faint)]'}`}>
                      {copied ? 'Copied!' : 'Click to copy'}
                    </span>
                  </span>
                </span>
                {copied ? (
                  <Check size={16} className="text-[var(--cyan)]" />
                ) : (
                  <Copy size={15} className="text-white/50 transition-colors group-hover:text-white" />
                )}
              </button>

              <a
                href={`tel:${site.phoneTel}`}
                className="
                  group flex items-center justify-between gap-3 rounded-[18px]
                  border border-white/[0.08] bg-white/[0.03]
                  px-4 py-3.5
                  transition-[background-color,border-color] duration-300
                  hover:border-white/20 hover:bg-white/[0.06]
                "
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-[var(--cyan)]">
                    <Phone size={16} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[14px] font-medium text-white">{site.phone}</span>
                    <span className="text-[12px] text-[var(--faint)]">Tap to call</span>
                  </span>
                </span>
                <ArrowUpRight size={16} className="text-white/50 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-[1] mx-auto mt-16 flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] py-6 max-[600px]:mt-10 max-[600px]:justify-center max-[600px]:gap-3 max-[600px]:py-4 max-[600px]:text-center">
          <p className="text-[12.5px] tracking-[0.04em] text-[var(--faint)]">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="
              group inline-flex items-center gap-3
              font-[family-name:var(--font-display)] text-[12px] font-semibold uppercase tracking-[0.2em] text-white/60
              transition-colors hover:text-white
            "
          >
            Back to top
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition-[transform,border-color,color] duration-300 group-hover:-translate-y-1 group-hover:border-[rgba(83,247,251,0.5)] group-hover:text-[var(--cyan)]">
              <ArrowUp size={16} />
            </span>
          </button>
        </div>

        {/* Giant wordmark */}
        <div aria-hidden="true" className="pointer-events-none relative -mb-[0.18em] select-none overflow-hidden">
          <div
            ref={wordRef}
            className="
              flex items-center justify-center gap-[0.14em]
              font-[family-name:var(--font-display)]
              text-[clamp(4rem,16.5vw,17rem)] font-extrabold leading-[0.85] tracking-[-0.05em]
            "
          >
            <img
              ref={markRef}
              src={LOGO.mark}
              alt=""
              draggable="false"
              loading="lazy"
              decoding="async"
              className="
                h-[0.8em] w-auto shrink-0
                origin-bottom
                opacity-60
                [mask-image:linear-gradient(180deg,#000_0%,rgba(0,0,0,0.55)_55%,transparent_100%)]
                drop-shadow-[0_0_40px_rgba(83,247,251,0.35)]
              "
            />
            <span
              className="
                bg-[linear-gradient(180deg,rgba(83,247,251,0.22)_0%,rgba(83,247,251,0.06)_55%,transparent_100%)]
                bg-clip-text text-transparent
              "
            >
              AXAMP
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}

import { useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BrainCircuit, CalendarDays, Camera,
  HeartHandshake, Layers, Magnet, MessageCircleHeart, MousePointerClick, Quote,
  Scissors, Search, Send, TrendingUp,
} from 'lucide-react'

import PageHero from '../components/PageHero'
import ContentBento from '../components/ContentBento'
import { WhatsAppIcon } from '../components/icons'
import { founder, growth, principles, stats, team, workflow } from '../data/about'
import { whatsappLink } from '../data/site'
import { useGo } from '../lib/nav'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const icons = {
  magnet: Magnet, 'heart-chat': MessageCircleHeart, click: MousePointerClick, handshake: HeartHandshake,
  search: Search, calendar: CalendarDays, camera: Camera, scissors: Scissors,
  send: Send, trending: TrendingUp, brain: BrainCircuit, layers: Layers,
}

const Icon = ({ name, size = 20 }) => {
  const C = icons[name]
  return C ? <C size={size} strokeWidth={1.8} aria-hidden="true" /> : null
}

const pad = (n) => String(n).padStart(2, '0')

/* ── Shared section heading ─────────────────────────────────────── */
function Heading({ eyebrow, title, text, center }) {
  return (
    <header
      data-slide="up"
      className={`flex flex-col gap-3 ${center ? 'items-center text-center mx-auto' : ''} max-w-[640px]`}
    >
      <p className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
        <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent" />
        {eyebrow}
      </p>
      <h2 className="text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.08] font-[700] tracking-[-0.03em] text-[var(--text)] font-[family-name:var(--font-display)] text-balance">
        {title}
      </h2>
      {text && <p className="text-[clamp(15px,1.2vw,17px)] leading-[1.6] text-[var(--muted)]">{text}</p>}
    </header>
  )
}

const Section = ({ children, className = '' }) => (
  <section className={`relative px-[var(--gutter)] py-[clamp(72px,12vh,130px)] max-[640px]:py-10 ${className}`}>
    <div className="mx-auto max-w-[1180px]">{children}</div>
  </section>
)

/* ── Team: portrait cards, name + role over the photo ───────────── */
// A fresh random order on every visit (Fisher–Yates shuffle)
const shuffle = (list) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function TeamGrid({ members }) {
  const order = useMemo(() => shuffle(members), [members])
  return (
    <ul
      data-slide="up"
      data-slide-stagger
      className="m-0 mt-12 grid list-none grid-cols-2 gap-3 p-0 max-[640px]:mt-6 min-[640px]:grid-cols-3 min-[640px]:gap-4 min-[1024px]:grid-cols-6"
    >
      {order.map((m, i) => (
        <li key={m.photo}>
          <figure className="group relative m-0 aspect-[4/5] overflow-hidden rounded-[22px] border border-white/10 bg-[var(--navy-2)] shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease)] hover:-translate-y-1 hover:border-[rgba(83,247,251,0.45)] hover:shadow-[0_24px_50px_-24px_rgba(83,247,251,0.45)]">
            {/* Uncropped photos: a blurred copy fills the space around them */}
            {m.fit === 'contain' && (
              <img
                src={m.photo}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
              />
            )}
            <img
              src={m.photo}
              alt={m.name ? `${m.name}${m.role ? `, ${m.role}` : ''} at AXAMP` : 'AXAMP team member'}
              loading="lazy"
              decoding="async"
              className={
                m.fit === 'contain'
                  ? 'absolute inset-0 h-full w-full object-contain'
                  : 'absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.06]'
              }
            />
            {/* Shade so the name reads on any photo */}
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(0deg,rgba(5,8,26,0.92),rgba(5,8,26,0.45)_55%,transparent)]" />
            <span aria-hidden="true" className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-white/75 backdrop-blur-sm">
              {pad(i + 1)}
            </span>
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3.5 max-[640px]:p-3">
              <span className="font-[family-name:var(--font-display)] text-[16px] font-bold leading-tight text-white max-[640px]:text-[15px]">
                {m.name || 'AXAMP team'}
              </span>
              {m.role && <span className="text-[12px] font-semibold leading-snug text-[var(--cyan)]">{m.role}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}

/* ── Founder spotlight ──────────────────────────────────────────── */
function FounderSpotlight({ f }) {
  return (
    <article
      data-slide="up"
      className="
        group glass relative isolate overflow-hidden
        mt-12 max-[640px]:mt-6 grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center
        rounded-[32px]
        max-[900px]:grid-cols-1
      "
    >
      {/* Backdrop glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.16),transparent_65%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,122,80,0.10),transparent_65%)]" />

      {/* ── Photo ───────────────────────────────────── */}
      <div className="relative flex justify-center px-10 py-12 max-[900px]:pb-4 max-[600px]:px-6 max-[600px]:pt-10">
        {/* Faint grid behind the portrait */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(circle_at_50%_50%,#000_20%,transparent_70%)]"
        />

        <div className="relative">
          {/* Orbiting gradient frame */}
          <div className="cta-border rounded-[30px] p-[2px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),0_0_60px_-18px_rgba(83,247,251,0.55)]">
            <div className="h-[320px] w-[300px] overflow-hidden rounded-[28px] bg-[var(--navy)] max-[600px]:h-[256px] max-[600px]:w-[240px]">
              <img
                src={f.photo}
                alt={f.name}
                width={300}
                height={320}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[50%_25%] transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.05]"
              />
            </div>
          </div>

          {/* Floating badges */}
          {f.badges.map((b, i) => (
            <div
              key={b.label}
              className={`
                perf-float glass absolute flex items-center gap-2 rounded-2xl px-3.5 py-2.5
                ${i === 0 ? '-right-8 top-8 max-[600px]:-right-4' : 'perf-float--late -left-8 bottom-10 max-[600px]:-left-4'}
              `}
            >
              <span className="font-[family-name:var(--font-display)] text-[22px] font-[800] leading-none tracking-[-0.03em] text-[var(--cyan)]">
                {b.value}
              </span>
              <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-white/70">
                {b.label}
              </span>
            </div>
          ))}

          {/* Verified tag */}
          <span className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(83,247,251,0.4)] bg-[var(--navy)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cyan)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
            <BadgeCheck size={14} aria-hidden="true" />
            Founder
          </span>
        </div>
      </div>

      {/* ── Details ─────────────────────────────────── */}
      <div className="relative flex flex-col gap-6 px-10 py-12 pl-4 max-[900px]:px-8 max-[900px]:pt-6 max-[600px]:px-6 max-[600px]:pb-8">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(2rem,3.6vw,3.2rem)] font-[800] leading-[1.02] tracking-[-0.035em] text-white">
            {f.name}
          </h3>
          <p className="mt-2 text-[15px] font-semibold text-[var(--cyan)]">{f.role}</p>
        </div>

        {/* Pull quote */}
        <blockquote className="relative m-0 border-l-2 border-[var(--amber)] pl-5">
          <Quote size={22} aria-hidden="true" className="absolute -top-1 right-0 text-[rgba(255,122,80,0.35)]" />
          <p className="pr-8 font-[family-name:var(--font-display)] text-[clamp(1.15rem,1.7vw,1.45rem)] font-[600] leading-[1.35] tracking-[-0.01em] text-white">
            {f.quote}
          </p>
        </blockquote>

        <p className="max-w-[560px] text-[15.5px] leading-[1.75] text-[var(--muted)]">{f.bio}</p>

        {/* Expertise */}
        <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 max-[600px]:grid-cols-1">
          {f.skills.map((s) => (
            <li
              key={s.label}
              className="
                flex flex-col gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-4
                transition-[border-color,background-color,transform] duration-300 ease-[var(--ease)]
                hover:-translate-y-0.5 hover:border-[rgba(83,247,251,0.4)] hover:bg-[rgba(83,247,251,0.06)]
                max-[600px]:flex-row max-[600px]:items-center
              "
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[rgba(83,247,251,0.35)] bg-[rgba(83,247,251,0.08)] text-[var(--cyan)]">
                <Icon name={s.icon} size={17} />
              </span>
              <span className="text-[13.5px] font-semibold leading-snug text-white/90">{s.label}</span>
            </li>
          ))}
        </ul>

        {/* Sectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">Sectors</span>
          {f.sectors.map((s) => (
            <span key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12.5px] font-medium text-white/80">
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

/* ── How we work: line fills as you scroll, steps light up ──────── */
function Workflow() {
  const ref = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.wf-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.wf-list', start: 'top 65%', end: 'bottom 65%', scrub: 0.5 },
        },
      )
      gsap.utils.toArray('.wf-step', ref.current).forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          end: 'max',
          toggleClass: { targets: step, className: 'is-lit' },
        })
      })
    },
    { scope: ref },
  )

  return (
    <Section>
      <div ref={ref} className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[640px]:gap-8">
        <div className="min-[901px]:sticky min-[901px]:top-[22vh] self-start">
          <Heading
            eyebrow="How we work"
            title="From first research to steady results."
            text="One clear pipeline for every brand — so nothing is guessed and everything is measured."
          />
        </div>

        <ol className="wf-list relative m-0 list-none p-0">
          {/* Track + scroll-driven fill */}
          <span aria-hidden="true" className="absolute left-[27px] top-2 bottom-2 w-px bg-white/[0.08]" />
          <span
            aria-hidden="true"
            className="wf-fill absolute left-[27px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[var(--cyan)] via-[var(--cyan)] to-[var(--amber)] shadow-[0_0_12px_rgba(83,247,251,0.6)]"
          />

          {workflow.map((s, i) => (
            <li key={s.title} className="wf-step group relative flex gap-6 pb-10 last:pb-0 max-[640px]:gap-4 max-[640px]:pb-7">
              <span
                className="
                  relative z-[1] grid h-14 w-14 shrink-0 place-items-center rounded-2xl
                  border border-white/10 bg-[var(--navy-2)] text-white/45
                  transition-[color,border-color,box-shadow,background-color] duration-500 ease-[var(--ease)]
                  group-[.is-lit]:border-[rgba(83,247,251,0.55)] group-[.is-lit]:bg-[rgba(83,247,251,0.10)]
                  group-[.is-lit]:text-[var(--cyan)] group-[.is-lit]:shadow-[0_0_26px_-6px_rgba(83,247,251,0.7)]
                "
              >
                <Icon name={s.icon} size={22} />
              </span>

              <div className="pt-1.5 opacity-50 transition-opacity duration-500 group-[.is-lit]:opacity-100">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--faint)]">STEP {pad(i + 1)}</p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.25rem,1.8vw,1.5rem)] font-[700] tracking-[-0.02em] text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 max-w-[440px] text-[15px] leading-[1.6] text-[var(--muted)]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

export default function About() {
  const go = useGo()

  return (
    <>
      {/* ── Hero + numbers ─────────────────────────────── */}
      <PageHero
        eyebrow="About AXAMP"
        title={['Building brands,', 'not just campaigns.']}
        text="Elevate your status with futuristic digital marketing — AI-driven strategy and real, raw storytelling people actually watch."
        secondary={{ label: 'See our work', to: '/#area' }}
      >
        <dl
          data-slide="up"
          data-slide-stagger
          className="mt-10 grid w-full max-w-[820px] grid-cols-3 gap-3 max-[640px]:mt-6 max-[640px]:gap-2"
        >
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-[22px] px-5 py-6 text-center max-[640px]:rounded-[18px] max-[640px]:px-2 max-[640px]:py-4">
              <dt className="sr-only">{s.label}</dt>
              <dd className="m-0 font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3rem)] font-[800] leading-none tracking-[-0.04em] bg-[linear-gradient(120deg,var(--cyan),#e6feff)] bg-clip-text text-transparent">
                {s.value}
              </dd>
              <p aria-hidden="true" className="mt-2 text-[13px] leading-snug text-[var(--muted)] max-[640px]:text-[11.5px]">{s.label}</p>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* ── Founders ───────────────────────────────────── */}
      <Section>
        <Heading eyebrow="Meet the founder" title="The mind behind the magic." />
        <FounderSpotlight f={founder} />
      </Section>

      {/* ── Team ───────────────────────────────────────── */}
      <Section className="!pt-0">
        <Heading
          center
          eyebrow="Meet the team"
          title="The people behind your growth."
          text="Strategists, creators, designers and developers — one team that plans, shoots, codes and ships for every brand we grow."
        />
        <TeamGrid members={team} />
      </Section>

      {/* ── Content principles ─────────────────────────── */}
      <Section className="bg-[linear-gradient(180deg,transparent,rgba(15,24,54,0.6)_20%,rgba(15,24,54,0.6)_80%,transparent)]">
        <Heading
          center
          eyebrow="Content that matters"
          title="Real, raw, storytelling, fun and relatable."
        />
        <ContentBento items={principles} />
      </Section>

      {/* ── Audience growth ────────────────────────────── */}
      <Section>
        <Heading
          center
          eyebrow="Audience growth"
          title="How we grow your audience."
          text="Four steps, in order — from a stranger scrolling past to a loyal follower."
        />

        <div className="relative mt-14 max-[640px]:mt-8">
          {/* Connector with a travelling pulse (desktop) */}
          <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[34px] h-px overflow-hidden bg-white/[0.08] max-[900px]:hidden">
            <span className="about-pulse absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
          </div>

          <ol data-slide="up" data-slide-stagger className="relative m-0 grid list-none grid-cols-4 gap-5 p-0 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1 max-[480px]:gap-8">
            {growth.map((g, i) => {
              const warm = i === growth.length - 1
              return (
                <li key={g.title} className="flex flex-col items-center text-center">
                  <span
                    className={`
                      relative grid h-[68px] w-[68px] place-items-center rounded-full border bg-[var(--navy)]
                      ${warm
                        ? 'border-[rgba(255,122,80,0.5)] text-[var(--amber)] shadow-[0_0_30px_-6px_rgba(255,122,80,0.6)]'
                        : 'border-[rgba(83,247,251,0.45)] text-[var(--cyan)] shadow-[0_0_30px_-8px_rgba(83,247,251,0.6)]'}
                    `}
                  >
                    <Icon name={g.icon} size={24} />
                    <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--navy-3)] text-[10px] font-bold text-white/80 ring-1 ring-white/10">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 max-[640px]:mt-3 font-[family-name:var(--font-display)] text-[22px] font-[800] tracking-[-0.02em] text-white">
                    {g.title}
                  </h3>
                  <p className="mt-2 max-w-[240px] text-[14.5px] leading-[1.6] text-[var(--muted)]">{g.text}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </Section>

      {/* ── How we work ────────────────────────────────── */}
      <Workflow />

      {/* ── Call to action ─────────────────────────────── */}
      <Section className="!pt-0">
        <div
          data-slide="scale"
          className="relative overflow-hidden rounded-[32px] border border-[rgba(83,247,251,0.2)] bg-[linear-gradient(135deg,rgba(83,247,251,0.10),rgba(15,24,54,0.9)_45%,rgba(255,122,80,0.10))] px-8 py-14 text-center max-[600px]:px-6 max-[600px]:py-10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_260px_at_50%_0%,rgba(83,247,251,0.14),transparent_70%)]" />
          <h2 className="relative font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.4vw,2.8rem)] font-[800] leading-[1.1] tracking-[-0.03em] text-white text-balance">
            Ready to build a brand people trust?
          </h2>
          <p className="relative mx-auto mt-3 max-w-[520px] text-[16px] leading-[1.6] text-[var(--muted)]">
            Tell us about your business — we'll map the content that moves it.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] pl-1.5 pr-5 font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--navy)] shadow-[0_0_26px_-6px_rgba(83,247,251,0.7)] transition-transform duration-300 hover:-translate-y-px"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--navy)] text-[var(--cyan)]">
                <WhatsAppIcon size={17} />
              </span>
              Book a Call
              <ArrowUpRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href="/packages"
              onClick={(e) => {
                e.preventDefault()
                go('/packages')
              }}
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 font-[family-name:var(--font-display)] text-[14px] font-semibold text-white transition-[border-color,background-color] duration-300 hover:border-[rgba(83,247,251,0.5)] hover:bg-white/[0.07]"
            >
              See packages
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}





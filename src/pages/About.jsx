import { useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowRight, ArrowUpRight, Award, BadgeCheck, BrainCircuit, CalendarDays, Camera,
  HeartHandshake, Layers, Magnet, MessageCircleHeart, MousePointerClick,
  Rocket, Scissors, Search, Send, TrendingUp,
} from 'lucide-react'

import PageHero from '../components/PageHero'
import ContentCarousel from '../components/ContentCarousel'
import { LinkedInIcon, WhatsAppIcon } from '../components/icons'
import { cmo, growth, principles, stats, team, teamSlots, workflow } from '../data/about'
import { site, whatsappLink } from '../data/site'
import { useGo } from '../lib/nav'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const icons = {
  magnet: Magnet, 'heart-chat': MessageCircleHeart, click: MousePointerClick, handshake: HeartHandshake,
  search: Search, calendar: CalendarDays, camera: Camera, scissors: Scissors,
  send: Send, trending: TrendingUp, brain: BrainCircuit, layers: Layers,
  award: Award, rocket: Rocket,
}

// Founder photo badges: one colour each ("r, g, b") + where they sit on the frame
const badgeLook = [
  { tone: '83, 247, 251', place: '-right-16 -top-9 max-[1100px]:-right-7 max-[1023px]:-right-16 max-[600px]:-right-5 max-[600px]:-top-7' },
  { tone: '255, 122, 80', place: 'perf-float--late -left-10 bottom-14 max-[1100px]:-left-6 max-[1023px]:-left-10 max-[600px]:-left-5 max-[600px]:bottom-12' },
]

const Icon = ({ name, size = 20 }) => {
  const C = icons[name]
  return C ? <C size={size} strokeWidth={1.8} aria-hidden="true" /> : null
}

const pad = (n) => String(n).padStart(2, '0')

/* ── Shared section heading ─────────────────────────────────────── */
// `oneLine` keeps the title on a single line (it still wraps on phones).
// `text` can be a list of paragraphs: the first reads as a brighter lead.
function Heading({ eyebrow, title, text, center, oneLine = false }) {
  const paragraphs = Array.isArray(text) ? text : text ? [text] : []
  const lead = paragraphs.length > 1
  return (
    <header
      data-slide="up"
      className={`flex flex-col gap-3 ${center ? 'items-center text-center mx-auto' : ''} ${oneLine ? 'max-w-[1100px]' : 'max-w-[640px]'}`}
    >
      <p className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
        <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent" />
        {eyebrow}
      </p>
      <h2 className={`text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.08] font-[700] tracking-[-0.03em] text-[var(--text)] font-[family-name:var(--font-display)] text-balance ${oneLine ? 'md:whitespace-nowrap' : ''}`}>
        {title}
      </h2>
      {lead ? (
        <div className="mt-2 flex max-w-[760px] flex-col gap-4 max-[640px]:mt-1 max-[640px]:gap-3">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`m-0 text-pretty ${
                i === 0
                  ? 'text-[clamp(16px,1.35vw,19px)] leading-[1.6] text-[rgba(255,255,255,0.86)]'
                  : 'text-[clamp(14.5px,1.1vw,16.5px)] leading-[1.7] text-[var(--muted)]'
              }`}
            >
              {p}
            </p>
          ))}
        </div>
      ) : (
        paragraphs.map((p, i) => (
          <p key={i} className={`text-[clamp(15px,1.2vw,17px)] leading-[1.6] text-[var(--muted)] ${oneLine ? 'max-w-[720px]' : ''}`}>{p}</p>
        ))
      )}
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

function TeamGrid({ members, slots }) {
  const order = useMemo(() => shuffle(members), [members])
  // Keep full rows of 5: pad with blank boxes up to `slots` (or the next row of 5)
  const blanks = Math.max(slots, Math.ceil(order.length / 5) * 5) - order.length
  return (
    <ul
      data-slide="up"
      data-slide-stagger
      className="m-0 mt-12 grid list-none grid-cols-2 gap-3 p-0 max-[640px]:mt-6 min-[640px]:gap-4 min-[768px]:grid-cols-5"
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
      {/* Open seats: same box, no photo */}
      {Array.from({ length: blanks }, (_, i) => (
        <li key={`blank-${i}`} aria-hidden="true">
          <div className="aspect-[4/5] rounded-[22px] border border-dashed border-white/15 bg-white/[0.03]" />
        </li>
      ))}
    </ul>
  )
}

/* ── Founder spotlight ──────────────────────────────────────────── */
// "7+ years", "20+ brands" … in the bio stand out in white
const highlightFigures = (text) =>
  text.split(/(\d+\+\s\w+)/g).map((part, i) =>
    i % 2 ? <strong key={i} className="whitespace-nowrap font-semibold text-white">{part}</strong> : part,
  )


function FounderSpotlight({ f }) {
  return (
    <article
      data-slide="up"
      className="
        group glass relative isolate overflow-hidden
        mt-12 max-[640px]:mt-6 grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)]
        rounded-[32px] max-[600px]:rounded-[26px]
        max-[1023px]:grid-cols-1
      "
    >
      {/* Backdrop glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.16),transparent_65%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,122,80,0.10),transparent_65%)]" />

      {/* ── Photo ───────────────────────────────────── */}
      <div className="relative flex items-center justify-center px-10 py-12 min-[1024px]:border-r min-[1024px]:border-white/[0.06] max-[1023px]:pb-6 max-[600px]:px-6 max-[600px]:pt-12">
        {/* Faint grid behind the portrait */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(circle_at_50%_50%,#000_20%,transparent_70%)]"
        />

        <div className="relative">
          {/* Orbiting gradient frame */}
          <div className="cta-border rounded-[30px] p-[2px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),0_0_60px_-18px_rgba(83,247,251,0.55)]">
            <div className="aspect-[15/16] w-[300px] overflow-hidden rounded-[28px] bg-[var(--navy)] max-[1100px]:w-[250px] max-[1023px]:w-[300px] max-[600px]:w-[240px]">
              <img
                src={f.photo}
                alt={`${f.name}, ${f.role} at AXAMP`}
                width={300}
                height={320}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[50%_25%] transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.05]"
              />
            </div>
          </div>

          {/* Floating badges — solid so they read over any part of the photo */}
          {f.badges.map((b, i) => {
            const { tone, place } = badgeLook[i % badgeLook.length]
            return (
              <div
                key={b.label}
                style={{ '--tone': tone }}
                className={`
                  perf-float absolute z-[1] flex items-center gap-3 rounded-[18px] py-2.5 pl-2.5 pr-4
                  border border-[rgba(var(--tone),0.4)]
                  bg-[linear-gradient(145deg,rgba(22,32,70,0.97),rgba(8,13,32,0.97))]
                  shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9),0_0_32px_-10px_rgba(var(--tone),0.55),inset_0_1px_0_rgba(255,255,255,0.08)]
                  max-[600px]:gap-2 max-[600px]:rounded-2xl max-[600px]:py-2 max-[600px]:pl-2 max-[600px]:pr-3
                  ${place}
                `}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgba(var(--tone),0.35)] bg-[rgba(var(--tone),0.12)] text-[rgb(var(--tone))] max-[600px]:h-8 max-[600px]:w-8 max-[600px]:rounded-[10px]">
                  <Icon name={b.icon} size={18} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-[family-name:var(--font-display)] text-[28px] font-[800] leading-none tracking-[-0.03em] text-[rgb(var(--tone))] [text-shadow:0_0_18px_rgba(var(--tone),0.45)] max-[600px]:text-[21px]">
                    {b.value}
                  </span>
                  <span className="whitespace-nowrap text-[10.5px] font-bold uppercase leading-none tracking-[0.14em] text-white/85 max-[600px]:text-[9px] max-[600px]:tracking-[0.1em]">
                    {b.label}
                  </span>
                </span>
              </div>
            )
          })}

          {/* Verified tag */}
          <span className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(83,247,251,0.4)] bg-[var(--navy)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cyan)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
            <BadgeCheck size={14} aria-hidden="true" />
            {f.tag || 'Founder'}
          </span>
        </div>
      </div>

      {/* ── Details — compact and skimmable ─────────── */}
      <div className="relative flex flex-col justify-center gap-5 px-11 py-11 max-[1100px]:px-8 max-[1023px]:items-center max-[1023px]:pb-8 max-[1023px]:pt-5 max-[1023px]:text-center max-[600px]:gap-4 max-[600px]:px-5 max-[600px]:pb-6">
        {/* Role + name — centred under the photo on one-column layouts */}
        <header className="flex flex-col gap-2 max-[1023px]:items-center max-[1023px]:text-center">
          <p className="m-0 text-[11.5px] font-bold uppercase leading-[1.5] tracking-[0.16em] text-[var(--cyan)] max-[600px]:text-[10.5px] max-[600px]:tracking-[0.12em]">
            <span aria-hidden="true" className="mr-2 inline-block h-1.5 w-1.5 -translate-y-[2px] rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]" />
            {f.role}
          </p>
          <h3 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3vw,2.6rem)] font-[800] leading-[1.05] tracking-[-0.035em] text-white">
            {f.name}
          </h3>
        </header>

        <blockquote className="m-0 border-l-[3px] border-[var(--amber)] pl-4 font-[family-name:var(--font-display)] text-[clamp(1.05rem,1.45vw,1.25rem)] font-[600] leading-[1.4] tracking-[-0.01em] text-white max-[1023px]:max-w-[520px] max-[1023px]:border-l-0 max-[1023px]:pl-0">
          <span aria-hidden="true" className="text-[var(--amber)]">“</span>
          {f.quote}
          <span aria-hidden="true" className="text-[var(--amber)]">”</span>
        </blockquote>

        <p className="m-0 max-w-[580px] text-[15px] leading-[1.7] text-[var(--muted)]">{highlightFigures(f.bio)}</p>

        {/* Expertise — small pills instead of tall tiles */}
        <ul aria-label="Expertise" className="m-0 flex list-none flex-wrap gap-2 p-0 max-[1023px]:justify-center max-[600px]:grid max-[600px]:w-full max-[600px]:grid-cols-3">
          {f.skills.map((s) => (
            <li
              key={s.label}
              className="
                inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5
                border border-[rgba(83,247,251,0.22)] bg-[rgba(83,247,251,0.06)]
                text-[13px] font-semibold text-white/90
                transition-[border-color,background-color] duration-300
                hover:border-[rgba(83,247,251,0.5)] hover:bg-[rgba(83,247,251,0.11)]
                max-[600px]:flex-col max-[600px]:justify-center max-[600px]:gap-1.5 max-[600px]:rounded-2xl max-[600px]:px-1.5 max-[600px]:py-2.5 max-[600px]:text-[11.5px] max-[600px]:leading-tight
              "
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[rgba(83,247,251,0.14)] text-[var(--cyan)]">
                <Icon name={s.icon} size={14} />
              </span>
              {s.label}
            </li>
          ))}
        </ul>

        {/* Sectors — one quiet line */}
        <div className="flex flex-wrap items-center gap-1.5 max-[1023px]:justify-center">
          <span className="mr-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--faint)]">Sectors</span>
          <ul aria-label="Sectors" className="contents">
            {f.sectors.map((s) => (
              <li key={s} className="list-none rounded-md bg-white/[0.05] px-2 py-0.5 text-[12px] font-medium text-white/70">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Next step */}
        <div className="mt-1 flex items-center gap-2.5 max-[1023px]:justify-center max-[600px]:self-stretch">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="group/cta inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] px-5 font-[family-name:var(--font-display)] text-[14.5px] font-[700] text-[var(--navy)] shadow-[0_0_28px_-8px_rgba(83,247,251,0.8)] transition-transform duration-300 hover:-translate-y-0.5 max-[600px]:flex-1"
          >
            <WhatsAppIcon size={17} />
            Start a project
            <ArrowRight size={15} className="transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden="true" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="Follow AXAMP on LinkedIn"
            title="Follow AXAMP on LinkedIn"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-white/80 transition-[border-color,color,background-color] duration-300 hover:border-[rgba(83,247,251,0.45)] hover:bg-[rgba(83,247,251,0.06)] hover:text-[var(--cyan)]"
          >
            <LinkedInIcon size={17} />
          </a>
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

      {/* ── CMO spotlight ──────────────────────────────── */}
      {/* Founder section hidden for now — to bring it back, import `founder` and render
          <Heading eyebrow="Meet the founder" title="The mind behind the magic." />
          <FounderSpotlight f={founder} /> */}
      <Section>
        <Heading eyebrow="Meet our CMO" title="The strategist behind our growth." />
        <FounderSpotlight f={cmo} />
      </Section>

      {/* ── Team ───────────────────────────────────────── */}
      <Section className="!pt-0">
        <Heading
          center
          oneLine
          eyebrow="Meet Our Core Team"
          title="The people driving AXAMP forward."
          text={[
            'From strategic leadership and creative direction to website design, development, coding, digital marketing, n8n workflow automation, and viral video creation and editing, meet the key people turning ideas into impactful digital experiences and measurable business growth.',
            'Our core team brings together technology, creativity, branding, SEO, social media, performance marketing, video production and intelligent automation to build powerful websites, create engaging content, strengthen brand presence, streamline business operations and help businesses reach the right audience — backed by a wider team of talented professionals.',
          ]}
        />
        <TeamGrid members={team} slots={teamSlots} />
      </Section>

      {/* ── Content principles ─────────────────────────── */}
      {/* overflow-x-clip: the circle's side cards (and its full-width stage on
          desktop) reach past the screen edge — without it phones can pan sideways */}
      <Section className="overflow-x-clip bg-[linear-gradient(180deg,transparent,rgba(15,24,54,0.6)_20%,rgba(15,24,54,0.6)_80%,transparent)]">
        <Heading
          center
          eyebrow="Content that matters"
          oneLine
          title={<>Real, relatable, storytelling,<br />hook and call to action.</>}
        />
        <ContentCarousel items={principles} />
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





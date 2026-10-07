import {
  CalendarCheck,
  Check,
  CheckCheck,
  Clapperboard,
  Compass,
  Database,
  FileCheck2,
  FileText,
  Handshake,
  Headset,
  Infinity as InfinityIcon,
  Mail,
  MapPin,
  MapPinCheck,
  Phone,
  PhoneCall,
  Play,
  Trophy,
  UserPlus,
} from 'lucide-react'

import { scrollToTarget } from '../lib/scroll'
import { PillarIcon, WhatsAppIcon } from './icons'
import { COPY } from './LeadEngineAdmission'
import { GoogleG, Orb, Shell, Tag, pad } from './LeadEngineParts'

/* ============================================================
   THE LEAD ENGINE, PHONES / TABLETS
   Each desktop diagram condensed to its main points: icons and
   one-liners, joined by flowing connectors.
   Real estate: 3 sources → WhatsApp API → instant reply → proof
   → convert. University / hospital: 3 sources → WhatsApp + email
   → call form → admission.
   Every block fades in via [data-anim="m-block"] (LeadEngine.jsx).
============================================================ */

/* ─── Shared pieces ─────────────────────────────────────────────── */

function Stage({ n, title, sub }) {
  return (
    <div data-anim="m-block" className="mb-2.5 flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[rgba(83,247,251,0.6)] bg-[var(--navy)] font-[family-name:var(--font-display)] text-[11px] font-bold text-[var(--cyan)] shadow-[0_0_16px_-2px_rgba(83,247,251,0.6)]">
        {pad(n)}
      </span>
      <span className="shrink-0 font-[family-name:var(--font-display)] text-[12.5px] font-bold uppercase tracking-[0.2em] text-white">{title}</span>
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-gradient-to-r from-white/15 to-transparent" />
      <span className="truncate text-[11.5px] text-[var(--faint)]">{sub}</span>
    </div>
  )
}

// Small stage tag inside a card that a connector runs straight into
const Eyebrow = ({ n, children }) => (
  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">
    {pad(n)} · {children}
  </p>
)

/* A lead flowing down to the next block */
function Drop({ color = '#53f7fb' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 32" className="mx-auto block h-8 w-3 overflow-visible">
      <line x1="6" y1="0" x2="6" y2="26" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      <line x1="6" y1="0" x2="6" y2="26" stroke={color} strokeWidth="2" strokeLinecap="round" className="le-flow le-glow" />
      <path d="M2 24 L6 29 L10 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Three tiles merging into one line */
function Merge({ colors }) {
  const paths = ['M50,0 C50,26 150,18 150,44', 'M150,0 L150,44', 'M250,0 C250,26 150,18 150,44']
  return (
    <svg aria-hidden="true" viewBox="0 0 300 48" preserveAspectRatio="none" className="block h-11 w-full overflow-visible">
      {paths.map((d, i) => (
        <g key={d}>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" stroke={colors[i]} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="le-flow" />
        </g>
      ))}
    </svg>
  )
}

/* Three channels / options side by side */
function Tiles({ items }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((s) => (
        <Shell key={s.title} anim="m-block" tone={s.tone}>
          <div className="flex h-full flex-col items-center gap-2 px-1.5 py-3 text-center">
            <Orb tone={s.tone} size="h-10 w-10">{s.icon}</Orb>
            <div>
              <p className="font-[family-name:var(--font-display)] text-[13px] font-bold leading-tight text-white">{s.title}</p>
              <p className="mt-0.5 text-[10.5px] leading-tight text-[var(--faint)]">{s.note}</p>
            </div>
            {s.tag && <Tag>{s.tag}</Tag>}
          </div>
        </Shell>
      ))}
    </div>
  )
}

/* The closing steps, threaded down to a gold finish.
   `head` labels the stage inside the card when a connector runs into it. */
function Steps({ steps, final, head }) {
  const [FinalIcon, finalTitle, finalText] = final
  return (
    <Shell anim="m-block" tone="cyan">
      {head && (
        <div className="px-4 pt-3.5">
          <Eyebrow n={head[0]}>
            {head[1]} <span className="font-semibold normal-case tracking-normal text-[var(--faint)]">— {head[2]}</span>
          </Eyebrow>
        </div>
      )}
      <ol className={`m-0 flex list-none flex-col p-4 ${head ? "pt-2.5" : ""}`}>
        {steps.map(([Icon, title, text]) => (
          <li key={title} className="relative flex gap-3 pb-3.5">
            {/* Thread to the next step */}
            <span aria-hidden="true" className="absolute bottom-0 left-5 top-11 w-px bg-gradient-to-b from-[rgba(83,247,251,0.5)] to-[rgba(83,247,251,0.1)]" />
            <Orb tone="cyan" size="h-10 w-10">
              <Icon size={18} aria-hidden="true" />
            </Orb>
            <div className="min-w-0 pt-0.5 leading-tight">
              <p className="font-[family-name:var(--font-display)] text-[14px] font-bold text-white">{title}</p>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">{text}</p>
            </div>
          </li>
        ))}
        <li className="deal-card flex items-center gap-3 rounded-[16px] bg-[linear-gradient(120deg,rgba(255,209,102,0.16),rgba(255,159,67,0.06))] p-2.5 ring-1 ring-[rgba(255,190,90,0.5)]">
          <Orb tone="gold" size="h-10 w-10">
            <FinalIcon size={18} aria-hidden="true" />
          </Orb>
          <div className="min-w-0 leading-tight">
            <p className="font-[family-name:var(--font-display)] text-[14px] font-bold text-[#ffe0ae]">{finalTitle}</p>
            <p className="mt-0.5 text-[12px] text-[#ffe0ae]/70">{finalText}</p>
          </div>
        </li>
      </ol>
    </Shell>
  )
}

const Live = () => (
  <span className="flex items-center gap-1 rounded-full bg-[rgba(37,211,102,0.14)] px-2 py-0.5 text-[10px] font-semibold text-[#3ee07f]">
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ee07f]" /> Live
  </span>
)

/* ============================================================
   REAL ESTATE
============================================================ */

const ESTATE_SOURCES = [
  { tone: 'cyan', icon: <Clapperboard size={18} aria-hidden="true" />, title: 'Content', note: 'Proof reels', tag: 'Organic' },
  { tone: 'blue', icon: <InfinityIcon size={20} strokeWidth={2.6} aria-hidden="true" />, title: 'Meta Ads', note: 'FB & Insta', tag: 'Paid' },
  { tone: 'google', icon: <GoogleG size={18} />, title: 'Google Ads', note: 'Search · YT', tag: 'Paid' },
]

const ESTATE_OPTIONS = [
  [FileText, 'Project details'],
  [MapPin, 'Book a visit'],
  [Phone, 'Talk to agent'],
]

const ESTATE_STEPS = [
  [CalendarCheck, 'Slot booking', 'Picks a call or visit slot on WhatsApp'],
  [Headset, 'AI + agent calling', 'AI confirms in minutes, your agent follows up'],
  [MapPinCheck, 'Site visit confirmed', 'Reminders sent, the visit is locked in'],
]

// Short names so five fit in a row
const proofLabel = { 'site-visit': 'Site visit', project: 'Project', reviews: 'Reviews' }

export function EstateMobile({ proof }) {
  return (
    <div className="mx-auto max-w-[520px]">
      {/* 01 Capture: three ways in */}
      <Stage n={1} title="Capture" sub="3 ways in" />
      <Tiles items={ESTATE_SOURCES} />
      <Merge colors={['#53f7fb', '#4f9bff', '#fbbc05']} />

      {/* 02 Sync: one inbox */}
      <Shell anim="m-block" tone="cyan">
        <div className="flex items-center gap-3.5 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#53f7fb] to-[#2bb6d8] text-[var(--navy)] shadow-[0_0_26px_-2px_rgba(83,247,251,0.8)]">
            <Database size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <Eyebrow n={2}>Sync</Eyebrow>
            <div className="flex items-center gap-2">
              <p className="font-[family-name:var(--font-display)] text-[16px] font-bold leading-tight text-white">WhatsApp API</p>
              <Live />
            </div>
            <p className="text-[12px] text-[var(--muted)]">Every lead synced in real time</p>
          </div>
        </div>
      </Shell>
      <Drop color="#25d366" />

      {/* 03 Instant reply: the WhatsApp chat, then the proof videos */}
      <Stage n={3} title="Instant reply" sub="on WhatsApp" />
      <Shell anim="m-block" tone="green">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2.5">
            <Orb tone="green" size="h-10 w-10">
              <WhatsAppIcon size={19} />
            </Orb>
            <div className="flex-1 leading-tight">
              <p className="flex items-center gap-1 font-[family-name:var(--font-display)] text-[14px] font-semibold text-white">
                Project Sales
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#25d366]" aria-hidden="true">
                  <Check size={9} strokeWidth={3.5} className="text-[#0b141a]" />
                </span>
              </p>
              <p className="text-[11px] text-[#25d366]">replies instantly</p>
            </div>
            <span className="rounded-full bg-[#25d366]/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#25d366]">Instant</span>
          </div>

          <div className="w-fit max-w-[92%] rounded-[14px] rounded-tl-[4px] bg-[#202c33] px-3 py-2 text-[13px] leading-[1.45] text-white/90">
            Hi 👋 Thanks for your enquiry! How would you like to continue?
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-white/40">
              just now <CheckCheck size={12} className="text-[#53bdeb]" aria-hidden="true" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {ESTATE_OPTIONS.map(([Icon, label]) => (
              <span
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-[12px] border border-white/[0.05] bg-[#202c33] px-1 py-2.5 text-center text-[11.5px] font-semibold leading-tight text-[#00d47e]"
              >
                <Icon size={16} aria-hidden="true" /> {label}
              </span>
            ))}
          </div>
        </div>
      </Shell>
      <Drop color="#25d366" />

      <Shell anim="m-block" tone="green">
        <div className="p-3.5">
          <div className="flex items-center gap-2.5">
            <Orb tone="green" size="h-9 w-9">
              <Play size={15} fill="currentColor" aria-hidden="true" />
            </Orb>
            <div className="flex-1 leading-tight">
              <p className="font-[family-name:var(--font-display)] text-[15px] font-bold text-white">Proof videos</p>
              <p className="text-[11.5px] text-[var(--faint)]">Auto-sent on “Project details”</p>
            </div>
            <CheckCheck size={16} className="text-[#3ee07f]" aria-hidden="true" />
          </div>
          <div className="mt-3 grid grid-cols-5">
            {proof.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => scrollToTarget(`#${p.id}`)}
                className="flex flex-col items-center gap-1.5 text-center"
                aria-label={`See ${p.label} proof`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full ring-1 ${
                    p.tone === 'warm'
                      ? 'bg-[rgba(255,179,71,0.12)] text-[var(--amber)] ring-[rgba(255,179,71,0.5)]'
                      : 'bg-[rgba(83,247,251,0.1)] text-[var(--cyan)] ring-[rgba(83,247,251,0.45)]'
                  }`}
                >
                  <PillarIcon name={p.icon} size={17} />
                </span>
                <span className="text-[10.5px] font-semibold leading-tight tracking-[-0.01em] text-white/80">{proofLabel[p.id] ?? p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Shell>
      <Drop color="#53f7fb" />

      {/* 04 Convert: slot → calls → visit → deal */}
      <Stage n={4} title="Convert" sub="slot to deal" />
      <Steps steps={ESTATE_STEPS} final={[Handshake, 'Deal closed', 'Proof built the trust — the visit closes it']} />
    </div>
  )
}

/* ============================================================
   UNIVERSITY / HOSPITAL (admission flow)
============================================================ */

const ADMIT_SOURCES = [
  { tone: 'blue', icon: <InfinityIcon size={20} strokeWidth={2.6} aria-hidden="true" />, title: 'Content + Meta', note: 'Reels & ads', tag: 'Social' },
  { tone: 'google', icon: <GoogleG size={18} />, title: 'Web + Google', note: 'Search · YT', tag: 'Search' },
  { tone: 'maps', icon: <MapPin size={18} className="text-[#ea4335]" aria-hidden="true" />, title: 'Google Business', note: 'Maps & reviews', tag: 'Local' },
]

// The main points of each step, per industry
const ADMIT_SHORT = {
  university: {
    call: 'Counsellor calls back',
    explore: 'Courses & fees',
    final: 'to a confirmed seat',
    admit: 'Course and seat locked in',
    docs: 'Marksheets & ID checked online',
    done: 'Student enrolled — proof built the trust',
  },
  hospital: {
    call: 'Coordinator calls back',
    explore: 'Doctors & costs',
    final: 'to treatment',
    admit: 'Doctor and bed locked in',
    docs: 'ID, insurance & reports checked online',
    done: 'Patient admitted — proof built the trust',
  },
}

export function AdmissionMobile({ kind }) {
  const c = COPY[kind]
  const s = ADMIT_SHORT[kind]
  const options = [
    { tone: 'cyan', icon: <PhoneCall size={18} aria-hidden="true" />, title: 'Book a call', note: s.call },
    { tone: 'mint', icon: <UserPlus size={18} aria-hidden="true" />, title: 'Register', note: '1-minute form' },
    { tone: 'blue', icon: <Compass size={18} aria-hidden="true" />, title: 'Explore', note: s.explore },
  ]
  const channels = [
    [WhatsAppIcon, 'WhatsApp', 'Instant reply + next steps', 'text-[#25d366]'],
    [Mail, 'Email', c.attachments.map((f) => f.replace(/\.pdf$/i, '')).join(' · '), 'text-[#8ab4f8]'],
  ]
  return (
    <div className="mx-auto max-w-[520px]">
      {/* 01 Capture: three ways in */}
      <Stage n={1} title="Capture" sub="3 ways in" />
      <Tiles items={ADMIT_SOURCES} />
      <Merge colors={['#4f9bff', '#fbbc05', '#ea4335']} />

      {/* 02 Instant reply: WhatsApp + email at once */}
      <Shell anim="m-block" tone="green">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <Orb tone="green" size="h-11 w-11">
              <WhatsAppIcon size={20} />
            </Orb>
            <div className="min-w-0 flex-1">
              <Eyebrow n={2}>Instant reply</Eyebrow>
              <div className="flex items-center gap-2">
                <p className="font-[family-name:var(--font-display)] text-[16px] font-bold leading-tight text-white">WhatsApp + Email</p>
                <Live />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {channels.map(([Icon, label, text, color]) => (
              <div key={label} className="flex min-w-0 flex-col gap-1 rounded-[14px] border border-white/[0.07] bg-[rgba(5,9,26,0.55)] p-2.5">
                <span className={`flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] ${color}`}>
                  <Icon size={13} aria-hidden="true" /> {label}
                </span>
                <span className="text-[11.5px] leading-snug text-white/70">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Shell>
      <Drop color="#25d366" />

      {/* 03 Admission call form: the three ways forward */}
      <Stage n={3} title="Call form" sub={c.formSub.replace(/^the /, '')} />
      <Tiles items={options} />
      <Merge colors={['#53f7fb', '#7dffb3', '#4f9bff']} />

      {/* 04 Enrol / admit */}
      <Steps
        head={[4, c.finalTitle, s.final]}
        steps={[
          [c.admitIcon, 'Admission', s.admit],
          [FileCheck2, 'Document verification', s.docs],
        ]}
        final={[Trophy, 'Admission done', s.done]}
      />
    </div>
  )
}

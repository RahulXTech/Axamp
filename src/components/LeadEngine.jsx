import { useEffect, useRef } from 'react'
import {
  BatteryFull,
  Bot,
  Building2,
  CalendarCheck,
  Check,
  CheckCheck,
  Clapperboard,
  Database,
  FileText,
  Handshake,
  Headset,
  Heart,
  Infinity as InfinityIcon,
  MapPin,
  MapPinCheck,
  Phone,
  Play,
  Search,
  Signal,
  Trophy,
  Wifi,
  Workflow,
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { clientReels, compact } from '../data/reels'
import { pillars, resolveReel } from '../data/work'
import { useIndustry } from '../lib/industry'
import { useMediaQuery } from '../lib/hooks'
import { scrollToTarget } from '../lib/scroll'
import { PillarIcon } from './icons'
import { FlowLines, GoogleG, Orb, Shell, SourceCard, StepCard, StepLabel, makeDraw, pad, useFlowPaths } from './LeadEngineParts'
import { ADMIT_LINKS, AdmissionDiagram, COPY, admitTimeline } from './LeadEngineAdmission'
import { AdmissionMobile, EstateMobile } from './LeadEngineMobile'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ============================================================
   THE LEAD ENGINE
   Real estate: Content / Meta / Google → CRM → instant WhatsApp
   → proof videos or a booking → slot → AI + agent calls → site
   visit → deal.
   University and hospital: the admission flow, see
   LeadEngineAdmission.jsx.

   Desktop: an SVG layer measures the cards and draws curved
   connectors between them; scrolling draws each line in order
   and lights up the next card, with "lead" dots travelling the
   finished lines. Phones / tablets: a compact icon flow for each
   industry, see LeadEngineMobile.jsx.
   Every card carries a small UI preview of what happens at
   that step (sample visuals, not live data).
============================================================ */

// Proof videos sent on WhatsApp — each links to its pillar section
const proofIds = ['area', 'site-visit', 'connectivity', 'project', 'reviews']
// Short names, as in the sketch
const shortLabel = { 'site-visit': 'Site visit', project: 'Project', reviews: 'Reviews' }
const usedPosters = new Set()
const proof = proofIds
  .map((id) => pillars.find((p) => p.id === id))
  .filter(Boolean)
  .map((p) => {
    const posters = (p.reels || []).map((r) => resolveReel(r, p).poster)
    const poster = posters.find((x) => !usedPosters.has(x)) ?? posters[0] ?? null
    usedPosters.add(poster)
    return { ...p, poster }
  })

// Three best-performing reels, fanned on the Content card
const topReels = [...clientReels].sort((a, b) => b.likes - a.likes).slice(0, 3)

// [id, from node, from side, to node, to side, colour]
const LINKS = [
  ['l-content', 'src-content', 'bottom', 'crm', 'top', 'cyan'],
  ['l-meta', 'src-meta', 'bottom', 'crm', 'top', 'blue'],
  ['l-google', 'src-google', 'bottom', 'crm', 'top', 'google'],
  ['l-crm', 'crm', 'bottom', 'wa', 'top', 'cyan'],
  ['l-proof', 'wa-opt-1', 'right', 'proof', 'left', 'green'],
  ['l-book', 'wa', 'bottom', 'slot', 'top', 'green'],
  ['l-proof-book', 'proof', 'bottom', 'slot', 'top', 'cyan'],
  ['l-call', 'slot', 'right', 'call', 'left', 'cyan'],
  ['l-confirm', 'call', 'right', 'confirm', 'left', 'cyan'],
  ['l-deal', 'confirm', 'right', 'deal', 'left', 'amber'],
]

function ContentPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {topReels.map((r, i) => (
        <div
          key={r.id}
          className="absolute h-[88px] w-[50px] overflow-hidden rounded-[9px] border border-white/20 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-[var(--ease)]"
          style={{
            transform: `translateX(${(i - 1) * 46}px) rotate(${(i - 1) * 9}deg) translateY(${Math.abs(i - 1) * 6}px)`,
            zIndex: i === 1 ? 2 : 1,
          }}
        >
          <img src={r.cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/55 py-0.5 text-[8.5px] font-bold text-white">
            <Heart size={7} className="fill-[#ff4d6d] text-[#ff4d6d]" aria-hidden="true" /> {compact(r.likes)}
          </span>
        </div>
      ))}
      <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[rgba(83,247,251,0.15)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cyan)]">
        <Play size={8} fill="currentColor" aria-hidden="true" /> Reels
      </span>
    </div>
  )
}

function MetaFormPreview() {
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold text-white/85">Instant form</span>
        <span className="rounded bg-[#1877f2]/20 px-1.5 text-[9px] font-semibold text-[#7db3ff]">Sponsored</span>
      </div>
      {['Full name', 'Phone number'].map((f) => (
        <div key={f} className="flex h-[18px] items-center rounded-[6px] border border-white/10 bg-white/[0.04] px-2 text-[9.5px] text-white/40">{f}</div>
      ))}
      <div className="mt-auto flex h-[22px] items-center justify-center rounded-[7px] bg-[#1877f2] text-[10.5px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(24,119,242,0.9)]">Submit</div>
    </div>
  )
}

function GooglePreview() {
  return (
    <div className="absolute inset-0 flex flex-col gap-2 p-3">
      <div className="flex h-[24px] items-center gap-2 rounded-full bg-white/95 px-2.5">
        <GoogleG size={11} />
        <span className="flex-1 truncate text-[10.5px] text-[#3c4043]">3 BHK flats near metro</span>
        <Search size={11} className="text-[#4285f4]" aria-hidden="true" />
      </div>
      <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
        <p className="text-[9px] text-white/50"><b className="text-white/80">Sponsored</b> · yourproject.com</p>
        <p className="truncate text-[11px] font-semibold text-[#8ab4f8]">Ready-to-move 3 BHK — book a visit</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-[9.5px] text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-[#34a853]" /> Landing page → form
      </div>
    </div>
  )
}

/* ─── 02 Sync: CRM hub with orbiting sources and a live feed ───────── */

const FEED = [
  ['#4f9bff', 'Meta Ads', 'Instant form'],
  ['#fbbc05', 'Google Ads', 'Landing page'],
  ['#53f7fb', 'Instagram', 'Profile enquiry'],
]

function CrmHub() {
  return (
    <Shell node="crm" tone="cyan" className="w-full max-w-[600px]">
      <div className="flex items-center gap-5 p-5 max-sm:gap-3.5 max-sm:p-4">
        {/* Hub */}
        <div className="relative grid h-[92px] w-[92px] shrink-0 place-items-center max-sm:h-[72px] max-sm:w-[72px]">
          <span aria-hidden="true" className="le-orbit absolute inset-0 rounded-full border border-dashed border-[rgba(83,247,251,0.45)]" />
          <span aria-hidden="true" className="le-orbit le-orbit--rev absolute inset-[10px] rounded-full border border-[rgba(79,155,255,0.35)]" />
          <span aria-hidden="true" className="le-orbit absolute inset-0">
            <span className="absolute left-1/2 top-[-4px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#4f9bff] shadow-[0_0_10px_#4f9bff]" />
            <span className="absolute bottom-[8px] left-[2px] h-2 w-2 rounded-full bg-[#fbbc05] shadow-[0_0_10px_#fbbc05]" />
            <span className="absolute bottom-[8px] right-[2px] h-2 w-2 rounded-full bg-[#53f7fb] shadow-[0_0_10px_#53f7fb]" />
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#53f7fb] to-[#2bb6d8] text-[var(--navy)] shadow-[0_0_30px_-2px_rgba(83,247,251,0.8)]">
            <Database size={22} aria-hidden="true" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-[family-name:var(--font-display)] text-[20px] font-bold leading-tight text-white">WhatsApp API</p>
            <span className="flex items-center gap-1.5 rounded-full bg-[rgba(37,211,102,0.14)] px-2 py-0.5 text-[10.5px] font-semibold text-[#3ee07f]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ee07f]" /> Live
            </span>
          </div>
          <p className="text-[12.5px] text-[var(--muted)]">Every lead synced in real time — nothing missed.</p>

          {/* Live feed ticker */}
          <div className="mt-3 h-[34px] overflow-hidden rounded-[10px] border border-white/[0.07] bg-[rgba(5,9,26,0.55)]">
            <ul className="le-feed m-0 list-none p-0">
              {[...FEED, FEED[0]].map(([c, src, via], i) => (
                <li key={i} className="flex h-[34px] items-center gap-2.5 px-3 text-[12px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                  <span className="whitespace-nowrap font-semibold text-white">New lead</span>
                  <span className="truncate text-white/50">
                    {src} · {via}
                  </span>
                  <span className="ml-auto text-[10.5px] text-white/35 max-sm:hidden">now</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ─── 03 Instant reply: phone with the WhatsApp chat ───────────────── */

function WhatsAppPhone() {
  const options = [
    ['wa-opt-1', FileText, 'Project details'],
    ['wa-opt-2', MapPin, 'Book a site visit'],
    ['wa-opt-3', Phone, 'Talk to an agent'],
  ]
  return (
    <div
      data-node="wa"
      data-anim="wa"
      className="relative z-10 w-full max-w-[370px] rounded-[40px] bg-[linear-gradient(160deg,#3a4566,#121a35_40%,#0a1027)] p-[7px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_0_70px_-26px_rgba(37,211,102,0.55),inset_0_1px_0_rgba(255,255,255,0.15)]"
    >
      <div className="relative overflow-hidden rounded-[34px] bg-[#0b141a]">
        {/* Status bar + notch */}
        <div className="relative flex items-center justify-between bg-[#202c33] px-6 pb-1 pt-2.5 text-[11px] font-semibold text-white/85">
          <span>9:41</span>
          <span aria-hidden="true" className="absolute left-1/2 top-1.5 h-[18px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1" aria-hidden="true">
            <Signal size={12} />
            <Wifi size={12} />
            <BatteryFull size={14} />
          </span>
        </div>

        {/* Chat header */}
        <div className="flex items-center gap-3 bg-[#202c33] px-4 pb-3 pt-1.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#3ee07f] to-[#14a650] text-[var(--navy)]">
            <Building2 size={17} aria-hidden="true" />
          </span>
          <div className="flex-1 leading-tight">
            <p className="flex items-center gap-1 font-[family-name:var(--font-display)] text-[14px] font-semibold text-white">
              Project Sales
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#25d366]" aria-hidden="true">
                <Check size={9} strokeWidth={3.5} className="text-[#0b141a]" />
              </span>
            </p>
            <p className="text-[11.5px] text-[#25d366]">online</p>
          </div>
          <span className="rounded-full bg-[#25d366]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#25d366]">Instant</span>
        </div>

        {/* Chat body on WhatsApp's doodle wallpaper */}
        <div className="flex flex-col gap-2 bg-[radial-gradient(rgba(255,255,255,0.045)_1px,transparent_1.2px)] bg-[size:14px_14px] p-4 pb-5">
          <span className="mx-auto rounded-md bg-[#182229] px-2 py-0.5 text-[10px] font-medium text-white/50">TODAY</span>
          <div data-anim="wa-typing" className="flex w-fit items-center gap-1 rounded-[14px] rounded-tl-[4px] bg-[#202c33] px-3 py-2.5 max-lg:hidden" aria-hidden="true">
            <span className="wa-dot" />
            <span className="wa-dot wa-dot--2" />
            <span className="wa-dot wa-dot--3" />
          </div>
          <div data-anim="wa-msg" className="relative max-w-[90%] rounded-[14px] rounded-tl-[4px] bg-[#202c33] px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-white/90 shadow-[0_1px_0_rgba(0,0,0,0.3)]">
            Hi 👋 Thanks for your enquiry! Everything about the project is right here — how would you like to continue?
            <span className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-white/40">
              just now <CheckCheck size={13} className="text-[#53bdeb]" aria-hidden="true" />
            </span>
          </div>
          <div className="flex max-w-[90%] flex-col gap-1.5">
            {options.map(([node, Icon, label]) => (
              <span
                key={node}
                data-node={node}
                data-anim="wa-opt"
                className="flex items-center justify-center gap-2 rounded-[12px] border border-white/[0.04] bg-[#202c33] px-3 py-2.5 text-[13.5px] font-semibold text-[#00d47e] shadow-[0_1px_0_rgba(0,0,0,0.3)]"
              >
                <Icon size={15} aria-hidden="true" /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* "Project details" → the proof videos, one per buyer doubt */
function ProofCard() {
  return (
    <Shell node="proof" anim="proof" tone="green" className="w-full">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Orb tone="green">
            <Play size={18} fill="currentColor" aria-hidden="true" />
          </Orb>
          <div className="flex-1">
            <p className="font-[family-name:var(--font-display)] text-[18px] font-bold leading-tight text-white">All types of proof video</p>
            <p className="text-[12.5px] text-[var(--faint)]">Sent on WhatsApp the moment they tap “Project details”</p>
          </div>
          <span className="hidden items-center gap-1 rounded-full bg-[rgba(37,211,102,0.14)] px-2.5 py-1 text-[11px] font-semibold text-[#3ee07f] sm:flex">
            <CheckCheck size={13} aria-hidden="true" /> Auto-sent
          </span>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:mt-5 sm:gap-3">
          {proof.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-anim="chip"
              onClick={() => scrollToTarget(`#${p.id}`)}
              className="group/chip flex flex-col items-center gap-2 text-center"
              aria-label={`See ${p.label} proof`}
            >
              <span className="relative block aspect-[9/16] w-full rounded-[14px] bg-[linear-gradient(160deg,rgba(83,247,251,0.5),rgba(255,255,255,0.08)_45%,rgba(37,211,102,0.4))] p-px transition-[transform,box-shadow] duration-500 ease-[var(--ease)] group-hover/chip:-translate-y-1.5 group-hover/chip:shadow-[0_18px_30px_-12px_rgba(83,247,251,0.55)]">
                <span className="relative block h-full w-full overflow-hidden rounded-[13px] bg-[var(--navy-2)]">
                  {p.poster && (
                    <img src={p.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover/chip:scale-110" />
                  )}
                  <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,8,26,0.9),transparent_55%)]" />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white/85 backdrop-blur">{pad(i + 1)}</span>
                  <span className={`absolute bottom-2 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full ${p.tone === 'warm' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]'} text-[var(--navy)] shadow-[0_0_14px_rgba(83,247,251,0.6)]`}>
                    <PillarIcon name={p.icon} size={13} />
                  </span>
                </span>
              </span>
              <span className="text-[11.5px] font-semibold leading-tight text-white/80 group-hover/chip:text-white">{shortLabel[p.id] ?? p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  )
}

function SlotPicker() {
  const slots = ['10:00', '11:30', '4:00']
  return (
    <div className="flex flex-col gap-2">
      <div className="flex rounded-full bg-white/[0.05] p-0.5 text-[10.5px] font-semibold">
        <span className="flex flex-1 items-center justify-center gap-1 rounded-full py-1 text-white/50">
          <Phone size={10} aria-hidden="true" /> Call
        </span>
        <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[var(--cyan)] py-1 text-[var(--navy)]">
          <MapPin size={10} aria-hidden="true" /> Visit
        </span>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Sat, this week</p>
      <div className="grid grid-cols-3 gap-1.5">
        {slots.map((s) => (
          <span
            key={s}
            className={`rounded-[8px] py-1 text-center text-[11px] font-semibold ${
              s === '11:30' ? 'bg-[rgba(83,247,251,0.18)] text-[var(--cyan)] ring-1 ring-[rgba(83,247,251,0.6)]' : 'bg-white/[0.05] text-white/60'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function CallPreview() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#53f7fb] to-[#4f9bff] text-[var(--navy)]">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-[rgba(83,247,251,0.35)]" />
          <Bot size={15} aria-hidden="true" />
        </span>
        <div className="flex-1 leading-tight">
          <p className="text-[11.5px] font-bold text-white">AI calling…</p>
          <p className="text-[10px] text-white/45">Confirms the slot</p>
        </div>
        <span className="le-wave flex h-5 items-end gap-[2px]" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-[3px] rounded-full bg-[var(--cyan)]" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </span>
      </div>
      <div className="flex items-center gap-2.5 border-t border-white/[0.06] pt-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.08] text-white/80">
          <Headset size={15} aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="text-[11.5px] font-bold text-white">Sales agent</p>
          <p className="text-[10px] text-white/45">Follows up with context</p>
        </div>
      </div>
    </div>
  )
}

function VisitTicket() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Site visit</span>
        <span className="flex items-center gap-1 rounded-full bg-[rgba(37,211,102,0.16)] px-2 py-0.5 text-[10px] font-bold text-[#3ee07f]">
          <Check size={10} strokeWidth={3} aria-hidden="true" /> Confirmed
        </span>
      </div>
      <p className="font-[family-name:var(--font-display)] text-[15px] font-bold text-white">Sat · 11:30 AM</p>
      <div aria-hidden="true" className="border-t border-dashed border-white/15" />
      <div className="flex items-center gap-1.5 text-[10.5px] text-white/55">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> Reminder sent on WhatsApp
      </div>
    </div>
  )
}

function DealChecklist() {
  return (
    <div className="flex flex-col gap-2">
      {['Proof seen', 'Trust built', 'Site visited'].map((t) => (
        <div key={t} className="flex items-center gap-2 text-[11.5px] text-white/75">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[rgba(255,209,102,0.2)] text-[#ffd166]">
            <Check size={10} strokeWidth={3} aria-hidden="true" />
          </span>
          {t}
        </div>
      ))}
      <div className="mt-0.5 flex items-center justify-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#ffd166] to-[#ff9f43] py-1.5 text-[12px] font-extrabold text-[var(--navy)] shadow-[0_8px_20px_-8px_rgba(255,179,71,0.9)]">
        <Trophy size={13} aria-hidden="true" /> Deal closed
      </div>
    </div>
  )
}

/* ============================================================
   REAL-ESTATE DIAGRAM
============================================================ */

function estateTimeline(tl, q, draw) {
  tl.from(q('[data-anim="label"]').slice(0, 1), { x: -40, autoAlpha: 0 })
    .from(q('[data-anim="src"]'), { y: 60, scale: 0.92, autoAlpha: 0, stagger: 0.25 }, '<0.2')
  draw(['l-content', 'l-meta', 'l-google'])
  tl.from(q('[data-node="crm"]'), { scale: 0.7, autoAlpha: 0, ease: 'back.out(1.7)' }, '-=0.4')
  draw(['l-crm'])
  tl.from(q('[data-anim="label"]').slice(1, 3), { x: -40, autoAlpha: 0, stagger: 0.2 }, '<')
    .from(q('[data-anim="wa"]'), { y: 50, rotate: -2, scale: 0.94, autoAlpha: 0 }, '-=0.3')
    .from(q('[data-anim="wa-typing"]'), { scale: 0.6, autoAlpha: 0, transformOrigin: '0% 50%' })
    .to(q('[data-anim="wa-typing"]'), { autoAlpha: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: -8, duration: 0.5 })
    .from(q('[data-anim="wa-msg"]'), { y: 16, scale: 0.9, autoAlpha: 0, transformOrigin: '0% 0%' }, '<')
    .from(q('[data-anim="wa-opt"]'), { y: 14, autoAlpha: 0, stagger: 0.18 })
  draw(['l-proof'])
  tl.from(q('[data-anim="proof"]'), { x: 60, autoAlpha: 0 }, '-=0.4')
    .from(q('[data-anim="chip"]'), { y: 30, scale: 0.8, autoAlpha: 0, stagger: 0.12, ease: 'back.out(1.6)' })
    .from(q('[data-anim="label"]').slice(3), { x: -40, autoAlpha: 0 })
  draw(['l-book', 'l-proof-book'], '<', 0.1)
  tl.from(q('[data-node="slot"]'), { y: 40, scale: 0.92, autoAlpha: 0 }, '-=0.3')
  draw(['l-call'])
  tl.from(q('[data-node="call"]'), { y: 40, scale: 0.92, autoAlpha: 0 }, '-=0.3')
  draw(['l-confirm'])
  tl.from(q('[data-node="confirm"]'), { y: 40, scale: 0.92, autoAlpha: 0 }, '-=0.3')
  draw(['l-deal'])
  tl.from(q('[data-node="deal"]'), { y: 40, scale: 0.85, rotate: -3, autoAlpha: 0, ease: 'back.out(1.8)' }, '-=0.3')
}

function EstateDiagram() {
  return (
    <>
      {/* 01 Capture */}
      <StepLabel n={1} title="Capture" sub="buyers find the project three ways" />
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">
        <SourceCard
          node="src-content"
          tone="cyan"
          icon={<Clapperboard size={21} aria-hidden="true" />}
          title="Content"
          note="Organic proof reels"
          tag="Organic"
          steps={['Reel', 'Profile', 'Enquiry']}
        >
          <ContentPreview />
        </SourceCard>
        <SourceCard
          node="src-meta"
          tone="blue"
          icon={<InfinityIcon size={23} strokeWidth={2.6} aria-hidden="true" />}
          title="Meta Ads"
          note="Facebook & Instagram"
          tag="Paid"
          steps={['Ad', 'Instant form']}
        >
          <MetaFormPreview />
        </SourceCard>
        <SourceCard
          node="src-google"
          tone="google"
          icon={<GoogleG size={21} />}
          title="Google Ads"
          note="Search · YouTube · PMax"
          tag="Paid"
          steps={['Search ad', 'Landing page', 'Form']}
        >
          <GooglePreview />
        </SourceCard>
      </div>

      {/* 02 Sync */}
      <div className="mt-7 lg:mt-20">
        <StepLabel n={2} title="Sync" sub="every lead lands in one place, instantly" />
      </div>
      <div className="flex justify-center">
        <CrmHub />
      </div>

      {/* 03 Instant reply */}
      <div className="mt-7 lg:mt-20">
        <StepLabel n={3} title="Instant reply" sub="WhatsApp answers before the buyer looks away" />
      </div>
      <div className="grid items-center gap-3 lg:grid-cols-[370px_1fr] lg:gap-24">
        <div className="flex justify-center lg:justify-start">
          <WhatsAppPhone />
        </div>
        <ProofCard />
      </div>

      {/* 04 Convert */}
      <div className="mt-7 lg:mt-20">
        <StepLabel n={4} title="Convert" sub="from a booked slot to a signed deal" />
      </div>
      <div className="grid gap-3 lg:grid-cols-4 lg:gap-10">
        <StepCard node="slot" n={1} icon={CalendarCheck} title="Slot booking" text="The buyer picks a call or site-visit slot — right inside WhatsApp.">
          <SlotPicker />
        </StepCard>
        <StepCard node="call" n={2} icon={Headset} title="AI + agent calling" text="An AI call confirms within minutes; your sales agent follows up.">
          <CallPreview />
        </StepCard>
        <StepCard node="confirm" n={3} icon={MapPinCheck} title="Site visit confirmed" text="Reminders go out and the visit is locked in.">
          <VisitTicket />
        </StepCard>
        <StepCard node="deal" n={4} tone="gold" icon={Handshake} title="Deal closed" text="Proof built the trust — the site visit closes it.">
          <DealChecklist />
        </StepCard>
      </div>
    </>
  )
}

/* ============================================================
   SECTION
============================================================ */

const UniversityDiagram = () => <AdmissionDiagram copy={COPY.university} />
const HospitalDiagram = () => <AdmissionDiagram copy={COPY.hospital} />

const FLOWS = {
  estate: {
    links: LINKS,
    timeline: estateTimeline,
    Diagram: EstateDiagram,
    MobileDiagram: () => <EstateMobile proof={proof} />,
    goal: 'to a closed deal.',
    sub: (
      <>
        Every view, form and click flows into one system — so no lead goes cold, and every buyer
        arrives at the site <span className="text-white">already convinced</span>.
      </>
    ),
  },
  university: {
    links: ADMIT_LINKS,
    timeline: admitTimeline,
    Diagram: UniversityDiagram,
    MobileDiagram: () => <AdmissionMobile kind="university" />,
    goal: 'to a confirmed admission.',
    sub: (
      <>
        Every reel, search and map listing flows into one system — so no enquiry goes cold, and every
        student reaches admission <span className="text-white">already convinced</span>.
      </>
    ),
  },
  hospital: {
    links: ADMIT_LINKS,
    timeline: admitTimeline,
    Diagram: HospitalDiagram,
    MobileDiagram: () => <AdmissionMobile kind="hospital" />,
    goal: 'to a confirmed admission.',
    sub: (
      <>
        Every reel, search and map listing flows into one system — so no enquiry goes cold, and every
        patient walks in <span className="text-white">already convinced</span>.
      </>
    ),
  },
}

// Follows the hero switcher; anything without its own flow uses real estate
export default function LeadEngine() {
  const { industry } = useIndustry()
  const key = FLOWS[industry] ? industry : 'estate'
  return <Engine key={key} flow={FLOWS[key]} />
}

function Engine({ flow: { links, timeline, Diagram, MobileDiagram, goal, sub } }) {
  const sectionRef = useRef(null)
  const diagramRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const flow = useFlowPaths(diagramRef, isDesktop, links)

  // A new flow changes the page height — re-measure everything below
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const scrubbed = (trigger, start = 'top 88%', end = 'top 55%') => ({ trigger, start, end, scrub: 0.8 })

      // Header
      gsap
        .timeline({ scrollTrigger: scrubbed(q('.le-head')[0], 'top 90%', 'top 45%') })
        .from(q('.le-pill'), { y: 30, scale: 0.85, autoAlpha: 0, ease: 'back.out(1.6)' })
        .from(q('.le-line'), { yPercent: 110, rotate: 2.5, stagger: 0.15, ease: 'power3.out' }, '<0.1')
        .from(q('.le-sub'), { y: 30, autoAlpha: 0, ease: 'power2.out' }, '<0.25')

      if (!isDesktop) {
        // Phones: each block simply fades in once as it arrives — no sliding
        q('[data-anim="m-block"]').forEach((el) =>
          gsap.from(el, {
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power1.out',
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
          }),
        )
        return
      }
      if (!flow.paths.length) return

      // Desktop: one scrubbed story — draw a line, light the next card
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 1 },
        scrollTrigger: { trigger: diagramRef.current, start: 'top 72%', end: 'bottom 80%', scrub: 1 },
      })
      gsap.set(flow.paths.flatMap((p) => q(`[data-dots="${p.id}"]`)), { autoAlpha: 0 })
      timeline(tl, q, makeDraw(tl, q))
    },
    { scope: sectionRef, dependencies: [isDesktop, flow.paths.length], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="lead-engine"
      className="relative z-10 overflow-x-clip bg-[var(--navy)] px-[var(--gutter)] pb-[clamp(56px,9vh,110px)] pt-[clamp(80px,13vh,150px)] max-lg:pb-8 max-sm:pt-10"
    >
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(55%_45%_at_50%_0%,rgba(37,211,102,0.08),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[600px] bg-[radial-gradient(circle,rgba(255,179,71,0.07),transparent_65%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1.2px)] bg-[size:28px_28px] [mask-image:linear-gradient(180deg,transparent,#000_15%,#000_80%,transparent)]"
      />

      <div className="relative mx-auto max-w-[1280px]">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="le-head mx-auto flex max-w-[900px] flex-col items-center gap-6 text-center max-sm:gap-4">
          <span className="le-pill glass inline-flex items-center gap-[10px] rounded-full px-4 py-[10px] text-[var(--cyan)]">
            <Workflow size={16} strokeWidth={1.8} aria-hidden="true" />
            <span className="font-[family-name:var(--font-display)] text-[12px] font-bold uppercase leading-none tracking-[0.2em] text-[var(--text)]">
              The AXAMP lead engine
            </span>
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <span className="le-line block">From first scroll</span>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <span className="le-line block bg-[linear-gradient(90deg,#25d366,var(--cyan)_50%,#ffb347)] bg-clip-text text-transparent">
                {goal}
              </span>
            </span>
          </h2>
          <p className="le-sub max-w-[620px] text-[clamp(1rem,1.3vw,1.125rem)] leading-[1.65] text-[var(--muted)]">{sub}</p>
        </div>

        {/* ── Diagram ────────────────────────────────────── */}
        <div ref={diagramRef} className="relative mt-16 max-sm:mt-8 lg:mt-20">
          {/* Connectors (desktop) */}
          {isDesktop && flow.paths.length > 0 && <FlowLines flow={flow} />}
          {isDesktop ? <Diagram /> : <MobileDiagram />}
        </div>
      </div>
    </section>
  )
}

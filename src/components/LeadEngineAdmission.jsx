import {
  BedDouble,
  Check,
  CheckCheck,
  Compass,
  FileCheck2,
  FileText,
  GraduationCap,
  IndianRupee,
  Infinity as InfinityIcon,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Paperclip,
  Phone,
  PhoneCall,
  Play,
  Search,
  Star,
  Stethoscope,
  Trophy,
  UserPlus,
} from 'lucide-react'

import { campusReels, compact, healthReels } from '../data/reels'
import { GoogleG, Shell, Orb, SourceCard, StepCard, StepLabel } from './LeadEngineParts'

/* ============================================================
   ADMISSION LEAD ENGINE (from AXAMP's sketch) — university and
   hospital share it, each with its own wording (COPY below).
   Content + Meta Ads / Website + Google Ads / Google Business
   → WhatsApp API + Email → admission call form (book a call,
   registration, explore) → admission → document verification
   → done. Same diagram system as the real-estate engine.
============================================================ */

// [id, from node, from side, to node, to side, colour]
export const ADMIT_LINKS = [
  ['l-u-content', 'src-u-content', 'bottom', 'reach', 'top', 'blue'],
  ['l-u-web', 'src-u-web', 'bottom', 'reach', 'top', 'google'],
  ['l-u-gmb', 'src-u-gmb', 'bottom', 'reach', 'top', 'maps'],
  ['l-u-call', 'reach', 'bottom', 'opt-call', 'top', 'green'],
  ['l-u-reg', 'reach', 'bottom', 'opt-reg', 'top', 'green'],
  ['l-u-explore', 'reach', 'bottom', 'opt-explore', 'top', 'green'],
  ['l-u-admit-1', 'opt-call', 'bottom', 'admit', 'top', 'mint'],
  ['l-u-admit-2', 'opt-reg', 'bottom', 'admit', 'top', 'mint'],
  ['l-u-admit-3', 'opt-explore', 'bottom', 'admit', 'top', 'mint'],
  ['l-u-docs', 'admit', 'right', 'docs', 'left', 'cyan'],
  ['l-u-done', 'docs', 'right', 'done', 'left', 'amber'],
]

// Desktop: one scrubbed story — draw a line, light the next card
export function admitTimeline(tl, q, draw) {
  const labels = q('[data-anim="label"]')
  tl.from(labels.slice(0, 1), { x: -40, autoAlpha: 0 })
    .from(q('[data-anim="src"]'), { y: 60, scale: 0.92, autoAlpha: 0, stagger: 0.25 }, '<0.2')
  draw(['l-u-content', 'l-u-web', 'l-u-gmb'])
  tl.from(labels.slice(1, 2), { x: -40, autoAlpha: 0 }, '<')
    .from(q('[data-node="reach"]'), { scale: 0.8, autoAlpha: 0, ease: 'back.out(1.6)' }, '-=0.4')
    .from(q('[data-anim="reach-msg"]'), { y: 16, autoAlpha: 0, stagger: 0.2 })
    .from(q('[data-anim="reach-chip"]'), { y: 10, autoAlpha: 0, stagger: 0.12 })
  draw(['l-u-call', 'l-u-reg', 'l-u-explore'], '>', 0.08)
  tl.from(labels.slice(2, 3), { x: -40, autoAlpha: 0 }, '<')
    .from(q('[data-anim="opt"]'), { y: 50, scale: 0.92, autoAlpha: 0, stagger: 0.2 }, '-=0.3')
  draw(['l-u-admit-1', 'l-u-admit-2', 'l-u-admit-3'], '>', 0.08)
  tl.from(labels.slice(3), { x: -40, autoAlpha: 0 }, '<')
    .from(q('[data-node="admit"]'), { y: 40, scale: 0.92, autoAlpha: 0 }, '-=0.3')
  draw(['l-u-docs'])
  tl.from(q('[data-node="docs"]'), { y: 40, scale: 0.92, autoAlpha: 0 }, '-=0.3')
  draw(['l-u-done'])
  tl.from(q('[data-node="done"]'), { y: 40, scale: 0.85, rotate: -3, autoAlpha: 0, ease: 'back.out(1.8)' }, '-=0.3')
}

/* ─── Wording per industry (sample visuals, not live data) ─────────── */

// Three best-performing reels, fanned on the Content card
const top3 = (reels) => [...reels].sort((a, b) => b.likes - a.likes).slice(0, 3)

export const COPY = {
  university: {
    reels: top3(campusReels),
    who: 'students',
    adCta: 'Apply now',
    search: 'B.Tech AI admission 2026',
    site: 'northgate.edu.in',
    adTitle: 'B.Tech AI & Data Science — apply now',
    place: 'Northgate University',
    rating: ['4.6', '2.1K'],
    category: 'University',
    hello: 'Hi Karan 👋 Thanks for your interest in B.Tech 2026! How would you like to continue?',
    mailFrom: 'Admissions Office',
    mailSubject: 'Your B.Tech 2026 admission guide',
    mailBody: 'Courses, fees, scholarships and the steps to apply — all in one place.',
    attachments: ['Brochure.pdf', 'Fee structure.pdf'],
    formSub: 'the student picks the next step',
    callText: 'Pick a slot — an admission counsellor calls back.',
    caller: 'A counsellor calls you back',
    regText: 'A one-minute form to register for admission.',
    regFields: [['Name', 'Karan Malhotra'], ['Course', 'B.Tech · AI & DS'], ['Phone', '+91 98••• ••210']],
    exploreText: 'Courses, fees, scholarships and a campus tour.',
    exploreTags: ['B.Tech', 'MBA', 'BBA', 'Law'],
    exploreItems: [[Play, 'Campus tour'], [IndianRupee, 'Fees & scholarships'], [FileText, 'Course details']],
    finalTitle: 'Enrol',
    finalSub: 'from admission to a confirmed seat',
    admitIcon: GraduationCap,
    admitText: 'Course and seat locked in — the fee link goes out on WhatsApp.',
    slip: ['Offer letter', 'Seat confirmed', 'B.Tech · AI & Data Science', 'Fee link sent on WhatsApp'],
    docsText: 'Marksheets and ID uploaded and checked online.',
    docs: [['10th marksheet', true], ['12th marksheet', true], ['ID proof', true], ['Entrance scorecard', false]],
    doneText: 'Student enrolled — the proof built the trust.',
    doneList: ['Proof seen', 'Documents verified', 'Seat confirmed'],
  },
  hospital: {
    reels: top3(healthReels),
    who: 'patients',
    adCta: 'Book now',
    search: 'best heart hospital near me',
    site: 'heartcarehospital.in',
    adTitle: 'Trusted heart specialists — book a consult',
    place: 'HeartCare Hospital',
    rating: ['4.8', '5.2K'],
    category: 'Hospital',
    hello: 'Hi Rohit 👋 Thanks for reaching out about heart care! How would you like to continue?',
    mailFrom: 'Patient Care Desk',
    mailSubject: 'Your heart-care guide & next steps',
    mailBody: 'Doctors, treatment steps, costs and insurance — all in one place.',
    attachments: ['Doctor profiles.pdf', 'Treatment cost.pdf'],
    formSub: 'the patient picks the next step',
    callText: 'Pick a slot — a patient coordinator calls back.',
    caller: 'A coordinator calls you back',
    regText: 'A one-minute form to register as a patient.',
    regFields: [['Name', 'Rohit Mehta'], ['Department', 'Cardiology'], ['Phone', '+91 98••• ••210']],
    exploreText: 'Departments, doctors, costs and a hospital tour.',
    exploreTags: ['Cardiac', 'Ortho', 'Neuro', 'Onco'],
    exploreItems: [[Play, 'Hospital tour'], [Stethoscope, 'Doctor profiles'], [IndianRupee, 'Costs & insurance']],
    finalTitle: 'Admit',
    finalSub: 'from admission to treatment, all sorted',
    admitIcon: BedDouble,
    admitText: 'Doctor and bed locked in — the details go out on WhatsApp.',
    slip: ['Admission slip', 'Bed confirmed', 'Cardiology · Private room', 'Admission details sent on WhatsApp'],
    docsText: 'ID, insurance and past reports uploaded and checked online.',
    docs: [['ID proof', true], ['Insurance card', true], ['Past reports', true], ['Doctor’s referral', false]],
    doneText: 'Patient admitted — the proof built the trust.',
    doneList: ['Proof seen', 'Documents verified', 'Bed confirmed'],
  },
}

/* ─── 01 Capture: channel previews ─────────────────────────────────── */

function ContentAdsPreview({ c }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {c.reels.map((r, i) => (
        <div
          key={r.id}
          className="absolute h-[88px] w-[50px] overflow-hidden rounded-[9px] border border-white/20 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.9)]"
          style={{
            transform: `translateX(${(i - 1) * 46}px) rotate(${(i - 1) * 9}deg) translateY(${Math.abs(i - 1) * 6}px)`,
            zIndex: i === 1 ? 2 : 1,
          }}
        >
          <img src={r.cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[8.5px] font-bold text-white">{compact(r.likes)}</span>
        </div>
      ))}
      <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[rgba(83,247,251,0.15)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cyan)]">
        <Play size={8} fill="currentColor" aria-hidden="true" /> Reels
      </span>
      <span className="absolute bottom-2.5 right-2.5 rounded-[6px] bg-[#1877f2] px-2 py-0.5 text-[9.5px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(24,119,242,0.9)]">
        {c.adCta}
      </span>
    </div>
  )
}

function WebsitePreview({ c }) {
  return (
    <div className="absolute inset-0 flex flex-col gap-2 p-3">
      <div className="flex h-[24px] items-center gap-2 rounded-full bg-white/95 px-2.5">
        <GoogleG size={11} />
        <span className="flex-1 truncate text-[10.5px] text-[#3c4043]">{c.search}</span>
        <Search size={11} className="text-[#4285f4]" aria-hidden="true" />
      </div>
      <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
        <p className="truncate text-[9px] text-white/50"><b className="text-white/80">Sponsored</b> · {c.site}</p>
        <p className="truncate text-[11px] font-semibold text-[#8ab4f8]">{c.adTitle}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-[9.5px] text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-[#34a853]" /> Website → enquiry form
      </div>
    </div>
  )
}

function BusinessPreview({ c }) {
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-bold text-white/90">{c.place}</p>
          <p className="flex items-center gap-1 text-[9.5px] text-white/55">
            <span className="font-semibold text-[#fbbc05]">{c.rating[0]}</span>
            <span className="flex text-[#fbbc05]" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={8} fill="currentColor" />
              ))}
            </span>
            ({c.rating[1]})
          </p>
        </div>
        <MapPin size={16} className="shrink-0 text-[#ea4335]" fill="rgba(234,67,53,0.25)" aria-hidden="true" />
      </div>
      <p className="text-[9.5px] text-white/50">{c.category} · <span className="text-[#3ee07f]">Open now</span></p>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        {[
          [Phone, 'Call'],
          [Navigation, 'Directions'],
          [Compass, 'Website'],
        ].map(([Icon, t]) => (
          <span key={t} className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] py-1 text-[9px] font-semibold text-[#8ab4f8]">
            <Icon size={9} aria-hidden="true" /> {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── 02 Reach: WhatsApp API + Email, sent the moment they enquire ─── */

function ReachHub({ c }) {
  return (
    <Shell node="reach" tone="green" className="w-full max-w-[760px]">
      <div className="flex flex-col gap-4 p-5 max-sm:p-4">
        <div className="flex items-center gap-3">
          <Orb tone="green">
            <MessageCircle size={21} aria-hidden="true" />
          </Orb>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="font-[family-name:var(--font-display)] text-[20px] font-bold leading-tight text-white max-sm:text-[18px]">WhatsApp API + Email</p>
              <span className="flex items-center gap-1.5 rounded-full bg-[rgba(37,211,102,0.14)] px-2 py-0.5 text-[10.5px] font-semibold text-[#3ee07f]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ee07f]" /> Live
              </span>
            </div>
            <p className="text-[12.5px] text-[var(--muted)]">Every enquiry gets an instant reply — on both channels.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* WhatsApp */}
          <div data-anim="reach-msg" className="flex min-w-0 flex-col gap-2 rounded-[16px] border border-white/[0.07] bg-[#0b141a] p-3">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em]">
              <span className="flex items-center gap-1.5 text-[#25d366]">
                <MessageCircle size={11} aria-hidden="true" /> WhatsApp
              </span>
              <span className="text-white/35">now</span>
            </div>
            <div className="rounded-[12px] rounded-tl-[4px] bg-[#202c33] px-3 py-2 text-[12px] leading-[1.5] text-white/90">
              {c.hello}
              <span className="mt-0.5 flex items-center justify-end gap-1 text-[9.5px] text-white/40">
                just now <CheckCheck size={12} className="text-[#53bdeb]" aria-hidden="true" />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['Book a call', 'Register', 'Explore'].map((t) => (
                <span key={t} data-anim="reach-chip" className="truncate rounded-[9px] bg-[#202c33] px-1 py-1.5 text-center text-[10.5px] font-semibold text-[#00d47e]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Email */}
          <div data-anim="reach-msg" className="flex min-w-0 flex-col gap-2 rounded-[16px] border border-white/[0.07] bg-[rgba(5,9,26,0.55)] p-3">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em]">
              <span className="flex items-center gap-1.5 text-[#8ab4f8]">
                <Mail size={11} aria-hidden="true" /> Email
              </span>
              <span className="text-white/35">now</span>
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[10.5px] text-white/50">From: {c.mailFrom}</p>
              <p className="truncate text-[12.5px] font-bold text-white">{c.mailSubject}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-[1.45] text-white/55">{c.mailBody}</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {c.attachments.map((f) => (
                <span key={f} className="flex items-center gap-1 rounded-[8px] border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/70">
                  <Paperclip size={10} aria-hidden="true" /> {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ─── 03 Admission call form: the three ways forward ──────────────── */

function OptionCard({ node, tone, icon: Icon, title, text, children }) {
  return (
    <Shell node={node} anim="opt" tone={tone} className="h-full">
      <div className="flex h-full flex-col gap-3 p-5 max-lg:gap-2 max-lg:p-4">
        <div className="flex items-center gap-3">
          <Orb tone={tone}>
            <Icon size={21} strokeWidth={2} aria-hidden="true" />
          </Orb>
          <p className="font-[family-name:var(--font-display)] text-[17px] font-bold leading-tight text-white">{title}</p>
        </div>
        <p className="text-[13px] leading-[1.55] text-[var(--muted)]">{text}</p>
        <div className="mt-auto rounded-[14px] border border-white/[0.07] bg-[rgba(5,9,26,0.55)] p-3">{children}</div>
      </div>
    </Shell>
  )
}

function CallSlots({ c }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {['Mon 6', 'Tue 7', 'Wed 8'].map((d, i) => (
          <span key={d} className={`rounded-[8px] py-1 text-[10.5px] font-semibold ${i === 1 ? 'bg-[var(--cyan)] text-[var(--navy)]' : 'bg-white/[0.05] text-white/55'}`}>
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {['10:00', '12:30', '4:00'].map((s) => (
          <span
            key={s}
            className={`rounded-[8px] py-1 text-center text-[11px] font-semibold ${
              s === '12:30' ? 'bg-[rgba(83,247,251,0.18)] text-[var(--cyan)] ring-1 ring-[rgba(83,247,251,0.6)]' : 'bg-white/[0.05] text-white/60'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-[10.5px] text-white/55">
        <PhoneCall size={10} className="text-[var(--cyan)]" aria-hidden="true" /> {c.caller}
      </p>
    </div>
  )
}

function RegistrationForm({ c }) {
  return (
    <div className="flex flex-col gap-1.5">
      {c.regFields.map(([k, v]) => (
        <div key={k} className="flex h-[24px] items-center justify-between gap-2 rounded-[7px] border border-white/10 bg-white/[0.04] px-2 text-[10.5px]">
          <span className="text-white/40">{k}</span>
          <span className="truncate font-semibold text-white/80">{v}</span>
        </div>
      ))}
      <div className="mt-0.5 flex h-[26px] items-center justify-center rounded-[8px] bg-gradient-to-r from-[#9dffc6] to-[#3ccf86] text-[11px] font-bold text-[var(--navy)]">
        Register
      </div>
    </div>
  )
}

function ExplorePanel({ c }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {c.exploreTags.map((t, i) => (
          <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${i === 0 ? 'bg-[#4f9bff] text-white' : 'bg-white/[0.06] text-white/60'}`}>
            {t}
          </span>
        ))}
      </div>
      {c.exploreItems.map(([Icon, t]) => (
        <div key={t} className="flex items-center gap-2 text-[11px] text-white/75">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[rgba(79,155,255,0.18)] text-[#8ab4f8]">
            <Icon size={10} aria-hidden="true" />
          </span>
          {t}
        </div>
      ))}
    </div>
  )
}

/* ─── 04 Enrol / admit: admission → documents → done ──────────────────────── */

function AdmissionSlip({ c }) {
  const [label, badge, title, note] = c.slip
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</span>
        <span className="flex items-center gap-1 rounded-full bg-[rgba(37,211,102,0.16)] px-2 py-0.5 text-[10px] font-bold text-[#3ee07f]">
          <Check size={10} strokeWidth={3} aria-hidden="true" /> {badge}
        </span>
      </div>
      <p className="font-[family-name:var(--font-display)] text-[15px] font-bold text-white">{title}</p>
      <div aria-hidden="true" className="border-t border-dashed border-white/15" />
      <div className="flex items-center gap-1.5 text-[10.5px] text-white/55">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> {note}
      </div>
    </div>
  )
}

function DocChecklist({ c }) {
  return (
    <div className="flex flex-col gap-1.5">
      {c.docs.map(([t, ok]) => (
        <div key={t} className="flex items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-2 text-white/75">
            <FileText size={11} className="text-white/40" aria-hidden="true" /> {t}
          </span>
          {ok ? (
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[rgba(37,211,102,0.2)] text-[#3ee07f]">
              <Check size={10} strokeWidth={3} aria-hidden="true" />
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--cyan)]">
              <Loader2 size={11} className="animate-spin" aria-hidden="true" /> Verifying
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function DoneChecklist({ c }) {
  return (
    <div className="flex flex-col gap-2">
      {c.doneList.map((t) => (
        <div key={t} className="flex items-center gap-2 text-[11.5px] text-white/75">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[rgba(255,209,102,0.2)] text-[#ffd166]">
            <Check size={10} strokeWidth={3} aria-hidden="true" />
          </span>
          {t}
        </div>
      ))}
      <div className="mt-0.5 flex items-center justify-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#ffd166] to-[#ff9f43] py-1.5 text-[12px] font-extrabold text-[var(--navy)] shadow-[0_8px_20px_-8px_rgba(255,179,71,0.9)]">
        <Trophy size={13} aria-hidden="true" /> Admission done
      </div>
    </div>
  )
}

/* ============================================================
   DIAGRAM
============================================================ */

export function AdmissionDiagram({ copy: c }) {
  return (
    <>
      {/* 01 Capture */}
      <StepLabel n={1} title="Capture" sub={`${c.who} find you three ways`} />
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">
        <SourceCard
          node="src-u-content"
          tone="blue"
          icon={<InfinityIcon size={23} strokeWidth={2.6} aria-hidden="true" />}
          title="Content + Meta Ads"
          note="Reels · Instagram & Facebook"
          tag="Social"
          steps={['Reel / Ad', 'Instant form']}
        >
          <ContentAdsPreview c={c} />
        </SourceCard>
        <SourceCard
          node="src-u-web"
          tone="google"
          icon={<GoogleG size={21} />}
          title="Website + Google Ads"
          note="Search · YouTube · PMax"
          tag="Search"
          steps={['Search ad', 'Website', 'Enquiry']}
        >
          <WebsitePreview c={c} />
        </SourceCard>
        <SourceCard
          node="src-u-gmb"
          tone="maps"
          icon={<MapPin size={21} className="text-[#ea4335]" aria-hidden="true" />}
          title="Google Business"
          note="GMB · Maps & reviews"
          tag="Local"
          steps={['Maps', 'Profile', 'Call']}
        >
          <BusinessPreview c={c} />
        </SourceCard>
      </div>

      {/* 02 Reach */}
      <div className="mt-7 lg:mt-20">
        <StepLabel n={2} title="Instant reply" sub="WhatsApp API + email, the moment they enquire" />
      </div>
      <div className="flex justify-center">
        <ReachHub c={c} />
      </div>

      {/* 03 Admission call form */}
      <div className="mt-7 lg:mt-20">
        <StepLabel n={3} title="Admission call form" sub={c.formSub} />
      </div>
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">
        <OptionCard node="opt-call" tone="cyan" icon={PhoneCall} title="Book a call" text={c.callText}>
          <CallSlots c={c} />
        </OptionCard>
        <OptionCard node="opt-reg" tone="mint" icon={UserPlus} title="Registration" text={c.regText}>
          <RegistrationForm c={c} />
        </OptionCard>
        <OptionCard node="opt-explore" tone="blue" icon={Compass} title="Explore" text={c.exploreText}>
          <ExplorePanel c={c} />
        </OptionCard>
      </div>

      {/* 04 Admit */}
      <div className="mt-7 lg:mt-20">
        <StepLabel n={4} title={c.finalTitle} sub={c.finalSub} />
      </div>
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-12">
        <StepCard node="admit" n={1} icon={c.admitIcon} title="Admission" text={c.admitText}>
          <AdmissionSlip c={c} />
        </StepCard>
        <StepCard node="docs" n={2} icon={FileCheck2} title="Document verification" text={c.docsText}>
          <DocChecklist c={c} />
        </StepCard>
        <StepCard node="done" n={3} tone="gold" icon={Trophy} title="Done" text={c.doneText}>
          <DoneChecklist c={c} />
        </StepCard>
      </div>
    </>
  )
}

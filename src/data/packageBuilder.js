// ─── Build your own package (/build-package) ────────────────────────────
// The visitor answers five questions — who they are, the project type,
// the ticket size, the platform they want leads from and how many leads a
// day they want — and gets a result:
// what a month of ads costs, how many of those leads reach the site, and
// how much of the spend is lost on the way. "Find reason" shows where the
// leads drop off (`funnel`); "Get solution" shows the AXAMP package that
// fixes it.
//
// CPL rules (founder's brief): a ₹1Cr ticket → ₹1,000, a ₹1.5Cr ticket →
// ₹1,200, ₹2Cr and above → ₹1,500. That's for residential; commercial is
// 20% higher. Google Ads leads cost 20% more again, rounded up to a round
// ₹500 (₹1,500, ₹2,000, ₹2,500 …). Change `cpl` / `cplFactor` below and
// the page follows.

import { planById, withGst } from './packages'

// Ad budget is worked out for a 30-day month
export const DAYS_PER_MONTH = 30

export const categories = [
  { id: 'developer', label: 'Developer' },
  { id: 'channel-partner', label: 'Channel Partner' },
  { id: 'other', label: 'Other' },
]

export const projectTypes = [
  { id: 'residential', label: 'Residential', cplFactor: 1 },
  { id: 'commercial', label: 'Commercial', cplFactor: 1.2 },
  // Plots have their own ticket sizes and CPLs — see `plotTicketSizes`
  { id: 'plot', label: 'Plot', cplFactor: 1 },
]

// `cpl` is the residential cost per lead for that ticket size;
// `notFor` hides it for those project types
export const ticketSizes = [
  // TODO(AXAMP): no CPL given for ₹50L and below yet — priced like a ₹1Cr ticket
  { id: 'upto-50l', label: 'Up to ₹50L', cpl: 1000 },
  { id: '50l', label: '₹50L', cpl: 1000 },
  { id: '1cr', label: '₹1Cr', cpl: 1000 },
  { id: '1.5cr', label: '₹1.5Cr', cpl: 1200 },
  { id: '2cr', label: '₹2Cr', cpl: 1500, luxury: true },
  { id: '3cr', label: '₹3Cr', cpl: 1500, luxury: true },
  { id: '5cr', label: '₹5Cr', cpl: 1500, luxury: true, notFor: ['commercial'] },
  { id: '10cr', label: '₹10Cr', cpl: 1500, luxury: true, notFor: ['commercial'] },
]

// Plot ticket sizes, with the Meta Ads CPL (founder's brief): ₹10–20L →
// ₹300, ₹20–40L → ₹500, ₹40–70L → ₹700
export const plotTicketSizes = [
  { id: 'upto-20l', label: 'Up to ₹20L', cpl: 300 },
  { id: '30l', label: '₹30L', cpl: 500 },
  { id: '50l', label: '₹50L', cpl: 700 },
  { id: '70l', label: '₹70L', cpl: 700 },
  // TODO(AXAMP): no plot CPL given above ₹70L yet — priced like residential
  { id: '1cr', label: '₹1Cr', cpl: 1000 },
  { id: '1.5cr', label: '₹1.5Cr', cpl: 1200 },
]

// The ticket sizes on offer for a project type (all but the plot ones until one is picked)
export const ticketsFor = (project) =>
  project?.id === 'plot' ? plotTicketSizes : ticketSizes.filter((t) => !t.notFor?.includes(project?.id))

// Where the visitor wants their leads from. Google Ads only comes with
// Full Ads, so picking it steers the suggested package there.
// `cplFactor` raises the cost per lead; `cplStep` rounds it up to a round number.
// `visitBoost` multiplies the site visits against Meta Ads (Google buyers are
// already searching): `[everyday, commercial or ₹2Cr+ luxury]`.
export const platforms = [
  { id: 'meta', label: 'Meta Ads', cplFactor: 1 },
  { id: 'google', label: 'Google Ads', cplFactor: 1.2, cplStep: 500, visitBoost: [1.8, 2] },
]

// How many times Meta's site visits this platform brings (1 for Meta)
export function visitBoostFor(project, ticket, platform) {
  const boost = platform?.visitBoost
  if (!boost) return 1
  return project?.id === 'commercial' || ticket?.luxury ? boost[1] : boost[0]
}

// An option can set `plus: true` to be priced at its perDay and shown as a starting figure ("100+")
export const leadTargets = [
  { id: '10', label: '10 leads per day', perDay: 10 },
  { id: '20', label: '20 leads per day', perDay: 20 },
  { id: '50', label: '50 leads per day', perDay: 50 },
  { id: '100', label: '100 leads per day', perDay: 100 },
]

/*
 * What happens to the leads after they come in (founder's notes). We take
 * 100 leads and the visitor tells us how many drop out at each step. Each
 * question has exactly 3 options, always shown as a number of leads — never
 * as a percentage. Each step sets its options one of three ways:
 * `options`  → fixed numbers of leads.
 * `ofLeft`   → % of the leads still in, rounded to whole leads (0.5 up).
 * `leave`    → the leads still in after this step (the options are what
 *              it takes to get there).
 * `lost`     → why they drop out (short line for the live preview and the
 *              WhatsApp summary).
 * `question` → the question asked on the form for this step.
 * `fix`      → how the AXAMP system stops that drop.
 * `journey`  → the stage in the journey line ("65 picked up → 52 interested …").
 */
export const funnel = [
  { id: 'leads', label: 'Leads received', journey: 'leads' },
  {
    id: 'answered',
    label: 'Picked up the call',
    journey: 'picked up',
    lost: 'Didn’t pick up the call',
    question: 'Out of 100 leads, how many didn’t pick up your first call?',
    options: [30, 35, 40],
    fix: 'A WhatsApp reply in seconds, 24×7 — and the buyer picks the slot when your team should call.',
  },
  {
    id: 'interested',
    label: 'Interested',
    journey: 'interested',
    lost: 'Not interested, didn’t fill the form',
    question: 'Out of the remaining leads, how many were not interested, didn’t fill the form intentionally, or clicked by mistake?',
    ofLeft: [15, 20, 25],
    fix: 'Two-factor and real-profile verification filter out time-pass leads, and fresh creatives every month reach serious buyers.',
  },
  {
    id: 'details',
    label: 'Accepted the offer',
    journey: 'accepted the offer',
    lost: 'Rejected high price or other reasons',
    question: 'Out of the remaining leads, how many rejected the offer due to price, location or budget after hearing the details?',
    ofLeft: [15, 20, 25],
    fix: 'Project details, location and a walkthrough on WhatsApp the moment they ask — while they’re still keen.',
  },
  {
    id: 'follow-up',
    label: 'Kept responding',
    journey: 'kept responding',
    lost: 'Went quiet after we sent the details',
    question: 'Out of the remaining leads, how many stopped responding after receiving the details?',
    leave: [20, 15, 10],
    fix: 'Buyers book their own site visit or call slot on WhatsApp — no chasing, no lost follow-ups.',
  },
  {
    id: 'site-visit',
    label: 'Site visit done',
    journey: 'site visits',
    lost: 'Didn’t come for the site visit',
    question: 'Out of the remaining leads, how many were not ready for a site visit, made an excuse, or agreed but never showed up?',
    leave: [5, 4, 3],
    fix: 'Buyers choose a visit slot that suits them, and your team sees every booking in one place.',
  },
]

// Share of site visits that close (founder's sketch: 5 visits → 1 deal)
export const CLOSE_RATE = 0.2

// Out of every 100 leads, after the AXAMP algorithm (founder's sketch,
// "Before vs After AXAMP"): who picks up, who is still interested after
// the details, who visits the site and whose deal closes.
export const axampFunnel = { answered: 85, details: 45, 'site-visit': 20, deal: 5 }

// The funnel questions
export const funnelSteps = funnel.filter((s) => s.question)

/*
 * The 3 options for each funnel question, in leads, from the leads still
 * in before it — so the funnel always ends at 3, 4 or 5 site visits:
 *
 *   Q1  30 / 35 / 40
 *   Q2  15 / 20 / 25% of the leads left    e.g. 60 left → 9 / 12 / 15
 *   Q3  15 / 20 / 25% of the leads left    e.g. 45 left → 7 / 9 / 11
 *   Q4  whatever leaves 20 / 15 / 10       e.g. 34 left → 14 / 19 / 24
 *   Q5  whatever leaves 5 / 4 / 3          e.g. 10 left → 5 / 6 / 7
 *
 * Q2 and Q3 shrink with the leads left, so the options come down step by
 * step. The highest option every time (40, 15, 11) still leaves 34 before
 * Q4 — always enough to leave 20 / 15 / 10.
 *
 * Nothing is pre-picked on the form — the visitor picks every answer. The
 * middle option is only the fallback for a report link that's missing one:
 * following it all the way down gives 35 / 13 / 10 / 27 / 11 → 4 site visits.
 */
// `left` = leads (of 100) still in before question `i`
export function dropOptions(left, i) {
  const s = funnelSteps[i]
  const options = s.options ?? s.ofLeft?.map((p) => Math.round((left * p) / 100)) ?? s.leave.map((n) => left - n)
  return { options, suggested: options[1] }
}

// Fit a set of answers to the options above, question by question: an
// answer that's no longer on offer (because an earlier one changed) falls
// back to the middle option.
export function fitDrops(given = {}) {
  let left = 100
  return Object.fromEntries(
    funnelSteps.map((s, i) => {
      const { options, suggested } = dropOptions(left, i)
      const v = options.includes(given[s.id]) ? given[s.id] : suggested
      left -= v
      return [s.id, v]
    }),
  )
}

// Change one answer and work out the ones after it again. A later answer
// keeps its place (lowest / middle / highest) even though its number changes;
// one not given yet stays empty, and so does everything after it.
export function changeDrop(drops, id, value) {
  let oldLeft = 100
  let left = 100
  const next = {}
  for (const [i, s] of funnelSteps.entries()) {
    const old = drops[s.id]
    if (s.id !== id && old == null) break
    const place = old == null ? -1 : dropOptions(oldLeft, i).options.indexOf(old)
    oldLeft -= old ?? 0
    const { options, suggested } = dropOptions(left, i)
    const v = s.id === id ? value : (options[place] ?? suggested)
    left -= v
    next[s.id] = v
  }
  return next
}

// Every funnel question has an answer
export const funnelDone = (drops) => funnelSteps.every((s) => drops[s.id] != null)

// The middle option all the way down → 4 site visits
export const typicalDrops = fitDrops()

/*
 * The answers live in the report's URL, so a report can be shared,
 * reloaded, or taken back to the form to edit:
 *   ?who=developer&project=residential&ticket=1cr&platform=meta&leads=20&funnel=35-13-10-27-11
 * Anything missing or unknown comes back as null (or the suggested drop).
 */
export const toQuery = (picks, drops) =>
  new URLSearchParams({
    who: picks.category.id,
    project: picks.project.id,
    ticket: picks.ticket.id,
    platform: picks.platform.id,
    leads: picks.leads.id,
    funnel: funnelSteps.map((s) => drops[s.id]).join('-'),
  }).toString()

export function fromQuery(search) {
  const q = new URLSearchParams(search)
  const find = (list, key) => list.find((o) => o.id === q.get(key)) ?? null
  const given = (q.get('funnel') ?? '').split('-').map(Number)
  const project = find(projectTypes, 'project')
  return {
    picks: {
      category: find(categories, 'who'),
      project,
      ticket: find(ticketsFor(project), 'ticket'),
      platform: find(platforms, 'platform'),
      leads: find(leadTargets, 'leads'),
    },
    drops: fitDrops(Object.fromEntries(funnelSteps.map((s, i) => [s.id, given[i]]))),
  }
}

// % of all leads still in at each stage. A drop can't take out more
// leads than are left, so the visitor's answers never go below 0. Stages
// from the first unanswered question on are null (not known yet).
// `boost` (visitBoostFor) multiplies the site visits, never past the leads
// still in before them — e.g. Google Ads 2×: 4 visits → 8.
export function funnelShares(drops, boost = 1) {
  let left = 100
  return funnel.map((s, i) => {
    if (!s.question) return left
    const before = left
    left = left == null || drops[s.id] == null ? null : left - Math.min(left, drops[s.id])
    if (left != null && i === funnel.length - 1) left = Math.min(before, Math.round(left * boost))
    return left
  })
}

/*
 * Cost per lead: the ticket size's CPL × project type × platform.
 * Meta is rounded to ₹10; Google is rounded up to the next ₹500 so it's
 * always a round number and never less than 20% over Meta:
 *
 *                 Up to ₹1Cr   ₹1.5Cr   ₹2Cr+
 *   Residential   1,500        1,500    2,000
 *   Commercial    1,500        2,000    2,500
 *
 *                 ₹20L   ₹30L–70L   ₹1Cr–1.5Cr
 *   Plot          500    1,000      1,500
 */
export function cplFor(ticket, project, platform) {
  const cpl = ticket.cpl * project.cplFactor * (platform?.cplFactor ?? 1)
  const step = platform?.cplStep
  return step ? Math.ceil(Math.round(cpl) / step) * step : Math.round(cpl / 10) * 10
}

// Plots and everyday residential → Meta Ads; commercial, ₹2Cr+ (luxury)
// residential, or anyone who wants Google leads → Full Ads
export const recommendedAds = (project, ticket, platform) =>
  platform.id === 'google' || project.id === 'commercial' || (project.id === 'residential' && ticket.luxury) ? 'full-ads' : 'meta-ads'

/*
 * Everything the result shows, from the visitor's answers.
 *   picks: { category, project, ticket, platform, leads } — the option objects above
 *   drops: { [funnel step id]: % of all leads lost there }
 * Returns null until the five project questions are answered.
 *
 *   e.g. 20 leads a day at ₹1,000 a lead, middle options → ₹6,00,000 ad
 *   spend, 600 leads, 24 site visits (4 in 100), ₹25,000 per visit, 576
 *   leads and ₹5,76,000 lost.
 */
export function report({ category, project, ticket, platform, leads }, drops = typicalDrops) {
  if (!category || !project || !ticket || !platform || !leads) return null

  const cpl = cplFor(ticket, project, platform)
  const leadsPerMonth = leads.perDay * DAYS_PER_MONTH
  const adSpend = cpl * leadsPerMonth

  const visitBoost = visitBoostFor(project, ticket, platform)
  const shares = funnelShares(drops, visitBoost)
  const stages = funnel.map((s, i) => ({ ...s, share: shares[i], count: Math.round((leadsPerMonth * shares[i]) / 100) }))
  const siteVisits = stages[stages.length - 1].count
  const leadLoss = leadsPerMonth - siteVisits

  const plan = planById[recommendedAds(project, ticket, platform)]

  return {
    cpl,
    leadsPerMonth,
    plus: !!leads.plus,
    adSpend,
    stages,
    siteVisits,
    // × Meta's site visits (1 for Meta Ads)
    visitBoost,
    // null when no one reaches the site
    costPerVisit: siteVisits ? Math.round(adSpend / siteVisits) : null,
    leadLoss,
    moneyLoss: leadLoss * cpl,
    plan,
    planWithGst: withGst(plan.fee).total,
  }
}

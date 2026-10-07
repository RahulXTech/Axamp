// ─── Performance marketing proof ────────────────────────────────────────
// Client reels + their Instagram numbers live in ./reels.js (shared with
// the proof pillars). Everything here is derived from that list.

import { clientReels } from './reels'

export { SHOW_COUNT_FROM, compact } from './reels'

const byLikes = (a, b) => (b.views ?? 0) - (a.views ?? 0) || b.likes - a.likes

// Tabs above the carousel — highest-performing reels always come first
export const reelGroups = [
  { id: 'top', label: 'Top Performing', icon: 'flame', reels: [...clientReels].sort(byLikes) },
  { id: 'estate', label: 'Real Estate & Clubs', icon: 'tower', reels: clientReels.filter((r) => r.group === 'estate').sort(byLikes) },
  { id: 'retail', label: 'Malls & Cafés', icon: 'store', reels: clientReels.filter((r) => r.group === 'retail').sort(byLikes) },
]

// Big numbers under the heading — computed from the reels above
const totalComments = clientReels.reduce((s, r) => s + r.comments, 0)
const topLikes = Math.max(...clientReels.map((r) => r.likes))
const thousands = (n, label) => ({ value: Math.floor(n / 100) / 10, decimals: n % 1000 >= 100 ? 1 : 0, suffix: 'K+', label })

export const headlineStats = [
  { value: 1, suffix: 'M+', label: 'Views' },
  thousands(totalComments, 'Comments'),
  { value: topLikes / 1000, suffix: 'K', label: 'Likes on one reel' },
  { value: 20, suffix: '+', label: 'Client brands' },
]

// ─── Google Ads ─────────────────────────────────────────────────────────
// ⚠ DEMO CONTENT — sample numbers so the dashboard looks complete.
// Replace with real campaign figures, or add `src` (a screenshot of the
// Google Ads dashboard) to show the real thing instead.

export const googleItems = [
  {
    title: 'Search — 3 BHK launch',
    kind: 'Search',
    project: 'Sample project',
    kpis: [
      { label: 'Clicks', value: '9,284', delta: '+38%' },
      { label: 'Conversions', value: '318', delta: '+52%' },
      { label: 'Cost / conv.', value: '₹142', delta: '-27%' },
      { label: 'CTR', value: '7.9%', delta: '+1.8 pts' },
    ],
    series: [22, 28, 25, 34, 31, 42, 39, 51, 48, 60, 58, 71],
    campaigns: [
      ['3 BHK near metro', '4,120', '146'],
      ['Project brand terms', '3,018', '121'],
      ['Ready to move flats', '2,146', '51'],
    ],
  },
  {
    title: 'Performance Max — leads',
    kind: 'Performance Max',
    project: 'Sample project',
    kpis: [
      { label: 'Impressions', value: '1.2M', delta: '+64%' },
      { label: 'Leads', value: '541', delta: '+41%' },
      { label: 'Cost / lead', value: '₹96', delta: '-33%' },
      { label: 'Conv. rate', value: '6.4%', delta: '+2.1 pts' },
    ],
    series: [18, 21, 27, 26, 33, 37, 35, 44, 50, 49, 57, 66],
    campaigns: [
      ['Plots on highway', '1,904', '238'],
      ['Farm house weekend', '1,377', '187'],
      ['Project brand terms', '842', '116'],
    ],
  },
  {
    title: 'YouTube — walkthrough views',
    kind: 'YouTube',
    project: 'Sample project',
    kpis: [
      { label: 'Views', value: '486K', delta: '+72%' },
      { label: 'View rate', value: '41%', delta: '+9 pts' },
      { label: 'Cost / view', value: '₹0.38', delta: '-21%' },
      { label: 'Site visits', value: '134', delta: '+29%' },
    ],
    series: [12, 19, 24, 30, 29, 38, 46, 44, 53, 61, 64, 74],
    campaigns: [
      ['Sky-deck walkthrough', '212K', '61'],
      ['Sample flat tour', '168K', '44'],
      ['Possession update', '106K', '29'],
    ],
  },
]

// ─── Google Business Profile (GMB) ──────────────────────────────────────
// ⚠ DEMO CONTENT — sample numbers so the Maps preview looks complete.
// Replace with the real Business Profile insights for a client.

export const businessProfile = {
  search: 'flats near metro',
  name: 'Your Project',
  category: 'Real estate developer',
  rating: 4.8,
  reviews: '1,240',
  // The Maps "3-pack" — first one is the client
  pack: [
    { name: 'Your Project', rating: 4.8, reviews: '1,240', note: 'Open · Site visits today' },
    { name: 'Nearby Developer', rating: 4.1, reviews: '312', note: 'Open · 2.4 km' },
    { name: 'Another Builder', rating: 3.9, reviews: '186', note: 'Closes 7 pm · 3.1 km' },
  ],
  stats: [
    { label: 'Profile views', value: '48.2K', delta: '+61%' },
    { label: 'Direction requests', value: '3,940', delta: '+44%' },
    { label: 'Calls from Maps', value: '1,286', delta: '+37%' },
    { label: 'Website clicks', value: '2,715', delta: '+52%' },
  ],
  work: ['Maps 3-pack ranking', 'Review replies', 'Weekly posts & photos', 'Keyword-rich listing'],
}

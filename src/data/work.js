// ─── The six proof pillars ──────────────────────────────────────────────
// Each section pins and slides its reels horizontally.
//
// A reel entry can be:
//   { file: '<name>', caption: '…' }  AXAMP's own video, /videos/<name>.mp4
//                                     with /posters/<name>.webp as its cover
//   { ig: 'https://www.instagram.com/p/<ID>/', image: true }  (photo / carousel post)
//   { ig: 'https://www.instagram.com/reels/<ID>/', caption: '…' }
//   { youtube: '<YouTubeVideoID>', caption: '…' }
// Optional overrides: video: '/videos/x.mp4', poster: '/posters/x.jpg'
//
// `objection` is the buyer's doubt (struck through on scroll); `answer`
// is the line that appears after it — how this kind of proof answers it.
//
// 6 Oct 2026 — every pillar now uses AXAMP's official real-estate videos
// (public/videos/README.txt lists them). Each pillar lists all eight, its
// most relevant first: the first is the pillar's cover (strip cards, lead
// engine), and with 6+ distinct videos the 3D ring shows each once instead
// of repeating (Pillar.jsx). The client Instagram reels that were here
// still run in the Performance section (./reels.js).
//
// 7 Oct 2026 — Project Details (pd-*.mp4, ten), Site Visit (sv-*.mp4, nine)
// and Informative (in-*.mp4, seven) have their own official edits in place
// of the shared eight.

import { reelById } from './reels'
import { site } from './site'

// AXAMP's official real-estate videos
const V = {
  mdb: { file: 'mdb-london-square', caption: 'MDB London Square — 2-acre commercial hub with ₹45K monthly rental income' },
  royalGreen: { file: 'royal-green-county', caption: 'Royal Green County — premium residential plots off UER-II' },
  yamuna: { file: 'luxury-tower-amenities', caption: 'Yamuna Expressway — the tower, the amenities, the lifestyle' },
  clubhouse: { file: 'clubhouse-construction', caption: 'Clubhouse walkthrough — gym, lounge and entry, under construction' },
  rosemont: { file: 'aditya-rosemont', caption: 'Rosemont Residency by Aditya — sales gallery visit, 4 apartments per floor' },
  metro: { file: 'noida-metro-map', caption: 'Noida Aqua Line — every metro stop, sector by sector' },
  yeida: { file: 'erm-yeida-growth', caption: 'Noida vs YEIDA — prices, Film City and the airport story' },
  gurgaonNoida: { file: 'gurgaon-vs-noida', caption: 'Gurugram vs Noida — which city is built to live in?' },
}

export const pillars = [
  {
    id: 'area',
    label: 'Area',
    tag: 'Drone + UGC',
    icon: 'drone',
    objection: 'Is there real demand here?',
    answer: 'Answered on a podcast.',
    reels: [V.yeida, V.mdb, V.royalGreen, V.metro, V.rosemont, V.yamuna, V.clubhouse, V.gurgaonNoida],
  },
  {
    id: 'connectivity',
    label: 'Connectivity',
    tag: 'Drone · Drive-time',
    icon: 'route',
    objection: 'How far is it, really?',
    answer: 'Answered walking the ground.',
    reels: [V.metro, V.royalGreen, V.yeida, V.mdb, V.gurgaonNoida, V.rosemont, V.yamuna, V.clubhouse],
  },
  {
    id: 'project',
    label: 'Project Details',
    tag: 'Walkthroughs',
    icon: 'building',
    objection: 'Is this actually being built?',
    answer: 'Answered on a site walkthrough.',
    // AXAMP's official Project Details edits (7 Oct 2026) — this pillar only
    reels: [
      { file: 'pd-mdb-london-square', caption: 'MDB London Square — the build, the interiors and the sales reward scheme' },
      { file: 'pd-bptp-skynest', caption: 'BPTP Skynest, Sector 80 Faridabad — 3 & 4 BHK residences from ₹4.36 Cr' },
      { file: 'pd-aditya-rosemont', caption: 'Rosemont Residency by Aditya — 3 BHK living room, bedroom and balcony' },
      { file: 'pd-royal-green-county', caption: 'Royal Green County — the gate, the avenue and the sales gallery near Kundli Metro' },
      { file: 'pd-tonk-road-township', caption: 'Premium township off Tonk Road — Phase 2 from the air' },
      { file: 'pd-jda-rera-plots', caption: 'JDA & RERA approved plots — the layout and roads by drone' },
      { file: 'pd-society-house-tour', caption: 'Society house tour — the home, the lawns and the towers around it' },
      { file: 'pd-society-patta-plot', caption: '266.66 gaj society patta plot — walked from the main road' },
      { file: 'pd-township-registries', caption: 'High-rise township tour — towers, pool, greens and registries' },
      { file: 'pd-gurgaon-vs-noida', caption: 'Gurugram vs Noida — geography, planning and livability, explained' },
    ],
  },
  {
    id: 'site-visit',
    label: 'Site Visit',
    tag: 'On-ground',
    icon: 'footprints',
    objection: 'Is anyone really buying?',
    answer: 'Answered by real visitors.',
    // AXAMP's official Site Visit edits (7 Oct 2026) — this pillar only
    reels: [
      { file: 'sv-vvip-yamuna', caption: 'VVIP Yamuna — a sales gallery visit, with the model, the music and the welcome' },
      { file: 'sv-red-carpet-sample-flat', caption: 'Red-carpet sample flat visit — the dining room, the balcony and the welcome' },
      { file: 'sv-sector-66-site', caption: 'Sector 66 — around 4.5 acres, toured on site' },
      { file: 'sv-max-estate-128', caption: 'Max Estate 128, Noida — a hard-hat visit to the balconies and the view' },
      { file: 'sv-sample-flat-walkthrough', caption: 'Sample flat walkthrough — living room, bedrooms and garden deck' },
      { file: 'sv-group-108-grandthum', caption: 'Group 108 Grandthum — the lobby, the art and the atrium' },
      { file: 'sv-dlf-phase-1-floor', caption: 'DLF Phase 1 builder floor — staircase, kitchen and living, walked through' },
      { file: 'sv-biggest-family-house', caption: 'The biggest family house — a floor-by-floor visit' },
      { file: 'sv-bollywood-style-floor', caption: 'Bollywood-style builder floor — chandeliers, marble and the terrace' },
    ],
  },
  {
    id: 'branding',
    label: 'Informative',
    tag: 'Face · Voice',
    icon: 'mic',
    objection: 'Who am I trusting with this?',
    answer: 'Answered face to face.',
    tone: 'warm',
    // AXAMP's official Informative edits (7 Oct 2026) — this pillar only
    reels: [
      { file: 'in-buy-or-invest', caption: 'Buying a home or investing in one — the financial decision, explained face to face' },
      { file: 'in-max-estates-270-sold', caption: 'Max Estates — 270 already sold, and why the market responded' },
      { file: 'in-mdb-london-square', caption: 'MDB London Square — on site, showing how it’s being built' },
      { file: 'in-noida-sector-guide', caption: 'Noida, sector by sector — Sector 150, 143 and 137, and the projects in each' },
      { file: 'in-aqua-line-sectors', caption: 'The Aqua Line, stop by stop — where Noida’s commercial demand sits' },
      { file: 'in-jewar-ganga-expressway', caption: 'Jewar–Ganga link expressway — the interchange, Film City and the airport' },
      { file: 'in-noida-property-price', caption: 'Noida property prices — what’s driving them' },
    ],
  },
  {
    id: 'reviews',
    label: 'Feedback & Reviews',
    tag: 'Reviews · FAQ',
    icon: 'messages',
    objection: 'What do real buyers say?',
    answer: 'Answered by real buyers.',
    reels: [V.yamuna, V.rosemont, V.clubhouse, V.mdb, V.royalGreen, V.yeida, V.gurgaonNoida, V.metro],
  },
]

const igId = (url) =>
  url?.match(/instagram\.com\/(?:reels?|p)\/([A-Za-z0-9_-]+)/)?.[1]

// Normalise a reel entry into everything the UI needs.
export function resolveReel(reel, section) {
  const id = reel.ig ? igId(reel.ig) : (reel.file ?? reel.youtube)
  const info = reelById[id] // client, caption, cover + Instagram numbers

  /*
   * Poster URLs — we try the local file first (if the user has
   * dropped one in /public/posters/), and fall back to Instagram's
   * public thumbnail endpoint which works without auth.
   */
  const localPoster =
    reel.poster ?? info?.cover ?? (reel.file ? `/posters/${id}.webp` : reel.ig ? `/posters/${id}.jpg` : null)
  const remotePoster = reel.ig
    ? `https://www.instagram.com/p/${id}/media/?size=l`
    : reel.youtube
      ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
      : null

  return {
    key: `${section.id}-${id}`,
    type: reel.ig ? 'instagram' : reel.file ? 'file' : 'youtube',
    image: !!reel.image, // photo post — shown as an image, never as video
    id,
    // Our own videos have no post of their own — link to AXAMP's profile
    url: reel.ig ?? (reel.file ? site.instagram : `https://www.youtube.com/watch?v=${reel.youtube}`),
    video: reel.image ? null : (reel.video ?? (reel.ig || reel.file ? `/videos/${id}.mp4` : null)),

    /* Card tries `poster` first, then `posterFallback`. */
    poster: localPoster ?? remotePoster,
    posterFallback: remotePoster,

    caption: reel.caption || info?.caption || `${section.label} — AXAMP`,
    warm: section.tone === 'warm',

    // Client account + public numbers, shown in the on-site player
    handle: info?.handle,
    name: info && `${info.name} · ${info.place}`,
    client: info?.name,
    kind: info?.kind,
    place: info?.place,
    likes: info?.likes,
    comments: info?.comments,
    views: info?.views,
  }
}
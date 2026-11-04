// ─── The six proof pillars ──────────────────────────────────────────────
// Each section pins and slides its reels horizontally.
//
// A reel entry can be:
//   { file: '<name>', caption: '…' }  AXAMP's own video, /videos/<name>.mp4
//                                     with /posters/<name>.webp as its cover
//   { ig: 'https://www.instagram.com/p/<ID>/', image: true }  (photo / carousel post)
//   { ig: 'https://www.instagram.com/reels/<ID>/', caption: '…' }
//   { youtube: '<YouTubeVideoID>', caption: '…' }
//   { youtube: '<ID>', video: '/videos/<ID>.mp4', handle, name, profile }
//                                     a YouTube Short we host ourselves —
//                                     plays vertically, credits the channel
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
// 7 Oct 2026 — Project Details (pd-*.mp4), Site Visit (sv-*.mp4, nine)
// and Informative (in-*.mp4, seven) have their own official edits in place
// of the shared eight. 4 Nov 2026 — Project Details is now seven YouTube
// Shorts streamed from YouTube; its MP4s were deleted to lighten the site.

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

// A YouTube Short streamed from YouTube (nothing hosted here but its
// /posters/<id>.jpg still), credited to the channel that posted it
const ytShort = (id, caption, channel, name) => ({
  youtube: id,
  short: true,
  caption,
  handle: `@${channel}`,
  name,
  profile: `https://www.youtube.com/@${channel}`,
})

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
    // Project Details (4 Nov 2026) — YouTube Shorts, streamed from YouTube
    // (no MP4s in /videos). Covers are small stills in /posters/<id>.jpg;
    // the first one is the pillar's cover in the "Six kinds of proof" strip.
    reels: [
      ytShort('G-xHxhe3nVc', 'Why channel partners must educate homebuyers', 'engineershorizon7656', 'Engineers Horizon'),
      ytShort('PlCyHS6BgL8', 'The crucial role of channel partners', 'vipinsuri13', 'Vipin Suri'),
      ytShort('ssvYWsFw79o', 'Real estate truth: why you need a channel partner', 'Trpspodcast', 'TRPS — Trending Realestate Property Show'),
      ytShort('35KksBTfN-Y', 'Who should consider a career in real estate? — Bhaswar Paul', 'vipinsuri13', 'Vipin Suri'),
      ytShort('7Q1mlgycuJ8', 'NoBroker’s innovative approach to real estate', 'OddPlus6334', 'Oddplus'),
      ytShort('Gins0uHKsYw', 'Risk-free work in real estate? Start with rental property broking', 'VinodSaini-skybyte', 'Vinod Saini'),
      ytShort('8yaFsRgHQNc', 'Lights, camera, real estate — the podcast behind the scenes', 'realtynmore', 'Realty & More'),
    ],
  },
  {
    id: 'site-visit',
    label: 'Site Visit',
    tag: 'On-ground',
    icon: 'footprints',
    objection: 'Is anyone really buying?',
    answer: 'Answered by real visitors.',
    // AXAMP's official Site Visit edits (16 Oct 2026). The MDB one is the
    // same file the Informative pillar uses (in-mdb-london-square.mp4).
    reels: [
      { file: 'sv-max-estate-128', caption: 'Max Estate 128, Noida — a hard-hat visit to the balconies and the view' },
      { file: 'sv-sector-66-site', caption: 'Sector 66 — around 4.5 acres, toured on site' },
      { file: 'sv-dlf-phase-1-floor', caption: 'DLF Phase 1 builder floor — staircase, kitchen and living, walked through' },
      { file: 'sv-biggest-family-house', caption: 'The biggest family house — a floor-by-floor visit' },
      { file: 'sv-sample-flat-walkthrough', caption: 'Sample flat walkthrough — living room, bedrooms and garden deck' },
      { file: 'sv-bollywood-style-floor', caption: 'Bollywood-style builder floor — chandeliers, marble and the terrace' },
      { file: 'sv-red-carpet-sample-flat', caption: 'Red-carpet sample flat visit — the dining room, the balcony and the welcome' },
      { file: 'in-mdb-london-square', caption: 'MDB London Square — on site: 2 acres, student footfall and ₹45K monthly rental income' },
    ],
  },
  {
    id: 'branding',
    label: 'Informative',
    tag: 'Podcast · Key leaders',
    icon: 'mic',
    objection: 'Who am I trusting with this?',
    answer: 'Answered on a podcast with key leaders.',
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
    // Real buyer testimonials (16 Oct 2026) — hosted in /videos and /posters
    reels: [
      { ig: 'https://www.instagram.com/p/DdBq0i-Mx2F/', poster: '/posters/DdBq0i-Mx2F.jpg', caption: 'Mateshwari Group — Janakpuri buyers, two years after delivery, on why the trust still stands' },
      { ig: 'https://www.instagram.com/p/DaZyjYBxJp7/', poster: '/posters/DaZyjYBxJp7.jpg', caption: 'Viviana Westin, Vadodara — the Bajpai family on why they chose the community and the concept' },
      { ig: 'https://www.instagram.com/p/Dbxn5qxpdA9/', poster: '/posters/Dbxn5qxpdA9.jpg', caption: 'KRE Arihant, Udaipur — the Chaudhary family on life in their new bungalow' },
      { ig: 'https://www.instagram.com/p/Dc02Sl6Iltn/', poster: '/posters/Dc02Sl6Iltn.jpg', caption: 'Two brothers on finding the right home for their joint family in Brampton' },
      { ig: 'https://www.instagram.com/p/DcliMVixxPe/', poster: '/posters/DcliMVixxPe.jpg', caption: 'After 50+ homes viewed — a couple on how they finally found the one' },
      { ig: 'https://www.instagram.com/p/DcvXQgwCATY/', poster: '/posters/DcvXQgwCATY.jpg', caption: 'Piramal Revanta, Mulund — homeowners on the planning, the detail and the quality' },
      { ig: 'https://www.instagram.com/p/DT2u-E5DLkf/', poster: '/posters/DT2u-E5DLkf.jpg', caption: 'A happy 2BHK homeowner on the home they envisioned, delivered' },
      { ig: 'https://www.instagram.com/p/DYgbl1kIKz_/', poster: '/posters/DYgbl1kIKz_.jpg', caption: 'Mrs. Manisha and Dr. Avnish Seth on trusting a studio with the design of their home' },
    ],
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
    reel.poster ?? info?.cover ?? (reel.file ? `/posters/${id}.webp` : reel.ig || reel.short ? `/posters/${id}.jpg` : null)
  const remotePoster = reel.ig
    ? `https://www.instagram.com/p/${id}/media/?size=l`
    : reel.youtube
      ? `https://i.ytimg.com/vi/${id}/${reel.short ? 'oar2' : 'maxresdefault'}.jpg`
      : null

  return {
    key: `${section.id}-${id}`,
    type: reel.ig ? 'instagram' : reel.file ? 'file' : 'youtube',
    image: !!reel.image, // photo post — shown as an image, never as video
    id,
    // Our own videos have no post of their own — link to AXAMP's profile
    url: reel.ig ?? (reel.file
      ? site.instagram
      : reel.short ? `https://www.youtube.com/shorts/${reel.youtube}` : `https://www.youtube.com/watch?v=${reel.youtube}`),
    short: !!reel.short, // vertical YouTube Short — post view, not the wide frame
    video: reel.image ? null : (reel.video ?? (reel.ig || reel.file ? `/videos/${id}.mp4` : null)),

    /* Card tries `poster` first, then `posterFallback`. */
    poster: localPoster ?? remotePoster,
    posterFallback: remotePoster,

    caption: reel.caption || info?.caption || `${section.label} — AXAMP`,
    warm: section.tone === 'warm',

    // Client account + public numbers, shown in the on-site player
    handle: reel.handle ?? info?.handle,
    name: reel.name ?? (info && `${info.name} · ${info.place}`),
    profile: reel.profile,
    client: info?.name,
    kind: info?.kind,
    place: info?.place,
    likes: info?.likes,
    comments: info?.comments,
    views: info?.views,
  }
}
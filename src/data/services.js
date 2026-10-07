// ─── Hero service switcher ──────────────────────────────────────────────
// The first entry is the default. `accent` tints the switcher pill,
// eyebrow, headline gradient and CTA for that service.
// `cta.target` is any in-page selector (pillar ids, '#contact', …).

export const services = [
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: 'building',
    accent: '#53f7fb',
    accentRgb: '83, 247, 251',
    eyebrow: 'Viral video for real estate',
    headline: ["From Leads to 100%", 'Guaranteed site visits'],
    description:
      'Drone, walkthrough and on-ground reels that answer every buyer objection — before the site visit.',
    cta: { label: 'Watch Our Work', target: '#area', icon: 'play' },
  },
  {
    id: 'hospital',
    label: 'Hospital',
    icon: 'user',
    accent: '#7dffb3',
    accentRgb: '125, 255, 179',
    eyebrow: 'Personal branding for founders & experts',
    headline: ['Your face.', 'Your authority.'],
    description:
      'Scripted, shot and edited talking-head content that turns your expertise into trust — and trust into inbound.',
    cta: { label: 'Watch Our Work', target: '#facilities', icon: 'play' },
  },
  {
    id: 'university',
    label: 'University',
    icon: 'graduation',
    accent: '#ff7a50',
    accentRgb: '255, 122, 80',
    eyebrow: 'Video for hospitals & universities',
    headline: ['Trust, before', 'the first visit.'],
    description:
      'Campus tours, doctor stories and real patient & student testimonials that help families choose you with confidence.',
    cta: { label: 'Book a Call', target: '#contact', icon: 'arrow' },
  },
]

// ─── What the home page shows for each hero switcher choice ─────────────
// Keys match the `id`s in ./services.js. Anything without its own entry
// falls back to real estate.

import { pillars } from './work'
import { hospitalPillars } from './hospital'
import { universityPillars } from './university'

export const industries = {
  'real-estate': {
    key: 'real-estate',
    pillars,
    audience: 'buyer',
    stripEyebrow: 'Six kinds of proof',
    stripTitle: "Before Your Buyer asks, they're already looking for this 6 answers.",
  },
  hospital: {
    key: 'hospital',
    pillars: hospitalPillars,
    audience: 'patient',
    pillarStyle: 'showcase', // coverflow instead of the 3D ring (Pillar.jsx)
    stripEyebrow: 'Six kinds of proof',
    stripTitle: "Before your patient asks, they're already looking for these 6 answers.",
  },
  university: {
    key: 'university',
    pillars: universityPillars,
    audience: 'student',
    pillarStyle: 'orbit', // reels orbit the copy instead of the 3D ring (Pillar.jsx)
    stripEyebrow: 'Six kinds of proof',
    stripTitle: "Before your student asks, they're already looking for these 6 answers.",
  },
}

export const getIndustry = (id) => industries[id] ?? industries['real-estate']

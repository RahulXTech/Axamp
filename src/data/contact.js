// ─── Contact page content ───────────────────────────────────────────────
// Options shown as tap-to-select tiles in the contact form.
// `icon` is a lucide name, mapped in components/ContactForm.jsx.

export const industries = [
  { label: 'Real Estate', icon: 'building' },
  { label: 'Hospital', icon: 'hospital' },
  { label: 'University', icon: 'graduation' },
  { label: 'Personal Brand', icon: 'user' },
  { label: 'Other', icon: 'sparkles' },
]

// Hero switcher id → industry preselected on the form
export const industryFromSwitcher = {
  'real-estate': 'Real Estate',
  hospital: 'Hospital',
  university: 'University',
}

export const needs = [
  { label: 'Video shoots & reels', icon: 'clapperboard' },
  { label: 'Social media management', icon: 'phone' },
  { label: 'Performance ads', icon: 'megaphone' },
  { label: 'Personal branding', icon: 'mic' },
  { label: 'Lead automation', icon: 'workflow' },
  { label: 'Influencer campaigns', icon: 'users' },
]

// TODO(AXAMP): adjust the ranges to match your packages
export const budgets = ['₹1 Lakh', '₹1L – ₹1.5L', '₹1.5k – ₹2L', '₹2L - ₹2.5L', 'Not sure yet']

export const contactMethods = ['WhatsApp', 'Call', 'Email']

// TODO(AXAMP): tweak to match how you actually onboard a client
export const nextSteps = [
  { title: 'You send your details', text: 'Takes about a minute — no long briefs needed.' },
  { title: 'We get on a quick call', text: 'We learn your goals, audience and timeline.' },
  { title: 'You get a clear plan', text: 'Content, ads and pricing tailored to your business.' },
]

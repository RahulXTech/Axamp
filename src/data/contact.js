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
  { label: 'UGC content creation', icon: 'clapperboard' },
  { label: 'Social media management', icon: 'phone' },
  { label: 'Performance marketing', icon: 'megaphone' },
  { label: 'Personal branding', icon: 'mic' },
  { label: 'Lead-to-sale system', icon: 'workflow' },
  { label: 'Everything', icon: 'sparkles' },
]

export const budgets = ['Below ₹1L', '₹1L – ₹2L', '₹2L – ₹3L', '₹3L – ₹4L', '₹4L – ₹5L', 'Not sure yet']

export const contactMethods = ['WhatsApp', 'Call', 'Email']

// TODO(AXAMP): tweak to match how you actually onboard a client
export const nextSteps = [
  { title: 'You send your details', text: 'Takes about a minute — no long briefs needed.' },
  { title: 'We get on a quick call', text: 'We learn your goals, audience and timeline.' },
  { title: 'You get a clear plan', text: 'Content, ads and pricing tailored to your business.' },
]

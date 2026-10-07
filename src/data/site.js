// ─── Contact + social details ───────────────────────────────────────────
export const site = {
  name: 'AXAMP',
  legalName: 'AXAMP Private Limited',
  tagline: 'Building brands, not just campaigns.',

  email: 'info@axamp.com',

  // Shown as-is; `phoneTel` is what the dialer gets
  phone: '+91-8826088011',
  phoneTel: '+918826088011',

  // WhatsApp number in international format, digits only
  whatsapp: '918826088011',
  whatsappMessage: "Hi AXAMP, I'd like to book a call about my next project.",

  address: {
    lines: ['A-Tower, 8th Floor, Spectrum @Metro Mall', 'Sector 75, Noida, Gautam Buddh Nagar', 'Uttar Pradesh, India — 201301'],
    short: 'Spectrum @Metro Mall, Sector 75, Noida',
  },
  hours: [
    ['Mon – Sat', '10:00 AM – 7:00 PM'],
    ['Sunday', 'Closed'],
  ],

  instagram: 'https://www.instagram.com/axampofficial/',
  facebook: 'https://www.facebook.com/axampinfinity/',
  linkedin: 'https://www.linkedin.com/company/axampinfinity/',
  // TODO(AXAMP): add the real channel link, then show it in the footer / menu
  youtube: 'https://www.youtube.com/',
}

export const whatsappLink = (message = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`

// Pre-filled WhatsApp message for each hero switcher choice (ids in ./services.js)
export const industryWhatsappMessage = {
  'real-estate': "Hi AXAMP, I'd like to talk about video marketing for my real-estate project.",
  hospital: "Hi AXAMP, I'd like to talk about video marketing for my hospital.",
  university: "Hi AXAMP, I'd like to talk about video marketing and admissions for my university.",
}

export const mapsLink = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'A-Tower, Spectrum Metro Mall, Sector 75, Noida, Uttar Pradesh 201301',
  )}`

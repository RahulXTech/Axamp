// ─── AXAMP-made client reels ────────────────────────────────────────────
// One place for every reel's client + public Instagram numbers (likes /
// comments as shown on each post, fetched 1 Oct 2026). Used by the
// proof pillars (work.js) and the performance section.
//
// Covers live in /public/posters/<reelId>.webp. Instagram doesn't expose
// view counts publicly — add `views: 120000` to a reel to show it.

export const clients = {
  waveoneclub: { name: 'Wave One Club', handle: 'waveoneclub', place: 'Noida', kind: 'Club & lifestyle', group: 'estate' },
  kwr: { name: 'KWR Group', handle: 'kwr.group', place: 'Vrindavan', kind: 'Real estate', group: 'estate' },
  waveonemall: { name: 'Wave One Mall', handle: 'waveone_noida', place: 'Sector 18, Noida', kind: 'Retail mall', group: 'retail' },
  barista: { name: 'Barista', handle: 'barista_spectrummetro', place: 'Spectrum Metro, Noida', kind: 'Café', group: 'retail' },
}

const list = [
  { id: 'Da0tRfPveuZ', client: 'waveoneclub', likes: 25000, comments: 7105, date: '2026-07-15', caption: 'I bet you can’t imagine this hidden gem of Noida 🤗' },
  { id: 'DdUXRByzY2p', client: 'waveoneclub', likes: 756, comments: 116, date: '2026-09-15', caption: 'Hidden floor at 15th Floor 🤞🏻' },
  { id: 'DdYKEi4y4tV', client: 'kwr', likes: 412, comments: 1, date: '2026-09-16', caption: 'Comment “vrindavan” for location and project details ✨' },
  { id: 'Dc_xg4oySsD', client: 'waveonemall', likes: 71, comments: 0, date: '2026-09-07', caption: 'One Two Three Four…….' },
  { id: 'DZ-jcZtztUq', client: 'barista', likes: 47, comments: 0, date: '2026-06-24', caption: 'Mam be like — Hamara Maths alag hai 🤪' },
  { id: 'DaGW4sezPkr', client: 'barista', likes: 35, comments: 0, date: '2026-06-27', caption: 'Work from Cafe only at 👇🏻' },
  { id: 'Da0uWKuSF86', client: 'waveonemall', likes: 32, comments: 0, date: '2026-07-15', caption: '@miabytanishq at Wave One, Sector-18, Noida' },
  { id: 'DYrgVitzsF_', client: 'barista', likes: 17, comments: 0, date: '2026-05-23', caption: 'Came for the coffee… stayed because the food had main character energy 😌☕' },
  { id: 'Dcy9A2wT6Iu', client: 'waveoneclub', likes: 15, comments: 15, date: '2026-09-02', caption: 'Comment ‘Club’ to get the Lifetime Membership Details 👇🏻' },
  { id: 'DcolKzgveyY', client: 'waveoneclub', likes: 10, comments: 0, date: '2026-08-29', caption: 'When Luxury defines the Destination' },
  { id: 'DYb3b4BzR4t', client: 'barista', likes: 4, comments: 0, date: '2026-05-17', caption: 'If serving good food is a crime, arrest us 😌☀️' },
]

const withClient = (rows, from) =>
  rows.map((r) => ({
    ...r,
    ...from[r.client],
    url: `https://www.instagram.com/reel/${r.id}/`,
    cover: `/posters/${r.id}.webp`,
  }))

export const clientReels = withClient(list, clients)

// ─── Hospital reels ─────────────────────────────────────────────────────
// Used only by the Hospital proof pillars (data/hospital.js). Kept out of
// clientReels so the real-estate stats and showcases stay unchanged.
// Numbers fetched 3 Oct 2026.

export const healthClients = {
  blk: { name: 'BLK-Max Super Speciality Hospital', handle: 'blk_hospital', place: 'New Delhi', kind: 'Hospital', group: 'health' },
  max: { name: 'Max Healthcare', handle: 'max.healthcare', place: 'Delhi NCR', kind: 'Hospital', group: 'health' },
  apollo: { name: 'Indraprastha Apollo Hospitals', handle: 'apollohospitaldelhi', place: 'New Delhi', kind: 'Hospital', group: 'health' },
  bharti: { name: 'Bharti Multi Speciality Hospital', handle: 'bharti_hospital_', place: 'Uttam Nagar, Delhi', kind: 'Hospital', group: 'health' },
  moin: { name: 'Smart Moin', handle: 'kingmoinofficial', place: 'at Bharti Hospital', kind: 'Creator collab', group: 'health' },
  n8nstack: { name: 'N8nstack', handle: 'n8nstack', place: 'AI automation', kind: 'Creator', group: 'health' },
  anatomix: { name: 'AnatomiX 3D', handle: 'anatomix3d_', place: '3D anatomy', kind: 'Medical animation', group: 'health' },
  anatomixTr: { name: 'Anatomix 3D Anatomi', handle: 'anatomix3d', place: 'Anatomy explainers', kind: 'Medical animation', group: 'health' },
  medAnim: { name: 'Medical Animation Media', handle: 'medicalanimationmedia', place: 'Procedure explainers', kind: 'Medical animation', group: 'health' },
  pradip: { name: 'Dr. Pradip Vekariya', handle: 'dr_pradip_gastroenterologist', place: 'Gastroenterologist', kind: 'Doctor', group: 'health' },
  makeGood: { name: 'Make Good Living', handle: 'makegoodliving', place: 'Women’s health', kind: 'Health creator', group: 'health' },
}

const healthList = [
  // Doctors on camera
  { id: 'DaPu7KHNBhZ', client: 'blk', likes: 916, comments: 3, date: '2026-07-01', caption: 'Urinary symptoms should never be ignored — Dr V.P. Singh Rana explains when to see a urologist.' },
  { id: 'DZAhzOsBfyw', client: 'blk', likes: 35, comments: 0, date: '2026-05-31', caption: 'Planning a family? Dr Saloni Arora on why a simple thalassaemia screening before pregnancy matters.' },
  { id: 'DdtYdQmiNwm', client: 'max', likes: 339, comments: 2, date: '2026-09-25', caption: 'Max Medical Minds — Dr Paresh Jain on a successful paediatric kidney transplant.' },
  { id: 'Dc0LasJzPU0', client: 'bharti', likes: 155, comments: 12, date: '2026-09-03', caption: 'Dr Bharti Singh, Chairman — inside Bharti Hospital.' },
  // The hospital itself
  { id: 'DaFPqyUieP6', client: 'apollo', likes: 55, comments: 0, date: '2026-06-27', caption: 'Rectal cancer surgery is among the most intricate procedures — see how precision tech changes it.' },
  { id: 'DVTZ03yidHK', client: 'max', likes: 77, comments: 4, date: '2026-02-28', caption: 'Advancing cancer care — more precise, more personalised and more hopeful than ever.' },
  { id: 'DXPRAU8B0S5', client: 'blk', likes: 8, comments: 0, date: '2026-04-17', caption: 'Spine Summit Live: Surgery to Rehabilitation CME at BLK-Max, New Delhi.' },
  // Patients & families
  { id: 'DcdWKAXgciw', client: 'moin', likes: 381, comments: 5, date: '2026-08-25', caption: 'Bharti Hospital’s chairman blesses a newborn 💛' },
  { id: 'DdwC7cXTtpY', client: 'bharti', likes: 72, comments: 0, date: '2026-09-26', caption: 'Smiles at the bedside — care at Bharti Hospital.' },
  // AI automation
  { id: 'DNX7z4Wor5T', client: 'n8nstack', likes: 61, comments: 83, date: '2025-08-15', caption: 'Cold emails fail when they feel copy-pasted — this n8n automation writes a personal icebreaker for every prospect.' },
  { id: 'DX5YW2Lgbrz', client: 'n8nstack', likes: 788, comments: 0, caption: 'There are 3 levels of AI — Generative, Agentic and AI Agents. Most people are stuck at level 1.' },
  { id: 'Dc_CTQRTjKK', client: 'n8nstack', likes: 70, comments: 0, caption: 'AI is powerful — but should it automate everything? Where human judgment still matters.' },
  { id: 'DTmm_p8kQv9', client: 'n8nstack', likes: 39, comments: 0, caption: 'Why automation skills are the future-proof skill of modern work.' },
  // Doctor consultations (numbers fetched 6 Oct 2026)
  { id: 'DSuDMe7kaSk', client: 'pradip', likes: 156, comments: 0, date: '2025-12-26', caption: 'Liver cancer doesn’t happen overnight — the tests that catch it early, from AFP and LFT to ultrasound.' },
  // 3D medical animation (numbers fetched 6 Oct 2026)
  { id: 'Db1D69UjoGB', client: 'anatomix', likes: 967, comments: 4, date: '2026-08-09', caption: 'Inside the human skull — a 3D look at the brain and nervous system.' },
  { id: 'Db_Q3JZAX8R', client: 'anatomix', likes: 96, comments: 1, date: '2026-08-13', caption: 'Twin development in utero — growth and life before birth, in 3D.' },
  { id: 'Dd66SVZjFFJ', client: 'anatomix', likes: 54, comments: 0, date: '2026-09-30', caption: 'What happens inside your ear when you hear a sound — from eardrum to cochlea to brain.' },
  { id: 'DdEl7fNjPyu', client: 'anatomix', likes: 37, comments: 0, date: '2026-09-09', caption: 'The shoulder joint in 3D — how muscles, tendons and bones move together.' },
  { id: 'DVJooKwjV3d', client: 'anatomixTr', likes: 30, comments: 0, date: '2026-02-24', caption: 'The science behind your workout — how a muscle fibre tears and rebuilds stronger.' },
  { id: 'DeJfUiJz-5A', client: 'makeGood', likes: 3, comments: 1, date: '2026-10-06', caption: 'What is leucorrhoea (white discharge)? When it’s normal and when to see a doctor.' },
  // Procedures, step by step (numbers fetched 6 Oct 2026)
  { id: 'DcHCSR1CWhf', client: 'medAnim', likes: 18, comments: 1, date: '2026-08-16', caption: 'Inside a colonoscopy — how doctors check the large intestine for polyps and early cancer.' },
]

export const healthReels = withClient(healthList, healthClients)

// ─── University reels ───────────────────────────────────────────────────
// Used only by the University proof pillars (data/university.js).
// Numbers fetched 5 Oct 2026.

export const campusClients = {
  iitd: { name: 'IIT Delhi', handle: 'iitdelhi', place: 'New Delhi', kind: 'University', group: 'campus' },
  outreach: { name: 'IIT Delhi Outreach', handle: 'outreach_iitd', place: 'New Delhi', kind: 'University', group: 'campus' },
  edc: { name: 'eDC, IIT Delhi', handle: 'edc_iitd', place: 'New Delhi', kind: 'University', group: 'campus' },
  pravritti: { name: 'Pravritti, IIT Delhi', handle: 'pravritti_iitd', place: 'New Delhi', kind: 'Career fest', group: 'campus' },
}

const campusList = [
  { id: 'DbIUObzh4qM', client: 'iitd', likes: 2631, comments: 0, date: '2026-07-23', caption: 'Welcome to IIT Delhi, future innovators — orientation week and a first look at the campus.' },
  { id: 'DUESWyVE3iw', client: 'edc', likes: 3934, comments: 381, date: '2026-01-28', caption: 'BECon 2026 — founders, researchers and investors shaping AI and deep-tech at IIT Delhi.' },
  { id: 'DFLiNfpTp00', client: 'pravritti', likes: 1190, comments: 42, date: '2025-01-23', caption: 'Pravritti 2025 — IIT Delhi’s annual career fest, opening career skylines.' },
  { id: 'DOaF6Rhjoqc', client: 'outreach', likes: 1264, comments: 2, date: '2025-09-09', caption: 'Manasvi STEM mentorship — maths and physics labs, flying drones and the lanes of IITD.' },
  { id: 'DZVQO56Suc7', client: 'outreach', likes: 491, comments: 1, date: '2026-06-08', caption: 'From a small village to IIT Delhi to founder & CEO — Surabhi Yadav on what IITD gave her.' },
  { id: 'DYECqNNySkB', client: 'outreach', likes: 1411, comments: 6, date: '2026-05-07', caption: 'Dreaming of IIT Delhi? Meet students and faculty at the IIT Delhi Open Houses.' },
  { id: 'DZE28P1uce2', client: 'outreach', likes: 733, comments: 10, date: '2026-06-02', caption: 'Cracked JEE Advanced? Academics, placements and campus life — answered at the Open House.' },
]

export const campusReels = withClient(campusList, campusClients)

export const reelById = Object.fromEntries([...clientReels, ...healthReels, ...campusReels].map((r) => [r.id, r]))

// Small numbers look weak on a sales page, so counts below this are hidden
// (the reel still shows; the live count is one click away on Instagram).
export const SHOW_COUNT_FROM = 100

// 25000 → "25K", 26399 → "26.3K", 7105 → "7,105" (rounds down, never overstates)
const down = (n, unit) => Math.floor((n / unit) * 10) / 10
export const compact = (n) =>
  n >= 1e6 ? `${down(n, 1e6)}M` : n >= 1e4 ? `${down(n, 1e3)}K` : n.toLocaleString('en-IN')

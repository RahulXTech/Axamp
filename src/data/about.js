// ─── About page content ─────────────────────────────────────────────────
// Icons are lucide-react names, mapped in src/pages/About.jsx.

export const stats = [
  { value: '7+', label: 'Years in digital strategy' },
  { value: '20+', label: 'Brands grown' },
  { value: '6', label: 'Sectors — real estate to lifestyle' },
]

export const founder = {
  name: 'Aditya Upadhyay',
  photo: '/assets/Founder_profile_img.png',
  role: 'Founder & AI Digital Marketing Specialist',
  quote: 'Merging cutting-edge AI with brand storytelling.',
  bio: "With 7+ years of leadership in digital strategy, Aditya drives AXAMP's mission. He has led campaigns for 20+ brands across F&B, healthcare and lifestyle — consistently delivering strong ROI through data-driven innovation.",
  // Floating badges on the photo
  badges: [
    { value: '7+', label: 'Years' },
    { value: '20+', label: 'Brands' },
  ],
  // icon: lucide name, mapped in pages/About.jsx
  skills: [
    { icon: 'brain', label: 'AI & Digital Strategy' },
    { icon: 'trending', label: 'Performance Marketing' },
    { icon: 'layers', label: 'Viral Marketing' },
  ],
  sectors: ['Real Estate', 'Personal Branding', 'Hospital', 'University', 'F&B', 'Lifestyle'],
}

// "Meet the team" — photos in public/assets/team/ (portrait, 4:5).
// Shown in a random order on every visit (pages/About.jsx).
// A member without a `name` / `role` simply shows "AXAMP team".
// `fit: 'contain'` shows the whole photo uncropped (for photos that aren't 4:5).
// TODO(AXAMP): add everyone's role.
// TODO(AXAMP): Riya's photo is very small (187px) — swap in a larger one.
export const team = [
  { name: 'Rahul Kumar', role: '', photo: '/assets/team/rahul-kumar.webp' },
  { name: 'Krishna Verma', role: '', photo: '/assets/team/krishna-verma.webp', fit: 'contain' },
  { name: 'Riya', role: '', photo: '/assets/team/riya.webp' },
  { name: 'Tanishka Sinah Chauhan', role: '', photo: '/assets/team/tanishka-sinah-chauhan.webp' },
  { name: 'Aditya', role: '', photo: '/assets/team/aditya.webp' },
  { name: 'Anand', role: '', photo: '/assets/team/anand.webp' },
]

// "Content that matters" — real, raw, storytelling, fun and relatable.
// `visual` picks the animated preview in components/ContentBento.jsx.
export const principles = [
  { icon: 'clapperboard', visual: 'video', title: 'Video quality', text: 'High-resolution videos and reels that look real and trustworthy.' },
  { icon: 'clock', visual: 'peak', title: 'Peak hours', text: 'Posted when your audience is most active online.' },
  { icon: 'book', visual: 'story', title: 'Storytelling', text: 'Authentic stories that connect emotionally.' },
  { icon: 'smile', visual: 'fun', title: 'Fun moments', text: 'Emotional hooks that bring customers to your door.' },
  { icon: 'sparkles', visual: 'trend', title: 'Entertainment', text: 'Trending, inspiring content people enjoy watching.' },
  { icon: 'messages', visual: 'chat', title: 'Interaction', text: 'Communities that engage — not just people who come to buy.' },
]

// Audience growth, in order
export const growth = [
  { icon: 'magnet', title: 'Attract', text: 'Targeted content and SEO keywords reach new followers.' },
  { icon: 'heart-chat', title: 'Engage', text: 'Replies and conversations build a real community.' },
  { icon: 'click', title: 'Convert', text: 'Clear calls to action turn viewers into followers.' },
  { icon: 'handshake', title: 'Retain', text: 'Consistent value keeps followers loyal.' },
]

// How a project runs, start to finish
export const workflow = [
  { icon: 'search', title: 'Research', text: 'Pick the right platforms and find the niche your audience cares about.' },
  { icon: 'calendar', title: 'Plan', text: 'Build a content calendar around your goals.' },
  { icon: 'camera', title: 'Shoot', text: 'Capture real, high-quality videos and reels.' },
  { icon: 'scissors', title: 'Edit', text: 'Cut for hooks, pace and each platform.' },
  { icon: 'send', title: 'Publish', text: 'Post at peak hours across multiple channels.' },
  { icon: 'trending', title: 'Optimize', text: 'Track the numbers and refine for more conversions.' },
]

// ─── About page content ─────────────────────────────────────────────────
// Icons are lucide-react names, mapped in src/pages/About.jsx.

export const stats = [
  { value: '7+', label: 'Years in digital strategy' },
  { value: '20+', label: 'Brands grown' },
  { value: '6', label: 'Sectors — real estate to lifestyle' },
]

export const founder = {
  name: 'Aditya Upadhyay',
  // 353×375 — a larger photo (~700px wide) would stay sharp on retina screens
  photo: '/assets/Founder_profile_img.webp',
  role: 'Founder & AI Digital Marketing Specialist',
  quote: 'Merging cutting-edge AI with brand storytelling.',
  bio: "With 7+ years of leadership in digital strategy, Aditya drives AXAMP's mission. He has led campaigns for 20+ brands across F&B, healthcare and lifestyle — consistently delivering strong ROI through data-driven innovation.",
  // Floating badges on the photo (icon: lucide name, mapped in pages/About.jsx)
  badges: [
    { value: '7+', label: 'Years experience', icon: 'award' },
    { value: '20+', label: 'Brands grown', icon: 'rocket' },
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
  { name: 'Rahul', role: '', photo: '/assets/team/rahul-kumar.webp' },
  { name: 'Krishna', role: '', photo: '/assets/team/krishna-verma.webp', fit: 'contain' },
  { name: 'Riya', role: '', photo: '/assets/team/riya.webp' },
  { name: 'Tanishka', role: '', photo: '/assets/team/tanishka-sinah-chauhan.webp' },
  { name: 'Aditya', role: '', photo: '/assets/team/aditya.webp' },
  { name: 'Anand', role: '', photo: '/assets/team/anand.webp' },
  { name: 'Shivangi', role: '', photo: '/assets/team/shivangi.jpg' },
]

// The team grid always shows this many boxes (5 per row on desktop);
// slots without a member render as blank boxes at the end.
export const teamSlots = 10

// "Content that matters" — real, raw, storytelling, fun and relatable.
// Cards in components/ContentCarousel.jsx; `image` is a landscape photo (16:10),
// `warm` gives the card the amber accent instead of cyan.
export const principles = [
  { icon: 'clapperboard', image: '/services/ct-ugc.webp', title: 'Video quality', text: 'High-resolution videos and reels that look real and trustworthy.' },
  { icon: 'clock', image: '/services/sm-instagram.webp', warm: true, title: 'Peak hours', text: 'Posted when your audience is most active online.' },
  { icon: 'book', image: '/services/ct-podcast.webp', title: 'Storytelling', text: 'Authentic stories that connect emotionally.' },
  { icon: 'flame', image: '/services/ct-influencer.webp', warm: true, title: 'Viral content', text: 'Scroll-stopping reels built to be shared — reaching thousands beyond your followers.' },
  { icon: 'sparkles', image: '/services/sm-youtube.webp', title: 'Entertainment', text: 'Trending, inspiring content people enjoy watching.' },
  { icon: 'messages', image: '/services/sm-wa-channel.webp', warm: true, title: 'Interaction', text: 'Communities that engage — not just people who come to buy.' },
  { icon: 'drone', image: '/services/ct-drone.webp', title: 'Drone shots', text: 'Sweeping aerial views that show the full scale of your project.' },
  { icon: 'share', image: '/services/meta-ads.webp', warm: true, title: 'Every platform', text: 'One story, cut to fit Instagram, YouTube, Facebook and more.' },
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

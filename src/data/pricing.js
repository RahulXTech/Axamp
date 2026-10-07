// ─── Services (Services page) ───────────────────────────────────────────
// Prices are kept here for reference only — the site doesn't show them;
// visitors pick services and get a quote on WhatsApp.
// `price` → a fixed amount in ₹ (per month for monthly services,
//           paid once for one-time services).
// `rate` + `unit` → a per-unit price range (these run as campaigns).
// `bestFor` → optional one-liner on the card: the job this service does.
// `icon`  → name mapped in components/ServiceCatalog.jsx.
// Card photo → public/services/<service id>.webp (800×500). Swap the file
//           to change a photo; if it's missing the card shows drawn artwork.
// `accent` → the category's colour (hex + "r, g, b" for glows).

const tone = {
  cyan: ['#53f7fb', '83, 247, 251'],
  blue: ['#4f9bff', '79, 155, 255'],
  coral: ['#ff7a50', '255, 122, 80'],
  green: ['#25d366', '37, 211, 102'],
  violet: ['#b18cff', '177, 140, 255'],
  pink: ['#ff6fae', '255, 111, 174'],
  gold: ['#ffc857', '255, 200, 87'],
  mint: ['#7dffb3', '125, 255, 179'],
}

export const catalog = {
  monthly: [
    {
      id: 'social',
      name: 'Social Media Management',
      icon: 'share',
      accent: tone.pink,
      tagline: 'Every platform, each with its own job.',
      services: [
        { id: 'sm-instagram', icon: 'instagram', name: 'Instagram', bestFor: 'Quick engagement', desc: 'Reels, stories and posts made for the scroll — quick hits that earn likes, shares and DMs every day.' },
        { id: 'sm-facebook', icon: 'facebook', name: 'Facebook', bestFor: 'Community & connections', desc: 'Reach the audience that has known you for years — page posts, groups and the word of mouth that still converts.' },
        { id: 'sm-wa-channel', icon: 'whatsapp', name: 'WhatsApp Channel', bestFor: 'Trust & reminders', desc: 'A direct line to your followers’ phones — updates, offers and timely reminders from a name they already trust.' },
        { id: 'sm-linkedin', icon: 'linkedin', name: 'LinkedIn', bestFor: 'Professionals & B2B', desc: 'Thought-leadership posts and company updates that build credibility with decision-makers and talent.' },
        { id: 'sm-youtube', icon: 'youtube', name: 'YouTube', bestFor: 'Long-form deep dives', desc: 'Detailed videos, walkthroughs and explainers — the long format that answers every question before they call.' },
        { id: 'sm-gmb', icon: 'pin', name: 'Google Business Profile', bestFor: 'Google Maps & local SEO', desc: 'Your Google Maps listing (GMB) optimised with photos, posts, reviews and keywords — so nearby customers find you first.' },
      ],
    },
    {
      id: 'ads',
      name: 'Performance Marketing',
      icon: 'target',
      accent: tone.blue,
      tagline: 'Ads tuned every week for real results.',
      services: [
        { id: 'meta-ads', icon: 'megaphone', name: 'Meta Ads', desc: 'Facebook and Instagram ad campaigns with weekly optimization and reporting.', price: 15000 },
        { id: 'google-ads', icon: 'search', name: 'Google Ads', desc: 'Search, display and YouTube campaigns with full performance tracking.', price: 20000 },
        { id: 'li-ads', icon: 'briefcase', name: 'LinkedIn Ads', desc: 'B2B lead generation campaigns on LinkedIn for targeted professional reach.', price: 20000 },
      ],
    },
    {
      id: 'content',
      name: 'Content Creation',
      icon: 'clapperboard',
      accent: tone.coral,
      tagline: 'Every format your audience watches.',
      services: [
        { id: 'ct-ugc', icon: 'users', name: 'UGC Content', bestFor: 'Authentic & relatable', desc: 'Real people, real reactions — creator-style videos that feel native to the feed and earn trust fast.' },
        { id: 'ct-ads', icon: 'film', name: 'Ad Videos', bestFor: 'Paid campaigns', desc: 'Hook-first video ads, scripted and cut to convert on Meta, Google and YouTube.' },
        { id: 'ct-podcast', icon: 'podcast', name: 'Podcast', bestFor: 'Authority & trust', desc: 'In-depth conversations with you and your experts, filmed in studio quality and clipped into reels.' },
        { id: 'ct-influencer', icon: 'handshake', name: 'Influencer Collaborations', bestFor: 'Borrowed reach', desc: 'Creators who match your audience — sourced, briefed and tracked from the first DM to the final report.' },
        { id: 'ct-drone', icon: 'drone', name: 'Drone Videos', bestFor: 'Scale & wow factor', desc: 'Cinematic aerial shots that show the full picture — location, size and surroundings in one sweep.' },
        { id: 'ct-3d', icon: 'box', name: '3D Rendering', bestFor: 'See it before it’s built', desc: 'Photoreal 3D renders and walkthroughs that bring products, spaces and projects to life before they exist.' },
      ],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp API',
      icon: 'whatsapp',
      accent: tone.green,
      tagline: 'Automated chats that capture every lead.',
      services: [
        { id: 'wa-bulk', icon: 'send', name: 'Bulk Messaging', desc: 'Broadcast campaigns to up to 10,000 contacts per month via WhatsApp API.', price: 25000 },
        { id: 'wa-auto', icon: 'messages', name: 'Automation Reply Chat', desc: 'Automated chatbot reply flows for lead capture, FAQs and follow-ups.', price: 15000 },
        { id: 'ai-agents', icon: 'bot', name: 'AI Agents + CRM', desc: 'AI-powered conversational agents to handle queries and book appointments.', price: 15000 },
      ],
    },
    {
      id: 'graphics',
      name: 'Graphics & Carousels',
      icon: 'palette',
      accent: tone.violet,
      tagline: 'On-brand designs, ready to post.',
      services: [
        { id: 'posts', icon: 'image', name: 'Social Media Posts', desc: '15 designed social media posts per month — static, branded and ready to post.', price: 15000 },
        { id: 'carousels', icon: 'gallery', name: 'Carousel Designs', desc: '10 multi-slide carousel posts optimized for engagement and saves.', price: 15000 },
        { id: '3d-anim', icon: 'box', name: '3D / Illustration / Animation', desc: 'Premium motion graphics, 3D renders and brand illustrations per month.', price: 25000 },
      ],
    },
    {
      id: 'video',
      name: 'Video Production',
      icon: 'video',
      accent: tone.cyan,
      tagline: 'Pro shoots, from podcasts to drones.',
      services: [
        { id: 'podcast', icon: 'mic', name: 'Podcast / 1 Video', desc: 'One professionally produced video or podcast episode per month.', price: 15000 },
        { id: 'cgi-drone', icon: 'drone', name: 'CGI / Drone Video', desc: 'One CGI product story or drone aerial shoot per month.', price: 20000 },
        { id: 'event', icon: 'party', name: 'Event Shoot / Full Video', desc: 'Complete event coverage or long-form brand video production.', price: 50000 },
      ],
    },
    {
      id: 'lift',
      name: 'Lift Marketing',
      icon: 'elevator',
      accent: tone.gold,
      tagline: 'Screens in high-footfall building lifts.',
      services: [
        { id: 'lift-poster', icon: 'poster', name: 'Static Poster', desc: 'Premium elevator static poster advertising — ideal for high-footfall building lifts.', rate: '₹1,100–1,500', unit: 'screen' },
        { id: 'lift-portrait', icon: 'portrait', name: 'Portrait Video (15 sec)', desc: '15-second portrait format video ad played on lift screens for maximum brand visibility.', rate: '₹1,000–1,300', unit: 'screen' },
        { id: 'lift-landscape', icon: 'landscape', name: 'Landscape Video (15 sec)', desc: '15-second landscape format video ad on lift screens to capture commuter attention.', rate: '₹1,000–1,300', unit: 'screen' },
      ],
    },
    {
      id: 'pamphlet',
      name: 'Pamphlet Distribution',
      icon: 'newspaper',
      accent: tone.mint,
      tagline: 'Your flyer, in local hands.',
      services: [
        { id: 'pam-news', icon: 'newspaper', name: 'Pamphlet Distribution', desc: 'Insert your pamphlets into newspaper deliveries to reach local households.', rate: '₹1–2', unit: 'newspaper' },
        { id: 'pam-delivery', icon: 'bike', name: 'Online Delivery', desc: 'Pamphlets packed with Zomato, Blinkit, Zepto and Swiggy orders for brand reach.', rate: '₹10–14', unit: 'piece' },
        { id: 'pam-direct', icon: 'pin', name: 'Direct Distribution', desc: 'Physical pamphlet distribution at walk-in locations and high-traffic zones.', rate: '₹2–3', unit: 'piece' },
      ],
    },
    {
      id: 'bulk',
      name: 'Bulk SMS / WhatsApp Campaigns',
      icon: 'send',
      accent: tone.blue,
      tagline: 'Reach thousands in one go.',
      services: [
        { id: 'bulk-wa', icon: 'whatsapp', name: 'WhatsApp Campaigns', desc: 'Mass WhatsApp messaging campaigns to contacts for promotions.', rate: '₹0.25–0.50', unit: 'number' },
        { id: 'bulk-sms', icon: 'sms', name: 'Bulk SMS Campaigns', desc: 'High-volume SMS broadcast to numbers for offers, alerts and brand awareness.', rate: '₹0.10–0.25', unit: 'number' },
        { id: 'bulk-email', icon: 'mail', name: 'Bulk Email Campaigns', desc: 'Targeted email marketing to large contact lists with branded templates and analytics.', rate: '₹0.10–0.15', unit: 'number' },
      ],
    },
  ],
  oneTime: [
    {
      id: 'web',
      name: 'Website Development',
      icon: 'globe',
      accent: tone.cyan,
      tagline: 'Fast, mobile-ready sites that convert.',
      services: [
        { id: 'landing', icon: 'panel', name: 'Basic Landing Page', desc: 'Clean, conversion-focused single-page website — fast and mobile-ready.', price: 20000 },
        { id: 'ecom', icon: 'cart', name: 'E-Commerce Store Setup', desc: 'Full online store with product pages, cart, checkout and payment gateway.', price: 45000 },
        { id: 'web-auto', icon: 'workflow', name: 'Full Website + Automation', desc: '3-page website with payment integration, backend setup and automation flows.', price: 100000 },
      ],
    },
    {
      id: 'brand',
      name: 'Brand Kit',
      icon: 'pen',
      accent: tone.pink,
      tagline: 'A look people remember.',
      services: [
        { id: 'logo', icon: 'pen', name: 'Logo + Color Palette', desc: 'Custom logo design with a complete brand color palette and usage guide.', price: 10000 },
        { id: 'mockups', icon: 'package', name: 'Mockups & Designs', desc: 'Brand mockups for packaging, merchandise and marketing collateral.', price: 10000 },
        { id: 'posters', icon: 'images', name: '5 Posters / Banners', desc: '5 premium designed posters or banners for offline and digital use.', price: 10000 },
      ],
    },
    {
      id: 'apps',
      name: 'App Development',
      icon: 'app',
      accent: tone.violet,
      tagline: 'Custom apps, dashboards and backends.',
      services: [
        { id: 'mobile-app', icon: 'phone', name: 'Mobile App', desc: 'Custom Android or iOS mobile application built for your business needs.', price: 150000 },
        { id: 'web-app', icon: 'dashboard', name: 'Web App / Dashboard', desc: 'Custom web application or admin dashboard with full backend integration.', price: 80000 },
        { id: 'api', icon: 'plug', name: 'API & Backend Setup', desc: 'Third-party API integrations, payment gateways and backend architecture setup.', price: 50000 },
      ],
    },
  ],
}

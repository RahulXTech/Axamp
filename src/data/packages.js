// ─── Packages (Packages page) ───────────────────────────────────────────
// Three cards, five packages. Branding and Performance Marketing each hold
// two packages (a switch on the card picks one); Super Premium is one.
// Details come from the founder's notes and the client proposals
// (AXAMP_Proposal_*.pdf). Change a line here and both the card and the
// "Full details" panel update.
//
// `cards`  → the three cards on the page, in order. `plans` → the ids of
//            the packages inside each card.
// `plans`  → every package. `label` is its name on the card switch,
//            `fee` the monthly fee in ₹ before GST (GST is worked out at
//            18%), `highlights` the lines on the card front. Everything
//            else lives in the details panel.

import { site } from './site'

export const GST_RATE = 0.18

// Set to false to hide every price on the page (cards, panel)
export const SHOW_PRICES = true

export const inr = (n) => `₹${n.toLocaleString('en-IN')}`
// 65000 → ₹65K, 120000 → ₹1.2L
export const inrShort = (n) => (n >= 100000 ? `₹${+(n / 100000).toFixed(2)}L` : `₹${n / 1000}K`)
export const withGst = (fee) => ({ gst: Math.round(fee * GST_RATE), total: Math.round(fee * (1 + GST_RATE)) })

// Paid by the client straight to Meta / Google / WhatsApp — never through us
const adSpend = {
  title: 'Ad spend',
  text: 'The money that goes to Meta / Google to show your ads — paid directly by you to the platform. We recommend the right budget for your monthly lead target, ticket size and goals, and share it before launch.',
}
const whatsappCharges = {
  title: 'WhatsApp messaging charges',
  text: 'Incoming, outgoing, template and broadcast message charges — billed directly to your account. We set up and run the automation; you always see exactly what you pay for.',
}
const boosting = {
  title: 'Paid promotion / boosting',
  text: 'Optional. If you choose to boost posts, it’s paid directly by you to the platform.',
}

// Shared by both ads packages (Meta's "Andromeda" delivery update)
export const creativeIsTargeting = {
  title: 'Why content now decides your ad results',
  quote: 'Your creative is now your targeting.',
  text: 'After Meta’s latest ad-delivery updates (often called the Andromeda update), Meta’s AI decides who sees your ad mainly by reading the ad itself — the video, the visuals, the message. Detailed interest targeting matters far less than before. Fresh, varied, buyer-focused creatives reach the right buyers at a lower cost; tired, repeated or brochure-style creatives get expensive. That’s why every AXAMP ads package includes new creatives every month — not just ad management.',
}

// The monthly content cycle, from the founder's notes — both branding packages
const brandingProcess = [
  ['Strategy & planning', 'Your positioning, audience and goals for the month.'],
  ['Content calendar', 'Every reel, story and post mapped to a date.'],
  ['Profile optimisation', 'Bio, photo, highlights and links that build trust at first glance.'],
  ['Viral scripting', 'Hook-first scripts written around what buyers actually ask.'],
  ['Shoot', 'We bring the plan, scripts and crew.'],
  ['Edit', 'Fast, polished cuts with captions, made for each platform.'],
  ['Approval', 'You sign off on WhatsApp before anything goes live.'],
  ['Publish with keywords', 'Captions, hashtags and search keywords so the right buyers find you.'],
]

export const cards = [
  {
    id: 'performance',
    name: 'Lead Generation',
    short: 'Performance',
    icon: 'rocket',
    accent: ['#ff7a50', '255, 122, 80'],
    finish: 'bronze', // rose bronze, lit brand coral (see FINISH in pages/Packages.jsx)
    pick: 'Choose your setup',
    plans: ['meta-ads', 'full-ads'],
  },
  {
    id: 'branding',
    name: 'Branding',
    short: 'Branding',
    icon: 'sparkles',
    accent: ['#53f7fb', '83, 247, 251'],
    finish: 'platinum', // midnight platinum, lit brand cyan (see FINISH in pages/Packages.jsx)
    pick: 'Who is it for?',
    plans: ['developer-branding', 'cp-branding'],
  },
  {
    id: 'super-premium',
    name: 'Top 1% Realtors',
    short: 'Top 1%',
    icon: 'crown',
    premium: true,
    // Gold: the card itself is black and gold
    accent: ['#f5c451', '245, 196, 81'],
    finish: 'gold',
    plans: ['super-premium'],
  },
]

export const plans = [
  /* ── Branding ─────────────────────────────────────────────────── */
  {
    id: 'developer-branding',
    card: 'branding',
    label: 'Enterprises',
    name: 'Developer Branding',
    icon: 'building',
    fee: 120000,
    bestFor: 'Developers & Builders',
    summary: 'Instagram & Facebook · UGC videos with professional models',
    highlights: [
      'Increase site visits',
      'Less sales call',
      'Close the trust gap between you and buyers',
      'Organic leads — not just paid ones',
      'More walk-in site visits',
      'Create hype around your project',
      'Build trust between buyers and you, the developer',
    ],
    headline: 'Make buyers trust your company and your project — before they ever call.',
    builtFor: 'Developers & builders launching or selling a project',
    situation: [
      'Buyers check the developer before the project — and find little or nothing online.',
      'Your launch looks like every other launch: the same renders, the same brochure, the same claims.',
      'Leads come in, but buyers hesitate to visit because they don’t yet trust the brand behind the project.',
      'Paid leads keep getting costlier, and there’s no steady flow of organic enquiries.',
    ],
    result: 'Buyers stay unsure, site visits stay low, and every sale depends on paid ads and brokers.',
    why: {
      title: 'Why developer branding works now',
      text: 'Buyers commit lakhs — often crores — to a developer’s promise. Real, relatable videos on Instagram and Facebook show the people, the progress and the lifestyle behind your project. When buyers see that every week, the trust gap closes before the first call — and they walk in ready to buy.',
    },
    solution: 'We build your brand and your project on Instagram & Facebook with UGC-style videos featuring professional models — planned, scripted, shot, edited and published by AXAMP every month.',
    flow: [
      'We plan your brand story and project angles',
      'We script and shoot UGC videos with professional models',
      'We edit and publish on Instagram & Facebook',
      'Buyers see your project come alive every week',
      'Organic enquiries, sales calls and walk-in visits',
    ],
    process: brandingProcess,
    groups: [
      {
        title: 'Profile management — Instagram + Facebook',
        items: [
          ['Brand profiles fully managed', 'Posting, captions, hashtags and a consistent premium look — handled by AXAMP.'],
          ['Profile optimisation', 'Bio, highlights and links set up so buyers find project details in seconds.'],
          ['Stories & highlights', 'Regular stories and organised highlights: Project, Location, Progress, Happy buyers, FAQs.'],
        ],
      },
      {
        title: 'Content',
        items: [
          ['UGC-style videos with professional models', 'Real, relatable videos that show buyers the lifestyle your project offers.'],
          ['Project & construction updates', 'Progress, amenities and milestones that prove you deliver.'],
          ['Your developer story', 'Your vision, your track record and the people behind the project.'],
          ['Content strategy & scripts', 'Every video planned around what buyers ask. You approve before we shoot.'],
        ],
      },
      {
        title: 'Shoots',
        items: [['Planned and executed by AXAMP', 'Scripts, crew, models and locations arranged by us — you just approve.']],
      },
      {
        title: 'Reporting',
        items: [['Monthly report', 'Reach, followers, engagement, profile visits and enquiries — plus next month’s plan.']],
      },
    ],
    pillars: [
      ['Project highlights', 'What makes your project different — design, amenities, value'],
      ['Location & connectivity', 'Roads, metro, schools, offices and what’s coming next'],
      ['Construction progress', 'Regular proof that the project is moving on time'],
      ['Lifestyle', 'Models living the everyday life your project promises'],
      ['Buyer questions', 'Loans, possession, RERA, payment plans'],
      ['Your track record', 'Delivered projects, happy handovers and your story'],
    ],
    weeks: [
      ['Week 1', 'Kick-off, brand positioning, content pillars, profile optimisation, first scripts', 'Positioning + scripts for approval'],
      ['Week 2', 'First shoot with models; first videos edited; stories and highlights set up', 'First videos live, refreshed profiles'],
      ['Week 3', 'Next shoot; regular posting on both platforms', 'Consistent posting on Instagram & Facebook'],
      ['Week 4', 'Review what buyers respond to most', 'Monthly report + next month’s plan'],
      ['Month 2 +', 'Fresh content around every project milestone', 'Growing trust, organic leads and walk-ins'],
    ],
    timeNeeded: 'A kick-off call and quick approvals on WhatsApp. We handle the shoots, models, editing and posting.',
    notIncluded: [boosting],
    math: 'One extra booking from an organic enquiry or a walk-in can cover months of the fee — and the trust you build stays with your brand for every future launch.',
    pairing: {
      with: 'full-ads',
      text: 'Branding builds trust. Pair it with Full Ads to turn that trust into highly qualified leads from Meta and Google — answered by an AI Agent in seconds.',
    },
  },

  {
    id: 'cp-branding',
    card: 'branding',
    label: 'Personal Branding',
    name: 'Channel Partner Branding',
    icon: 'user',
    fee: 100000,
    bestFor: 'Channel Partners & Consultants',
    summary: 'Instagram & LinkedIn · 15 reels + 1 podcast a month',
    highlights: [
      'Build your face value',
      'Increase demand for you, personally',
      'Be trusted as a consultant',
      'Build trust with your audience',
      'Organic leads',
      'Inspire other brokers',
      'Create your own USP',
    ],
    headline: 'Become the name buyers trust — your face and your knowledge on Instagram & LinkedIn, every week.',
    builtFor: 'Channel partners, real estate consultants & brokers',
    situation: [
      'The same project is sold by hundreds of brokers. To a buyer, everyone looks the same.',
      'Buyers trust people, not projects. If they don’t know you, they compare you only on price and discounts.',
      'You explain the same things to clients every day — but none of that knowledge is visible online.',
      'Your Instagram and LinkedIn are irregular or empty, so new clients have no reason to choose you.',
      'The leads you buy are expensive and cold, because they’ve never heard of you.',
    ],
    result: 'You work hard, but you stay one name among many. The broker who is visible and trusted gets the call first — and gets the deal.',
    why: {
      title: 'Why personal branding works now',
      text: 'Instagram and LinkedIn push short, face-led videos that help people. When buyers regularly see you explaining the market, projects and their doubts, they get to know, like and trust you before they ever call. Then they come to you already convinced — they come back, and they refer others.',
    },
    solution: 'We turn you into a trusted real estate expert online: we plan, script, shoot, edit and post your content on Instagram and LinkedIn every month, while you focus on clients.',
    flow: [
      'We plan topics from real buyer questions',
      'We script and shoot with you (2–3 shoots)',
      'We edit and post 15 reels + 1 podcast',
      'Buyers see you every week and start trusting you',
      'They DM or call you first — warmer leads, faster deals',
    ],
    process: brandingProcess,
    groups: [
      {
        title: 'Profile management — Instagram + LinkedIn',
        items: [
          ['2 profiles fully managed', 'Posting, captions, hashtags and a consistent look — handled by AXAMP.'],
          ['Profile optimisation', 'Bio, profile-picture guidance, LinkedIn headline and About section.'],
          ['Stories management', 'Regular stories so you stay visible every day.'],
          ['Highlights management', 'Organised highlights: About me, Projects, Client stories, FAQs.'],
        ],
      },
      {
        title: 'Content',
        items: [
          ['15 reels a month', 'Short vertical videos — scripted, shot and edited, featuring you.'],
          ['1 podcast / long-format video a month', 'A longer, in-depth conversation that shows your knowledge and builds deep trust.'],
          ['Content strategy & scripts', 'Topics planned from real buyer questions and market moments. You approve before we shoot.'],
        ],
      },
      {
        title: 'Shoots',
        items: [['2–3 shoots a month', 'Planned around your schedule. We bring the plan, scripts and crew — you just speak.']],
      },
      {
        title: 'Reporting',
        items: [['Monthly report', 'Reach, followers, engagement, profile visits and DM enquiries — plus next month’s plan.']],
      },
    ],
    pillars: [
      ['Market updates', 'Prices, new launches and infrastructure news in your area'],
      ['Project insights', 'Honest breakdowns of the projects you sell — who they suit, and who they don’t'],
      ['Buyer questions', 'Loans, possession, RERA, resale vs new, investment vs end-use'],
      ['Myth-busting', 'Common buyer mistakes and how to avoid them'],
      ['Your story', 'Your journey, your values, behind the scenes of your work'],
      ['Client stories', 'Happy handovers and real experiences (with permission)'],
    ],
    weeks: [
      ['Week 1', 'Kick-off, your positioning, content pillars, profile optimisation, first scripts', 'Positioning + scripts for approval'],
      ['Week 2', 'Shoot 1; first reels edited; stories and highlights set up', 'First reels live, refreshed profiles'],
      ['Week 3', 'Shoot 2; podcast recording; regular posting on both platforms', 'Consistent posting + podcast'],
      ['Week 4', 'Shoot 3 (if planned); review what works best', 'Monthly report + next month’s plan'],
      ['Month 2 +', 'Fresh topics every month; double down on what buyers respond to', 'Growing trust and warmer enquiries'],
    ],
    timeNeeded: 'Only your 2–3 shoot sessions a month and quick script approvals on WhatsApp. We handle everything else.',
    notIncluded: [boosting],
    math: 'The commission from just one extra deal a month can cover the full fee. And a strong personal brand keeps paying back for years — it doesn’t stop when a campaign stops.',
    pairing: {
      with: 'meta-ads',
      text: 'Personal branding builds trust. Pair it with Meta Ads to turn that trust into a steady flow of leads who already know your face — and get answered on WhatsApp in seconds.',
    },
  },

  /* ── Performance Marketing ───────────────────────────────────── */
  {
    id: 'meta-ads',
    card: 'performance',
    label: 'Meta Ads',
    name: 'Meta Ads',
    // The card's main button opens this live demo instead of WhatsApp
    demo: site.whatsappDemo,
    icon: 'zap',
    fee: 65000,
    bestFor: 'Residential Projects, Plots & Villas',
    summary: 'Facebook & Instagram ads · WhatsApp lead flow',
    highlights: [
      'Maximum number of leads',
      'Lower cost per lead (CPL)',
      'Two-factor lead verification',
      'Real-profile verification',
      'Complete WhatsApp lead-flow system',
      'Instant site-visit booking',
      'Sales-call booking at the buyer’s preferred slot',
      'Project details in content format',
    ],
    headline: 'The most leads at the lowest cost from Facebook & Instagram — verified, and answered on WhatsApp in seconds.',
    builtFor: 'Residential building and plot projects that need lead volume at a low cost',
    situation: [
      'You run ads and leads come in — but most never pick up, never reply and never reach your site.',
      'A buyer fills your form at 11 pm. Your team calls at 3 pm the next day. By then they’ve forgotten you.',
      'Fake numbers and time-pass enquiries waste your sales team’s day.',
      'Your ads look like every other project’s — same brochure images, same walkthrough — so they get costlier every month.',
    ],
    why: creativeIsTargeting,
    result: 'You pay for 100 leads, but only a handful reach your site. The problem isn’t only getting leads — it’s the first few minutes after a lead comes in.',
    solution: 'We create fresh ad creatives every month, run tested lead campaigns on Facebook & Instagram, verify every lead, and connect each one to an instant WhatsApp flow — so no buyer is left waiting.',
    flow: [
      'Buyer sees your video or carousel ad',
      'Fills the lead form and verifies their number',
      'Gets your WhatsApp message in seconds — 24×7',
      'Explores the project or books a visit or call',
      'Your sales team gets a warm, verified lead',
    ],
    groups: [
      {
        title: 'Meta Ads — Facebook & Instagram',
        items: [
          ['3 lead-generation campaigns', 'Each tests a different angle — location, price advantage, lifestyle.'],
          ['6 ad sets', 'Two per campaign, so we learn fast what works and stop what doesn’t.'],
          ['Instant lead forms', 'Built with qualifying questions that filter out casual enquiries.'],
          ['Lead tracking', 'We know which ad brought which lead, so budget moves to what brings real buyers.'],
          ['Weekly optimisation', 'Month 1 is for testing; after that we keep pausing weak ads and scaling strong ones — for more leads at a lower CPL.'],
        ],
      },
      {
        title: 'Lead verification',
        items: [
          ['Two-factor verification', 'A second confirmation step on every lead, so wrong and fake numbers are filtered out.'],
          ['Real-profile verification', 'Leads are checked against real profiles before they reach your team.'],
        ],
      },
      {
        title: 'Ad creatives — made by AXAMP',
        items: [
          ['3 ad videos', 'Scripted, shot and edited by our team — buyer-focused, not brochure-style.'],
          ['3 carousels / graphics', 'Swipeable multi-image ads or designed posters for fast scrollers.'],
          ['The shoot', 'Planned and executed by AXAMP.'],
        ],
      },
      {
        title: 'WhatsApp lead-flow system',
        items: [
          ['WhatsApp Business API', 'The official WhatsApp system for businesses — your verified number, connected to your ads.'],
          ['Flow-based chat journey', 'A ready, menu-based chat — fully automated, no typing needed from your team.'],
          ['Instant reply, 24×7', 'The buyer hears from you within seconds of filling the form — even at 2 am.'],
          ['Project details on WhatsApp', 'Location, connectivity, details, construction updates and a site walkthrough.'],
          ['Instant site-visit booking', 'Buyers pick their own visit slot — no cold calls.'],
          ['Preferred-slot sales calls', 'Buyers choose when they want your sales team to call.'],
        ],
      },
      {
        title: 'Reporting',
        items: [['Monthly report', 'Ad spend, leads, cost per lead, WhatsApp conversations and site visits booked — in one simple sheet.']],
      },
    ],
    note: 'Meta Ads uses flow-based automation. Google Ads, a custom landing page, a WhatsApp AI Agent and CRM come with Full Ads.',
    weeks: [
      ['Week 1', 'Kick-off, buyer profile, ad strategy, scripts; WhatsApp API setup starts', 'Strategy + scripts for approval'],
      ['Week 2', 'Shoot; 3 videos + 3 carousels / graphics; WhatsApp flow built and tested', 'Creatives + a live flow demo for approval'],
      ['Week 3', '3 campaigns and 6 ad sets go live', 'First verified leads + instant WhatsApp replies'],
      ['Week 4', 'Optimisation — pause weak ads, push strong ones', 'Monthly report + next month’s plan'],
      ['Month 2 +', 'New creatives every month + continuous optimisation', 'More leads at a lower cost over time'],
    ],
    notIncluded: [adSpend, whatsappCharges],
    math: 'One extra booking in a month is worth far more than the full fee. This package turns more of the leads you pay for into site visits.',
  },

  {
    id: 'full-ads',
    card: 'performance',
    label: 'Meta Ads + Google Ads',
    name: 'Full Ads',
    // The card's main button opens this live demo instead of WhatsApp
    demo: site.whatsappDemo,
    icon: 'rocket',
    fee: 100000,
    bestFor: 'Commercial & Luxury Residential',
    summary: 'Meta + Google Ads · landing page · WhatsApp API',
    highlights: [
      'Highly qualified leads',
      'Highly interested buyers',
      'High-conversion leads',
      'Complete conversion-funnel system',
      'AI Agent support for every lead',
      'Custom landing page for your project',
      'WhatsApp CRM — every lead tracked',
    ],
    headline: 'Meta + Google Ads, a custom landing page and a WhatsApp AI Agent — one funnel from ad to site visit.',
    builtFor: 'Commercial and luxury residential projects that need serious, qualified buyers',
    situation: [
      'Leads come from Meta, Google and portals — but they land in different places and nobody tracks them properly.',
      'Buyers who search on Google land on a generic website and leave without enquiring.',
      'Your team can’t answer every buyer instantly, especially at night and on weekends.',
      'Follow-ups depend on someone remembering. Leads get lost in phones and WhatsApp chats.',
      'You can’t see which channel, ad or campaign brings real buyers.',
    ],
    why: creativeIsTargeting,
    result: 'Good money goes into ads, but the journey after the click is broken. High-value buyers drop off between the ad, the website, the call and the site.',
    solution: 'One connected funnel: Meta + Google Ads bring buyers, a custom landing page converts them, a WhatsApp AI Agent answers them 24×7, and a WhatsApp CRM makes sure no lead is ever lost.',
    flow: [
      'Buyer sees your ad on Meta or searches on Google',
      'Lands on your custom project page',
      'WhatsApp AI Agent replies in seconds and answers questions',
      'Buyer explores the project and books a visit or call',
      'Every lead tracked in the CRM — your team closes',
    ],
    groups: [
      {
        title: 'Meta Ads — Facebook & Instagram',
        items: [
          ['4 lead-generation campaigns', 'Messages tested side by side — location, price, lifestyle, investment.'],
          ['Ad set testing', 'Multiple ad sets per campaign so winners are found fast.'],
          ['Instant lead forms + tracking', 'Qualifying questions, and a clear record of which ad brought which lead.'],
        ],
      },
      {
        title: 'Google Ads',
        items: [
          ['2 Google Ads campaigns', 'Including a Search campaign that catches buyers actively looking for property in your area; the second is chosen for your goal.'],
          ['6 campaigns in total', '4 Meta + 2 Google — all managed and optimised by AXAMP.'],
        ],
      },
      {
        title: 'Ad creatives — made by AXAMP',
        items: [
          ['4 ad videos', 'Scripted, shot and edited — one for each Meta campaign.'],
          ['Carousels / graphics', 'For every campaign, for quick-scrolling buyers.'],
          ['1 long-format project video', 'A podcast-style deep explainer that answers buyers’ real questions — used on WhatsApp, the landing page and in ads.'],
          ['The shoot', 'Planned and executed by AXAMP.'],
        ],
      },
      {
        title: 'Custom landing page',
        items: [
          ['1 project landing page', 'Built only for your project to convert: highlights, content, lead form and a WhatsApp button.'],
          ['Updates', 'Kept fresh as your project and offers change.'],
        ],
      },
      {
        title: 'WhatsApp API, AI Agent & CRM',
        items: [
          ['WhatsApp Business API', 'Your verified number, connected to Meta, Google and the landing page.'],
          ['Flow-based chat journey', 'Explore Project · Book Site Visit · Book Sales Call — with project content inside.'],
          ['AI Agent for every lead', 'A smart assistant that understands buyer questions — price range, location, amenities, possession — and replies like a human, 24×7.'],
          ['WhatsApp CRM', 'One place for every lead, chat and status: who is hot, who needs a follow-up, who booked a visit.'],
          ['Self-booking', 'Buyers book their own site visit or call slot.'],
        ],
      },
      {
        title: 'Reporting',
        items: [['Monthly report', 'Spend, leads, cost per lead, cost per site visit, channel-wise results and next month’s plan.']],
      },
    ],
    // What this adds over the other ads package
    versus: {
      against: 'meta-ads',
      rows: [
        ['Meta campaigns', '3', '4'],
        ['Google Ads campaigns', '—', '2'],
        ['Ad videos', '3', '4'],
        ['Podcast-style project video', '—', 'Included'],
        ['Custom landing page', '—', 'Included'],
        ['WhatsApp flow automation', 'Included', 'Included'],
        ['WhatsApp AI Agent', '—', 'Included'],
        ['WhatsApp CRM', '—', 'Included'],
      ],
    },
    weeks: [
      ['Week 1', 'Kick-off, buyer profile, strategy, scripts; WhatsApp API + CRM setup starts; landing page design', 'Strategy, scripts and page design for approval'],
      ['Week 2', 'Shoot; 4 videos + carousels / graphics; podcast recording; AI Agent trained on your project; landing page built', 'Creatives, landing page and WhatsApp demo for approval'],
      ['Week 3', '4 Meta + 2 Google campaigns go live', 'First leads, instant AI replies, leads in the CRM'],
      ['Week 4', 'Optimisation across channels; AI Agent answers improved', 'Monthly report + next month’s plan'],
      ['Month 2 +', 'New creatives every month + continuous optimisation', 'Lower cost per site visit over time'],
    ],
    notIncluded: [adSpend, whatsappCharges],
    math: 'For a commercial or luxury project, one extra booking a month pays for this many times over. We measure success by cost per site visit, not just cost per lead.',
  },

  /* ── Super Premium ───────────────────────────────────────────── */
  {
    id: 'super-premium',
    card: 'super-premium',
    label: 'Top 1% Realtors',
    name: 'Top 1% Realtors',
    icon: 'crown',
    fee: 450000,
    bestFor: 'Only for the Top 1% of Developers & Channel Partners',
    summary: 'Personal branding + omnichannel growth',
    guarantee: '100% Site Visits Guaranteed*',
    footnote: '*Site-visit guarantee terms are agreed in writing with our founder before kick-off.',
    highlights: [
      'Developer & partner personal branding',
      'Exclusive growth strategy',
      'Premium project positioning',
      'Cinematic project marketing',
      'Omnichannel lead generation',
      'AI-powered lead management',
      'Dedicated conversion funnel',
      'Priority site-visit coordination',
      'Buyer trust architecture',
      'Dedicated growth strategy & planning',
      'Custom campaigns built around your business goals',
      'Integrated marketing & automation ecosystem',
      'Priority campaign optimisation',
      'Advanced analytics & actionable insights',
      'Monthly strategic growth consultation',
      'Quarterly performance & expansion roadmap',
    ],
    headline: 'The complete AXAMP growth engine for landmark projects — your personal brand, cinematic marketing and leads from every channel, with site visits guaranteed.',
    builtFor: 'Only for the top 1% of developers & channel partners — landmark and super-premium projects',
    situation: [
      'Your project is a landmark — but online it looks like any other launch.',
      'Leads alone don’t move the needle; you need serious buyers standing at your site.',
      'Different agencies handle branding, ads and follow-ups — and nobody owns the result.',
    ],
    result: 'A premium project gets marketed like an ordinary one, and the sales target depends on luck.',
    solution: 'Everything AXAMP does, built around one landmark project: your personal brand, a premium position for the project, cinematic content, leads from every channel and a dedicated team that gets buyers to your site — guaranteed.',
    flow: [
      'An exclusive growth strategy, built with our founder',
      'Your personal brand + premium project positioning',
      'Cinematic campaigns across every channel',
      'AI-powered lead management and a dedicated funnel',
      'Priority site-visit coordination — visits guaranteed',
    ],
    groups: [
      {
        title: 'Brand & trust',
        items: [
          ['Developer & partner personal branding', 'Your face and your vision become the reason buyers trust the project.'],
          ['Premium project positioning', 'We place your project above the competition — the story, the audience, the value.'],
          ['Buyer trust architecture', 'Every touchpoint — profiles, content, WhatsApp, the site visit — built to answer buyers’ doubts before they ask.'],
        ],
      },
      {
        title: 'Content',
        items: [
          ['Cinematic project marketing', 'Film-quality project videos and launch content.'],
          ['5 shoots in your first month', 'Enough footage to launch on every channel at once.'],
        ],
      },
      {
        title: 'Leads',
        items: [
          ['Omnichannel lead generation', 'Meta, Google and more — wherever your buyers are.'],
          ['AI-powered lead management', 'An AI Agent answers and qualifies every lead 24×7, and every lead is tracked.'],
          ['Dedicated conversion funnel', 'A custom landing page and buyer journey built only for your project.'],
        ],
      },
      {
        title: 'Strategy & site visits',
        items: [
          ['Exclusive growth strategy', 'Planned and reviewed with our founder.'],
          ['Priority site-visit coordination', 'Our team follows up and lines up visits with your sales team.'],
          ['100% Site Visits Guaranteed*', 'We commit to site visits, not just leads.'],
        ],
      },
      {
        title: 'Reporting',
        items: [['Monthly report & review', 'Spend, leads, site visits and next month’s plan — reviewed with you.']],
      },
    ],
    weeks: [
      ['Week 1', 'Strategy session with our founder; positioning, brand plan and launch calendar', 'Growth strategy for approval'],
      ['Weeks 1–4', '5 shoots — your personal brand and cinematic project content', 'Footage for every channel'],
      ['Week 3', 'Omnichannel campaigns, AI lead management and the conversion funnel go live', 'First qualified leads and booked visits'],
      ['Week 4', 'Review site visits against the guarantee; scale what works', 'Monthly report + next month’s plan'],
    ],
    timeNeeded: 'A strategy session with our founder, your shoot days and quick approvals. We handle the rest.',
    notIncluded: [adSpend, whatsappCharges],
    math: 'For a landmark project, a handful of extra bookings is worth many times the fee — and with guaranteed site visits, you pay for buyers at your site, not just leads.',
  },
]

export const planById = Object.fromEntries(plans.map((p) => [p.id, p]))
export const cardById = Object.fromEntries(cards.map((c) => [c.id, c]))
export const cardOf = (plan) => cardById[plan.card]

// "Which one is right for me?"
export const matches = [
  { situation: 'You’re a developer, and buyers don’t know or trust your brand yet.', pick: ['developer-branding'], line: 'Close the trust gap so buyers walk in ready to buy.' },
  { situation: 'You’re one channel partner among hundreds selling the same project.', pick: ['cp-branding'], line: 'Let buyers know and trust you before they compare brokers.' },
  { situation: 'You sell residential buildings or plots and need lots of leads at a low cost.', pick: ['meta-ads'], line: 'Maximum verified leads, answered on WhatsApp in seconds.' },
  { situation: 'Your project is commercial or luxury, and only serious buyers matter.', pick: ['full-ads'], line: 'One funnel from Meta and Google to the site visit — no lead gets lost.' },
  { situation: 'You need trust and a steady flow of leads.', pick: ['cp-branding', 'meta-ads'], line: 'Branding builds trust, ads bring leads — together they’re strongest.' },
  { situation: 'You’re a top developer with a landmark project.', pick: ['super-premium'], line: 'Everything we do, around one project — with site visits guaranteed.' },
]

export const faqs = [
  ['Developer Branding or Channel Partner Branding — which one is mine?', 'Developer Branding builds trust in your company and your project, with UGC-style videos featuring professional models on Instagram & Facebook. Channel Partner Branding builds you — your face, your knowledge and your USP — with 15 reels and a podcast a month on Instagram & LinkedIn.'],
  ['What’s the difference between Meta Ads and Full Ads?', 'Meta Ads runs Facebook & Instagram campaigns with lead verification and a WhatsApp flow — best for residential buildings and plots, where lead volume and a low cost per lead matter most. Full Ads adds Google Ads, a custom landing page, a WhatsApp AI Agent and CRM — built for commercial and luxury projects, where every lead must be highly qualified.'],
  ['What does “100% site visits guaranteed” mean?', 'It’s part of our Top 1% Realtors package, which is only for the top 1% of realtors. We commit to site visits, not just leads — the exact terms are agreed in writing with our founder before kick-off.'],
  ['Why is ad spend paid separately?', 'Your ad spend goes straight from your account to Meta or Google, so you can see every rupee yourself. Our fee covers only our work — full transparency.'],
  ['Why are WhatsApp charges separate?', 'WhatsApp charges per message and bills you directly, in your name. We set up and run the automation; the more leads and broadcasts, the more usage — and you see all of it.'],
  ['How much ad budget will I need?', 'It depends on your monthly lead target, ticket size and goals. We share an exact recommended budget before launch.'],
  ['Are 3 videos a month enough?', 'With Meta Ads you get 3 new videos plus 3 carousels / graphics every month — 6 fresh creatives tested across 6 ad sets. Need more? Full Ads has 4 videos plus a podcast-style project video.'],
  ['I don’t have time to be on camera.', 'Just 2–3 shoots a month. The script, plan and crew are ours — you say what you already tell clients every day.'],
  ['Why is GST added?', 'AXAMP is a registered company, so 18% GST applies — and you get a proper GST invoice.'],
]

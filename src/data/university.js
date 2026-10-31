// ─── The six university proof pillars ───────────────────────────────────
// Same shape as the real-estate pillars in ./work.js. Ids must not clash
// with those or the hospital ones (all can be linked to from the same page).
//
// Reels are listed the same way as in work.js; their account, caption and
// numbers come from campusReels in ./reels.js. A pillar with no reels
// shows "coming soon" cards.

const reel = (id) => ({ ig: `https://www.instagram.com/reel/${id}/` })

export const universityPillars = [
  {
    id: 'campus',
    label: 'Facilities & Amenities',
    tag: 'Drone + UGC',
    icon: 'drone',
    objection: 'What is the campus really like?',
    answer: 'Answered on a drone and campus tour.',
    // Video + cover live in /public (videos/<id>.mp4, posters/<id>.webp)
    reels: [
      ['DcBeKFaxLbB', 'Sharda University — the campus gym, just a few steps from class'],
      ['DXhtohok851', 'WCTM Gurgaon — campus life and next-level tech placements'],
      ['DYM7z5MzfHM', 'LPU — inside a ₹10K/month student hostel'],
      ['DZbtPz2NRu3', 'NIMS University — classes, conversations and coffee breaks on campus'],
      ['DJHKFkjzqcy', 'Noida International University — from aerial views to vibrant classrooms'],
      ['C65Ux_uoAxH', 'CGC Landran — every corner of the campus holds a story'],
      ['DbYF_SmOqX0', 'Invertis University — a walk through world-class facilities'],
      ['Dac9hg8IC3p', '100+ acres of campus — infrastructure, academics and sports'],
      ['DUNkcOZjCbU', 'KIIT — labs, sports fields and stages beyond the classroom'],
    ].map(([id, caption]) => ({ ig: `https://www.instagram.com/p/${id}/`, poster: `/posters/${id}.webp`, caption })),
  },
  {
    id: 'events',
    label: 'Events',
    tag: 'Event videos',
    icon: 'clapper',
    objection: 'Is there life beyond the classroom?',
    answer: 'Answered at the fests and events.',
    // Official videos first — the pillar card plays the first reel inline
    reels: [
      { ig: 'https://www.instagram.com/p/DW-cLFsiOML/', poster: '/posters/DW-cLFsiOML.webp', caption: 'That 1% of university life — the fest nights students never forget' },
      { ig: 'https://www.instagram.com/p/DVEesGdkrVs/', poster: '/posters/DVEesGdkrVs.webp', caption: 'ETAMAX, FCRIT — finale performances, loud cheers and goosebumps' },
      reel('DUESWyVE3iw'), // BECon
      reel('DFLiNfpTp00'), // Pravritti
    ],
  },
  {
    id: 'practical',
    label: 'Practical Experience',
    tag: 'Labs · Hands-on',
    icon: 'flask',
    objection: 'Will I actually learn by doing?',
    answer: 'Answered inside the labs and workshops.',
    // Official videos first — the pillar card plays the first reel inline
    reels: [
      { ig: 'https://www.instagram.com/p/DZ9-ZH0kuWZ/', poster: '/posters/DZ9-ZH0kuWZ.jpg', caption: 'JIS Education Expo 2026, Kolkata — a packed hall of students, parents and mentors' },
      { ig: 'https://www.instagram.com/p/DX_1p_7IH2a/', poster: '/posters/DX_1p_7IH2a.jpg', caption: 'Pillai University — from AI & Robotics to Fashion Design, one campus, many futures' },
      reel('DOaF6Rhjoqc'), // labs + drones
      reel('DbIUObzh4qM'), // MakerSpace
    ],
  },
  {
    id: 'alumni',
    label: 'Alumni Reviews',
    tag: 'Feedback · Reviews',
    icon: 'messages',
    tone: 'warm',
    objection: 'What do students who graduated say?',
    answer: 'Answered by passed-out students.',
    // Official video first — the pillar card plays the first reel inline
    reels: [
      { ig: 'https://www.instagram.com/p/DYSC2icuM-L/', poster: '/posters/DYSC2icuM-L.jpg', caption: 'J.N.N Institute — different dreams, one destination: students on why they chose J.N.N' },
      reel('DZVQO56Suc7'), // alumna founder
      reel('DYECqNNySkB'), // meet the students
    ],
  },
  {
    id: 'placements',
    label: 'Placements',
    tag: 'Packages · Selections · Companies',
    icon: 'briefcase',
    objection: 'Will I get a good job after this?',
    answer: 'Answered with real packages and recruiters.',
    // Official videos first — the pillar card plays the first reel inline
    reels: [
      { ig: 'https://www.instagram.com/p/DWJP7ykiD3B/', poster: '/posters/DWJP7ykiD3B.jpg', caption: 'GIMS — achievers aren’t born, they’re built: students mentored all the way to placement' },
      { ig: 'https://www.instagram.com/p/DVf15FlDo9X/', poster: '/posters/DVf15FlDo9X.jpg', caption: 'GL Bajaj IMR — 500+ recruiters, early offers and a highest CTC of ₹19 LPA' },
      { ig: 'https://www.instagram.com/p/Db0Ht8cvvpw/', poster: '/posters/Db0Ht8cvvpw.jpg', caption: 'Amity University Noida — TCS on campus: students on their first placement drive' },
      reel('DFLiNfpTp00'), // career fest
      reel('DZE28P1uce2'), // placements Q&A
    ],
  },
  {
    id: 'podcast',
    label: 'Podcast',
    tag: 'Counselling · Admissions · Scholarships',
    icon: 'podcast',
    objection: 'How do I get in — and can I afford it?',
    answer: 'Answered on a podcast: admissions, achievements, scholarships.',
    // Official videos first — the pillar card plays the first reel inline
    reels: [
      { ig: 'https://www.instagram.com/p/DdgNvNaPjsd/', poster: '/posters/DdgNvNaPjsd.jpg', caption: 'Amity University Noida — “After Amity”, a podcast where alumni talk about life after campus' },
      {
        youtube: 'DtiZFK0Z-kM',
        video: '/videos/DtiZFK0Z-kM.mp4',
        poster: '/posters/DtiZFK0Z-kM.jpg',
        caption: 'The importance of college — a podcast conversation on why the campus years matter',
        handle: 'sunoindia_podcast',
        name: 'SUNOINDIA PODCAST · YouTube',
        profile: 'https://www.youtube.com/@sunoindia_podcast',
      },
      reel('DZE28P1uce2'), // Open House admissions
      reel('DYECqNNySkB'),
    ],
  },
]

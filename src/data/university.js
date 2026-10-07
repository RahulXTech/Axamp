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
    reels: [reel('DbIUObzh4qM'), reel('DOaF6Rhjoqc')], // orientation tour · lanes of IITD
  },
  {
    id: 'events',
    label: 'Events',
    tag: 'Event videos',
    icon: 'clapper',
    objection: 'Is there life beyond the classroom?',
    answer: 'Answered at the fests and events.',
    reels: [reel('DUESWyVE3iw'), reel('DFLiNfpTp00')], // BECon · Pravritti
  },
  {
    id: 'practical',
    label: 'Practical Experience',
    tag: 'Labs · Hands-on',
    icon: 'flask',
    objection: 'Will I actually learn by doing?',
    answer: 'Answered inside the labs and workshops.',
    reels: [reel('DOaF6Rhjoqc'), reel('DbIUObzh4qM')], // labs + drones · MakerSpace
  },
  {
    id: 'alumni',
    label: 'Alumni Reviews',
    tag: 'Feedback · Reviews',
    icon: 'messages',
    tone: 'warm',
    objection: 'What do students who graduated say?',
    answer: 'Answered by passed-out students.',
    reels: [reel('DZVQO56Suc7'), reel('DYECqNNySkB')], // alumna founder · meet the students
  },
  {
    id: 'placements',
    label: 'Placements',
    tag: 'Packages · Selections · Companies',
    icon: 'briefcase',
    objection: 'Will I get a good job after this?',
    answer: 'Answered with real packages and recruiters.',
    reels: [reel('DFLiNfpTp00'), reel('DZE28P1uce2')], // career fest · placements Q&A
  },
  {
    id: 'podcast',
    label: 'Podcast',
    tag: 'Counselling · Admissions · Scholarships',
    icon: 'podcast',
    objection: 'How do I get in — and can I afford it?',
    answer: 'Answered on a podcast: admissions, achievements, scholarships.',
    reels: [reel('DZE28P1uce2'), reel('DYECqNNySkB')], // Open House admissions
  },
]

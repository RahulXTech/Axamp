// ─── The six hospital proof pillars ─────────────────────────────────────
// Same shape as the real-estate pillars in ./work.js. Ids must not clash
// with those (both lists can be linked to from the same page).
//
// Reels are listed the same way as in work.js; their account, caption and
// numbers come from healthReels in ./reels.js. A pillar with no reels
// shows "coming soon" cards on its ring.
//
// Every pillar has reels now (Consultation and AI Visuals added 6 Oct 2026).
// Removed 6 Oct 2026 — posts taken down on Instagram (the embed only says
// "the link may be broken"): DLhuYWRBW5J (ascites), DIxls3PTBdu (C-section).
// Reels with an MP4 in /public/videos play that file instead of the embed.

export const hospitalPillars = [
  {
    id: 'facilities',
    label: 'Facilities',
    tag: 'Equipment · UGC · Drone',
    icon: 'hospital',
    objection: 'Is this hospital well equipped?',
    answer: 'Answered on a drone and floor tour.',
    reels: [
      { ig: 'https://www.instagram.com/p/Dc0LasJzPU0/' },
      { ig: 'https://www.instagram.com/reel/DVTZ03yidHK/' },
      { ig: 'https://www.instagram.com/reel/DXPRAU8B0S5/' },
    ],
  },
  {
    id: 'awareness',
    label: 'Awareness',
    tag: 'Department podcasts',
    icon: 'podcast',
    objection: 'Should I be worried about this?',
    answer: 'Answered by the specialist, on a podcast.',
    reels: [
      { ig: 'https://www.instagram.com/reel/DaPu7KHNBhZ/' },
      { ig: 'https://www.instagram.com/reel/DZAhzOsBfyw/' },
    ],
  },
  {
    id: 'treatment',
    label: 'Treatment',
    tag: 'Step-by-step process',
    icon: 'clipboard',
    objection: 'What will actually happen to me?',
    answer: 'Answered step by step, on camera.',
    reels: [
      { ig: 'https://www.instagram.com/p/DaFPqyUieP6/' },
      { ig: 'https://www.instagram.com/reel/DdtYdQmiNwm/' },
      { ig: 'https://www.instagram.com/reel/DcHCSR1CWhf/' },
    ],
  },
  {
    id: 'consultation',
    label: 'Consultation',
    tag: 'Doctor · Patient',
    icon: 'stethoscope',
    objection: 'Will the doctor really listen?',
    answer: 'Answered in a real consultation.',
    reels: [
      { ig: 'https://www.instagram.com/reel/DZAhzOsBfyw/' },
      { ig: 'https://www.instagram.com/reel/DSuDMe7kaSk/' },
      { ig: 'https://www.instagram.com/reel/DaPu7KHNBhZ/' },
    ],
  },
  {
    id: 'journeys',
    label: 'Journeys',
    tag: 'Patient & doctor stories',
    icon: 'heart',
    tone: 'warm',
    objection: 'Did it work for people like me?',
    answer: 'Answered by patients and doctors.',
    reels: [
      { ig: 'https://www.instagram.com/p/DcdWKAXgciw/' },
      { ig: 'https://www.instagram.com/p/DdwC7cXTtpY/' },
    ],
  },
  {
    id: 'ai-visuals',
    label: 'AI Visuals',
    tag: 'Medical visualisation',
    icon: 'scan',
    objection: "I can't picture what's wrong.",
    answer: 'Answered in AI 3D, inside the body.',
    reels: [
      { ig: 'https://www.instagram.com/reel/Db1D69UjoGB/' },
      { ig: 'https://www.instagram.com/reel/Db_Q3JZAX8R/' },
      { ig: 'https://www.instagram.com/reel/Dd66SVZjFFJ/' },
      { ig: 'https://www.instagram.com/reel/DdEl7fNjPyu/' },
      { ig: 'https://www.instagram.com/reel/DVJooKwjV3d/' },
      { ig: 'https://www.instagram.com/reel/DeJfUiJz-5A/' },
    ],
  },
]

Performance marketing proof
===========================

meta/    Meta (Facebook & Instagram) ad videos and results screenshots
         - videos: MP4 (H.264), vertical 9:16 works best, e.g. 720x1280
         - screenshots: JPG/PNG/WebP

google/  Google Ads dashboard screenshots (landscape, ~1600px wide)

After adding a file, list it in src/data/performance.js, e.g.

  { type: 'video', src: '/performance/meta/tower-launch.mp4',
    title: 'Tower launch — lead form', stats: [['Leads', '412'], ['CPL', '₹86']] }

  { src: '/performance/google/search.jpg', title: 'Search campaign — project launch',
    kind: 'Search', stats: [['Clicks', '9.2k'], ['Conv.', '318']] }

Tip: blur client names / phone numbers in screenshots before uploading.

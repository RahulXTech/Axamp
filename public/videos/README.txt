AXAMP's official real-estate videos — every "Six kinds of proof" pillar
except Project Details, Site Visit and Informative shows all eight, its most relevant first
(src/data/work.js, covers in /public/posters/<name>.webp):

  erm-yeida-growth.mp4         Noida vs YEIDA prices
  mdb-london-square.mp4        MDB London Square on site
  royal-green-county.mp4       Royal Green County plots
  noida-metro-map.mp4          Noida Aqua Line metro map
  clubhouse-construction.mp4   Clubhouse walkthrough
  luxury-tower-amenities.mp4   Yamuna Expressway tower
  aditya-rosemont.mp4          Rosemont Residency sales visit
  gurgaon-vs-noida.mp4         Gurugram vs Noida explainer

Project Details pillar (4 Nov 2026): no files here. It streams seven
YouTube Shorts from YouTube (src/data/work.js); only their small cover
stills live in /public/posters/<YouTubeID>.jpg.

Site Visit pillar only — AXAMP's official edits (7 Oct 2026), in pillar order:

  sv-max-estate-128.mp4          Max Estate 128, Noida — hard-hat visit
  sv-sector-66-site.mp4          Sector 66 — 4.5 acres on site
  sv-dlf-phase-1-floor.mp4       DLF Phase 1 builder floor
  sv-biggest-family-house.mp4    The biggest family house
  sv-sample-flat-walkthrough.mp4 Sample flat walkthrough
  sv-bollywood-style-floor.mp4   Bollywood-style builder floor (360p source)
  sv-red-carpet-sample-flat.mp4  Red-carpet sample flat visit
  (+ in-mdb-london-square.mp4, shared with the Informative pillar)

Informative pillar only — AXAMP's official edits (7 Oct 2026), in pillar order:

  in-buy-or-invest.mp4           Buy or invest — presenter explainer
  in-max-estates-270-sold.mp4    Max Estates — 270 already sold
  in-mdb-london-square.mp4       MDB London Square — on site
  in-noida-sector-guide.mp4      Noida sector by sector (2:51, 38 MB)
  in-aqua-line-sectors.mp4       Aqua Line, stop by stop
  in-jewar-ganga-expressway.mp4  Jewar–Ganga link expressway
  in-noida-property-price.mp4    Noida property prices (360p source)

Client reels, named by Instagram reel ID (the same IDs as src/data/reels.js) —
used by the Performance section and the content bento:

  Da0tRfPveuZ.mp4   Wave One Club — hidden gem of Noida
  Dc_xg4oySsD.mp4   Wave One Mall — aerial
  DdUXRByzY2p.mp4   Wave One Club — hidden floor
  Da0uWKuSF86.mp4   Wave One Mall — Mia by Tanishq
  Dcy9A2wT6Iu.mp4   Wave One Club — lifetime membership
  DcolKzgveyY.mp4   Wave One Club — luxury destination
  DaGW4sezPkr.mp4   Barista — work from cafe
  DYrgVitzsF_.mp4   Barista — main character food
  DdYKEi4y4tV.mp4   KWR Group — Vrindavan
  DZ-jcZtztUq.mp4   Barista — hamara maths alag hai
  DYb3b4BzR4t.mp4   Barista — you have been served

The site detects them automatically: cards switch from the Instagram embed
to a muted autoplay loop, and the fullscreen modal plays them with sound.

Tips: H.264 MP4, 720x1280, ~2-4 Mbps, with "faststart" so they stream:
  ffmpeg -i in.mp4 -vf scale=720:-2 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4

Optional poster frames go in /public/posters/<reelId>.jpg
  ffmpeg -ss 1 -i out.mp4 -frames:v 1 -q:v 3 ../posters/<reelId>.jpg

To add or move videos between the proof pillars, edit src/data/work.js.

University (IIT Delhi) reels — see src/data/university.js:
  DbIUObzh4qM.mp4   IIT Delhi — orientation week            (Facilities, Practical)
  DOaF6Rhjoqc.mp4   IITD Outreach — STEM mentorship, labs     (Facilities, Practical)
  DUESWyVE3iw.mp4   eDC IITD — BECon 2026                     (Events)
  DFLiNfpTp00.mp4   Pravritti — career fest                   (Events, Placements)
  DZVQO56Suc7.mp4   IITD Outreach — alumna founder story      (Alumni Reviews)
  DYECqNNySkB.mp4   IITD Outreach — Open Houses               (Alumni Reviews, Podcast)
  DZE28P1uce2.mp4   IITD Outreach — Open House 2026 (34 MB)   (Placements, Podcast)

Real estate Feedback & Reviews testimonials (16 Oct 2026) — see the 'reviews'
pillar in src/data/work.js, posters in /public/posters/<id>.jpg:
  DdBq0i-Mx2F.mp4   Mateshwari Group — Janakpuri buyers, 2 years on
  DaZyjYBxJp7.mp4   Viviana Westin, Vadodara — the Bajpai family
  Dbxn5qxpdA9.mp4   KRE Arihant, Udaipur — the Chaudhary family
  Dc02Sl6Iltn.mp4   Two brothers — joint-family home in Brampton
  DcliMVixxPe.mp4   After 50+ homes viewed — client testimonial
  DcvXQgwCATY.mp4   Piramal Revanta, Mulund — homeowners
  DT2u-E5DLkf.mp4   2BHK homeowner testimonial
  DYgbl1kIKz_.mp4   Mrs. Manisha & Dr. Avnish Seth — home design

Real estate Meta ad creatives (16 Oct 2026) — the "Real Estate Ads" tab of the
Meta Ads panel, Real Estate view only. See metaAdGroup in src/data/performance.js,
posters in /public/posters/<name>.webp:
  ad-bptp-skynest.mp4             BPTP Skynest, Sector 80 Faridabad
  ad-royal-green-county.mp4       Royal Green County, Kundli
  ad-aditya-rosemont.mp4          Aditya Rosemont Residency
  ad-mdb-london-square.mp4        MDB London Square — sales reward scheme
  ad-ace-ultra-luxury.mp4         ACE Group — ultra luxury
  ad-vvip-yamuna-site-visit.mp4   VVIP Yamuna — site visit

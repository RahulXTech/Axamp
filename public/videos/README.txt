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

Project Details pillar only — AXAMP's official edits (7 Oct 2026),
listed in pillar order (first is the cover):

  pd-mdb-london-square.mp4     MDB London Square — build, interiors, offers
  pd-bptp-skynest.mp4          BPTP Skynest, Sector 80 Faridabad
  pd-aditya-rosemont.mp4       Rosemont Residency — 3 BHK interiors
  pd-royal-green-county.mp4    Royal Green County — gate, avenue, sales gallery
  pd-tonk-road-township.mp4    Tonk Road township — Phase 2 drone
  pd-jda-rera-plots.mp4        JDA & RERA approved plots — drone
  pd-society-house-tour.mp4    Society house tour
  pd-society-patta-plot.mp4    266.66 gaj society patta plot
  pd-township-registries.mp4   High-rise township — registries
  pd-gurgaon-vs-noida.mp4      Gurugram vs Noida explainer (new edit)

Site Visit pillar only — AXAMP's official edits (7 Oct 2026), in pillar order:

  sv-vvip-yamuna.mp4             VVIP Yamuna — sales gallery visit
  sv-red-carpet-sample-flat.mp4  Red-carpet sample flat visit
  sv-sector-66-site.mp4          Sector 66 — 4.5 acres on site
  sv-max-estate-128.mp4          Max Estate 128, Noida — hard-hat visit
  sv-sample-flat-walkthrough.mp4 Sample flat walkthrough
  sv-group-108-grandthum.mp4     Group 108 Grandthum — lobby and atrium
  sv-dlf-phase-1-floor.mp4       DLF Phase 1 builder floor
  sv-biggest-family-house.mp4    The biggest family house
  sv-bollywood-style-floor.mp4   Bollywood-style builder floor (360p source)

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

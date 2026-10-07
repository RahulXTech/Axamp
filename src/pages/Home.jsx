import { useEffect, useRef } from 'react'
import { useIndustry } from '../lib/industry'
import { initSlides } from '../lib/slide'
import Hero from '../components/Hero'
import ProcessStrip from '../components/ProcessStrip'
import AnswerFirst from '../components/AnswerFirst'
import Pillar from '../components/Pillar'
import Performance from '../components/Performance'
import LeadEngine from '../components/LeadEngine'
import SectionRail from '../components/SectionRail'
import { Closing } from '../components/Closing'
import IndustryDock from '../components/IndustryDock'

/*
 * Everything that depends on the hero switcher (Real Estate / Hospital …):
 * the proof strip, the questions and one pinned section per proof.
 * Keyed by industry so a switch mounts a fresh set; the block wires up its
 * own `data-slide` animations each time (see data-slide-root in slide.js).
 */
function IndustryProof() {
  const { config } = useIndustry()
  const ref = useRef(null)

  // Runs after the new block's pins exist
  useEffect(() => initSlides(ref.current), [config.key])

  const { pillars } = config

  return (
    <div ref={ref} key={config.key} data-slide-root>
      <ProcessStrip pillars={pillars} eyebrow={config.stripEyebrow} title={config.stripTitle} />
      <AnswerFirst pillars={pillars} />
      {pillars.map((p, i) => (
        <Pillar key={p.id} pillar={p} index={i} variant={config.pillarStyle} />
      ))}
      <SectionRail pillars={pillars} />
    </div>
  )
}

// Home — hero, the proof for the chosen industry, ads, leads, contact
export default function Home() {
  return (
    <>
      <Hero />
      <IndustryProof />
      <Performance />
      <LeadEngine />
      <Closing />
      {/* Switch industry (or WhatsApp us) from anywhere on the page */}
      <IndustryDock />
    </>
  )
}

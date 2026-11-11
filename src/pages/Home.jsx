import { Suspense, useEffect, useRef } from 'react'
import { useIndustry } from '../lib/industry'
import { initSlides } from '../lib/slide'
import { usePauseOffscreen } from '../lib/hooks'
import Hero from '../components/Hero'
import LeadLeak from '../components/LeadLeak'
import ProcessStrip from '../components/ProcessStrip'
import AnswerFirst from '../components/AnswerFirst'
import Pillar from '../components/Pillar'
import SectionRail from '../components/SectionRail'
import { Closing } from '../components/Closing'
import IndustryDock from '../components/IndustryDock'
import Deferred from '../components/Deferred'

// Far-down sections whose code is fetched only when they're about to be
// built (Deferred.jsx). Closing stays in the first download: the footer on
// every page comes from the same file.
const loadPerformance = () => import('../components/Performance')
const loadLeadEngine = () => import('../components/LeadEngine')

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
      {/* Where a realtor's 100 leads go — real estate only */}
      {config.key === 'real-estate' && <LeadLeak />}
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
  // Looping CSS animations in sections off screen hold still (lib/hooks.js)
  usePauseOffscreen()

  return (
    <>
      <Hero />
      {/* The Hospital coverflow loads on demand: the whole block waits for it,
          so its slides and pins are wired up in one go (the hero stays on screen) */}
      <Suspense fallback={<div className="min-h-[100svh]" />}>
        <IndustryProof />
      </Suspense>
      {/* Far below the first screen: downloaded and built just after load,
          not in the first render — see Deferred.jsx (the first render used
          to block a slow phone for ~5 s) */}
      <Deferred load={loadPerformance} />
      <Deferred load={loadLeadEngine} />
      <Deferred><Closing /></Deferred>
      {/* Switch industry (or WhatsApp us) from anywhere on the page */}
      <IndustryDock />
    </>
  )
}

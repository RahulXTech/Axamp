import { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll, resetScroll, scrollToTarget } from './lib/scroll'
import { initSlides } from './lib/slide'
import { lazyPage } from './lib/lazyPage'
import { ModalProvider } from './lib/modal'
import { IndustryProvider, industryFromPath } from './lib/industry'
import Nav from './components/Nav'
import VideoModal from './components/VideoModal'
import RouteBoundary from './components/RouteBoundary'
import { Footer } from './components/Closing'
import { PillarShowcase } from './components/Pillar'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// The home page ships in the first download; the others load when visited
// (Packages and the report also bring Framer Motion, which home doesn't use).
const Services = lazyPage(() => import('./pages/Services'))
const Packages = lazyPage(() => import('./pages/Packages'))
const BuildPackage = lazyPage(() => import('./pages/BuildPackage'))
const LeadReport = lazyPage(() => import('./pages/LeadReport'))
const About = lazyPage(() => import('./pages/About'))
const Contact = lazyPage(() => import('./pages/Contact'))
// …plus the Hospital coverflow, so switching to Hospital doesn't wait for it
const lazyPages = [BuildPackage, Services, Packages, About, Contact, LeadReport, PillarShowcase]

const SITE_TITLE = 'AXAMP — From Leads to Sales'
// Tab titles for the industry pages (real estate is the home page)
const industryTitles = { hospital: 'Hospital Marketing', university: 'University Marketing' }

// iOS Safari resizes the viewport as its address bar shows / hides while
// you scroll — don't re-measure every pin for that, only for real resizes.
ScrollTrigger.config({ ignoreMobileResize: true })

/*
 * Wraps every route. Runs after the page's own effects (so its pins
 * exist): starts at the top — or at the #section in the URL — and
 * wires up the page's `data-slide` animations.
 */
// `fullTitle` replaces the whole tab title — a short one like "About · AXAMP"
// gets rewritten by Google into its own (it showed "About Us — AXAMP PRIVATE LIMITED")
function Page({ title, fullTitle, children }) {
  useEffect(() => {
    document.title = fullTitle ?? (title ? `${title} · AXAMP` : SITE_TITLE)
  }, [title, fullTitle])

  useEffect(() => {
    resetScroll()
    const stopSlides = initSlides()

    const { hash } = window.location
    const t = hash && setTimeout(() => scrollToTarget(hash), 200)

    return () => {
      clearTimeout(t)
      stopSlides()
    }
  }, [])

  return <main>{children}</main>
}

export default function App() {
  const location = useLocation()
  // The three industry pages share one Home that swaps its sections in
  // place (Home.jsx), so switching keeps your scroll position and the hero
  // video. Every other path mounts fresh.
  const industry = industryFromPath(location.pathname)
  const routeKey = industry ? 'home' : location.pathname

  useEffect(() => {
    const stop = initSmoothScroll()
    // Fonts shift layout widths, so re-measure the pins once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return stop
  }, [])

  // Once the first page has settled, fetch the other pages in the background
  // so the nav opens them instantly (skipped when the visitor saves data)
  useEffect(() => {
    if (navigator.connection?.saveData) return
    let t
    const later = () => (t = setTimeout(() => lazyPages.forEach((p) => p.preload().catch(() => {})), 4000))
    if (document.readyState === 'complete') later()
    else window.addEventListener('load', later, { once: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('load', later)
    }
  }, [])

  const home = <Page key="home" title={industryTitles[industry]}><Home /></Page>

  return (
    <IndustryProvider>
      <ModalProvider>
        {/* Film grain overlay */}
        <div className="grain" aria-hidden="true" />

        <Nav />

        {/* The fallback only shows when a page is opened directly; moving between
            pages keeps the current one on screen until the next is ready */}
        <Suspense fallback={<div className="min-h-[100svh]" />}>
        <RouteBoundary key={routeKey}>
        <Routes location={location} key={routeKey}>
          {/* Real estate is the home page */}
          <Route path="/" element={home} />
          <Route path="/hospital" element={home} />
          <Route path="/university" element={home} />
          <Route path="/real-estate" element={<Navigate to="/" replace />} />
          <Route path="/services" element={<Page title="Services"><Services /></Page>} />
          <Route path="/packages" element={<Page title="Packages"><Packages /></Page>} />
          <Route path="/build-package" element={<Page title="Get Audit"><BuildPackage /></Page>} />
          <Route path="/build-package/report" element={<Page title="Lead Loss Report"><LeadReport /></Page>} />
          <Route path="/about" element={<Page fullTitle="About Us — MARKETING, BRANDING & AUTOMATION"><About /></Page>} />
          <Route path="/contact" element={<Page title="Contact"><Contact /></Page>} />
          <Route path="*" element={<Page title="Page not found"><NotFound /></Page>} />
        </Routes>
        </RouteBoundary>
        </Suspense>

        <Footer />
        <VideoModal />
      </ModalProvider>
    </IndustryProvider>
  )
}

import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll, resetScroll, scrollToTarget } from './lib/scroll'
import { initSlides } from './lib/slide'
import { ModalProvider } from './lib/modal'
import { IndustryProvider } from './lib/industry'
import Nav from './components/Nav'
import VideoModal from './components/VideoModal'
import { Footer } from './components/Closing'
import Home from './pages/Home'
import Services from './pages/Services'
import Packages from './pages/Packages'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

const SITE_TITLE = 'AXAMP — We build proof.'

/*
 * Wraps every route. Runs after the page's own effects (so its pins
 * exist): starts at the top — or at the #section in the URL — and
 * wires up the page's `data-slide` animations.
 */
function Page({ title, children }) {
  useEffect(() => {
    document.title = title ? `${title} · AXAMP` : SITE_TITLE
    resetScroll()
    const stopSlides = initSlides()

    const { hash } = window.location
    const t = hash && setTimeout(() => scrollToTarget(hash), 200)

    return () => {
      clearTimeout(t)
      stopSlides()
    }
  }, [title])

  return <main>{children}</main>
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    const stop = initSmoothScroll()
    // Fonts shift layout widths, so re-measure the pins once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return stop
  }, [])

  return (
    <IndustryProvider>
      <ModalProvider>
        {/* Film grain overlay */}
        <div className="grain" aria-hidden="true" />

        <Nav />

        {/* Keyed by path so each page mounts fresh */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/services" element={<Page title="Services"><Services /></Page>} />
          <Route path="/packages" element={<Page title="Packages"><Packages /></Page>} />
          <Route path="/about" element={<Page title="About"><About /></Page>} />
          <Route path="/contact" element={<Page title="Contact"><Contact /></Page>} />
          <Route path="*" element={<Page title="Page not found"><NotFound /></Page>} />
        </Routes>

        <Footer />
        <VideoModal />
      </ModalProvider>
    </IndustryProvider>
  )
}

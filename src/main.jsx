import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// Swiper's styles for the Hospital coverflow. PillarShowcase loads on demand,
// but its CSS stays here, ahead of styles.css, so our overrides (.perf-swiper) still win.
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getIndustry } from '../data/industries'

// Each industry has its own page; real estate is the home page.
export const industryPaths = {
  'real-estate': '/',
  hospital: '/hospital',
  university: '/university',
}

// '/hospital' → 'hospital', any non-industry page → null
export const industryFromPath = (pathname) => {
  const path = pathname.replace(/\/+$/, '') || '/'
  return Object.keys(industryPaths).find((id) => industryPaths[id] === path) ?? null
}

// The industry page you're on (Real Estate / Hospital / University),
// shared so the sections on it can follow along. Other pages (Contact …)
// keep the last one you saw, so e.g. the contact form can preselect it.
const IndustryCtx = createContext(null)

export function IndustryProvider({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const fromPath = industryFromPath(pathname)
  const [last, setLast] = useState(fromPath ?? 'real-estate')

  useEffect(() => {
    if (fromPath) setLast(fromPath)
  }, [fromPath])

  const industry = fromPath ?? last
  // Switching industry = going to its page
  const setIndustry = useCallback((id) => navigate(industryPaths[id] ?? '/'), [navigate])

  return (
    <IndustryCtx.Provider
      value={{ industry, setIndustry, config: getIndustry(industry), homePath: industryPaths[industry] ?? '/' }}
    >
      {children}
    </IndustryCtx.Provider>
  )
}

export const useIndustry = () => useContext(IndustryCtx)

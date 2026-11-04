import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToTarget } from './scroll'
import { industryFromPath, useIndustry } from './industry'

// Top-level pages, in navbar order
export const pages = [
  { to: '/', label: 'Home' },
  { to: '/build-package', label: 'Get Audit' },
  { to: '/services', label: 'Services' },
  { to: '/packages', label: 'Packages' },
  { to: '/lead-leak', label: 'Lead Leak' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

/*
 * One way to move around the site:
 *   go('/about')    another page
 *   go('/#area')    a section on the home page (from any page) — '/' is the
 *                   page of the industry you're on (or last saw)
 *   go('#area')     a section on the current page
 * Already on the target page → smooth-scrolls instead of reloading it.
 */
export function useGo() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { homePath } = useIndustry()

  return useCallback(
    (to) => {
      const [path, hash] = to.split('#')
      const target = path === '/' ? homePath : path || pathname
      if (target === pathname) scrollToTarget(hash ? `#${hash}` : 0)
      else navigate(hash ? `${target}#${hash}` : target)
    },
    [navigate, pathname, homePath],
  )
}

// The navbar treats every industry page as "Home", and the lead loss report as "Get Audit"
export const pageOf = (pathname) => (industryFromPath(pathname) ? '/' : pathname.startsWith('/build-package') ? '/build-package' : pathname)

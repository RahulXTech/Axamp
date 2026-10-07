import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToTarget } from './scroll'

// Top-level pages, in navbar order
export const pages = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/packages', label: 'Packages' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

/*
 * One way to move around the site:
 *   go('/about')    another page
 *   go('/#area')    a section on the home page (from any page)
 *   go('#area')     a section on the current page
 * Already on the target page → smooth-scrolls instead of reloading it.
 */
export function useGo() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback(
    (to) => {
      const [path, hash] = to.split('#')
      const target = path || pathname
      if (target === pathname) scrollToTarget(hash ? `#${hash}` : 0)
      else navigate(hash ? `${target}#${hash}` : target)
    },
    [navigate, pathname],
  )
}

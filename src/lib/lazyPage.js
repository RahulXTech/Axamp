import { lazy } from 'react'

/*
 * A page that loads on demand (its code isn't part of the first download).
 *
 * After a new deploy, a tab opened earlier still asks for the old page
 * files, which are gone. That's fixed by reloading once to pick up the new
 * build. A sessionStorage flag makes it once: if the page still can't load
 * after that (offline, server down) the error goes to RouteBoundary, which
 * offers a reload button — it never reloads in a loop.
 */
const RELOADED = 'axamp:chunk-reload'

const storage = {
  get: () => {
    try { return sessionStorage.getItem(RELOADED) } catch { return '1' } // no storage → never auto-reload
  },
  set: (v) => {
    try { v ? sessionStorage.setItem(RELOADED, v) : sessionStorage.removeItem(RELOADED) } catch { /* ignore */ }
  },
}

export function lazyPage(load) {
  const Page = lazy(() =>
    load().then(
      (mod) => {
        storage.set(null)
        return mod
      },
      (err) => {
        if (storage.get()) throw err
        storage.set('1')
        window.location.reload()
        return new Promise(() => {}) // stay on the fallback until the reload happens
      },
    ),
  )
  // Lets the app fetch the page ahead of time (see App.jsx)
  Page.preload = load
  return Page
}

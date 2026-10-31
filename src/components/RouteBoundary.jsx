import { Component } from 'react'

/*
 * Catches a page that fails to load or render, so the rest of the site
 * (nav, footer) stays up and the visitor gets a way forward instead of a
 * blank screen. Reset by remounting (App keys it by path).
 */
export default class RouteBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('[page] failed to load:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main className="grid min-h-[100svh] place-items-center px-[var(--gutter)] py-32 text-center">
        <div className="flex max-w-[460px] flex-col items-center gap-5">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,4vw,2.2rem)] font-bold text-white">
            This page didn't load
          </h1>
          <p className="text-[var(--muted)]">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-12 rounded-full bg-[var(--cyan)] px-7 font-[family-name:var(--font-display)] font-semibold text-[var(--navy)]"
          >
            Reload
          </button>
        </div>
      </main>
    )
  }
}

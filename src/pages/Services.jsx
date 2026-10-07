import { ArrowRight } from 'lucide-react'

import PageHero from '../components/PageHero'
import ServiceCatalog, { CatalogIcon, categoryCount, serviceCount } from '../components/ServiceCatalog'
import { catalog } from '../data/pricing'
import { useGo } from '../lib/nav'

const allCats = [...catalog.monthly, ...catalog.oneTime]

// Two rows of categories drifting in opposite directions
function CategoryMarquee() {
  const row = (cats, reverse) => (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div
        className="bento-marquee flex shrink-0 gap-3 pr-3"
        style={{ animationDuration: '38s', ...(reverse ? { animationDirection: 'reverse' } : null) }}
      >
        {[...cats, ...cats].map((c, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-4 text-[14px] font-semibold text-white/75 backdrop-blur-sm"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: `rgba(${c.accent[1]}, 0.14)`, color: c.accent[0] }}>
              <CatalogIcon name={c.icon} size={15} />
            </span>
            {c.name}
          </span>
        ))}
      </div>
    </div>
  )

  const half = Math.ceil(allCats.length / 2)
  return (
    // Part of the hero, so it rises in on load (not on scroll)
    <div aria-hidden="true" className="mt-10 flex w-[min(100vw,1180px)] flex-col gap-3 max-[640px]:mt-6 [animation:rise_1.1s_var(--ease)_0.5s_both]">
      {row(allCats.slice(0, half), false)}
      {row(allCats.slice(half), true)}
    </div>
  )
}

export default function Services() {
  const go = useGo()

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={['Everything your brand', 'needs to grow.']}
        oneLine
        text={`${serviceCount} services across ${categoryCount} categories — tap “Add” on anything you like and get one quote on WhatsApp.`}
        secondary={{ label: 'Browse services', to: '#catalog' }}
      >
        <CategoryMarquee />
      </PageHero>

      <ServiceCatalog />

      {/* Not sure? */}
      <section className="px-[var(--gutter)] pb-[clamp(96px,14vh,150px)] max-[640px]:pb-12">
        <div
          data-slide="scale"
          className="relative mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[30px] border border-[rgba(83,247,251,0.2)] bg-[linear-gradient(120deg,rgba(83,247,251,0.10),rgba(15,24,54,0.9)_50%,rgba(255,122,80,0.10))] px-8 py-10 max-[640px]:px-6"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.18),transparent_65%)]" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2.1rem)] font-[800] leading-[1.15] tracking-[-0.03em] text-white">
              Not sure what you need?
            </h2>
            <p className="mt-2 text-[15.5px] text-[var(--muted)]">Tell us about your business — we’ll suggest the right mix.</p>
          </div>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault()
              go('/contact')
            }}
            className="group relative inline-flex h-13 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)] px-6 py-3.5 font-[family-name:var(--font-display)] text-[15px] font-[700] text-[var(--navy)] shadow-[0_0_30px_-8px_rgba(83,247,251,0.8)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Talk to us
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  )
}

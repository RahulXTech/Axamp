/* ------------------------------------------------------------------
   A short page opening for pages where the content below is the point
   (Packages, Build Package) — a badge, a one-line title and one line of
   text, so the main content starts on the first screen. PageHero is
   the tall version for the other inner pages.

   <CompactHero
     icon={Calculator}
     eyebrow="Package calculator"
     title={['Build your package.', 'See your budget instantly.']}  // 2nd part glows cyan
     text="One short line."            // a string or JSX (e.g. with a link)
   />

   On phones the cyan part drops to its own line.
------------------------------------------------------------------ */
export default function CompactHero({ icon: Icon, eyebrow, title, text }) {
  const [first, second] = Array.isArray(title) ? title : [title]

  return (
    <header className="relative isolate overflow-hidden px-[var(--gutter)] pb-8 pt-[clamp(112px,15vh,140px)] max-[640px]:pb-6 max-[640px]:pt-[104px]">
      {/* Backdrop: grid + glow, as on PageHero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_50%_20%,#000_10%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-0 h-[380px] w-[min(1000px,120vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_15%,rgba(83,247,251,0.14),transparent_65%)]"
      />

      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-3 text-center">
        <p data-slide="up" className="flex items-center gap-2 rounded-full border border-[rgba(83,247,251,0.3)] bg-[rgba(83,247,251,0.07)] px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">
          {Icon && <Icon size={14} aria-hidden="true" />}
          {eyebrow}
        </p>
        <h1
          data-slide="up"
          className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.3vw,2.9rem)] font-[800] leading-[1.08] tracking-[-0.035em] text-white text-balance max-[640px]:text-[clamp(1.4rem,6.6vw,1.75rem)] min-[1100px]:whitespace-nowrap"
        >
          {first}
          {second && (
            <>
              {' '}
              <span className="bg-[linear-gradient(100deg,var(--cyan),#c9fdff_50%,var(--cyan))] bg-clip-text text-transparent max-[640px]:block">{second}</span>
            </>
          )}
        </h1>
        {text && (
          <p data-slide="up" className="max-w-[640px] text-[15px] leading-[1.55] text-[var(--muted)] max-[640px]:text-[14px]">
            {text}
          </p>
        )}
      </div>
    </header>
  )
}

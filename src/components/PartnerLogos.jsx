import { partners } from '../data/partners'

/* ------------------------------------------------------------------
   "Brands we've worked with" — an endless strip of partner logos.
   Pauses on hover; edges fade out. Used on Home and About.
------------------------------------------------------------------ */

// Enough copies that one half of the track is wider than any screen
const COPIES = 4

export default function PartnerLogos({
  eyebrow = 'Brands we’ve worked with',
  title = 'Trusted by brands people love.',
  text = 'Restaurants, cafés, clinics and gifting brands — all growing with AXAMP.',
}) {
  const track = Array.from({ length: COPIES }, () => partners).flat()

  return (
    <section className="relative isolate overflow-hidden py-[clamp(64px,10vh,110px)]">
      {/* Soft divider glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(83,247,251,0.3)] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[360px] w-[min(1000px,120vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(83,247,251,0.08),transparent_70%)]"
      />

      <header data-slide="up" className="mx-auto flex max-w-[760px] flex-col items-center gap-3 px-[var(--gutter)] text-center">
        <p className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
          <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-l from-[var(--cyan)] to-transparent" />
          {eyebrow}
          <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent" />
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.4vw,2.8rem)] font-[800] leading-[1.08] tracking-[-0.035em] text-white text-balance">
          {title}
        </h2>
        {text && <p className="max-w-[520px] text-[15.5px] leading-[1.6] text-[var(--muted)]">{text}</p>}
      </header>

      <div
        data-slide="up"
        className="partner-strip mt-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        <ul className="partner-track m-0 flex w-max list-none gap-5 p-0 py-3 max-[640px]:gap-3.5">
          {track.map((p, i) => (
            <li key={i} aria-hidden={i >= partners.length || undefined} className="shrink-0">
              <figure className="group m-0 flex flex-col items-center gap-3">
                <div
                  className="
                    h-[150px] w-[150px] overflow-hidden rounded-[28px] border border-white/10
                    shadow-[0_24px_50px_-20px_rgba(0,0,0,0.85)]
                    transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease)]
                    group-hover:-translate-y-2 group-hover:border-[rgba(83,247,251,0.55)]
                    group-hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(83,247,251,0.6)]
                    max-[640px]:h-[112px] max-[640px]:w-[112px] max-[640px]:rounded-[22px]
                  "
                >
                  <img
                    src={p.logo}
                    alt={i < partners.length ? `${p.name} logo` : ''}
                    width={150}
                    height={150}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.06]"
                  />
                </div>
                <figcaption className="text-center leading-tight">
                  <span className="block font-[family-name:var(--font-display)] text-[14px] font-semibold text-white/85 max-[640px]:text-[12.5px]">
                    {p.name}
                  </span>
                  <span className="block text-[11.5px] text-[var(--faint)] max-[640px]:text-[10.5px]">{p.type}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

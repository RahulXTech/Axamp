import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { whatsappLink } from '../data/site'
import { useGo } from '../lib/nav'
import { WhatsAppIcon } from './icons'

/* ------------------------------------------------------------------
   Opening block for the inner pages (Services, Packages, About…).

   <PageHero
     eyebrow="Services"
     title={['Video that', 'sells real estate.']}   // 2nd line glows cyan
     text="One or two lines under the title."
     secondary={{ label: 'See our work', to: '/#area' }}  // optional
     oneLine            // optional: both parts on a single line (wraps on phones)
   />

   Everything slides in through the site-wide `data-slide` system.
------------------------------------------------------------------ */
export default function PageHero({ eyebrow, title, text, secondary, oneLine = false, children }) {
  const go = useGo()
  const [first, second] = Array.isArray(title) ? title : [title]

  return (
    <section className="relative isolate overflow-hidden px-[var(--gutter)] pt-[clamp(140px,22vh,220px)] pb-[clamp(72px,12vh,140px)] max-[640px]:pb-10 max-[640px]:pt-28">
      {/* Backdrop: grid + two glows */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]
          [background-size:64px_64px]
          [mask-image:radial-gradient(ellipse_at_50%_30%,#000_15%,transparent_70%)]
        "
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-0 h-[520px] w-[min(1100px,120vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_20%,rgba(83,247,251,0.13),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 right-[-10%] bottom-[-20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,122,80,0.10),transparent_65%)]"
      />

      <div className={`mx-auto flex flex-col items-center gap-6 text-center max-[640px]:gap-4 ${oneLine ? 'max-w-[1280px]' : 'max-w-[980px]'}`}>
        <p
          data-slide="up"
          className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]"
        >
          <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-l from-[var(--cyan)] to-transparent" />
          {eyebrow}
          <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent" />
        </p>

        <h1
          data-slide="up"
          className={`font-[800] leading-[1.02] tracking-[-0.04em] text-[var(--text)] font-[family-name:var(--font-display)] text-balance ${
            oneLine ? 'text-[clamp(2.4rem,3.9vw,4rem)] lg:whitespace-nowrap' : 'text-[clamp(2.6rem,6.4vw,6rem)]'
          }`}
        >
          {first}
          {second && (
            <span className={`${oneLine ? 'inline' : 'block'} bg-[linear-gradient(100deg,var(--cyan),#c9fdff_50%,var(--cyan))] bg-clip-text text-transparent`}>
              {oneLine && ' '}
              {second}
            </span>
          )}
        </h1>

        {text && (
          <p
            data-slide="up"
            className="max-w-[640px] text-[clamp(1rem,1.4vw,1.2rem)] leading-[1.6] text-[var(--muted)]"
          >
            {text}
          </p>
        )}

        <div data-slide="up" className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="
              group inline-flex items-center gap-2.5
              h-12 pl-1.5 pr-5 rounded-full
              font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--navy)]
              bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)]
              shadow-[0_0_26px_-6px_rgba(83,247,251,0.7),inset_0_1px_0_rgba(255,255,255,0.6)]
              transition-[transform,box-shadow] duration-300 ease-[var(--ease)]
              hover:-translate-y-px hover:shadow-[0_0_34px_-4px_rgba(83,247,251,0.85),inset_0_1px_0_rgba(255,255,255,0.6)]
            "
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--navy)] text-[var(--cyan)]">
              <WhatsAppIcon size={17} />
            </span>
            Book a Call
            <ArrowUpRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          {secondary && (
            <a
              href={secondary.to}
              onClick={(e) => {
                e.preventDefault()
                go(secondary.to)
              }}
              className="
                group inline-flex items-center gap-2 h-12 px-6 rounded-full
                border border-white/12 bg-white/[0.04]
                font-[family-name:var(--font-display)] text-[14px] font-semibold text-white
                transition-[border-color,background-color] duration-300
                hover:border-[rgba(83,247,251,0.5)] hover:bg-white/[0.07]
              "
            >
              {secondary.label}
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          )}
        </div>

        {children}
      </div>
    </section>
  )
}

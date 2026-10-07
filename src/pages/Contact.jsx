import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react'

import ContactForm from '../components/ContactForm'
import { WhatsAppIcon } from '../components/icons'
import { nextSteps } from '../data/contact'
import { mapsLink, site, whatsappLink } from '../data/site'

const pad = (n) => String(n).padStart(2, '0')

// Direct ways to reach AXAMP, beside the form
const direct = [
  {
    icon: <WhatsAppIcon size={19} />,
    label: 'Chat on WhatsApp',
    sub: 'Fastest reply',
    href: whatsappLink(),
    external: true,
    hot: true,
  },
  {
    icon: <Phone size={18} />,
    label: site.phone,
    sub: 'Call us',
    href: `tel:${site.phoneTel}`,
  },
  {
    icon: <Mail size={18} />,
    label: site.email,
    sub: 'Email us',
    href: `mailto:${site.email}`,
  },
]

const card = 'glass rounded-[26px] p-6 max-[640px]:p-5'

const cardTitle =
  'mb-4 max-[640px]:mb-3 font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--faint)]'

export default function Contact() {
  return (
    <section className="relative isolate overflow-clip px-[var(--gutter)] pt-[clamp(120px,19vh,190px)] pb-[clamp(72px,12vh,130px)] max-[640px]:pt-28 max-[640px]:pb-12">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_50%_10%,#000_10%,transparent_60%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-0 h-[520px] w-[min(1100px,120vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_15%,rgba(83,247,251,0.13),transparent_65%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 -right-40 top-[40%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,122,80,0.08),transparent_65%)]"
      />

      <div className="mx-auto max-w-[1180px]">
        {/* Heading */}
        <header className="mx-auto flex max-w-[760px] flex-col items-center gap-5 text-center max-[640px]:gap-4">
          <p
            data-slide="up"
            className="flex items-center gap-3 font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]"
          >
            <span
              aria-hidden="true"
              className="h-[2px] w-8 rounded-full bg-gradient-to-l from-[var(--cyan)] to-transparent"
            />

            Contact

            <span
              aria-hidden="true"
              className="h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--cyan)] to-transparent"
            />
          </p>

          <h1
            data-slide="up"
            className="font-[800] text-[clamp(2.2rem,5.6vw,5rem)] leading-[1.03] tracking-[-0.04em] text-[var(--text)] font-[family-name:var(--font-display)] text-balance"
          >
            Let’s grow your

            <span className="block bg-[linear-gradient(100deg,var(--cyan),#c9fdff_50%,var(--cyan))] bg-clip-text text-transparent">
              business together.
            </span>
          </h1>

          <p
            data-slide="up"
            className="max-w-[560px] text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.6] text-[var(--muted)]"
          >
            Tell us a little about your business — it takes about a minute,
            and we’ll take it from there.
          </p>
        </header>

        {/* Form + details */}
        <div className="mt-14 grid grid-cols-[minmax(0,7fr)_minmax(0,4fr)] items-start gap-6 max-[960px]:grid-cols-1 max-[640px]:mt-6 max-[640px]:gap-4">
          {/* Contact Form */}
          <div
            data-slide="up"
            className="glass relative overflow-clip rounded-[32px] p-8 max-[640px]:rounded-[26px] max-[640px]:p-5"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(83,247,251,0.12),transparent_65%)]"
            />

            <div className="relative">
              <ContactForm />
            </div>
          </div>

          {/* Contact Details */}
          <aside
            data-slide="up"
            data-slide-stagger
            className="flex flex-col gap-4 min-[961px]:sticky min-[961px]:top-28"
          >
            {/* Direct Contact */}
            <div className={card}>
              <p className={cardTitle}>Talk to us directly</p>

              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {direct.map((d) => (
                  <li key={d.sub}>
                    <a
                      href={d.href}
                      target={d.external ? '_blank' : undefined}
                      rel={d.external ? 'noreferrer' : undefined}
                      className={`
                        group flex items-center gap-3.5 rounded-2xl border p-3.5
                        transition-[border-color,background-color,transform] duration-300 ease-[var(--ease)]
                        hover:-translate-y-0.5
                        ${
                          d.hot
                            ? 'border-[rgba(83,247,251,0.35)] bg-[rgba(83,247,251,0.07)] hover:border-[rgba(83,247,251,0.6)]'
                            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                        }
                      `}
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                          d.hot
                            ? 'bg-[var(--cyan)] text-[var(--navy)]'
                            : 'bg-white/[0.06] text-[var(--cyan)]'
                        }`}
                      >
                        {d.icon}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-[family-name:var(--font-display)] text-[14.5px] font-semibold text-white">
                          {d.label}
                        </span>

                        <span className="block text-[12.5px] text-[var(--faint)]">
                          {d.sub}
                        </span>
                      </span>

                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-white/40 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--cyan)]"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Office */}
            <div className={card}>
              <p className={cardTitle}>Visit our office</p>

              <a
                href={mapsLink()}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-3"
              >
                <MapPin
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[var(--cyan)]"
                />

                <span className="text-[14px] leading-[1.6] text-white/80 transition-colors group-hover:text-white">
                  {site.address.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}

                  <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--cyan)]">
                    Open in Maps
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </span>
                </span>
              </a>

              <div className="mt-4 flex gap-3 border-t border-white/[0.07] pt-4">
                <Clock
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[var(--cyan)]"
                />

                <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
                  {site.hours.map(([d, h]) => (
                    <div key={d} className="contents">
                      <dt className="text-[var(--faint)]">{d}</dt>
                      <dd className="m-0 font-medium text-white/85">
                        {h}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Next Steps */}
            <div className={card}>
              <p className={cardTitle}>What happens next</p>

              <ol className="m-0 flex list-none flex-col gap-4 p-0">
                {nextSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[rgba(83,247,251,0.35)] bg-[rgba(83,247,251,0.08)] font-[family-name:var(--font-display)] text-[11px] font-bold text-[var(--cyan)]">
                      {pad(i + 1)}
                    </span>

                    <span>
                      <span className="block font-[family-name:var(--font-display)] text-[14.5px] font-semibold text-white">
                        {s.title}
                      </span>

                      <span className="block text-[13px] leading-[1.55] text-[var(--muted)]">
                        {s.text}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

import { ArrowRight } from 'lucide-react'
import LeadLeak from '../components/LeadLeak'
import { leadLeak } from '../data/leadLeak'
import { useGo } from '../lib/nav'

const { total, stages } = leadLeak
const last = stages[stages.length - 1]
const visits = last.from - last.lost

// "The lead leak" — where a realtor's 100 leads go, as its own page (/lead-leak).
// The same section also stays on the home page, under the hero (Home.jsx).
export default function LeadLeakPage() {
  const go = useGo()

  return (
    <>
      <LeadLeak standalone />

      {/* Phones: the section has no room for its "Plug the leak" box (hidden
          below 600px by its `max-[600px]:hidden`, which Tailwind compiles to
          "narrower than 600px"), so it follows the panel here instead. Same
          breakpoint, so exactly one of the two boxes shows at every width. */}
      <section className="relative z-10 bg-[var(--navy)] px-[var(--gutter)] pb-12 min-[600px]:hidden">
        <div className="mx-auto flex max-w-[520px] flex-col items-start gap-4 rounded-[20px] border border-white/[0.08] bg-[linear-gradient(100deg,rgba(83,247,251,0.07),rgba(11,18,41,0.4))] px-5 py-5">
          <p className="font-[family-name:var(--font-display)] text-[17px] font-[700] leading-[1.25] text-white">
            {total} leads in. Only <span className="text-[var(--cyan)]">{visits}</span> walk into the property.
            <span className="mt-1 block font-[family-name:var(--font-ui)] text-[13px] font-[500] text-[var(--muted)]">
              AXAMP plugs every one of these leaks.
            </span>
          </p>
          <a
            href="/build-package"
            onClick={(e) => {
              e.preventDefault()
              go('/build-package')
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--cyan)] px-5 py-3 font-[family-name:var(--font-display)] text-[14px] font-[700] text-[var(--navy)] shadow-[0_14px_34px_-10px_rgba(83,247,251,0.75)]"
          >
            Plug the leak
            <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  )
}

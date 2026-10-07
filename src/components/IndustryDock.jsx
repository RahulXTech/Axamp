import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Building2, GraduationCap, UserRound } from 'lucide-react'
import { useIndustry } from '../lib/industry'
import { scrollToTarget } from '../lib/scroll'
import { services } from '../data/services'
import { industryWhatsappMessage, whatsappLink } from '../data/site'
import { WhatsAppIcon } from './icons'

const serviceIcons = { building: Building2, user: UserRound, graduation: GraduationCap }

/*
 * Floating industry switcher (home page): the hero's Real Estate /
 * Hospital / University choice, always one tap away, plus WhatsApp.
 * Bottom-centre on desktop, a full-width thumb bar on phones. Shows
 * once the hero has scrolled away (it has its own switcher) and hides
 * at the contact section (it has its own WhatsApp buttons).
 */
export default function IndustryDock() {
  const { industry, setIndustry } = useIndustry()
  const active = Math.max(0, services.findIndex((s) => s.id === industry))
  const svc = services[active]
  const visible = useDockVisible()

  const listRef = useRef(null)
  const tabRefs = useRef([])
  const [pill, setPill] = useState(null)

  // Gliding highlight behind the active industry
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[active]
      if (el) setPill({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(listRef.current)
    return () => ro.disconnect()
  }, [active])

  const select = (i) => {
    if (i === active) return
    // Reading the lead engine (or below it)? Stay there — it swaps too.
    // Otherwise go to the top of the new industry's proof.
    const engine = document.getElementById('lead-engine')?.getBoundingClientRect()
    const target = engine && engine.top < window.innerHeight * 0.5 ? '#lead-engine' : '#process'
    setIndustry(services[i].id)
    // Let the new sections mount and re-measure their pins first
    setTimeout(() => scrollToTarget(target), 150)
  }

  return (
    <div
      className={`
        fixed z-[44]
        left-1/2 bottom-[max(20px,env(safe-area-inset-bottom))] -translate-x-1/2
        max-[640px]:left-3 max-[640px]:right-3 max-[640px]:translate-x-0 max-[640px]:bottom-[max(12px,env(safe-area-inset-bottom))]

        flex items-center gap-2 p-1.5
        rounded-full max-[640px]:rounded-[24px]

        bg-[linear-gradient(160deg,rgba(11,18,41,0.86),rgba(11,18,41,0.66))]
        backdrop-blur-[18px]
        border border-white/10
        shadow-[0_24px_50px_-18px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]

        transition-[transform,opacity,translate] duration-500 ease-[var(--ease)]
        ${visible ? 'opacity-100' : 'pointer-events-none translate-y-[140%] opacity-0'}
      `}
      style={{ '--accent': svc.accent, '--accent-rgb': svc.accentRgb }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div
        ref={listRef}
        role="group"
        aria-label="Choose your industry"
        className="relative flex items-stretch gap-1 max-[640px]:grid max-[640px]:flex-1 max-[640px]:grid-cols-3"
      >
        {/* Gliding indicator */}
        <span
          aria-hidden="true"
          className="
            absolute left-0 top-0 rounded-full max-[640px]:rounded-[18px]
            bg-[var(--accent)]
            shadow-[0_0_24px_-4px_rgba(var(--accent-rgb),0.8),inset_0_1px_0_rgba(255,255,255,0.6)]
            transition-[transform,width,height,background-color] duration-500 ease-[var(--ease)]
          "
          style={pill ? { width: pill.w, height: pill.h, transform: `translate3d(${pill.x}px, ${pill.y}px, 0)` } : { opacity: 0 }}
        />

        {services.map((s, i) => {
          const Icon = serviceIcons[s.icon]
          const on = i === active
          return (
            <button
              key={s.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              aria-pressed={on}
              onClick={() => select(i)}
              className={`
                group relative z-10
                inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5
                rounded-full
                font-[family-name:var(--font-display)] font-[600]
                text-[13.5px] leading-none whitespace-nowrap
                transition-colors duration-[400ms] ease-[var(--ease)]

                max-[640px]:flex-col max-[640px]:justify-center max-[640px]:gap-1
                max-[640px]:px-1 max-[640px]:py-2 max-[640px]:rounded-[18px]
                max-[640px]:text-[11px]

                ${on ? 'text-[var(--navy)]' : 'text-[var(--muted)] hover:text-white'}
              `}
            >
              <span
                className={`
                  grid h-8 w-8 shrink-0 place-items-center rounded-full
                  transition-[background,transform] duration-[400ms] ease-[var(--ease)]
                  max-[640px]:h-6 max-[640px]:w-6
                  ${on ? 'bg-[rgba(11,18,41,0.14)]' : 'bg-white/[0.06] group-hover:scale-110 group-hover:bg-white/10'}
                `}
                style={on ? undefined : { color: s.accent }}
              >
                <Icon size={15} strokeWidth={2} aria-hidden="true" />
              </span>
              {s.label}
            </button>
          )
        })}
      </div>

      <span aria-hidden="true" className="h-8 w-px bg-white/10 max-[640px]:hidden" />

      <a
        href={whatsappLink(industryWhatsappMessage[svc.id])}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with AXAMP on WhatsApp"
        className="
          inline-flex shrink-0 items-center gap-2 rounded-full
          bg-[#25d366] py-1.5 pl-1.5 pr-4 text-[#06210f]
          font-[family-name:var(--font-display)] text-[13.5px] font-[700] leading-none
          shadow-[0_0_24px_-6px_rgba(37,211,102,0.8)]
          transition-[transform,box-shadow] duration-300 ease-[var(--ease)]
          hover:-translate-y-0.5 hover:shadow-[0_0_30px_-4px_rgba(37,211,102,0.95)]

          max-[640px]:h-[60px] max-[640px]:w-[56px] max-[640px]:flex-col max-[640px]:justify-center max-[640px]:gap-1
          max-[640px]:rounded-[18px] max-[640px]:p-0 max-[640px]:text-[10px]
        "
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(6,33,15,0.12)] max-[640px]:h-6 max-[640px]:w-6">
          <WhatsAppIcon size={17} />
        </span>
        <span className="max-[640px]:hidden">WhatsApp</span>
        <span className="hidden max-[640px]:inline">Chat</span>
      </a>
    </div>
  )
}

/* Visible between the hero and the contact section */
function useDockVisible() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const vh = window.innerHeight
      const contact = document.getElementById('contact')?.getBoundingClientRect()
      const pastHero = window.scrollY > vh * 0.6
      const beforeContact = !contact || contact.top > vh * 0.85
      setVisible(pastHero && beforeContact)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return visible
}

import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToTarget } from '../lib/scroll'

// Fixed right-edge progress rail; amber marks the section in view.
export default function SectionRail({ pillars }) {
  const [active, setActive] = useState(-1)

  useEffect(() => {
    // Created after the pins so the wrappers already include pin spacing.
    const triggers = pillars.map((p, i) =>
      ScrollTrigger.create({
        trigger: `#${p.id}`,
        start: 'top center',
        end: 'bottom center',
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) setActive(i)
          else setActive((a) => (a === i ? -1 : a))
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [pillars])

  return (
    <nav
      className={`
        fixed z-[45] right-[22px] top-1/2
        -translate-y-1/2

        flex flex-col items-end gap-3

        transition-opacity duration-500 ease-[var(--ease)]

        max-[900px]:hidden

        ${active >= 0
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'}
      `}
      aria-label="Sections"
    >
      {pillars.map((p, i) => (
        <button
          key={p.id}
          className={`
            group
            relative

            w-2
            rounded-full

            transition-[height,background]
            duration-[400ms] ease-[var(--ease)]

            ${i === active
              ? 'h-[26px] bg-[var(--amber)] shadow-[0_0_14px_rgba(255,122,80,0.60)]'
              : 'h-2 bg-white/25'}
          `}
          onClick={() => scrollToTarget(`#${p.id}`)}
          aria-label={p.label}
        >
          {/* Hover label */}
          <span
            className="
              absolute right-5 top-1/2
              translate-x-[6px] -translate-y-1/2

              whitespace-nowrap

              font-[600] text-[11px] leading-none
              tracking-[0.18em] uppercase
              font-[family-name:var(--font-ui)]

              text-[var(--muted)]

              opacity-0 pointer-events-none

              transition-[opacity,transform]
              duration-300 ease-[var(--ease)]

              group-hover:opacity-100
              group-hover:translate-x-0
              group-hover:text-[var(--text)]

              group-focus-visible:opacity-100
              group-focus-visible:translate-x-0
            "
          >
            {p.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

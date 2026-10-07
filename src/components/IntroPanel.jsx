import { PillarIcon } from './icons'

/* ─── Pill label badge ─────────────────────────────────────────────── */
export function PillLabel({ pillar }) {
  return (
    <div
      className={`
        glass
        inline-flex items-center gap-[10px]
        px-4 py-[10px]
        rounded-full

        ${pillar.tone === 'warm'
          ? 'text-[var(--amber)] border-[rgba(255,122,80,0.30)]'
          : 'text-[var(--cyan)]'}
      `}
    >
      <PillarIcon name={pillar.icon} />

      {/* Main label */}
      <span
        className="
          font-[700] text-[12px] leading-none
          tracking-[0.2em] uppercase
          font-[family-name:var(--font-display)]
          text-[var(--text)]
        "
      >
        {pillar.label}
      </span>

      {/* Sub-tag */}
      <span
        className="
          font-[500] text-[12px] leading-none
          tracking-[0.08em]
          font-[family-name:var(--font-ui)]
          text-[var(--faint)]
          pl-[10px]
          border-l border-white/[0.14]

          max-[600px]:hidden
        "
      >
        {pillar.tag}
      </span>
    </div>
  )
}

/* ─── Compact intro for phones: "01 Area" on one line, tight spacing ── */
function CompactIntro({ pillar, index, ref }) {
  const warm = pillar.tone === 'warm'
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span
          className="shrink-0 font-[family-name:var(--font-display)] text-[clamp(2.2rem,10vw,2.8rem)] font-[800] leading-none tracking-[-0.04em]"
          style={{ WebkitTextStroke: warm ? '1px rgba(255,122,80,0.7)' : '1px rgba(83,247,251,0.6)', color: 'transparent' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="min-w-0 font-[family-name:var(--font-display)] text-[clamp(1.6rem,7.4vw,2.2rem)] font-[800] leading-[1.05] tracking-[-0.03em] text-[var(--text)]">
          {pillar.label}
        </h2>
        <span className={`ml-auto shrink-0 self-center ${warm ? 'text-[var(--amber)]' : 'text-[var(--cyan)]'}`} aria-hidden="true">
          <PillarIcon name={pillar.icon} size={20} />
        </span>
      </div>

      <p className="relative w-fit font-[family-name:var(--font-ui)] text-[1rem] font-[500] leading-[1.35] text-[var(--muted)]">
        <span>"{pillar.objection}"</span>
        <span
          aria-hidden="true"
          className="absolute -left-1 -right-1 top-[52%] h-[2px] rounded-sm bg-[var(--amber)] shadow-[0_0_12px_rgba(255,122,80,0.70)]"
          style={{ transform: `scaleX(clamp(0, calc(var(--p) * 3.2), 1))`, transformOrigin: 'left' }}
        />
      </p>

      <p
        className={`font-[family-name:var(--font-ui)] text-[11px] font-[600] uppercase leading-[1.4] tracking-[0.22em] ${warm ? 'text-[var(--amber)]' : 'text-[var(--cyan)]'}`}
        style={{ opacity: `clamp(0, calc(var(--p) * 4 - 0.8), 1)` }}
      >
        {pillar.answer ?? 'Answered on camera.'}
      </p>
    </div>
  )
}

/* ─── Intro content panel ──────────────────────────────────────────── */
// `compact` → the phone layout (CompactIntro above)
export default function IntroPanel({ pillar, index, ref, align = 'left', compact = false }) {
  if (compact) return <CompactIntro pillar={pillar} index={index} ref={ref} />
  const right = align === 'right'
  const center = align === 'center'
  return (
    <div
      ref={ref}
      className={`
        w-fit
        max-w-[min(40vw,580px)]
        max-[900px]:max-w-full
        flex flex-col gap-[14px]
        ${right ? 'ml-auto items-end text-right' : center ? 'mx-auto items-center text-center' : 'items-start'}
      `}
    >
      {/* Large ghost number */}
      <span
        className={`
          font-[800]
          ${center ? 'text-[clamp(3rem,6vw,5.5rem)]' : 'text-[clamp(4rem,9vw,8.5rem)]'} leading-[0.9]
          tracking-[-0.04em]

          text-transparent

          font-[family-name:var(--font-display)]

          ${pillar.tone === 'warm'
            ? '[color:transparent] [-webkit-text-stroke:1px_rgba(255,122,80,0.55)]'
            : '[-webkit-text-stroke:1px_rgba(83,247,251,0.45)]'}
        `}
        style={{
          WebkitTextStroke: pillar.tone === 'warm'
            ? '1px rgba(255,122,80,0.55)'
            : '1px rgba(83,247,251,0.45)',
          color: 'transparent',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Section title */}
      <h2
        className="
          font-[800]
          text-[clamp(2.4rem,4.6vw,4.6rem)] leading-none
          tracking-[-0.03em]
          font-[family-name:var(--font-display)]
          text-[var(--text)]
        "
      >
        {pillar.label}
      </h2>

      {/* Objection + strikethrough */}
      <p
        className="
          relative
          mt-[10px]
          font-[500]
          text-[clamp(1.05rem,1.5vw,1.35rem)] leading-[1.35]
          font-[family-name:var(--font-ui)]
          text-[var(--muted)]
        "
      >
        <span>"{pillar.objection}"</span>

        {/* Animated amber strikethrough — driven by CSS custom property --p */}
        <span
          aria-hidden="true"
          className="
            absolute -left-1 -right-1
            top-[52%]
            h-[2px] rounded-sm
            bg-[var(--amber)]
            shadow-[0_0_12px_rgba(255,122,80,0.70)]
          "
          style={{
            transform: `scaleX(clamp(0, calc(var(--p) * 3.2), 1))`,
            // Strike runs in the reading direction of the panel's side
            transformOrigin: right ? 'right' : center ? 'center' : 'left',
          }}
        />
      </p>

      {/* Answer */}
      <p
        className={`
          font-[600] text-[12px] leading-none
          tracking-[0.26em] uppercase
          font-[family-name:var(--font-ui)]

          ${pillar.tone === 'warm' ? 'text-[var(--amber)]' : 'text-[var(--cyan)]'}
        `}
        style={{
          opacity: `clamp(0, calc(var(--p) * 4 - 0.8), 1)`,
        }}
      >
        {pillar.answer ?? 'Answered on camera.'}
      </p>
    </div>
  )
}

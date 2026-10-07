import { Fragment, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Check, CircleQuestionMark } from 'lucide-react'

import { useInView } from '../lib/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ------------------------------------------------------------------
   Short manifesto between the proof strip and the pillars:
   one headline, a live ticker where each buyer question gets struck
   out and answered, and a one-line kicker.
------------------------------------------------------------------ */

const Q_MS = 2200 // question on screen (strike lands near the end)
const A_MS = 1800 // answer on screen before the next question

/* Each word rises out of its own mask */
function Words({ text, className = '' }) {
  return text.split(' ').map((w, i, all) => (
    <Fragment key={i}>
      <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
        <span className={`af-w inline-block will-change-transform ${className}`}>{w}</span>
      </span>
      {i < all.length - 1 && ' '}
    </Fragment>
  ))
}

/* ── Question → answer ticker ───────────────────────────────────── */
function AnswerTicker({ active, pillars }) {
  // Even steps show a question, odd steps show its answer
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(
      () => setStep((s) => (s + 1) % (pillars.length * 2)),
      step % 2 ? A_MS : Q_MS,
    )
    return () => clearTimeout(t)
  }, [active, step])

  const i = Math.floor(step / 2)
  const answered = step % 2 === 1
  const p = pillars[i]

  return (
    <div className="af-ticker flex flex-col items-center gap-4 w-full">
      <div
        className="
          svc-track glass relative
          flex items-center gap-3
          w-[min(100%,580px)]
          p-2 pr-5
          rounded-full
        "
        style={{ '--accent-rgb': answered ? 'var(--cyan-rgb)' : 'var(--amber-rgb)' }}
      >
        {/* ? flips into ✓ */}
        <span
          className={`
            relative grid place-items-center shrink-0
            w-11 h-11 rounded-full border
            transition-[background,border-color,box-shadow] duration-500 ease-[var(--ease)]
            ${answered
              ? 'border-[rgba(83,247,251,0.5)] bg-[rgba(83,247,251,0.14)] shadow-[0_0_22px_-4px_rgba(83,247,251,0.7)]'
              : 'border-[rgba(255,122,80,0.4)] bg-[rgba(255,122,80,0.10)]'}
          `}
        >
          <span
            className={`
              absolute inset-0 grid place-items-center text-[var(--amber)]
              transition-[opacity,transform] duration-500 ease-[var(--ease)]
              ${answered ? 'opacity-0 rotate-90 scale-50' : 'opacity-100'}
            `}
          >
            <CircleQuestionMark size={19} strokeWidth={1.9} aria-hidden="true" />
          </span>
          <span
            className={`
              absolute inset-0 grid place-items-center text-[var(--cyan)]
              transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${answered ? 'opacity-100' : 'opacity-0 -rotate-90 scale-50'}
            `}
          >
            <Check size={18} strokeWidth={2.6} aria-hidden="true" />
          </span>
        </span>

        {/* Question slides out, answer slides in */}
        <div
          className="
            relative flex-1 h-[1.5em] overflow-hidden text-left
            text-[clamp(15px,1.35vw,18px)] font-[600]
            font-[family-name:var(--font-display)]
          "
          aria-live="polite"
        >
          <span
            key={`q${i}`}
            className={`
              af-q absolute inset-0 flex items-center whitespace-nowrap
              text-[var(--text)]
              transition-[transform,opacity] duration-500 ease-[var(--ease)]
              ${answered ? '-translate-y-full opacity-0' : ''}
            `}
          >
            <span className="relative">
              “{p.objection}”
              <span
                aria-hidden="true"
                className="af-strike absolute -left-1 -right-1 top-[54%] h-[2px] rounded-full origin-left bg-[var(--amber)] shadow-[0_0_12px_rgba(255,122,80,0.75)]"
                style={{ animationDelay: `${Q_MS - 750}ms` }}
              />
            </span>
          </span>
          <span
            key={`a${i}`}
            className={`
              absolute inset-0 flex items-center whitespace-nowrap
              text-[var(--cyan)]
              transition-[transform,opacity] duration-500 ease-[var(--ease)]
              ${answered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
          >
            {p.answer}
          </span>
        </div>

        <span className="shrink-0 text-[11px] leading-none tracking-[0.2em] text-[var(--faint)] tabular-nums font-[family-name:var(--font-ui)] max-[480px]:hidden">
          {String(i + 1).padStart(2, '0')}/{String(pillars.length).padStart(2, '0')}
        </span>
      </div>

      {/* Six steps, filling as they're answered */}
      <div className="flex items-center gap-[6px]" aria-hidden="true">
        {pillars.map((x, n) => (
          <span
            key={x.id}
            className={`
              h-[4px] rounded-full
              transition-[width,background,box-shadow] duration-500 ease-[var(--ease)]
              ${n === i
                ? `w-7 ${answered ? 'bg-[var(--cyan)] shadow-[0_0_10px_rgba(83,247,251,0.7)]' : 'bg-[var(--amber)]'}`
                : n < i
                  ? 'w-[10px] bg-[rgba(83,247,251,0.55)]'
                  : 'w-[10px] bg-white/15'}
            `}
          />
        ))}
      </div>
    </div>
  )
}

export default function AnswerFirst({ pillars }) {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, '-15% 0px')

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)

      gsap
        .timeline({
          defaults: { ease: 'power4.out' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        })
        .fromTo(q('.af-eyebrow'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7 })
        .fromTo(
          q('.af-title .af-w'),
          { yPercent: 115, rotate: 7 },
          { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.09 },
          '<0.1',
        )
        .fromTo(q('.af-underline'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.6')
        .fromTo(
          q('.af-ticker'),
          { autoAlpha: 0, y: 26, scale: 0.94, filter: 'blur(10px)' },
          { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.9 },
          '-=0.7',
        )
        .fromTo(
          q('.af-kicker .af-w'),
          { yPercent: 115 },
          { yPercent: 0, duration: 0.8, stagger: 0.05 },
          '-=0.5',
        )
        .fromTo(q('.af-tell-strike'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, '-=0.2')
        .fromTo(q('.af-tell'), { opacity: 1 }, { opacity: 0.4, duration: 0.4 }, '<0.2')
        .fromTo(q('.af-glow'), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, '<')

      // The backdrop glow breathes with the scroll
      gsap.fromTo(
        q('.af-halo'),
        { scale: 0.75, opacity: 0.4 },
        {
          scale: 1.15,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        },
      )
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="answer-first"
      ref={sectionRef}
      aria-labelledby="answer-first-title"
      className="
        relative z-10 overflow-hidden isolate
        bg-[var(--navy)]
        px-[var(--gutter)]
        py-[clamp(72px,12vh,140px)]
        max-[600px]:py-10
      "
    >
      {/* ── Backdrop ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="
          af-halo pointer-events-none absolute -z-10
          left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[min(1100px,120vw)] aspect-[2/1]
          bg-[radial-gradient(ellipse_at_center,rgba(83,247,251,0.11),rgba(255,122,80,0.05)_45%,transparent_70%)]
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          opacity-[0.06]
          bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)]
          [background-size:64px_64px]
          [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_65%)]
        "
      />

      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-[clamp(26px,4.5vh,44px)] text-center">
        {/* Eyebrow */}
        <p className="af-eyebrow flex items-center gap-[10px] font-semibold text-[12px] leading-none tracking-[0.28em] uppercase text-[rgba(83,247,251,0.85)] font-[family-name:var(--font-ui)]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-[var(--cyan)] opacity-70 animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-[var(--cyan)]" />
          </span>
          {pillars.length} questions · 0 doubts
        </p>

        {/* Headline */}
        <h2
          id="answer-first-title"
          className="
            af-title
            font-[800]
            text-[clamp(1.6rem,6.9vw,5.4rem)] leading-[1.02]
            tracking-[-0.04em]
            text-[var(--text)]
            font-[family-name:var(--font-display)]
          "
        >
          <span className="relative inline-block">
            <Words text="Answers" className="af-shine" />
            <span
              aria-hidden="true"
              className="
                af-underline absolute left-0 right-0 bottom-[0.02em]
                h-[0.06em] rounded-full origin-left
                bg-gradient-to-r from-[var(--cyan)] via-[rgba(83,247,251,0.55)] to-transparent
                shadow-[0_0_20px_rgba(83,247,251,0.6)]
              "
            />
          </span>{' '}
          <Words text="before they ask." />
        </h2>

        {/* Live: each question gets struck out and answered */}
        <AnswerTicker active={inView} pillars={pillars} />

        {/* Kicker */}
        <p
          className="
            af-kicker
            font-[700]
            text-[clamp(1.25rem,2.4vw,2.1rem)] leading-[1.2]
            tracking-[-0.02em]
            text-[var(--muted)]
            font-[family-name:var(--font-display)]
          "
        >
          <Words text="Don't just" />{' '}
          <span className="af-tell relative inline-block">
            <Words text="tell" />
            <span
              aria-hidden="true"
              className="af-tell-strike absolute -left-[0.1em] -right-[0.1em] top-[52%] h-[0.09em] rounded-full origin-left bg-[var(--amber)] shadow-[0_0_14px_rgba(255,122,80,0.75)]"
            />
          </span>{' '}
          <Words text="them." />{' '}
          <br className="min-[760px]:hidden" />
          <Words text="Let your content" className="text-[var(--text)]" />{' '}
          <span className="relative inline-block isolate">
            <span
              aria-hidden="true"
              className="af-glow absolute -inset-x-[0.4em] -inset-y-[0.2em] -z-10 rounded-full blur-[16px] bg-[radial-gradient(ellipse,rgba(255,122,80,0.35),rgba(83,247,251,0.12)_55%,transparent_75%)]"
            />
            <Words
              text="answer."
              className="bg-[linear-gradient(100deg,var(--amber),#ffb08f_50%,var(--cyan))] bg-clip-text text-transparent"
            />
          </span>
        </p>
      </div>
    </section>
  )
}

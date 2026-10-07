import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUpRight, ChevronRight, House, Mail, Package, Sparkles, Users } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import Logo from './Logo'
import { FacebookIcon, InstagramIcon, LinkedInIcon, PillarIcon, WhatsAppIcon } from './icons'
import { useIndustry } from '../lib/industry'
import { site, whatsappLink } from '../data/site'
import { lockScroll } from '../lib/scroll'
import { pages, useGo } from '../lib/nav'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Icon beside each page in the mobile menu
const pageIcons = {
  '/': House,
  '/services': Sparkles,
  '/packages': Package,
  '/about': Users,
  '/contact': Mail,
}

export default function Nav() {
  const headerRef = useRef(null)
  const progressRef = useRef(null)
  const pillRef = useRef(null)
  const overlayRef = useRef(null)
  const burgerRef = useRef(null)
  const linkEls = useRef({})
  const hiddenRef = useRef(false)
  const keepShownRef = useRef(false)

  const { pathname } = useLocation()
  const goTo = useGo()
  // The page you're on (unknown paths light nothing)
  const active = pages.some((p) => p.to === pathname) ? pathname : null
  const isHome = pathname === '/'
  // "Jump to proof" follows the hero switcher (Real Estate / Hospital …)
  const { pillars } = useIndustry().config

  const [hovered, setHovered] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    keepShownRef.current = menuOpen
  }, [menuOpen])

  // A new page starts at the top, so bring the bar back
  useEffect(() => {
    hiddenRef.current = false
    document.documentElement.removeAttribute('data-nav-hidden')
    gsap.to(headerRef.current, { yPercent: 0, duration: 0.6, ease: 'power3.out', overwrite: true })
  }, [pathname])

  /* ── Show / hide the bar ───────────────────────────── */
  const setHidden = useCallback((hide) => {
    if (hide === hiddenRef.current) return
    hiddenRef.current = hide
    // Lets sticky bars below the nav (e.g. the Services category bar) move up into its space
    document.documentElement.toggleAttribute('data-nav-hidden', hide)
    gsap.to(headerRef.current, {
      yPercent: hide ? -170 : 0,
      duration: hide ? 0.45 : 0.6,
      ease: hide ? 'power3.in' : 'power3.out',
      overwrite: true,
    })
  }, [])

  /* Condense on scroll, hide while reading down, return on scroll up,
   * and draw page progress along the bottom edge of the bar. */
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll()
        setScrolled(y > 40)

        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${self.progress})`
        }

        if (keepShownRef.current || y < 320) setHidden(false)
        else if (self.direction === 1) setHidden(true)
        else if (self.direction === -1) setHidden(false)
      },
    })
  })

  /* ── Sliding highlight behind the links ────────────── */
  const indicatorTarget = hovered ?? active

  // Link widths change when the web fonts land and on resize — re-measure then
  const [layoutTick, setLayoutTick] = useState(0)
  useEffect(() => {
    const bump = () => setLayoutTick((n) => n + 1)
    document.fonts?.ready.then(bump)
    window.addEventListener('resize', bump)
    return () => window.removeEventListener('resize', bump)
  }, [])

  useEffect(() => {
    const pill = pillRef.current
    const el = indicatorTarget && linkEls.current[indicatorTarget]
    if (!pill) return

    if (!el) {
      gsap.to(pill, { autoAlpha: 0, duration: 0.3, overwrite: true })
      return
    }

    // Appearing from nothing: jump into place, then fade in
    if (Number(gsap.getProperty(pill, 'opacity')) === 0) {
      gsap.set(pill, { x: el.offsetLeft, width: el.offsetWidth })
    }

    gsap.to(pill, {
      x: el.offsetLeft,
      width: el.offsetWidth,
      autoAlpha: 1,
      duration: 0.55,
      ease: 'expo.out',
      overwrite: true,
    })
  }, [indicatorTarget, layoutTick])

  /* ── Mobile menu ───────────────────────────────────── */
  const openMenu = () => {
    setHidden(false)
    lockScroll(true)
    setMenuOpen(true)
  }

  const closeMenu = useCallback((after) => {
    const overlay = overlayRef.current
    const finish = () => {
      lockScroll(false)
      setMenuOpen(false)
      burgerRef.current?.focus()
      after?.()
    }
    if (!overlay) return finish()

    gsap.to(overlay, {
      clipPath: 'circle(0% at calc(100% - 44px) 44px)',
      duration: 0.45,
      ease: 'power3.in',
      onComplete: finish,
    })
  }, [])

  // Reveal: circle wipe from the menu button, then items slide in
  useGSAP(
    () => {
      if (!menuOpen) return
      gsap.fromTo(
        overlayRef.current,
        { clipPath: 'circle(0% at calc(100% - 44px) 44px)' },
        { clipPath: 'circle(150% at calc(100% - 44px) 44px)', duration: 0.7, ease: 'power3.inOut' },
      )
      gsap.from('[data-m-item]', {
        y: 22,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.045,
        delay: 0.2,
      })
      overlayRef.current?.querySelector('a')?.focus({ preventScroll: true })
    },
    { dependencies: [menuOpen], scope: overlayRef },
  )

  useEffect(() => {
    if (!menuOpen) return

    const onKey = (e) => e.key === 'Escape' && closeMenu()
    const mq = window.matchMedia('(min-width: 768px)')
    const onWide = () => mq.matches && closeMenu()

    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onWide)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onWide)
    }
  }, [menuOpen, closeMenu])

  useEffect(() => () => lockScroll(false), [])

  /* ── Navigation ────────────────────────────────────── */
  const go = (to) => (e) => {
    e?.preventDefault()
    if (menuOpen) closeMenu(() => goTo(to))
    else goTo(to)
  }

  return (
    <>
      <header
        ref={headerRef}
        className="
          fixed left-1/2 top-4 z-50
          w-[calc(100%-24px)] max-w-[1180px]
          -translate-x-1/2
          font-[family-name:var(--font-display)]
        "
      >
        <div
          className={`
            relative
            flex items-center justify-between gap-4
            md:grid md:grid-cols-[1fr_auto_1fr]
            rounded-full
            border
            pl-5 pr-2
            backdrop-blur-xl
            transition-[height,background-color,border-color,box-shadow]
            duration-500 ease-[var(--ease)]
            ${
              scrolled || menuOpen
                ? 'h-[60px] bg-[#070c1c]/80 border-white/[0.09] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'h-[68px] bg-[#070c1c]/35 border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            }
          `}
        >
          {/* Glowing hairline along the top edge */}
          <span
            aria-hidden="true"
            className={`
              pointer-events-none absolute inset-x-[12%] -top-px h-px
              bg-[linear-gradient(90deg,transparent,rgba(83,247,251,0.7)_35%,rgba(255,122,80,0.55)_70%,transparent)]
              transition-opacity duration-500
              ${scrolled || menuOpen ? 'opacity-100' : 'opacity-60'}
            `}
          />
          {/* Soft light pooled under that edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <span className="absolute left-1/2 top-0 h-full w-[60%] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(83,247,251,0.09),transparent_100%)]" />
          </span>

          {/* ── LOGO ─────────────────────────────────── */}
          <div className="flex items-center">
            <Logo
              onClick={go('/')}
              size={34}
              wordHeight={21}
              wordClassName="max-[420px]:h-[17px] max-[420px]:w-auto"
            />
          </div>

          {/* ── CENTER LINKS (desktop) ───────────────── */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul
              className="
                relative m-0 flex list-none items-center gap-1
                rounded-full border border-white/[0.07]
                bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]
                p-1
                shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.25)]
              "
              onPointerLeave={() => setHovered(null)}
            >
              {/* Sliding highlight */}
              <span
                ref={pillRef}
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute left-0 top-1 bottom-1
                  rounded-full
                  border border-[rgba(83,247,251,0.3)]
                  bg-[linear-gradient(180deg,rgba(83,247,251,0.2),rgba(83,247,251,0.04)_70%),radial-gradient(60%_80%_at_50%_120%,rgba(83,247,251,0.25),transparent)]
                  shadow-[0_0_24px_-6px_rgba(83,247,251,0.6),0_6px_14px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)]
                  opacity-0 invisible
                "
              />

              {pages.map((page) => {
                const lit = indicatorTarget === page.to
                const current = active === page.to
                const Icon = pageIcons[page.to]

                return (
                  <li key={page.to}>
                    <a
                      ref={(el) => (linkEls.current[page.to] = el)}
                      href={page.to}
                      onClick={go(page.to)}
                      onPointerEnter={() => setHovered(page.to)}
                      onFocus={() => setHovered(page.to)}
                      onBlur={() => setHovered(null)}
                      aria-current={active === page.to ? 'page' : undefined}
                      className={`
                        group relative z-[1]
                        flex items-center gap-2
                        h-10 px-5 xl:pl-4
                        rounded-full
                        text-[13px] font-semibold tracking-[0.02em]
                        transition-colors duration-300
                        max-[900px]:px-4
                        ${lit ? 'text-white' : 'text-white/60 hover:text-white'}
                      `}
                    >
                      {Icon && (
                        <Icon
                          size={15}
                          strokeWidth={2}
                          aria-hidden="true"
                          className={`
                            hidden xl:block
                            transition-[color,transform] duration-300 ease-[var(--ease)]
                            ${lit ? 'scale-110 text-[var(--cyan)]' : 'text-white/40 group-hover:text-white/80'}
                          `}
                        />
                      )}
                      {page.label}

                      {/* Stays on the current page even while another link is hovered */}
                      <span
                        aria-hidden="true"
                        className={`
                          absolute bottom-[3px] left-1/2 h-[3px] -translate-x-1/2 rounded-full
                          bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]
                          transition-[width,opacity] duration-500 ease-[var(--ease)]
                          ${current ? 'w-3 opacity-100' : 'w-0 opacity-0'}
                        `}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* ── RIGHT: CTA + mobile controls ─────────── */}
          <div className="flex items-center justify-end gap-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="
                group
                relative isolate overflow-hidden
                hidden lg:inline-flex
                items-center gap-2.5
                h-11 pl-1.5 pr-5
                rounded-full
                text-[13px] font-semibold tracking-[0.01em]
                text-[var(--navy)]
                bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)]
                shadow-[0_0_26px_-6px_rgba(83,247,251,0.7),inset_0_1px_0_rgba(255,255,255,0.6)]
                transition-[transform,box-shadow] duration-300 ease-[var(--ease)]
                hover:-translate-y-px
                hover:shadow-[0_0_38px_-4px_rgba(83,247,251,0.9),inset_0_1px_0_rgba(255,255,255,0.6)]
                active:translate-y-0 active:scale-[0.98]
              "
            >
              {/* Light sweep on hover */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-y-0 -left-1/2 -z-[1] w-1/3
                  -skew-x-[20deg]
                  bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]
                  transition-transform duration-700 ease-[var(--ease)]
                  group-hover:translate-x-[520%]
                "
              />
              <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[var(--navy)] text-[var(--cyan)]">
                <WhatsAppIcon size={16} />
                {/* "We're online" pulse */}
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/80 motion-reduce:animate-none" />
                  <span className="relative h-2.5 w-2.5 rounded-full border-2 border-[var(--cyan)] bg-emerald-400" />
                </span>
              </span>
              Book a Call
              <ArrowUpRight
                size={15}
                strokeWidth={2.2}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>

            {/* Mobile: quick WhatsApp */}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              aria-label="Book a call on WhatsApp"
              className="
                lg:hidden
                grid h-11 w-11 place-items-center
                rounded-full
                bg-[var(--cyan)] text-[var(--navy)]
                shadow-[0_0_20px_-4px_rgba(83,247,251,0.7)]
              "
            >
              <WhatsAppIcon size={19} />
            </a>

            {/* Mobile: menu toggle — three dots that fold into an ✕ */}
            <button
              ref={burgerRef}
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
              className={`
                group md:hidden
                relative grid h-11 w-11 place-items-center
                rounded-full
                border border-transparent
                [background:linear-gradient(#0d1530,#0d1530)_padding-box,linear-gradient(135deg,rgba(83,247,251,0.85),rgba(83,247,251,0.15)_50%,rgba(255,122,80,0.8))_border-box]
                transition-[transform,box-shadow] duration-500 ease-[var(--ease)]
                active:scale-90
                ${
                  menuOpen
                    ? 'rotate-90 shadow-[0_0_24px_-4px_rgba(255,122,80,0.55)]'
                    : 'shadow-[0_0_20px_-6px_rgba(83,247,251,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]'
                }
              `}
            >
              {/* Dots */}
              {[
                { x: '-translate-x-[7px]', color: 'bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]', delay: '[transition-delay:0ms]' },
                { x: 'translate-x-0', color: 'bg-white', delay: '[transition-delay:70ms]' },
                { x: 'translate-x-[7px]', color: 'bg-[var(--amber)] shadow-[0_0_8px_var(--amber)]', delay: '[transition-delay:140ms]' },
              ].map((d, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`
                    absolute h-[5px] w-[5px] rounded-full ${d.color} ${d.delay}
                    transition-[transform,opacity] duration-300 ease-[var(--ease)]
                    ${menuOpen ? 'translate-x-0 scale-0 opacity-0' : `${d.x} group-hover:-translate-y-[3px]`}
                  `}
                />
              ))}

              {/* ✕ */}
              {['rotate-45', '-rotate-45'].map((r) => (
                <span
                  key={r}
                  aria-hidden="true"
                  className={`
                    absolute h-[2px] w-[18px] rounded-full
                    bg-[linear-gradient(90deg,var(--cyan),var(--amber))]
                    transition-[transform,opacity] duration-500 ease-[var(--ease)]
                    ${menuOpen ? `${r} scale-x-100 opacity-100 [transition-delay:120ms]` : 'rotate-0 scale-x-0 opacity-0'}
                  `}
                />
              ))}
            </button>
          </div>

          {/* Page progress along the bottom edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 -bottom-px h-px overflow-hidden"
          >
            <span
              ref={progressRef}
              className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-[var(--cyan)] to-[var(--amber)]"
            />
          </span>
        </div>

      </header>

      {/* ── MOBILE MENU ──────────────────────────────── */}
      {menuOpen && (
        <div
          ref={overlayRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="
            fixed inset-0 z-[49]
            [&>*]:shrink-0
            flex flex-col
            overflow-y-auto
            bg-[#070c1c]/[0.97]
            px-5 pb-6 pt-[96px]
            backdrop-blur-2xl
            font-[family-name:var(--font-display)]
            md:hidden
          "
        >
          {/* Ambient glow + faint grid */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-[radial-gradient(420px_340px_at_100%_0%,rgba(83,247,251,0.16),transparent_70%),radial-gradient(380px_320px_at_0%_100%,rgba(255,122,80,0.10),transparent_70%)]
            "
          />
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0 opacity-[0.35]
              bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]
              bg-[size:44px_44px]
              [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]
            "
          />

          {/* ── Pages: one grouped list ───────────────── */}
          <p
            data-m-item
            className="relative mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]"
          >
            Menu
          </p>

          <nav
            aria-label="Mobile"
            className="
              relative overflow-hidden
              rounded-[22px] border border-white/[0.07]
              bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))]
              shadow-[0_20px_40px_-24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]
            "
          >
            <ul className="m-0 list-none p-1.5">
              {pages.map((page) => {
                const current = active === page.to
                const Icon = pageIcons[page.to] ?? ChevronRight

                return (
                  <li
                    key={page.to}
                    data-m-item
                    className="relative [&+&]:before:absolute [&+&]:before:-top-px [&+&]:before:left-[62px] [&+&]:before:right-3 [&+&]:before:h-px [&+&]:before:bg-white/[0.06]"
                  >
                    <a
                      href={page.to}
                      onClick={go(page.to)}
                      aria-current={current ? 'page' : undefined}
                      className={`
                        group flex items-center gap-3.5
                        rounded-2xl px-2.5 py-2
                        [@media(max-height:700px)]:py-2
                        transition-[background-color,transform] duration-300 ease-[var(--ease)]
                        active:scale-[0.98]
                        ${
                          current
                            ? 'bg-[linear-gradient(100deg,rgba(83,247,251,0.16),rgba(83,247,251,0.04))] shadow-[inset_0_0_0_1px_rgba(83,247,251,0.22)]'
                            : 'hover:bg-white/[0.04] active:bg-white/[0.06]'
                        }
                      `}
                    >
                      <span
                        className={`
                          grid h-10 w-10 shrink-0 place-items-center rounded-xl
                          transition-colors duration-300
                          ${
                            current
                              ? 'bg-[var(--cyan)] text-[var(--navy)] shadow-[0_0_18px_-4px_rgba(83,247,251,0.8)]'
                              : 'border border-white/[0.07] bg-white/[0.04] text-white/70 group-hover:text-[var(--cyan)]'
                          }
                        `}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </span>

                      <span className="flex-1 text-[17px] font-semibold tracking-[-0.01em] text-white">
                        {page.label}
                      </span>

                      {current ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--cyan)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]" />
                          You're here
                        </span>
                      ) : (
                        <ChevronRight
                          size={18}
                          className="text-white/30 transition-[transform,color] duration-300 ease-[var(--ease)] group-hover:translate-x-0.5 group-hover:text-white/70"
                        />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* ── Shortcuts into the home page's proof sections ── */}
          {isHome && (
            <>
              <div
                data-m-item
                className="relative mb-2.5 mt-6 flex items-end justify-between px-1 [@media(max-height:700px)]:mt-4"
              >
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">
                  Jump to proof
                </p>
                <span className="text-[11px] text-white/35">Tap to scroll there</span>
              </div>

              <ul className="relative m-0 grid list-none grid-cols-3 gap-2 p-0">
                {pillars.map((p) => {
                  const warm = p.tone === 'warm'

                  return (
                    <li key={p.id} data-m-item>
                      <a
                        href={`/#${p.id}`}
                        onClick={go(`/#${p.id}`)}
                        className={`
                          group relative flex h-full flex-col items-center gap-2
                          overflow-hidden
                          rounded-2xl border
                          px-1.5 pb-2.5 pt-3
                          [@media(max-height:700px)]:gap-1.5 [@media(max-height:700px)]:py-2.5
                          text-center
                          transition-[border-color,transform] duration-300 ease-[var(--ease)]
                          active:scale-[0.96]
                          ${
                            warm
                              ? 'border-[rgba(255,122,80,0.14)] bg-[linear-gradient(180deg,rgba(255,122,80,0.1),rgba(255,255,255,0.015))] hover:border-[rgba(255,122,80,0.35)]'
                              : 'border-[rgba(83,247,251,0.12)] bg-[linear-gradient(180deg,rgba(83,247,251,0.08),rgba(255,255,255,0.015))] hover:border-[rgba(83,247,251,0.32)]'
                          }
                        `}
                      >
                        <span
                          className={`
                            grid h-10 w-10 place-items-center rounded-full
                            [@media(max-height:700px)]:h-8 [@media(max-height:700px)]:w-8
                            ${
                              warm
                                ? 'bg-[rgba(255,122,80,0.14)] text-[var(--amber)] shadow-[0_0_18px_-6px_rgba(255,122,80,0.8)]'
                                : 'bg-[rgba(83,247,251,0.12)] text-[var(--cyan)] shadow-[0_0_18px_-6px_rgba(83,247,251,0.8)]'
                            }
                          `}
                        >
                          <PillarIcon name={p.icon} size={18} />
                        </span>
                        <span className="text-[12px] font-semibold leading-[1.25] text-white/90 [text-wrap:balance]">
                          {p.label}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* ── Call to action + socials ─────────────── */}
          <div
            data-m-item
            className="
              relative mt-auto pt-7
              pb-[env(safe-area-inset-bottom)]
              [@media(max-height:700px)]:pt-5
            "
          >
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="
                  group flex h-14 items-center gap-3
                  rounded-2xl pl-2 pr-5
                  bg-[linear-gradient(135deg,#9dfcfd_0%,var(--cyan)_45%,#2bd4dc_100%)]
                  text-[var(--navy)]
                  shadow-[0_0_30px_-6px_rgba(83,247,251,0.7),inset_0_1px_0_rgba(255,255,255,0.6)]
                  transition-transform duration-300 ease-[var(--ease)]
                  active:scale-[0.98]
                "
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--navy)] text-[var(--cyan)]">
                  <WhatsAppIcon size={18} />
                </span>
                <span className="flex-1 leading-tight">
                  <span className="block text-[15px] font-bold">Book a Call</span>
                  <span className="block font-[family-name:var(--font-ui)] text-[11px] font-medium text-[var(--navy)]/70">
                    Chat with us on WhatsApp
                  </span>
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={2.2}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <div className="mt-3 flex items-center justify-between gap-3 px-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">
                  Follow us
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Instagram', href: site.instagram, icon: <InstagramIcon /> },
                    { label: 'Facebook', href: site.facebook, icon: <FacebookIcon /> },
                    { label: 'LinkedIn', href: site.linkedin, icon: <LinkedInIcon /> },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="
                        grid h-11 w-11 place-items-center rounded-full
                        border border-white/10 bg-white/[0.04] text-white/80
                        transition-colors duration-300
                        hover:border-[rgba(83,247,251,0.35)] hover:text-[var(--cyan)]
                      "
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

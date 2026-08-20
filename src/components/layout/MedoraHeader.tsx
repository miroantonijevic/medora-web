'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

interface NavGreatGrandchild {
  label: string
  href: string
}

interface NavGrandchild {
  label: string
  href: string
  subLinks?: NavGreatGrandchild[]
}

interface NavChild {
  label: string
  href: string
  grandchildren?: NavGrandchild[]
}

interface NavItem {
  label: string
  href: string
  children?: NavChild[]
}

const PROPERTIES = [
  { label: 'Medora Auri', href: '/' },
  { label: 'Luxury Camp Orbis', href: '/orbis' },
]

const LOCALES = [
  { code: 'en', label: 'English', flagCode: 'gb' },
  { code: 'hr', label: 'Hrvatski', flagCode: 'hr' },
  { code: 'de', label: 'Deutsch', flagCode: 'de' },
]

// Matches the site's original pun: "We ~~think~~ do green"
function renderNavLabel(label: string) {
  if (label === 'We think green') {
    return (
      <>
        We <span style={{ textDecoration: 'line-through' }}>think</span> do green
      </>
    )
  }
  return <>{label}</>
}

export function MedoraHeader({ navItems = [] }: { navItems?: NavItem[] }) {
  const tCommon = useTranslations('common')
  const tHeader = useTranslations('header')
  const pathname = usePathname()
  const activeProperty = PROPERTIES.findIndex((p) =>
    p.href === '/' ? pathname === '/' : pathname.startsWith(p.href),
  )
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [expandedChild, setExpandedChild] = useState<string | null>(null)
  const [expandedGrandchild, setExpandedGrandchild] = useState<string | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const currentLang = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!

  function switchLocale(code: string) {
    // With localePrefix: 'always', every URL starts with /<locale>/...
    // Replace the first path segment with the new locale.
    const raw = window.location.pathname
    const withoutLocale = raw.replace(/^\/(en|hr|de)(\/|$)/, '/') || '/'
    window.location.href = `/${code}${withoutLocale === '/' ? '' : withoutLocale}`
    setLangOpen(false)
  }

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#fff',
          height: '72px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginLeft: '24px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Link href="/">
            <Image
              src="/brand/medora-logo-typo.svg"
              alt="Medora Hotels"
              width={140}
              height={50}
              priority
              style={{ height: '50px', width: 'auto' }}
            />
          </Link>
          <Image
            src="/brand/location-pin.svg"
            alt=""
            width={30}
            height={40}
            aria-hidden="true"
            style={{ height: '38px', width: 'auto' }}
          />
        </div>

        {/* Center: property tabs — grid center column keeps them truly centered */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {PROPERTIES.map((prop, i) => (
            <Link
              key={prop.href}
              href={prop.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 28px',
                fontSize: '14px',
                fontWeight: activeProperty === i ? 700 : 500,
                color: '#11131e',
                textDecoration: 'none',
                borderBottom: activeProperty === i ? '3px solid #012B59' : '3px solid transparent',
                transition: 'border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {prop.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto',
            marginRight: '16px',
            flexShrink: 0,
            justifyContent: 'flex-end',
          }}
        >
          {/* Contact us dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setContactOpen((v) => !v)}
              style={{
                background: '#009bdb',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {tCommon('contactUs')}{' '}
              <span style={{ fontSize: '9px' }}>{contactOpen ? '▲' : '▼'}</span>
            </button>
            {contactOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#012B59',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  borderRadius: '6px',
                  minWidth: '280px',
                  zIndex: 200,
                  padding: '6px 0',
                  overflow: 'hidden',
                }}
              >
                {[
                  {
                    href: 'mailto:reservations@medorahotels.com',
                    label: 'reservations@medorahotels.com',
                    icon: (
                      <>
                        <path d="M2 4h16v12H2z" strokeLinejoin="round" />
                        <path d="m2 4 8 6 8-6" strokeLinejoin="round" />
                      </>
                    ),
                  },
                  {
                    href: 'tel:+38521601701',
                    label: '021 / 601 - 701',
                    icon: (
                      <path d="M4 3c-1 0-1 1-1 1 0 8 6 14 14 14 0 0 1 0 1-1v-3l-4-1-1 2c-2-1-4-3-5-5l2-1-1-4H4z" />
                    ),
                  },
                  {
                    href: 'https://wa.me/38521601701',
                    label: 'WhatsApp',
                    external: true,
                    icon: (
                      <path d="M10 2a8 8 0 0 0-6.9 12.03L2 18l4.1-1.07A8 8 0 1 0 10 2zm4.64 11.3c-.2.55-1.14 1.05-1.57 1.1-.4.06-.9.08-1.46-.09-.34-.1-.77-.26-1.33-.5-2.33-1-3.86-3.36-3.98-3.51-.12-.16-.95-1.26-.95-2.4 0-1.14.6-1.7.81-1.93.2-.23.45-.29.6-.29.15 0 .3 0 .43.01.14.01.32-.05.5.38.2.46.66 1.6.72 1.72.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.49.14.24.6 1 1.3 1.62.9.8 1.65 1.05 1.9 1.17.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.53-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.58-.14 1.13z" />
                    ),
                  },
                ].map(({ href, label, external, icon }) => (
                  <a
                    key={href}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 18px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#fff',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'transparent')
                    }
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: '#009bdb',
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.5"
                      >
                        {icon}
                      </svg>
                    </span>
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick inquiry */}
          <Link
            href="/inquiry"
            style={{
              background: '#FF914D',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              padding: '9px 18px',
              borderRadius: '4px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#e07d3e')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#FF914D')}
          >
            {tHeader('quickInquiry')}
          </Link>

          {/* Language dropdown */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#012B59',
                padding: '6px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
              aria-label="Select language"
            >
              <img
                src={`https://flagcdn.com/w40/${currentLang!.flagCode}.png`}
                alt=""
                width={20}
                height={15}
                style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
              />
              <span>{currentLang!.code.toUpperCase()}</span>
              <span style={{ fontSize: '9px', marginLeft: '2px' }}>{langOpen ? '▲' : '▼'}</span>
            </button>
            {langOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: '145px',
                  zIndex: 300,
                  overflow: 'hidden',
                }}
              >
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => switchLocale(l.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '9px 14px',
                      background: l.code === locale ? '#f0f7ff' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: l.code === locale ? 700 : 400,
                      color: l.code === locale ? '#009bdb' : '#11131e',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${l.flagCode}.png`}
                      alt=""
                      width={20}
                      height={15}
                      style={{
                        width: '20px',
                        height: '15px',
                        objectFit: 'cover',
                        borderRadius: '2px',
                      }}
                    />
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              marginLeft: '8px',
            }}
          >
            {menuOpen ? (
              <span style={{ fontSize: '20px', color: '#11131e', lineHeight: 1 }}>✕</span>
            ) : (
              <>
                <span
                  style={{ display: 'block', width: '22px', height: '2px', background: '#11131e' }}
                />
                <span
                  style={{ display: 'block', width: '22px', height: '2px', background: '#11131e' }}
                />
                <span
                  style={{ display: 'block', width: '22px', height: '2px', background: '#11131e' }}
                />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Blue booking strip */}
      <div
        style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          height: '52px',
          background: '#009bdb',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link
          href={
            activeProperty === 1
              ? '/properties/luxury-camp-orbis/rooms'
              : '/properties/medora-auri/rooms'
          }
          style={{
            background: '#fff',
            color: '#012B59',
            fontSize: '14px',
            fontWeight: 700,
            padding: '8px 28px',
            borderRadius: '24px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
          }}
        >
          {tHeader('chooseRoom')}
        </Link>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => {
            setMenuOpen(false)
            setExpandedItem(null)
            setExpandedChild(null)
            setExpandedGrandchild(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Right-side nav drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '340px',
            height: '100vh',
            background: '#002B59',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            zIndex: 1001,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.12em',
                margin: 0,
              }}
            >
              EXPLORE
            </p>
            <button
              onClick={() => {
                setMenuOpen(false)
                setExpandedItem(null)
                setExpandedChild(null)
                setExpandedGrandchild(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#fff',
                fontSize: '20px',
                lineHeight: 1,
              }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Nav items */}
          <div style={{ padding: '8px 24px 40px' }}>
            {navItems.map((item) => {
              const hasChildren = (item.children?.length ?? 0) > 0
              const isExpanded = expandedItem === item.href
              return (
                <div key={item.href}>
                  {hasChildren ? (
                    <button
                      onClick={() => {
                        setExpandedItem(isExpanded ? null : item.href)
                        setExpandedChild(null)
                        setExpandedGrandchild(null)
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '14px 0',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#fff',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      {item.label}
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '14px 0',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#fff',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {renderNavLabel(item.label)}
                    </Link>
                  )}
                  {isExpanded &&
                    item.children?.map((child) => {
                      const hasGrandchildren = (child.grandchildren?.length ?? 0) > 0
                      const childKey = `${item.href}|${child.href}`
                      const isChildExpanded = expandedChild === childKey
                      return (
                        <div key={child.href}>
                          {hasGrandchildren ? (
                            <button
                              onClick={() => {
                                setExpandedChild(isChildExpanded ? null : childKey)
                                setExpandedGrandchild(null)
                              }}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '11px 0 11px 20px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#fff',
                                background: 'none',
                                border: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                              }}
                            >
                              {child.label}
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                                {isChildExpanded ? '▲' : '▼'}
                              </span>
                            </button>
                          ) : (
                            <Link
                              href={child.href}
                              onClick={() => {
                                setMenuOpen(false)
                                setExpandedItem(null)
                                setExpandedChild(null)
                              }}
                              style={{
                                display: 'block',
                                padding: '11px 0 11px 20px',
                                fontSize: '14px',
                                color: '#fff',
                                textDecoration: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              {child.label}
                            </Link>
                          )}
                          {isChildExpanded &&
                            child.grandchildren?.map((grandchild) => {
                              const hasGreatGrandchildren = (grandchild.subLinks?.length ?? 0) > 0
                              const grandchildKey = `${childKey}|${grandchild.href}`
                              const isGrandchildExpanded = expandedGrandchild === grandchildKey
                              return (
                                <div key={grandchild.href}>
                                  {hasGreatGrandchildren ? (
                                    <button
                                      onClick={() =>
                                        setExpandedGrandchild(
                                          isGrandchildExpanded ? null : grandchildKey,
                                        )
                                      }
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '10px 0 10px 36px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#fff',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        textAlign: 'left',
                                      }}
                                    >
                                      {grandchild.label}
                                      <span
                                        style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}
                                      >
                                        {isGrandchildExpanded ? '▲' : '▼'}
                                      </span>
                                    </button>
                                  ) : (
                                    <Link
                                      href={grandchild.href}
                                      onClick={() => {
                                        setMenuOpen(false)
                                        setExpandedItem(null)
                                        setExpandedChild(null)
                                        setExpandedGrandchild(null)
                                      }}
                                      style={{
                                        display: 'block',
                                        padding: '10px 0 10px 36px',
                                        fontSize: '13px',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                      }}
                                    >
                                      {grandchild.label}
                                    </Link>
                                  )}
                                  {isGrandchildExpanded &&
                                    grandchild.subLinks?.map((greatGrandchild) => (
                                      <Link
                                        key={greatGrandchild.href}
                                        href={greatGrandchild.href}
                                        onClick={() => {
                                          setMenuOpen(false)
                                          setExpandedItem(null)
                                          setExpandedChild(null)
                                          setExpandedGrandchild(null)
                                        }}
                                        style={{
                                          display: 'block',
                                          padding: '9px 0 9px 52px',
                                          fontSize: '12px',
                                          color: '#fff',
                                          textDecoration: 'none',
                                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        }}
                                      >
                                        {greatGrandchild.label}
                                      </Link>
                                    ))}
                                </div>
                              )
                            })}
                        </div>
                      )
                    })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

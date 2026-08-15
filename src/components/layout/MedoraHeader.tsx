'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const PROPERTIES = [
  { label: 'Medora Auri', href: '/' },
  { label: 'Luxury Camp Orbis', href: '/orbis' },
]

const LOCALES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hr', label: 'Hrvatski', flag: '🇭🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

export function MedoraHeader() {
  const tCommon = useTranslations('common')
  const tHeader = useTranslations('header')
  const tNav = useTranslations('navigation')
  const tOffers = useTranslations('offers')
  const tFooter = useTranslations('footer')
  const [activeProperty, setActiveProperty] = useState(0)

  // Sync active tab with current URL on mount and navigation
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/(en|hr|de)(\/|$)/, '/')
    const idx = PROPERTIES.findIndex((p) =>
      p.href === '/' ? path === '/' : path.startsWith(p.href),
    )
    setActiveProperty(idx >= 0 ? idx : 0)
  }, [])
  const [contactOpen, setContactOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const currentLang = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!

  const NAV_LINKS = [
    { label: tFooter('accommodation'), href: '/properties' },
    { label: tOffers('title'), href: '/offers' },
    { label: tNav('gallery'), href: '/gallery' },
    { label: tNav('destination'), href: '/destination' },
    { label: tNav('weThinkGreen'), href: '/we-think-green' },
    { label: tNav('contactFaq'), href: '/contact' },
  ]

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
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginLeft: '24px', flexShrink: 0 }}>
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
        </div>

        {/* Center: ONLY property tabs */}
        <nav
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          {PROPERTIES.map((prop, i) => (
            <Link
              key={prop.href}
              href={prop.href}
              onClick={() => setActiveProperty(i)}
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
            marginRight: '16px',
            flexShrink: 0,
          }}
        >
          {/* Contact us dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setContactOpen((v) => !v)}
              style={{
                background: 'none',
                border: '1px solid #012B59',
                color: '#012B59',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
              }}
            >
              {tCommon('contactUs')}{' '}
              <span style={{ fontSize: '9px' }}>{contactOpen ? '▲' : '▼'}</span>
            </button>
            {contactOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  borderRadius: '4px',
                  minWidth: '260px',
                  zIndex: 200,
                  padding: '8px 0',
                }}
              >
                {[
                  {
                    href: 'mailto:reservations@medorahotels.com',
                    label: '✉ reservations@medorahotels.com',
                  },
                  { href: 'tel:+38521607990', label: '☎ +385 21 607 990' },
                  { href: 'https://wa.me/38521607990', label: '💬 WhatsApp', external: true },
                ].map(({ href, label, external }) => (
                  <a
                    key={href}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#11131e',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'transparent')
                    }
                  >
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
              <span>{currentLang!.flag}</span>
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
                    <span style={{ fontSize: '16px' }}>{l.flag}</span>
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

      {/* Full nav drawer (hamburger) */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #eee',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            padding: '16px 40px 24px',
            zIndex: 999,
          }}
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                fontSize: '15px',
                fontWeight: 500,
                color: '#11131e',
                textDecoration: 'none',
                borderBottom: '1px solid #f0f0f0',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#009bdb')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#11131e')}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

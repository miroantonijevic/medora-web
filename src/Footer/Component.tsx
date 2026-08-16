import { Link } from '@/i18n/navigation'
import React from 'react'

const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/MedoraHotels/' },
  { label: 'Twitter', href: 'https://twitter.com/MedoraHotels' },
  { label: 'Instagram', href: 'https://www.instagram.com/lovepodgora/' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/medorahotels/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/medora-hotels-resorts' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCTtE8QDM52-BZKFvfgjqm9Q' },
]

const COLUMNS = [
  {
    heading: 'Customer services',
    links: [
      { label: 'All contacts', href: '/contact' },
      {
        label: 'Modify / Cancel reservation',
        href: 'https://www.medorahotels.com/en/book/56?cancel=1',
        external: true,
      },
      { label: 'FAQ', href: '/help-center' },
      { label: 'Packages & Special offers', href: '/packages-special-offers' },
    ],
  },
  {
    heading: 'Amenities',
    links: [
      { label: 'Wellness', href: '/destination/wellness' },
      { label: 'Dining & Bars', href: '/destination/dining-bars' },
      { label: 'Active vacation', href: '/destination/active-vacation' },
      { label: 'About Makarska Riviera', href: '/destination/about-makarska-riviera' },
      { label: 'About Podgora', href: '/destination/location' },
    ],
  },
  {
    heading: 'Medora Hotels & Resorts',
    links: [
      { label: 'About Medora Hotels & Resorts', href: '/about' },
      { label: 'Our prizes & Achievements', href: '/about/awards' },
      { label: 'How to reach us', href: '/how-to-reach-us' },
      { label: 'Business information', href: 'https://mhr-podgora.com/', external: true },
      {
        label: 'Personal Data Protection Policy',
        href: '/personal-data-protection-policy',
      },
      { label: 'Cookies policy', href: '/cookies-policy' },
    ],
  },
]

export async function Footer() {
  return (
    <footer style={{ background: '#012B59', color: '#fff', marginTop: 'auto' }}>
      {/* Top bar: logo + social */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '36px 60px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Link href="/">
          <img
            src="/brand/medora-logo-typo.svg"
            alt="Medora Hotels & Resorts"
            style={{ height: '32px', filter: 'brightness(0) invert(1)' }}
          />
        </Link>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '13px',
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          padding: '40px 60px',
        }}
      >
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '16px',
                margin: '0 0 16px',
              }}
            >
              {col.heading}
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact column */}
        <div>
          <h4
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 16px',
            }}
          >
            Contact us
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <li>
              <a
                href="tel:+38521601701"
                style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}
              >
                +385 (0)21 601 701
              </a>
            </li>
            <li>
              <a
                href="mailto:reservations@medorahotels.com"
                style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}
              >
                reservations@medorahotels.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          padding: '16px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
          © {new Date().getFullYear()} Medora Hotels & Resorts
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link
            href="/personal-data-protection-policy"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookies-policy"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
          >
            Cookies policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

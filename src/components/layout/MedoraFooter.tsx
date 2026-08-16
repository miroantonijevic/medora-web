'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/MedoraHotels/', color: '#1877F2', char: 'f' },
  { label: 'Instagram', href: 'https://www.instagram.com/lovepodgora/', color: '#E1306C', char: 'in' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCTtE8QDM52-BZKFvfgjqm9Q', color: '#FF0000', char: 'yt' },
  { label: 'TripAdvisor', href: 'https://www.tripadvisor.com/Hotel_Review-g656736-d671497', color: '#34E0A1', char: 'ta' },
]

export function MedoraFooter() {
  const t = useTranslations('footer')

  const LINK_GROUPS = [
    {
      title: t('customerServices'),
      links: [
        { label: t('allContacts'), href: '/contacts' },
        { label: t('modifyReservation'), href: '/modify-reservation' },
        { label: t('faq'), href: '/faq' },
        { label: t('packagesOffers'), href: '/offers' },
      ],
    },
    {
      title: t('accommodation'),
      links: [
        { label: t('auriResort'), href: '/accommodation/auri' },
        { label: t('orbis'), href: '/orbis' },
        { label: t('roomsSuites'), href: '/accommodation/rooms' },
        { label: t('quickInquiry'), href: '/inquiry' },
      ],
    },
    {
      title: t('amenities'),
      links: [
        { label: t('wellness'), href: '/amenities/wellness' },
        { label: t('dining'), href: '/amenities/dining-bars' },
        { label: t('activeVacation'), href: '/amenities/active-vacation' },
        { label: t('aboutRiviera'), href: '/destination/makarska-riviera' },
      ],
    },
    {
      title: t('contact'),
      links: [
        { label: t('aboutMedora'), href: '/about' },
        { label: t('awards'), href: '/awards' },
        { label: t('directions'), href: '/directions' },
        { label: t('privacyPolicy'), href: '/privacy-policy' },
      ],
      contact: {
        phone: '+385 21 607 990',
        email: 'reservations@medorahotels.com',
      },
    },
  ]
  return (
    <footer
      style={{
        background: '#f1e5e1',
        marginTop: '130px',
        padding: '60px 0 40px',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
        }}
      >
        {/* Social icons row */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '48px',
            justifyContent: 'flex-start',
          }}
        >
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#fffbf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none',
                color: '#666',
                border: '1px solid #e0d4ce',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = s.color
                el.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = '#fffbf6'
                el.style.color = '#666'
              }}
            >
              {s.char}
            </a>
          ))}
        </div>

        {/* 4 link-group columns */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            flexWrap: 'wrap',
          }}
        >
          {LINK_GROUPS.map((group) => (
            <div
              key={group.title}
              style={{
                width: '23%',
                marginRight: '2.666%',
                marginBottom: '32px',
                minWidth: '180px',
              }}
            >
              <h4
                className="link-group-title"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#11131e',
                  marginBottom: '16px',
                  marginTop: 0,
                }}
              >
                {group.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {group.links.map((link) => (
                  <li key={link.href} style={{ marginBottom: '8px' }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: '14px',
                        color: '#11131e',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = '#009bdb')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = '#11131e')
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {'contact' in group && group.contact && (
                  <>
                    <li style={{ marginTop: '12px', marginBottom: '6px' }}>
                      <a
                        href={`tel:${group.contact.phone.replace(/\s/g, '')}`}
                        style={{ fontSize: '14px', color: '#11131e', textDecoration: 'none' }}
                      >
                        {group.contact.phone}
                      </a>
                    </li>
                    <li>
                      <a
                        href={`mailto:${group.contact.email}`}
                        style={{ fontSize: '13px', color: '#009bdb', textDecoration: 'none' }}
                      >
                        {group.contact.email}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid #d8cbc5',
            paddingTop: '24px',
            marginTop: '16px',
            fontSize: '12px',
            color: '#888',
          }}
        >
          © {new Date().getFullYear()} Medora Hotels d.d. · Member of{' '}
          <a
            href="https://www.agram-eeig.eu/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#009bdb', textDecoration: 'none' }}
          >
            Agram EEIG
          </a>
        </div>
      </div>
    </footer>
  )
}

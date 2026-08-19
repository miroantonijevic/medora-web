import React from 'react'
import { Link } from '@/i18n/navigation'

type Media = { url?: string | null; alt?: string | null }

type Props = {
  heroImage?: Media | number | null
  title?: string | null
  workingHoursText?: string | null
  phone?: string | null
  email?: string | null
  cardSubtext?: string | null
  showInquiryButton?: boolean | null
}

export const InfoCardHeroComponent: React.FC<Props> = ({
  heroImage,
  title,
  workingHoursText,
  phone,
  email,
  cardSubtext,
  showInquiryButton,
}) => {
  const image = heroImage && typeof heroImage === 'object' ? heroImage : null

  return (
    <>
      {/* Hero */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        {image?.url && (
          <img
            src={image.url}
            alt={image.alt ?? title ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: 48,
            color: '#fff',
            fontSize: 48,
            fontWeight: 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {title}
        </div>
        {/* Overlay card */}
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            padding: '28px 36px',
            minWidth: 280,
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: workingHoursText ? 8 : 16,
            }}
          >
            Working Hours
          </div>
          {workingHoursText && (
            <div
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: '#1a1a1a',
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {workingHoursText}
            </div>
          )}
          {(phone || email) && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginBottom: 16 }}>
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  style={{
                    display: 'block',
                    color: '#009bdb',
                    textDecoration: 'none',
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  style={{
                    display: 'block',
                    color: '#009bdb',
                    textDecoration: 'none',
                    fontSize: 13,
                  }}
                >
                  {email}
                </a>
              )}
            </div>
          )}
          {cardSubtext && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#009bdb', fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 15, color: '#333' }}>{cardSubtext}</span>
            </div>
          )}
          {showInquiryButton !== false && (
            <Link
              href="/inquiry"
              style={{
                display: 'block',
                background: '#012B59',
                color: '#fff',
                padding: '14px 24px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              Send an inquiry
            </Link>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav
        style={{
          padding: '14px 48px',
          fontSize: 13,
          color: '#888',
          borderBottom: '1px solid #f0ebe3',
          background: '#faf7f2',
        }}
      >
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>
          Medora
        </Link>
        {' / '}
        <Link href="/destination/wellness" style={{ color: '#888', textDecoration: 'none' }}>
          Destination
        </Link>
        {' / '}
        <Link href="/destination/wellness" style={{ color: '#888', textDecoration: 'none' }}>
          Things to do
        </Link>
        {' / '}
        <Link href="/destination/wellness" style={{ color: '#888', textDecoration: 'none' }}>
          Dream holiday
        </Link>
      </nav>
    </>
  )
}

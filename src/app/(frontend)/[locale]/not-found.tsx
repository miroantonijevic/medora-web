import { Link } from '@/i18n/navigation'
import React from 'react'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: '#fffaf5',
      }}
    >
      <p
        style={{
          fontSize: 120,
          fontWeight: 700,
          color: '#012B59',
          lineHeight: 1,
          margin: 0,
          opacity: 0.08,
          letterSpacing: '-0.04em',
        }}
        aria-hidden="true"
      >
        404
      </p>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#012B59',
          margin: '-24px 0 12px',
        }}
      >
        Page not found
      </h1>
      <p style={{ fontSize: 15, color: '#666', maxWidth: 420, lineHeight: 1.7, margin: '0 0 32px' }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you
        back on track.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: '#012B59',
            color: '#fff',
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: 4,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Go home
        </Link>
        <Link
          href="/properties"
          style={{
            background: 'transparent',
            border: '1px solid #012B59',
            color: '#012B59',
            fontWeight: 600,
            padding: '11px 24px',
            borderRadius: 4,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          View properties
        </Link>
        <Link
          href="/contact"
          style={{
            background: 'transparent',
            border: '1px solid #ccc',
            color: '#555',
            fontWeight: 600,
            padding: '11px 24px',
            borderRadius: 4,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Contact us
        </Link>
      </div>
    </main>
  )
}

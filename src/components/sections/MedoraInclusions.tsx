import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export type Inclusion = {
  icon: string
  label: string
  href: string
}

export function MedoraInclusions({ headline, subtitle, inclusions }: Props) {
  if (!inclusions || inclusions.length === 0) return null
  const items = inclusions
  const title = headline ?? ''

  return (
    <section
      style={{
        background: '#fffaf5',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      {/* Top title */}
      <h2
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#11131e',
          marginBottom: '6px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>

      {/* Icons row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          margin: '40px 0',
          flexWrap: 'wrap',
        }}
      >
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#11131e',
              gap: '14px',
              width: '200px',
            }}
          >
            <Image
              src={item.icon}
              alt={item.label}
              width={120}
              height={120}
              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom subtitle */}
      {subtitle && (
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#11131e',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </h2>
      )}
    </section>
  )
}

'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export type AmenityGroupCard = {
  slug: string
  name: string
  description?: string
  image?: string
  alt?: string
}

type Props = {
  groups: AmenityGroupCard[]
  title?: string
  subtitle?: string
}

export function MedoraAmenityGroups({ groups, title = 'Amenities', subtitle }: Props) {
  if (!groups || groups.length === 0) return null

  return (
    <section style={{ padding: '60px 0', background: '#fff' }}>
      {/* Header */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 40px 36px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#11131e', margin: '0 0 12px' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 16, color: '#666', margin: 0, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Cards */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {groups.map((group) => (
          <Link
            key={group.slug}
            href={`/amenities/${group.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div
              style={{
                borderRadius: 6,
                overflow: 'hidden',
                boxShadow: '0 2px 14px rgba(0,0,0,0.09)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: 240 }}>
                {group.image ? (
                  <Image
                    src={group.image}
                    alt={group.alt ?? group.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width:768px) 100vw, 400px"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#c8d8e8' }} />
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(1,43,89,0.55) 0%, transparent 55%)',
                  }}
                />
                <h3
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: 20,
                    right: 20,
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 700,
                    margin: 0,
                    textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                  }}
                >
                  {group.name}
                </h3>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: '16px 20px 22px',
                  background: '#fafaf8',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {group.description && (
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', margin: 0 }}>
                    {group.description}
                  </p>
                )}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#009bdb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: 'auto',
                  }}
                >
                  Read more →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

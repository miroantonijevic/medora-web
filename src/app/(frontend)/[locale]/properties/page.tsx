import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

import { getPublishedProperties } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Properties | Medora Hotels',
  description: 'Discover our properties â€” Medora Auri hotel and Luxury Camp Orbis.',
}

export default async function PropertiesPage() {
  const { docs: properties } = await getPublishedProperties()

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 700,
          color: '#012B59',
          marginBottom: 48,
          textAlign: 'center',
        }}
      >
        Our Properties
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 32,
        }}
      >
        {properties.length === 0 && (
          <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center' }}>
            No properties found.
          </p>
        )}

        {properties.map((property) => {
          const heroImage =
            property.heroImages && property.heroImages.length > 0
              ? (property.heroImages[0] as { url?: string; alt?: string })
              : null

          return (
            <Link
              key={property.id}
              href={`/properties/${property.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                  background: '#fff',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Hero image */}
                <div style={{ position: 'relative', height: 240 }}>
                  {heroImage?.url ? (
                    <Image
                      src={heroImage.url}
                      alt={heroImage.alt ?? String(property.name)}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div style={{ background: '#e5e7eb', height: '100%' }} />
                  )}

                  {/* Property type badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: '#009bdb',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 4,
                    }}
                  >
                    {property.type === 'hotel' ? 'Hotel' : 'Camp'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#012B59', margin: '0 0 8px' }}>
                    {String(property.name)}
                  </h2>
                  {property.shortDescription && (
                    <p
                      style={{
                        fontSize: 15,
                        color: '#444',
                        margin: '0 0 16px',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {String(property.shortDescription)}
                    </p>
                  )}
                  <span
                    style={{
                      display: 'inline-block',
                      color: '#009bdb',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    View property â†’
                  </span>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

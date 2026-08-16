import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAmenityGroups } from '@/lib/queries'

type Args = { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: 'Amenities — Medora Hotels',
  description: 'Discover Wellness, Dining & Bars, and Active Vacation amenities at Medora Auri.',
}

export default async function AmenitiesIndexPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  setRequestLocale(locale)

  const [tNav, groups] = await Promise.all([
    getTranslations({ locale, namespace: 'navigation' }),
    getAmenityGroups(locale),
  ])

  type MediaDoc = { url?: string; alt?: string }

  return (
    <main>
      {/* ── PAGE HEADER ── */}
      <div
        style={{
          background: '#012B59',
          padding: 'clamp(48px, 7vh, 80px) clamp(24px, 4vw, 80px)',
          textAlign: 'center',
        }}
      >
        <nav
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            {tNav('home')}
          </Link>
          <span>/</span>
          <span>Amenities</span>
        </nav>
        <h1
          style={{
            color: '#fff',
            fontSize: 'clamp(30px, 4vw, 52px)',
            fontWeight: 700,
            margin: '0 0 16px',
          }}
        >
          Things to Do
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, margin: 0, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Discover everything included at Medora Auri — from spa &amp; wellness to dining and
          adventure.
        </p>
      </div>

      {/* ── GROUP CARDS ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(48px, 7vh, 80px) clamp(24px, 4vw, 48px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 32,
          }}
        >
          {groups.map((group) => {
            const img = group.heroImage as MediaDoc | null
            return (
              <Link
                key={group.id}
                href={`/amenities/${group.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
              >
                <div
                  style={{
                    borderRadius: 6,
                    overflow: 'hidden',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: 260, flexShrink: 0 }}>
                    {img?.url ? (
                      <Image
                        src={img.url}
                        alt={img.alt ?? String(group.name)}
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
                    <h2
                      style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 24,
                        right: 24,
                        color: '#fff',
                        fontSize: 26,
                        fontWeight: 700,
                        margin: 0,
                        textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      {String(group.name)}
                    </h2>
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      padding: '20px 24px 28px',
                      flex: 1,
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    {group.description && (
                      <p style={{ fontSize: 15, lineHeight: 1.65, color: '#555', margin: 0 }}>
                        {String(group.description)}
                      </p>
                    )}
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 13,
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
            )
          })}
        </div>
      </div>
    </main>
  )
}

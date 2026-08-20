import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getPublishedOffers } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Special Offers | Medora Hotels',
  description: 'Discover our latest hotel packages and special offers.',
}

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [tOffers, tCommon, { docs: offers }] = await Promise.all([
    getTranslations({ locale, namespace: 'offers' }),
    getTranslations({ locale, namespace: 'common' }),
    getPublishedOffers(undefined, locale),
  ])

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 700,
          color: '#012B59',
          marginBottom: 8,
        }}
      >
        {tOffers('title')}
      </h1>
      <p style={{ fontSize: 16, color: '#666', marginBottom: 48 }}>{tOffers('subtitle')}</p>

      {offers.length === 0 && <p style={{ color: '#888' }}>{tOffers('noOffers')}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 28,
        }}
      >
        {offers.map((offer) => {
          const heroImg = offer.heroImage as { url?: string; alt?: string } | null | undefined

          return (
            <Link
              key={offer.id}
              href={`/offers/${offer.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Hero image */}
                <div style={{ position: 'relative', height: 220, flexShrink: 0 }}>
                  {heroImg?.url ? (
                    <Image
                      src={heroImg.url}
                      alt={heroImg.alt ?? String(offer.title)}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  ) : (
                    <div style={{ background: '#012B59', height: '100%' }} />
                  )}
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: '20px 24px 24px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h2
                    style={{ fontSize: 18, fontWeight: 700, color: '#012B59', margin: '0 0 8px' }}
                  >
                    {String(offer.title)}
                  </h2>

                  <span
                    style={{
                      marginTop: 'auto',
                      display: 'inline-block',
                      color: '#009bdb',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {tCommon('learnMore')} →
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

import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getPublishedOffers } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Packages & Special Offers | Medora Hotels',
  description: 'Discover special offers that turn your dream vacation into a reality.',
}

type Args = { params: Promise<{ locale: string }> }

export default async function PackagesSpecialOffersPage({ params }: Args) {
  const { locale } = await params
  setRequestLocale(locale)

  const { docs: offers } = await getPublishedOffers(undefined, locale)

  return (
    <main>
      {/* Breadcrumb */}
      <nav
        style={{
          padding: '12px 40px',
          fontSize: 13,
          color: '#888',
          borderBottom: '1px solid #eee',
        }}
      >
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>
          Medora
        </Link>
        {' / '}
        Packages &amp; Special offers
      </nav>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 40px' }}>
        {/* Heading + description */}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 32,
          }}
        >
          An offer you can&apos;t refuse
        </h1>

        <div
          style={{ maxWidth: 860, color: '#444', fontSize: 16, lineHeight: 1.7, marginBottom: 56 }}
        >
          <p style={{ marginBottom: 16 }}>
            Podgora is a place full to the brim with differences, its beauty and sun attracting
            numerous curious people wanting rest and enjoyment. Precisely because of this, we have
            created special offers that turn your dream vacation into a reality.
          </p>
          <p style={{ marginBottom: 16 }}>
            Special accommodation prices and unique experiences we are able to offer are just a part
            of what you can expect here with us in Podgora. Every day is an opportunity to find
            something new for yourself and make your vacation more beautiful and affordable.
          </p>
          <p>
            Find an offer you can&apos;t refuse, and we will do everything to meet your
            expectations.
          </p>
        </div>

        {/* Offers grid */}
        {offers.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
            No offers available at the moment. Please check back soon.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 48,
            }}
          >
            {offers.map((offer) => {
              const heroImg = offer.heroImage as { url?: string; alt?: string } | null | undefined

              return (
                <div key={offer.id}>
                  {/* Image */}
                  <Link
                    href={`/offers/${offer.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        aspectRatio: '4/3',
                        overflow: 'hidden',
                        marginBottom: 20,
                      }}
                    >
                      {heroImg?.url ? (
                        <Image
                          src={heroImg.url}
                          alt={heroImg.alt ?? String(offer.title)}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : (
                        <div style={{ background: '#012B59', position: 'absolute', inset: 0 }} />
                      )}
                    </div>
                  </Link>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#1a1a1a',
                      margin: '0 0 20px',
                      lineHeight: 1.3,
                    }}
                  >
                    {String(offer.title)}
                  </h2>

                  {/* Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Link
                      href={`/inquiry?offer=${encodeURIComponent(String(offer.title))}`}
                      style={{
                        display: 'inline-block',
                        background: '#012B59',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        padding: '12px 28px',
                        textDecoration: 'none',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Quick inquiry
                    </Link>
                    <Link
                      href={`/offers/${offer.slug}`}
                      style={{
                        display: 'inline-block',
                        background: 'transparent',
                        color: '#1a1a1a',
                        fontWeight: 700,
                        fontSize: 14,
                        padding: '11px 27px',
                        textDecoration: 'none',
                        border: '1px solid #333',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

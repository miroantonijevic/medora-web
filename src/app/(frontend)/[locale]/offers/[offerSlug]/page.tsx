import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { getOfferBySlug, getPublishedOffers } from '@/lib/queries'
import { bookingService } from '@/lib/booking'
import { RichText } from '@/components/RichText'
import { ExternalImageGallery } from '@/components/sections/ExternalImageGallery'
import { LivePreviewListener } from '@/components/LivePreviewListener'

type Args = {
  params: Promise<{ offerSlug: string; locale: string }>
}

export async function generateStaticParams() {
  const { docs } = await getPublishedOffers()
  return docs.map((o) => ({ offerSlug: o.slug }))
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { offerSlug, locale } = await paramsPromise
  const offer = await getOfferBySlug(offerSlug, locale)
  if (!offer) return {}
  const heroImg = offer.heroImage as { url?: string } | null | undefined
  return {
    title: `${String(offer.title)} | Medora Hotels`,
    openGraph: {
      title: `${String(offer.title)} | Medora Hotels`,
      images: heroImg?.url ? [{ url: heroImg.url, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function OfferDetailPage({ params: paramsPromise }: Args) {
  const { offerSlug, locale } = await paramsPromise
  setRequestLocale(locale)
  const { isEnabled: draft } = await draftMode()
  const [tOffers, tNav, offer] = await Promise.all([
    getTranslations({ locale, namespace: 'offers' }),
    getTranslations({ locale, namespace: 'navigation' }),
    getOfferBySlug(offerSlug, locale),
  ])

  if (!offer) return notFound()

  const heroImg = offer.heroImage as { url?: string; alt?: string } | null | undefined
  const property = offer.property as { slug?: string; name?: string } | null | undefined
  const bookingLink = bookingService.getBookingLink({
    propertySlug: property?.slug,
    locale,
  })

  return (
    <main>
      {draft && <LivePreviewListener />}

      {/* Hero */}
      <section style={{ position: 'relative', height: 400 }}>
        {heroImg?.url ? (
          <Image
            src={heroImg.url}
            alt={heroImg.alt ?? String(offer.title)}
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#012B59' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.40)' }} />
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 48,
            color: '#fff',
          }}
        >
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              background: '#FF914D',
              padding: '4px 10px',
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {tOffers('specialOffer')}
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, margin: '12px 0 0' }}>
            {String(offer.title)}
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav
        style={{ background: '#f9f5f1', padding: '12px 48px', fontSize: 13, color: '#666' }}
        aria-label="breadcrumb"
      >
        <Link href="/" style={{ color: '#009bdb', textDecoration: 'none' }}>
          {tNav('home')}
        </Link>{' '}
        /{' '}
        <Link href="/offers" style={{ color: '#009bdb', textDecoration: 'none' }}>
          {tNav('offers')}
        </Link>{' '}
        / {String(offer.title)}
      </nav>

      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 48,
          alignItems: 'start',
        }}
      >
        {/* Description */}
        <div>
          {/* Rich text description */}
          {offer.description && (
            <RichText data={offer.description as Parameters<typeof RichText>[0]['data']} />
          )}
        </div>

        {/* Sidebar CTA */}
        <aside
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            padding: '24px',
            position: 'sticky',
            top: 88,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#012B59', marginBottom: 16 }}>
            {tOffers('interested')}
          </h2>
          {property?.name && (
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              {tOffers('property')}: <strong>{String(property.name)}</strong>
            </p>
          )}
          <a
            href={bookingLink.href}
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#FF914D',
              color: '#fff',
              fontWeight: 700,
              padding: '13px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            {bookingLink.label}
          </a>
        </aside>
      </div>

      {/* Photo gallery */}
      {Array.isArray(offer.gallery) && offer.gallery.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 56px' }}>
          <ExternalImageGallery
            images={(offer.gallery as { image?: { url?: string; alt?: string } | null }[])
              .filter((g) => g.image?.url)
              .map((g) => ({ src: g.image!.url!, alt: g.image?.alt ?? String(offer.title) }))}
          />
        </div>
      )}
    </main>
  )
}

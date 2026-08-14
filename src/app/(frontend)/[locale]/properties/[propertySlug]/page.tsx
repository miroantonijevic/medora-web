import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'

import {
  getPropertyBySlug,
  getPublishedProperties,
  getRoomSubGroups,
  getPublishedOffers,
  getAuriHomepage,
  getOrbisHomepage,
} from '@/lib/queries'
import { MedoraHero, type HeroSlide } from '@/components/sections/MedoraHero'
import { MedoraInclusions, type Inclusion } from '@/components/sections/MedoraInclusions'
import { MedoraOfferBanners, type OfferBanner } from '@/components/sections/MedoraOfferBanners'
import { bookingService } from '@/lib/booking'

type Args = {
  params: Promise<{ propertySlug: string; locale: string }>
}

export async function generateStaticParams() {
  const { docs } = await getPublishedProperties()
  return docs.map((p) => ({ propertySlug: p.slug }))
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { propertySlug } = await paramsPromise
  const property = await getPropertyBySlug(propertySlug)
  if (!property) return {}
  const heroImage = property.heroImages?.[0] as { url?: string } | undefined
  return {
    title: `${String(property.name)} | Medora Hotels`,
    description: property.shortDescription ? String(property.shortDescription) : undefined,
    openGraph: {
      title: `${String(property.name)} | Medora Hotels`,
      description: property.shortDescription ? String(property.shortDescription) : undefined,
      images: heroImage?.url ? [{ url: heroImage.url, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function PropertyHomePage({ params: paramsPromise }: Args) {
  const { propertySlug, locale } = await paramsPromise

  const [property, roomSubGroups, offersResult, auriGlobal, orbisGlobal] = await Promise.all([
    getPropertyBySlug(propertySlug),
    getRoomSubGroups(propertySlug, locale),
    getPublishedOffers(propertySlug, locale).catch(() => ({ docs: [] })),
    getAuriHomepage(false, locale).catch(() => null),
    getOrbisHomepage(false, locale).catch(() => null),
  ])

  if (!property) return notFound()

  const homepageGlobal = propertySlug === 'medora-auri' ? auriGlobal : orbisGlobal

  let heroSlides: HeroSlide[] | undefined
  if (homepageGlobal?.slides && homepageGlobal.slides.length > 0) {
    heroSlides = homepageGlobal.slides.map((s) => {
      const img = s.image as { url?: string; alt?: string } | null
      return {
        image: img?.url ?? '/gallery/mainpage_skywalk.png',
        alt: img?.alt ?? String(property.name),
        headline: String(s.headline ?? 'Book here & get FREE:'),
        benefits: Array.isArray(s.benefits)
          ? s.benefits.map((b) => String((b as { text?: string }).text ?? ''))
          : [],
        ctaLabel: String(s.ctaLabel ?? 'View offers'),
        ctaHref: String(s.ctaHref ?? '/offers'),
      }
    })
  }

  let inclusions: Inclusion[] | undefined
  let inclusionsHeadline: string | undefined
  if (homepageGlobal?.inclusions && homepageGlobal.inclusions.length > 0) {
    inclusionsHeadline = homepageGlobal.inclusionsHeadline
      ? String(homepageGlobal.inclusionsHeadline)
      : undefined
    inclusions = homepageGlobal.inclusions.map((inc) => {
      const icon = inc.icon as { url?: string } | null
      return {
        icon: icon?.url ?? '/brand/parking.svg',
        label: String(inc.label ?? ''),
        href: String(inc.href ?? '/accommodation'),
      }
    })
  }

  let offerBanner: OfferBanner | undefined
  if (offersResult.docs.length > 0) {
    const offer = offersResult.docs[0]!
    const img = offer.heroImage as { url?: string; alt?: string } | null | undefined
    offerBanner = {
      image: img?.url ?? '/brand/special-offers.jpg',
      alt: img?.alt ?? String(offer.title),
      headline: String(offer.title),
      ctaLabel: 'Find out more',
      ctaHref: `/offers/${offer.slug}`,
    }
  }

  const roomSubGroupsData = roomSubGroups

  return (
    <main>
      {/* 1. Hero slideshow */}
      <MedoraHero slides={heroSlides} />

      {/* 2. Free inclusions strip */}
      <MedoraInclusions headline={inclusionsHeadline} inclusions={inclusions} />

      {/* 3. Room categories photo grid */}
      {roomSubGroupsData.length > 0 && (
        <section style={{ background: "#fffaf5", padding: "60px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#012B59", margin: "0 0 32px", textAlign: "center" }}>
              Sobe
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 4 }}>
              {roomSubGroupsData.map((group) => {
                const heroImage = group.heroImage as { url?: string; alt?: string } | null
                const groupName = String(group.name)
                return (
                  <Link
                    key={group.slug}
                    href={`/properties/${propertySlug}/rooms/${group.slug}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <article style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3", cursor: "pointer" }}>
                      {heroImage?.url ? (
                        <Image
                          src={heroImage.url}
                          alt={heroImage.alt ?? groupName}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div style={{ background: "#c8bfb0", width: "100%", height: "100%" }} />
                      )}
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)",
                      }} />
                      <h3 style={{
                        position: "absolute", bottom: 20, left: 20,
                        color: "#fff", fontSize: "clamp(16px, 1.8vw, 22px)", fontWeight: 700,
                        margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                      }}>
                        {groupName}
                      </h3>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Special offer banner */}
      <MedoraOfferBanners offer={offerBanner} />

      {/* 5. Property description + booking CTA */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        {property.shortDescription && (
          <p style={{ fontSize: 18, lineHeight: 1.7, color: '#333', marginBottom: 32 }}>
            {String(property.shortDescription)}
          </p>
        )}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
          {property.starRating && (
            <div>
              <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', display: 'block' }}>Rating</span>
              <span style={{ fontSize: 20, color: '#012B59', fontWeight: 700 }}>{'â˜…'.repeat(property.starRating)}</span>
            </div>
          )}
          {property.address && (
            <div>
              <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', display: 'block' }}>Location</span>
              <span style={{ fontSize: 15, color: '#333' }}>{String(property.address)}</span>
            </div>
          )}
        </div>
        {(() => {
          const link = bookingService.getBookingLink({ propertySlug })
          return (
            <a
              href={link.href}
              style={{
                display: 'inline-block',
                background: '#FF914D',
                color: '#fff',
                fontWeight: 700,
                padding: '14px 32px',
                borderRadius: 4,
                textDecoration: 'none',
                fontSize: 15,
                letterSpacing: '0.04em',
              }}
            >
              {link.label}
            </a>
          )
        })()}
      </section>
    </main>
  )
}

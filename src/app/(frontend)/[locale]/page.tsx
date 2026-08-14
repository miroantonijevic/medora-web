import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getRoomSubGroups, getPublishedOffers, getAuriHomepage } from '@/lib/queries'
import { MedoraHero, type HeroSlide } from '@/components/sections/MedoraHero'
import { MedoraInclusions, type Inclusion } from '@/components/sections/MedoraInclusions'
import { MedoraGallery } from '@/components/sections/MedoraGallery'
import { MedoraOfferBanners, type OfferBanner } from '@/components/sections/MedoraOfferBanners'
import { MedoraRoomsGrid, type RoomCard } from '@/components/sections/MedoraRoomsGrid'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const metadata: Metadata = {
  title: 'Medora Auri Family Beach Resort | Podgora, Croatia',
  description:
    'Medora Auri Family Beach Resort on the Makarska Riviera, Croatia. Book directly and enjoy exclusive free inclusions.',
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph({
    title: 'Medora Auri Family Beach Resort | Podgora, Croatia',
    description:
      'Book directly at Medora Auri and enjoy exclusive free inclusions — parking, sunloungers, drinks, and more.',
    url: '/',
  }),
}

export default async function AuriHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ locale?: string }>
}) {
  const PROPERTY_SLUG = 'medora-auri'
  const { isEnabled: isDraft } = await draftMode()
  // In draft mode the locale comes from /api/draft?locale=xx; otherwise from URL segment
  const { locale: localeParam } = await params
  const resolvedSearch = await searchParams
  const locale = isDraft && resolvedSearch.locale ? resolvedSearch.locale : localeParam

  const [tCommon, tNav, tOffers, homepageGlobal, roomSubGroups, fallbackOffersResult] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'navigation' }),
    getTranslations({ locale, namespace: 'offers' }),
    getAuriHomepage(isDraft, locale).catch(() => null),
    getRoomSubGroups(PROPERTY_SLUG, locale).catch(() => []),
    getPublishedOffers(PROPERTY_SLUG, locale).catch(() => ({ docs: [] })),
  ])

  // Map CMS slides → HeroSlide[]
  let heroSlides: HeroSlide[] | undefined
  if (homepageGlobal?.slides && homepageGlobal.slides.length > 0) {
    heroSlides = homepageGlobal.slides.map((s) => {
      const img = s.image as { url?: string; alt?: string } | null
      return {
        image: img?.url ?? '/gallery/mainpage_skywalk.png',
        alt: img?.alt ?? 'Medora Auri',
        headline: String(s.headline ?? 'Book here & get FREE:'),
        benefits: Array.isArray(s.benefits)
          ? s.benefits.map((b) => String((b as { text?: string }).text ?? ''))
          : [],
        ctaLabel: String(s.ctaLabel ?? 'View offers'),
        ctaHref: String(s.ctaHref ?? '/offers'),
      }
    })
  }

  // Map CMS inclusions
  let inclusions: Inclusion[] | undefined
  const inclusionsHeadline: string | undefined = homepageGlobal?.inclusionsHeadline
    ? String(homepageGlobal.inclusionsHeadline)
    : undefined
  const inclusionsSubtitle: string | undefined = (homepageGlobal as { inclusionsSubtitle?: unknown } | null)
    ?.inclusionsSubtitle
    ? String((homepageGlobal as { inclusionsSubtitle?: unknown }).inclusionsSubtitle)
    : undefined
  if (homepageGlobal?.inclusions && homepageGlobal.inclusions.length > 0) {
    inclusions = homepageGlobal.inclusions.map((inc) => {
      const icon = inc.icon as { url?: string } | null
      return {
        icon: icon?.url ?? '/brand/parking.svg',
        label: String(inc.label ?? ''),
        href: String(inc.href ?? '/accommodation'),
      }
    })
  }

  // Build room cards from DB sub-groups
  const payloadRooms: RoomCard[] = roomSubGroups.map((group) => {
    const heroImage = group.heroImage as { url?: string; alt?: string } | null
    return {
      image: heroImage?.url ?? '/rooms/double-room.jpg',
      alt: heroImage?.alt ?? String(group.name),
      name: String(group.name),
      href: `/properties/${PROPERTY_SLUG}/rooms/${group.slug}`,
    }
  })

  // Featured offer: use editor-picked offer from global, or fall back to latest
  type OfferDoc = { title: unknown; slug: string; heroImage?: unknown }
  const featuredOfferDoc = homepageGlobal?.featuredOffer as OfferDoc | null | undefined
  const offerDoc: OfferDoc | undefined =
    featuredOfferDoc ?? (fallbackOffersResult.docs[0] as OfferDoc | undefined)
  let offerBanner: OfferBanner | undefined
  if (offerDoc) {
    const img = offerDoc.heroImage as { url?: string; alt?: string } | null | undefined
    offerBanner = {
      image: img?.url ?? '/brand/special-offers.jpg',
      alt: img?.alt ?? String(offerDoc.title),
      headline: String(offerDoc.title),
      ctaLabel: tCommon('learnMore'),
      ctaHref: `/offers/${offerDoc.slug}`,
    }
  }

  return (
    <main>
      <LivePreviewListener />
      <MedoraHero slides={heroSlides} />
      <MedoraInclusions headline={inclusionsHeadline} subtitle={inclusionsSubtitle} inclusions={inclusions} />
      <MedoraGallery title={tNav('gallery')} viewAllLabel={tCommon('viewAll')} />
      <MedoraRoomsGrid
        rooms={payloadRooms.length > 0 ? payloadRooms : undefined}
        title={tNav('rooms')}
        viewAllLabel={tCommon('viewAll')}
        viewAllHref={`/properties/${PROPERTY_SLUG}/rooms`}
      />
      <MedoraOfferBanners offer={offerBanner} ctaLabel={tCommon('learnMore')} specialOffersLabel={tOffers('title')} />
    </main>
  )
}

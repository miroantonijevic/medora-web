import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { getRoomsByProperty, getPublishedOffers, getOrbisHomepage } from '@/lib/queries'
import { ROOM_GROUPS, groupNameForLocale } from '@/lib/roomGroups'
import { MedoraHero, type HeroSlide } from '@/components/sections/MedoraHero'
import { MedoraInclusions, type Inclusion } from '@/components/sections/MedoraInclusions'
import { MedoraOfferBanners, type OfferBanner } from '@/components/sections/MedoraOfferBanners'
import { MedoraRoomsGrid, type RoomCard } from '@/components/sections/MedoraRoomsGrid'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const metadata: Metadata = {
  title: 'Luxury Camp Orbis | Makarska Riviera, Croatia',
  description:
    'Luxury Camp Orbis on the Makarska Riviera — glamping in nature with premium amenities. Book directly for exclusive inclusions.',
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph({
    title: 'Luxury Camp Orbis | Makarska Riviera, Croatia',
    description: 'Glamping in nature with premium amenities on the Makarska Riviera.',
    url: '/orbis',
  }),
}

export default async function OrbisHomePage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>
}) {
  const PROPERTY_SLUG = 'luxury-camp-orbis'
  const { isEnabled: isDraft } = await draftMode()
  const resolvedParams = await searchParams
  const locale = isDraft && resolvedParams.locale ? resolvedParams.locale : await getLocale()

  const [homepageGlobal, fallbackRoomsResult, fallbackOffersResult] = await Promise.all([
    getOrbisHomepage(isDraft, locale).catch(() => null),
    getRoomsByProperty(PROPERTY_SLUG).catch(() => ({ docs: [] })),
    getPublishedOffers(PROPERTY_SLUG).catch(() => ({ docs: [] })),
  ])

  // Map CMS slides → HeroSlide[]
  let heroSlides: HeroSlide[] | undefined
  if (homepageGlobal?.slides && homepageGlobal.slides.length > 0) {
    heroSlides = homepageGlobal.slides.map((s) => {
      const img = s.image as { url?: string; alt?: string } | null
      return {
        image: img?.url ?? '/gallery/mainpage_skywalk.png',
        alt: img?.alt ?? 'Luxury Camp Orbis',
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

  // Build one card per room group
  type RoomDoc = { id: number; name: unknown; slug: string; images?: unknown[]; category?: string }
  const allRooms = (fallbackRoomsResult.docs as RoomDoc[])
  const payloadRooms: RoomCard[] = ROOM_GROUPS
    .map((group) => ({
      group,
      rooms: allRooms.filter((r) => group.categories.includes(r.category ?? '')),
    }))
    .filter(({ rooms }) => rooms.length > 0)
    .map(({ group, rooms }) => {
      const hero = rooms[0]!
      const img = hero.images && hero.images.length > 0 ? (hero.images[0] as { url?: string; alt?: string }) : null
      return {
        image: img?.url ?? '/rooms/double-room.jpg',
        alt: img?.alt ?? groupNameForLocale(group, 'en'),
        name: groupNameForLocale(group, 'en'),
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
      ctaLabel: 'Find out more',
      ctaHref: `/offers/${offerDoc.slug}`,
    }
  }

  return (
    <main>
      <LivePreviewListener />
      <MedoraHero slides={heroSlides} />
      <MedoraInclusions headline={inclusionsHeadline} inclusions={inclusions} />
      <MedoraRoomsGrid
        rooms={payloadRooms.length > 0 ? payloadRooms : undefined}
        viewAllHref={`/properties/${PROPERTY_SLUG}/rooms`}
      />
      <MedoraOfferBanners offer={offerBanner} />
    </main>
  )
}

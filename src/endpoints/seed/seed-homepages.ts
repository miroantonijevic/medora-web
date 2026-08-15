import type { Payload } from 'payload'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'public')

async function getOrUploadMedia(
  payload: Payload,
  filename: string,
  relPath: string,
  mimeType: string,
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number

  const filePath = path.join(PUBLIC_DIR, relPath)
  const data = fs.readFileSync(filePath)
  const doc = await payload.create({
    collection: 'media',
    data: { alt: filename.replace(/\.[^.]+$/, '') },
    file: { data, mimetype: mimeType, name: filename, size: data.length },
  })
  payload.logger.info(`  Uploaded media: ${filename} => id=${doc.id}`)
  return doc.id as number
}

// ─── Shared hero content ──────────────────────────────────────────────────────

const HERO_BENEFITS = {
  en: [
    { text: 'Excursion (Skywalk Biokovo / boat trip to islands)' },
    { text: 'OR' },
    { text: 'VIP seats at open air musical' },
  ],
  hr: [
    { text: 'Izlet (Skywalk Biokovo / Izlet brodom Hvar/Bra\u010d)' },
    { text: 'ILI' },
    { text: 'VIP mjesta na open air glazbenom' },
  ],
  de: [
    { text: 'Ausflug (Skywalk Biokovo / Bootsausflug zu den Inseln)' },
    { text: 'ODER' },
    { text: 'VIP-Pl\u00e4tze beim Open-Air-Musical' },
  ],
}

const HERO_HEADLINE = {
  en: 'Book here & get FREE:',
  hr: 'Rezerviraj ovdje i izaberi BESPLATNO:',
  de: 'Buchen Sie hier und erhalten Sie GRATIS:',
}

type SlideWithIds = {
  id: string
  benefits: { id: string }[]
}

function mapSlidesWithIds(
  slideIds: SlideWithIds[],
  locale: 'hr' | 'de',
  ctas: { label: string; href?: string }[],
) {
  return slideIds.map((slide, i) => ({
    id: slide.id,
    headline: HERO_HEADLINE[locale],
    benefits: slide.benefits.map((b, j) => ({
      id: b.id,
      text: HERO_BENEFITS[locale][j]?.text ?? '',
    })),
    ctaLabel: ctas[i]?.label ?? '',
    ...(ctas[i]?.href ? { ctaHref: ctas[i].href } : {}),
  }))
}

// ─── Auri ────────────────────────────────────────────────────────────────────

async function seedAuriHomepage(
  payload: Payload,
  ids: {
    skywalk: number
    hotel: number
    room: number
    parking: number
    sunloungers: number
    drinks: number
  },
) {
  const en = await payload.updateGlobal({
    slug: 'auri-homepage',
    locale: 'en',
    data: {
      slides: [
        {
          image: ids.skywalk,
          headline: HERO_HEADLINE.en,
          benefits: HERO_BENEFITS.en,
          ctaLabel: 'Find out more',
          ctaHref: '/offers',
        },
        {
          image: ids.hotel,
          headline: HERO_HEADLINE.en,
          benefits: HERO_BENEFITS.en,
          ctaLabel: 'View rooms',
          ctaHref: '/accommodation',
        },
        {
          image: ids.room,
          headline: HERO_HEADLINE.en,
          benefits: HERO_BENEFITS.en,
          ctaLabel: 'Book now',
          ctaHref: '/inquiry',
        },
      ],
      inclusionsHeadline: 'Children stay for FREE! Save \u20ac483 compared to other hotels for:',
      inclusionsSubtitle: 'Free of charge in Medora, because we appreciate our guests!',
      inclusions: [
        { icon: ids.parking, label: '1 parking space', href: '/accommodation' },
        { icon: ids.sunloungers, label: 'Sunloungers & beach towel', href: '/accommodation' },
        { icon: ids.drinks, label: 'Soft drinks & wine with dinner', href: '/accommodation' },
      ],
    },
  })

  const slides = en.slides as SlideWithIds[]
  const inclusionIds = (en.inclusions as { id: string }[]).map((i) => i.id)

  await payload.updateGlobal({
    slug: 'auri-homepage',
    locale: 'hr',
    data: {
      slides: mapSlidesWithIds(slides, 'hr', [
        { label: 'Saznaj vi\u0161e' },
        { label: 'Pogledaj sobe' },
        { label: 'Rezerviraj' },
      ]),
      inclusionsHeadline:
        'Djeca borave BESPLATNO! U\u0161tedite 483 \u20ac u usporedbi s drugim hotelima:',
      inclusionsSubtitle: 'Besplatno u Medori, jer cijenimo svoje goste!',
      inclusions: [
        { id: inclusionIds[0], label: 'Parking' },
        { id: inclusionIds[1], label: 'Le\u017ealjke i ru\u010dnik za pla\u017eu' },
        { id: inclusionIds[2], label: 'Pi\u0107e uz ve\u010deru' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'auri-homepage',
    locale: 'de',
    data: {
      slides: mapSlidesWithIds(slides, 'de', [
        { label: 'Mehr erfahren' },
        { label: 'Zimmer ansehen' },
        { label: 'Jetzt buchen' },
      ]),
      inclusionsHeadline:
        'Kinder \u00fcbernachten KOSTENLOS! Sparen Sie bis zu 483 \u20ac im Vergleich zu anderen Hotels f\u00fcr:',
      inclusionsSubtitle: 'Kostenlos in Medora, weil wir unsere G\u00e4ste sch\u00e4tzen!',
      inclusions: [
        { id: inclusionIds[0], label: 'Parkplatz' },
        { id: inclusionIds[1], label: 'Sonnenliegen und Badetuch' },
        { id: inclusionIds[2], label: 'Getr\u00e4nke zum Abendessen' },
      ],
    },
  })

  const auriGroupSlugs = ['auri-double-rooms', 'auri-suites', 'auri-family-rooms']
  const auriGroups = await payload.find({
    collection: 'room-groups',
    where: { slug: { in: auriGroupSlugs } },
    depth: 0,
    limit: 10,
  })
  const auriOffer = await payload.find({
    collection: 'offers',
    where: { slug: { equals: 'family-holiday-at-medora' } },
    depth: 0,
    limit: 1,
  })
  await payload.updateGlobal({
    slug: 'auri-homepage',
    data: {
      featuredGroups: auriGroups.docs.map((g) => g.id),
      featuredOffer: auriOffer.docs[0]?.id ?? null,
    },
  })

  await payload.updateGlobal({ slug: 'auri-homepage', data: { _status: 'published' } })
  payload.logger.info('  auri-homepage seeded and published.')
}

// ─── Orbis ───────────────────────────────────────────────────────────────────

async function seedOrbisHomepage(
  payload: Payload,
  ids: { skywalk: number; hotel: number; room: number; parking: number; sunloungers: number },
) {
  const en = await payload.updateGlobal({
    slug: 'orbis-homepage',
    locale: 'en',
    data: {
      slides: [
        {
          image: ids.skywalk,
          headline: HERO_HEADLINE.en,
          benefits: HERO_BENEFITS.en,
          ctaLabel: 'Find out more',
          ctaHref: '/offers',
        },
        {
          image: ids.hotel,
          headline: HERO_HEADLINE.en,
          benefits: HERO_BENEFITS.en,
          ctaLabel: 'View accommodation',
          ctaHref: '/orbis',
        },
        {
          image: ids.room,
          headline: HERO_HEADLINE.en,
          benefits: HERO_BENEFITS.en,
          ctaLabel: 'Quick inquiry',
          ctaHref: '/inquiry',
        },
      ],
      inclusionsHeadline: 'Free of charge in Medora, because we love our guests!',
      inclusionsSubtitle: 'Free of charge in Medora, because we love our guests!',
      inclusions: [
        { icon: ids.parking, label: 'Parking', href: '/orbis' },
        { icon: ids.sunloungers, label: 'Sunloungers & beach towel', href: '/orbis' },
        { label: 'Washer and dryer', href: '/orbis' },
        { label: 'A gift for your pet', href: '/orbis' },
        { label: 'Bicycle', href: '/orbis' },
      ],
    },
  })

  const slides = en.slides as SlideWithIds[]
  const inclusionIds = (en.inclusions as { id: string }[]).map((i) => i.id)

  await payload.updateGlobal({
    slug: 'orbis-homepage',
    locale: 'hr',
    data: {
      slides: mapSlidesWithIds(slides, 'hr', [
        { label: 'Saznaj vi\u0161e' },
        { label: 'Pogledaj smje\u0161taj' },
        { label: 'Brza ponuda' },
      ]),
      inclusionsHeadline: 'Besplatno u Medori, jer volimo svoje goste',
      inclusionsSubtitle: 'Besplatno u Medori, jer volimo svoje goste',
      inclusions: [
        { id: inclusionIds[0], label: 'Parking' },
        { id: inclusionIds[1], label: 'Le\u017ealjke i ru\u010dnik za pla\u017eu' },
        { id: inclusionIds[2], label: 'Perilica i su\u0161ilica rublja' },
        { id: inclusionIds[3], label: 'Poklon za va\u0161eg ljubimca' },
        { id: inclusionIds[4], label: 'Bicikl' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'orbis-homepage',
    locale: 'de',
    data: {
      slides: mapSlidesWithIds(slides, 'de', [
        { label: 'Mehr erfahren' },
        { label: 'Unterkunft ansehen' },
        { label: 'Schnellanfrage' },
      ]),
      inclusionsHeadline: 'Kostenlos in Medora, weil wir unsere G\u00e4ste lieben!',
      inclusionsSubtitle: 'Kostenlos in Medora, weil wir unsere G\u00e4ste lieben!',
      inclusions: [
        { id: inclusionIds[0], label: 'Parkplatz' },
        { id: inclusionIds[1], label: 'Sonnenliegen und Badetuch' },
        { id: inclusionIds[2], label: 'Waschmaschine und Trockner' },
        { id: inclusionIds[3], label: 'Ein Geschenk f\u00fcr Ihr Haustier' },
        { id: inclusionIds[4], label: 'Fahrrad' },
      ],
    },
  })

  const orbisGroupSlugs = ['orbis-cabins-small', 'orbis-cabins-large', 'orbis-pitches']
  const orbisGroups = await payload.find({
    collection: 'room-groups',
    where: { slug: { in: orbisGroupSlugs } },
    depth: 0,
    limit: 10,
  })
  const orbisOffer = await payload.find({
    collection: 'offers',
    where: { slug: { equals: 'one-summer-in-orbis' } },
    depth: 0,
    limit: 1,
  })
  await payload.updateGlobal({
    slug: 'orbis-homepage',
    data: {
      featuredGroups: orbisGroups.docs.map((g) => g.id),
      featuredOffer: orbisOffer.docs[0]?.id ?? null,
    },
  })

  await payload.updateGlobal({ slug: 'orbis-homepage', data: { _status: 'published' } })
  payload.logger.info('  orbis-homepage seeded and published.')
}

// ─── Rooms images ─────────────────────────────────────────────────────────────

async function seedRoomImages(payload: Payload, roomImages: { slug: string; mediaId: number }[]) {
  for (const { slug, mediaId } of roomImages) {
    const result = await payload.find({
      collection: 'rooms',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const room = result.docs[0]
    if (!room) {
      payload.logger.warn(`  Room '${slug}' not found - skipping image assignment.`)
      continue
    }
    const existingImages = (room.images ?? []) as number[]
    if (existingImages.includes(mediaId)) continue
    await payload.update({
      collection: 'rooms',
      id: room.id,
      data: { images: [mediaId] },
    })
    payload.logger.info(`  Assigned image ${mediaId} to room '${slug}'`)
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function seedHomepages({
  payload,
  force = false,
}: {
  payload: Payload
  force?: boolean
}) {
  payload.logger.info('Seeding homepages...')

  const [parkingId, sunloungersId, drinksId, doubleRoomId, familyRoomId, suiteId] =
    await Promise.all([
      getOrUploadMedia(payload, 'parking.svg', 'brand/parking.svg', 'image/svg+xml'),
      getOrUploadMedia(payload, 'sunloungers.svg', 'brand/sunloungers.svg', 'image/svg+xml'),
      getOrUploadMedia(payload, 'drinks.svg', 'brand/drinks.svg', 'image/svg+xml'),
      getOrUploadMedia(payload, 'double-room.jpg', 'rooms/double-room.jpg', 'image/jpeg'),
      getOrUploadMedia(payload, 'family-room.jpg', 'rooms/family-room.jpg', 'image/jpeg'),
      getOrUploadMedia(payload, 'suite.jpg', 'rooms/suite.jpg', 'image/jpeg'),
    ])

  await seedRoomImages(payload, [
    { slug: 'superior-double-sea-view', mediaId: doubleRoomId },
    { slug: 'family-room-auri', mediaId: familyRoomId },
    { slug: 'junior-suite-sea-view', mediaId: suiteId },
  ])

  const [skywalkId, hotelId, roomId] = await Promise.all([
    getOrUploadMedia(payload, 'mainpage_skywalk.png', 'gallery/mainpage_skywalk.png', 'image/png'),
    getOrUploadMedia(payload, 'mainpage_hotel.png', 'gallery/mainpage_hotel.png', 'image/png'),
    getOrUploadMedia(payload, 'mainpage_room.png', 'gallery/mainpage_room.png', 'image/png'),
  ])

  const existingAuri = await payload.findGlobal({ slug: 'auri-homepage', locale: 'en', depth: 0 })
  if (!force && existingAuri.slides?.length) {
    payload.logger.info('  auri-homepage already seeded - use force=true to reseed.')
  } else {
    await seedAuriHomepage(payload, {
      skywalk: skywalkId,
      hotel: hotelId,
      room: roomId,
      parking: parkingId,
      sunloungers: sunloungersId,
      drinks: drinksId,
    })
  }

  const existingOrbis = await payload.findGlobal({ slug: 'orbis-homepage', locale: 'en', depth: 0 })
  if (!force && existingOrbis.slides?.length) {
    payload.logger.info('  orbis-homepage already seeded - use force=true to reseed.')
  } else {
    await seedOrbisHomepage(payload, {
      skywalk: skywalkId,
      hotel: hotelId,
      room: roomId,
      parking: parkingId,
      sunloungers: sunloungersId,
    })
  }

  payload.logger.info('Homepage seed complete.')
}

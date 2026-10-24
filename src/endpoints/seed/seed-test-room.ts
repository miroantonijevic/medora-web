import type { Payload } from 'payload'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { lexParas } from './lexical'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'public')

// Internal-only room wired to the Phobs TEST account (unit 1447, see TEST_MODE_UNIT_IDS in
// src/lib/phobs.ts) so we can build/polish the booking-creation UI against a real, working
// Phobs flow without touching any real Medora room. Delete this room + file once production
// gets PCBookingNew permission and the real booking UI ships on real rooms.
const ROOM = {
  slug: 'test-booking-demo',
  phobsUnitId: '1447',
  capacity: 2,
  imageFile: {
    name: 'auri-comfort-double-sea.jpg',
    rel: 'rooms/auri-comfort-double-sea.jpg',
    mime: 'image/jpeg',
  },
  en: {
    name: 'Comfort Double Room – Nature Park View (Internal QA)',
    size: '21.5 m²',
    bedType: 'Double bed or twin beds',
    description:
      'Comfort double room with balcony overlooking the nature park. Internal test room used to verify the booking flow end-to-end — not bookable by real guests.',
    inclusions: ['Free Wi-Fi', 'Air conditioning / heating', 'Balcony with outdoor furniture'],
  },
  hr: {
    name: 'Comfort dvokrevetna soba – pogled na park prirode (interni QA)',
    size: '21,5 m²',
    bedType: 'Bračni krevet ili odvojena ležaja',
    description:
      'Comfort dvokrevetna soba s balkonom i pogledom na park prirode. Interna test soba za provjeru cijelog booking procesa — nije dostupna za prave goste.',
    inclusions: ['Besplatni Wi-Fi', 'Klima uređaj/grijanje', 'Balkon s vanjskim namještajem'],
  },
  de: {
    name: 'Comfort Doppelzimmer – Naturpark-Blick (interner QA)',
    size: '21,5 m²',
    bedType: 'Doppelbett oder Einzelbetten',
    description:
      'Comfort Doppelzimmer mit Balkon und Blick auf den Naturpark. Internes Testzimmer zur Überprüfung des gesamten Buchungsprozesses — nicht für echte Gäste buchbar.',
    inclusions: ['Kostenloses WLAN', 'Klimaanlage / Heizung', 'Balkon mit Außenmöbeln'],
  },
}

async function getOrUploadMedia(payload: Payload): Promise<number> {
  const { name, rel, mime } = ROOM.imageFile
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const filePath = path.join(PUBLIC_DIR, rel)
  const data = fs.readFileSync(filePath)
  const doc = await payload.create({
    collection: 'media',
    data: { alt: name.replace(/\.[^.]+$/, '').replace(/-/g, ' ') },
    file: { data, mimetype: mime, name, size: data.length },
  })
  return doc.id as number
}

export async function seedTestRoom({ payload }: { payload: Payload }): Promise<number> {
  payload.logger.info('Seeding internal test-booking room...')

  const property = await payload.find({
    collection: 'properties',
    where: { slug: { equals: 'medora-auri' } },
    limit: 1,
    depth: 0,
  })
  const propertyId = property.docs[0]?.id as number | undefined
  if (!propertyId) {
    throw new Error('Property medora-auri not found — run seed-rooms first')
  }

  const group = await payload.find({
    collection: 'room-groups',
    where: { slug: { equals: 'auri-double-sea-view' } },
    limit: 1,
    depth: 0,
  })
  const groupId = group.docs[0]?.id as number | undefined

  const mediaId = await getOrUploadMedia(payload)

  const existing = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: ROOM.slug } },
    limit: 1,
    depth: 0,
  })

  const baseData = {
    name: ROOM.en.name,
    property: propertyId,
    ...(groupId ? { group: groupId } : {}),
    capacity: ROOM.capacity,
    size: ROOM.en.size,
    bedType: ROOM.en.bedType,
    images: [mediaId],
    description: lexParas(ROOM.en.description),
    inclusions: ROOM.en.inclusions.map((label) => ({ label })),
    phobsUnitId: ROOM.phobsUnitId,
    _status: 'published' as const,
  }

  let id: number
  if (existing.docs.length > 0) {
    id = existing.docs[0].id as number
    const updated = await payload.update({
      collection: 'rooms',
      id,
      locale: 'en',
      draft: false,
      data: baseData,
    })
    await payload.update({
      collection: 'rooms',
      id,
      locale: 'hr',
      draft: false,
      data: {
        name: ROOM.hr.name,
        size: ROOM.hr.size,
        bedType: ROOM.hr.bedType,
        description: lexParas(ROOM.hr.description),
        inclusions: (updated.inclusions as { id: string }[]).map((inc, i) => ({
          id: inc.id,
          label: ROOM.hr.inclusions[i] ?? ROOM.en.inclusions[i],
        })),
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'rooms',
      id,
      locale: 'de',
      draft: false,
      data: {
        name: ROOM.de.name,
        size: ROOM.de.size,
        bedType: ROOM.de.bedType,
        description: lexParas(ROOM.de.description),
        inclusions: (updated.inclusions as { id: string }[]).map((inc, i) => ({
          id: inc.id,
          label: ROOM.de.inclusions[i] ?? ROOM.en.inclusions[i],
        })),
        _status: 'published',
      },
    })
    payload.logger.info(`  Updated test room: ${ROOM.slug} => id=${id}`)
    return id
  }

  const doc = await payload.create({
    collection: 'rooms',
    depth: 0,
    locale: 'en',
    data: { ...baseData, slug: ROOM.slug },
  })
  id = doc.id as number

  await payload.update({
    collection: 'rooms',
    id,
    locale: 'hr',
    draft: false,
    data: {
      name: ROOM.hr.name,
      size: ROOM.hr.size,
      bedType: ROOM.hr.bedType,
      description: lexParas(ROOM.hr.description),
      inclusions: (doc.inclusions as { id: string }[]).map((inc, i) => ({
        id: inc.id,
        label: ROOM.hr.inclusions[i] ?? ROOM.en.inclusions[i],
      })),
      _status: 'published',
    },
  })

  await payload.update({
    collection: 'rooms',
    id,
    locale: 'de',
    draft: false,
    data: {
      name: ROOM.de.name,
      size: ROOM.de.size,
      bedType: ROOM.de.bedType,
      description: lexParas(ROOM.de.description),
      inclusions: (doc.inclusions as { id: string }[]).map((inc, i) => ({
        id: inc.id,
        label: ROOM.de.inclusions[i] ?? ROOM.en.inclusions[i],
      })),
      _status: 'published',
    },
  })

  payload.logger.info(`  Created test room: ${ROOM.slug} => id=${id}`)
  return id
}

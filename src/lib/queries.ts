import { cache } from 'react'
import type { Where } from 'payload'

import { getPayloadClient } from './payload'

// ─── Globals ────────────────────────────────────────────────────────────────

export const getMainNav = cache(async (locale = 'en') => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'main-nav', locale: locale as 'en' | 'hr' | 'de' })
})

export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings' })
})

export const getAuriHomepage = cache(async (draft = false, locale = 'en') => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'auri-homepage',
    depth: 2,
    draft,
    locale: locale as 'en' | 'hr' | 'de',
  })
})

export const getOrbisHomepage = cache(async (draft = false, locale = 'en') => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'orbis-homepage',
    depth: 2,
    draft,
    locale: locale as 'en' | 'hr' | 'de',
  })
})

// ─── Properties ─────────────────────────────────────────────────────────────

export const getPublishedProperties = cache(async () => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'properties',
    draft: false,
    depth: 2,
    limit: 100,
  })
})

export const getPropertyBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'properties',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0] ?? null
})

// ─── Rooms ───────────────────────────────────────────────────────────────────

export const getRoomsByProperty = cache(async (propertySlug: string, locale = 'en') => {
  const payload = await getPayloadClient()

  // First resolve property id — omit `select` so Payload returns all fields including id
  const propResult = await payload.find({
    collection: 'properties',
    where: { slug: { equals: propertySlug } },
    depth: 0,
    limit: 1,
  })
  const propertyId = propResult.docs[0]?.id
  if (!propertyId) return { docs: [], totalDocs: 0 }

  return payload.find({
    collection: 'rooms',
    where: { property: { equals: propertyId } },
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 100,
  })
})

export const getRoomBySlug = cache(async (slug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: slug } },
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 1,
  })
  return result.docs[0] ?? null
})

// ─── Room Groups ──────────────────────────────────────────────────────────────

export const getRoomGroups = cache(async (propertySlug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const propResult = await payload.find({
    collection: 'properties',
    where: { slug: { equals: propertySlug } },
    depth: 0,
    limit: 1,
  })
  const propertyId = propResult.docs[0]?.id
  if (!propertyId) return []
  const result = await payload.find({
    collection: 'room-groups',
    where: { and: [{ property: { equals: propertyId } }, { parent: { exists: false } }] },
    depth: 1,
    locale: locale as 'en' | 'hr' | 'de',
    sort: 'order',
    limit: 100,
  })
  return result.docs
})

export const getRoomGroupBySlug = cache(async (slug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'room-groups',
    where: { slug: { equals: slug } },
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 1,
  })
  return result.docs[0] ?? null
})

export const getRoomGroupChildren = cache(async (parentId: number, locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'room-groups',
    where: { parent: { equals: parentId } },
    depth: 1,
    locale: locale as 'en' | 'hr' | 'de',
    sort: 'order',
    limit: 50,
  })
  return result.docs
})

export const getRoomSubGroups = cache(async (propertySlug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const propResult = await payload.find({
    collection: 'properties',
    where: { slug: { equals: propertySlug } },
    depth: 0,
    limit: 1,
  })
  const propertyId = propResult.docs[0]?.id
  if (!propertyId) return []
  // Root group has no parent — get its ID first
  const rootResult = await payload.find({
    collection: 'room-groups',
    where: { and: [{ property: { equals: propertyId } }, { parent: { exists: false } }] },
    depth: 0,
    limit: 1,
  })
  const rootId = rootResult.docs[0]?.id
  if (!rootId) return []
  // Return only direct children of root (the category level shown on homepage)
  const result = await payload.find({
    collection: 'room-groups',
    where: { parent: { equals: rootId } },
    depth: 1,
    locale: locale as 'en' | 'hr' | 'de',
    sort: 'order',
    limit: 20,
  })
  return result.docs
})

export const getRoomsByGroup = cache(async (groupId: number, locale = 'en') => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'rooms',
    where: { group: { equals: groupId } },
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 100,
  })
})

// ─── Amenity Groups ───────────────────────────────────────────────────────────

export const getAmenityGroups = cache(async (locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'amenity-groups',
    depth: 1,
    locale: locale as 'en' | 'hr' | 'de',
    sort: 'order',
    limit: 20,
  })
  return result.docs
})

export const getAmenityGroupBySlug = cache(async (slug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'amenity-groups',
    where: { slug: { equals: slug } },
    depth: 1,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 1,
  })
  return result.docs[0] ?? null
})

// ─── Amenities ────────────────────────────────────────────────────────────────

export const getAmenitiesByGroup = cache(async (groupSlug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const groupResult = await payload.find({
    collection: 'amenity-groups',
    where: { slug: { equals: groupSlug } },
    depth: 0,
    limit: 1,
  })
  const groupId = groupResult.docs[0]?.id
  if (!groupId) return []
  const result = await payload.find({
    collection: 'amenities',
    where: { group: { equals: groupId } },
    depth: 1,
    locale: locale as 'en' | 'hr' | 'de',
    sort: 'order',
    limit: 50,
  })
  return result.docs
})

export const getAmenityBySlug = cache(async (slug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'amenities',
    where: { slug: { equals: slug } },
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 1,
  })
  return result.docs[0] ?? null
})

// ─── Offers ──────────────────────────────────────────────────────────────────

export const getPublishedOffers = cache(async (propertySlug?: string, locale = 'en') => {
  const payload = await getPayloadClient()

  const now = new Date().toISOString()
  const baseWhere: Where = {
    or: [{ validUntil: { greater_than_equal: now } }, { validUntil: { exists: false } }],
  }

  if (propertySlug) {
    const propResult = await payload.find({
      collection: 'properties',
      where: { slug: { equals: propertySlug } },
      depth: 0,
      limit: 1,
    })
    const propertyId = propResult.docs[0]?.id
    if (propertyId) {
      baseWhere['or'] = [{ property: { equals: propertyId } }, { property: { exists: false } }]
    }
  }

  return payload.find({
    collection: 'offers',
    where: baseWhere,
    draft: false,
    sort: 'validFrom',
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 50,
  })
})

export const getOfferBySlug = cache(async (slug: string, locale = 'en') => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'offers',
    where: { slug: { equals: slug } },
    depth: 2,
    locale: locale as 'en' | 'hr' | 'de',
    limit: 1,
  })
  return result.docs[0] ?? null
})

import type { CollectionSlug, Payload } from 'payload'

export type MediaUsage = {
  label: string
  href: string
}

// Generic deep-scan: matches any leaf value against the target id, skipping
// `id`/`_id` keys so a doc's own (unrelated) id never triggers a false match.
const containsMediaId = (value: unknown, targetId: string, key?: string): boolean => {
  if (value === null || value === undefined) return false

  if (typeof value === 'string' || typeof value === 'number') {
    if (key === 'id' || key === '_id') return false
    return String(value) === targetId
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsMediaId(item, targetId))
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([k, v]) =>
      containsMediaId(v, targetId, k),
    )
  }

  return false
}

const collectionsToScan: {
  slug: CollectionSlug
  titleField: string
  label: string
}[] = [
  { slug: 'pages', titleField: 'title', label: 'Page' },
  { slug: 'posts', titleField: 'title', label: 'Post' },
  { slug: 'rooms', titleField: 'name', label: 'Room' },
  { slug: 'room-groups', titleField: 'name', label: 'Room Group' },
  { slug: 'properties', titleField: 'name', label: 'Property' },
  { slug: 'offers', titleField: 'title', label: 'Special Offer' },
  { slug: 'faq-categories', titleField: 'title', label: 'FAQ Category' },
]

const globalsToScan: { slug: 'auri-homepage' | 'orbis-homepage' | 'site-settings' | 'seo-defaults'; label: string }[] = [
  { slug: 'auri-homepage', label: 'Medora Auri Homepage' },
  { slug: 'orbis-homepage', label: 'Luxury Camp Orbis Homepage' },
  { slug: 'site-settings', label: 'Site Settings' },
  { slug: 'seo-defaults', label: 'SEO Defaults' },
]

// Finds every document/global that references a given media id, by fetching
// each candidate collection/global (depth: 0, so relationships stay as raw
// ids) and recursively scanning for the id anywhere in the JSON.
export const findMediaUsages = async (payload: Payload, mediaId: string | number): Promise<MediaUsage[]> => {
  const targetId = String(mediaId)
  const usages: MediaUsage[] = []

  await Promise.all(
    collectionsToScan.map(async ({ slug, titleField, label }) => {
      try {
        const { docs } = await payload.find({
          collection: slug,
          depth: 0,
          pagination: false,
          overrideAccess: true,
        })

        for (const doc of docs) {
          if (containsMediaId(doc, targetId)) {
            const title = (doc as Record<string, unknown>)[titleField]
            usages.push({
              label: `${label}: ${typeof title === 'string' ? title : doc.id}`,
              href: `/admin/collections/${slug}/${doc.id}`,
            })
          }
        }
      } catch {
        // Skip collections that fail to query rather than break the whole panel.
      }
    }),
  )

  await Promise.all(
    globalsToScan.map(async ({ slug, label }) => {
      try {
        const doc = await payload.findGlobal({ slug, depth: 0, overrideAccess: true })
        if (containsMediaId(doc, targetId)) {
          usages.push({ label, href: `/admin/globals/${slug}` })
        }
      } catch {
        // Skip globals that fail to query rather than break the whole panel.
      }
    }),
  )

  return usages
}

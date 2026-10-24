import { getPayloadClient } from '@/lib/payload'

/** The Phobs unit id of the room with this slug, or null when the room or its mapping does not exist. */
export async function getPhobsUnitIdForRoom(roomSlug: string): Promise<string | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: roomSlug } },
    depth: 0,
    limit: 1,
  })

  return result.docs[0]?.phobsUnitId ?? null
}

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

export type DealRoom = {
  slug: string
  name: string
  unitId: string
  imageUrl: string | null
  /** Size and bed type, e.g. "21.5 m² | Double bed". */
  meta: string
}

type Locale = 'en' | 'hr' | 'de'

/**
 * The rooms of the same group as this room that are mapped to a Phobs unit (this room included), for
 * the "show all deals" list of the booking popup.
 */
export async function getGroupRoomsForDeals(
  roomSlug: string,
  locale: Locale,
): Promise<{ groupName: string | null; currentUnitId: string; rooms: DealRoom[] } | null> {
  const payload = await getPayloadClient()
  const current = (
    await payload.find({
      collection: 'rooms',
      where: { slug: { equals: roomSlug } },
      depth: 1,
      locale,
      limit: 1,
    })
  ).docs[0]
  if (!current?.phobsUnitId) return null

  const group = typeof current.group === 'object' ? current.group : null
  if (!group) return { groupName: null, currentUnitId: current.phobsUnitId, rooms: [] }

  const siblings = await payload.find({
    collection: 'rooms',
    where: { group: { equals: group.id } },
    depth: 1,
    locale,
    limit: 50,
    sort: 'name',
  })

  const rooms = siblings.docs.flatMap((room): DealRoom[] => {
    if (!room.phobsUnitId) return []
    const image = (room.images ?? []).find(
      (media) => typeof media === 'object' && media.url && !media.mimeType?.startsWith('video/'),
    )
    return [
      {
        slug: room.slug,
        name: room.name,
        unitId: room.phobsUnitId,
        imageUrl: typeof image === 'object' ? (image.url ?? null) : null,
        meta: [room.size, room.bedType].filter(Boolean).join(' | '),
      },
    ]
  })

  return { groupName: group.name ?? null, currentUnitId: current.phobsUnitId, rooms }
}

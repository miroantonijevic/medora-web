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

export type DealRooms = {
  groupName: string | null
  propertyName: string | null
  currentUnitId: string
  /** The rooms to list: the room's group, or the whole property for scope "property". */
  rooms: DealRoom[]
  /** Whether the property has rooms with a Phobs unit outside the room's group. */
  hasOtherRooms: boolean
}

/**
 * The rooms mapped to a Phobs unit (this room included) for the "show all deals" list of the booking
 * popup: those of the room's group, or of the whole property (the room's own group first).
 */
export async function getRoomsForDeals(
  roomSlug: string,
  locale: Locale,
  scope: 'group' | 'property',
): Promise<DealRooms | null> {
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
  const property = typeof current.property === 'object' ? current.property : null
  const propertyId = property?.id ?? current.property
  const propertyRooms = await payload.find({
    collection: 'rooms',
    where: { property: { equals: propertyId } },
    depth: 1,
    locale,
    limit: 100,
    sort: 'name',
  })

  const inGroup = (room: (typeof propertyRooms.docs)[number]) =>
    !!group && typeof room.group === 'object' && room.group?.id === group.id
  const mapped = propertyRooms.docs.filter((room) => room.phobsUnitId)
  const listed =
    scope === 'group'
      ? mapped.filter(inGroup)
      : [...mapped.filter(inGroup), ...mapped.filter((room) => !inGroup(room))]

  const rooms = listed.map((room): DealRoom => {
    const image = (room.images ?? []).find(
      (media) => typeof media === 'object' && media.url && !media.mimeType?.startsWith('video/'),
    )
    return {
      slug: room.slug,
      name: room.name,
      unitId: room.phobsUnitId!,
      imageUrl: typeof image === 'object' ? (image.url ?? null) : null,
      meta: [room.size, room.bedType].filter(Boolean).join(' | '),
    }
  })

  return {
    groupName: group?.name ?? null,
    propertyName: property?.name ?? null,
    currentUnitId: current.phobsUnitId,
    rooms,
    hasOtherRooms: mapped.some((room) => !inGroup(room)),
  }
}

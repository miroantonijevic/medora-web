export type RoomImage = { url: string; alt?: string }

type MediaLike = { url?: string | null; alt?: string | null; mimeType?: string | null }

/** The photos of a room for the booking popup: populated media docs that are images (no videos). */
export function toRoomImages(media: unknown): RoomImage[] {
  if (!Array.isArray(media)) return []

  return (media as (MediaLike | number | null)[]).flatMap((item) => {
    if (!item || typeof item !== 'object' || !item.url) return []
    if (item.mimeType?.startsWith('video/')) return []
    return [{ url: item.url, alt: item.alt ?? undefined }]
  })
}

import type { DefaultServerCellComponentProps } from 'payload'

import type { Media, Room } from '@/payload-types'

import { getCellLinkHref } from '@/components/admin-list/getCellLinkHref'
import { PublishBadges } from '@/components/admin-list/PublishDot'
import '@/components/admin-list/adminList.scss'

function resolveThumbUrl(media: Media | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return media.sizes?.thumbnail?.url ?? media.url ?? null
}

export default async function TitleThumbnailCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as Room
  const firstImage = row.images?.[0]

  let thumbUrl = resolveThumbUrl(firstImage as Media | number | null | undefined)

  // rowData may only contain raw upload ids (depth 0) — fetch it so the thumbnail still renders.
  if (!thumbUrl && typeof firstImage === 'number') {
    const media = await payload
      .findByID({ collection: 'media', id: firstImage, depth: 0 })
      .catch(() => null)
    thumbUrl = media?.sizes?.thumbnail?.url ?? media?.url ?? null
  }

  // rowData._status reflects the *latest version* (list view queries with draft=true), which
  // can differ from the main row's real status — fetch the true status separately.
  let isPublished = false
  try {
    const published = await payload.findByID({
      collection: 'rooms',
      id: row.id,
      depth: 0,
      draft: false,
      overrideAccess: true,
    })
    isPublished = published?._status === 'published'
  } catch {
    isPublished = false
  }

  const hasPendingDraft = row._status === 'draft'

  const content = (
    <>
      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbUrl} alt="" className="admin-list-thumb-cell__thumb" />
      ) : (
        <span className="admin-list-thumb-cell__thumb admin-list-thumb-cell__thumb--placeholder">
          —
        </span>
      )}
      <span className="admin-list-thumb-cell__title">{row.name}</span>
      <PublishBadges isPublished={isPublished} hasPendingDraft={hasPendingDraft} />
    </>
  )

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return (
      <a href={href} className="admin-list-thumb-cell">
        {content}
      </a>
    )
  }

  return <div className="admin-list-thumb-cell">{content}</div>
}

import type { DefaultServerCellComponentProps } from 'payload'

import type { FaqCategory, Media } from '@/payload-types'

import { getCellLinkHref } from '@/components/admin-list/getCellLinkHref'
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
  const row = rowData as FaqCategory

  let thumbUrl = resolveThumbUrl(row.image as Media | number | null | undefined)

  // rowData may only contain the raw upload id (depth 0) — fetch it so the thumbnail still renders.
  if (!thumbUrl && typeof row.image === 'number') {
    const media = await payload
      .findByID({ collection: 'media', id: row.image, depth: 0 })
      .catch(() => null)
    thumbUrl = media?.sizes?.thumbnail?.url ?? media?.url ?? null
  }

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
      <span className="admin-list-thumb-cell__title">{row.title}</span>
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

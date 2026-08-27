import type { DefaultServerCellComponentProps } from 'payload'

import type { Media, Property } from '@/payload-types'

import { getCellLinkHref } from '@/components/admin-list/getCellLinkHref'
import { StatusBadge } from '@/components/admin-list/StatusBadge'
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
  const row = rowData as Property
  const firstImage = row.heroImages?.[0]

  let thumbUrl = resolveThumbUrl(firstImage as Media | number | null | undefined)

  // rowData may only contain raw upload ids (depth 0) — fetch it so the thumbnail still renders.
  if (!thumbUrl && typeof firstImage === 'number') {
    const media = await payload
      .findByID({ collection: 'media', id: firstImage, depth: 0 })
      .catch(() => null)
    thumbUrl = media?.sizes?.thumbnail?.url ?? media?.url ?? null
  }

  const isCamp = row.type === 'camp'

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
      <StatusBadge
        label={isCamp ? 'Camp' : 'Hotel'}
        color={isCamp ? '#166534' : '#7c2d92'}
        background={isCamp ? '#dcfce7' : '#f3e8ff'}
      />
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

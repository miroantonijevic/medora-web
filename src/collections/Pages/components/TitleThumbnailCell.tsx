import type { DefaultServerCellComponentProps } from 'payload'

import type { Media, Page } from '@/payload-types'

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
  const row = rowData as Page

  const heroType = row.hero?.type
  const heroMedia = heroType === 'infoCard' ? row.hero?.heroImage : row.hero?.media

  let thumbUrl = resolveThumbUrl(heroMedia as Media | number | null | undefined)

  // rowData may only contain the raw upload id (depth 0) — fetch it so the thumbnail still renders.
  if (!thumbUrl && typeof heroMedia === 'number') {
    const media = await payload
      .findByID({ collection: 'media', id: heroMedia, depth: 0 })
      .catch(() => null)
    thumbUrl = media?.sizes?.thumbnail?.url ?? media?.url ?? null
  }

  // rowData._status reflects the *latest version* (list view queries with draft=true), which
  // autosave can flip to 'draft' without ever touching the main row — so it alone can't tell us
  // whether the doc is actually live. Fetch the true main-row status separately.
  let isPublished = false
  try {
    const published = await payload.findByID({
      collection: 'pages',
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
      <span className="admin-list-thumb-cell__title">{row.title}</span>
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

import type { DefaultServerCellComponentProps } from 'payload'

import type { Page } from '@/payload-types'

import { formatRelativeTime } from '@/components/admin-list/formatRelativeTime'
import { getCellLinkHref } from '@/components/admin-list/getCellLinkHref'
import '@/components/admin-list/adminList.scss'

export default function UpdatedCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as Page
  const content = (
    <span className="admin-list-meta-cell__value">{formatRelativeTime(row.updatedAt)}</span>
  )

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return (
      <a href={href} className="admin-list-meta-cell">
        {content}
      </a>
    )
  }

  return <div className="admin-list-meta-cell">{content}</div>
}

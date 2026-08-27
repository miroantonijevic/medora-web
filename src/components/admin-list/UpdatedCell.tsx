import type { DefaultServerCellComponentProps } from 'payload'

import { formatRelativeTime } from './formatRelativeTime'
import { getCellLinkHref } from './getCellLinkHref'
import './adminList.scss'

// Generic relative-time cell for any collection's `updatedAt` column.
export default function UpdatedCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as { id: number | string; updatedAt?: string | null }
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

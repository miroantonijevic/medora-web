import type { DefaultServerCellComponentProps } from 'payload'

import type { Inquiry } from '@/payload-types'

import { formatRelativeTime } from './formatters'
import { getCellLinkHref } from './getCellLinkHref'

export default function SubmittedCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as Inquiry
  const label = formatRelativeTime(row.createdAt)
  const title = row.createdAt ? new Date(row.createdAt).toLocaleString() : undefined

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return (
      <a href={href} title={title}>
        {label}
      </a>
    )
  }

  return <span title={title}>{label}</span>
}

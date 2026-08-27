import type { DefaultServerCellComponentProps } from 'payload'

import type { Inquiry } from '@/payload-types'

import { formatStay } from './formatters'
import { getCellLinkHref } from './getCellLinkHref'

export default function StayCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as Inquiry
  const label = formatStay(row.arrival, row.departure)

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return <a href={href}>{label}</a>
  }

  return <span>{label}</span>
}

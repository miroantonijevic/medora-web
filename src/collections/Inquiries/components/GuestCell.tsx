import type { DefaultServerCellComponentProps } from 'payload'

import type { Inquiry } from '@/payload-types'

import { getCellLinkHref } from './getCellLinkHref'
import './inquiryAdmin.scss'

export default function GuestCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as Inquiry

  const content = (
    <>
      <strong>{row.name}</strong>
      <div className="inquiry-guest-cell__meta">
        <span>{row.email}</span>
        {row.phone ? <span> · {row.phone}</span> : null}
      </div>
    </>
  )

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return (
      <a href={href} className="inquiry-guest-cell">
        {content}
      </a>
    )
  }

  return <div className="inquiry-guest-cell">{content}</div>
}

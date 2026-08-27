import type { DefaultServerCellComponentProps } from 'payload'

import type { Offer } from '@/payload-types'

import { formatShortDate } from '@/components/admin-list/formatRelativeTime'
import { getCellLinkHref } from '@/components/admin-list/getCellLinkHref'
import { StatusBadge } from '@/components/admin-list/StatusBadge'
import '@/components/admin-list/adminList.scss'

function getValidityState(validFrom?: string | null, validUntil?: string | null) {
  if (!validFrom && !validUntil) return null
  const now = Date.now()
  if (validUntil && new Date(validUntil).getTime() < now) {
    return { label: 'Expired', color: '#b91c1c', background: '#fee2e2' }
  }
  if (validFrom && new Date(validFrom).getTime() > now) {
    return { label: 'Upcoming', color: '#1d4ed8', background: '#dbeafe' }
  }
  return { label: 'Active', color: '#15803d', background: '#dcfce7' }
}

export default function ValidityCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as Offer
  const state = getValidityState(row.validFrom, row.validUntil)

  const content = (
    <>
      <span className="admin-list-meta-cell__value">
        {row.validFrom || row.validUntil
          ? `${formatShortDate(row.validFrom)} – ${formatShortDate(row.validUntil)}`
          : 'No dates set'}
      </span>
      {state && (
        <StatusBadge label={state.label} color={state.color} background={state.background} />
      )}
    </>
  )

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return (
      <a href={href} className="admin-list-meta-cell admin-list-meta-cell--row">
        {content}
      </a>
    )
  }

  return <div className="admin-list-meta-cell admin-list-meta-cell--row">{content}</div>
}

'use client'

import { useField } from '@payloadcms/ui'

import './inquiryAdmin.scss'
import { formatRelativeTime, formatStay } from './formatters'
import { STATUS_META, type InquiryStatus } from './statusMeta'

export function InquiryHeaderBanner() {
  const { value: name } = useField<string>({ path: 'name' })
  const { value: email } = useField<string>({ path: 'email' })
  const { value: phone } = useField<string>({ path: 'phone' })
  const { value: arrival } = useField<string>({ path: 'arrival' })
  const { value: departure } = useField<string>({ path: 'departure' })
  const { value: createdAt } = useField<string>({ path: 'createdAt' })
  const { value: status } = useField<InquiryStatus>({ path: 'status' })

  const current = status ?? 'new'
  const meta = STATUS_META[current]
  const initials = getInitials(name)

  return (
    <div className="inquiry-header-banner" style={{ ['--inquiry-accent' as string]: meta.color }}>
      <div className="inquiry-header-banner__identity">
        <div className="inquiry-header-banner__avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <div className="inquiry-header-banner__name-row">
            <p className="inquiry-header-banner__name">{name || 'Untitled inquiry'}</p>
            <span
              className="inquiry-badge"
              style={{ color: meta.color, background: meta.background }}
            >
              {meta.label}
            </span>
          </div>
          <div className="inquiry-header-banner__contact">
            {email && <a href={`mailto:${email}`}>{email}</a>}
            {phone && <a href={`tel:${phone}`}>{phone}</a>}
          </div>
          <p className="inquiry-header-banner__stay">{formatStay(arrival, departure)}</p>
        </div>
      </div>
      <span className="inquiry-header-banner__submitted">
        Submitted {formatRelativeTime(createdAt)}
      </span>
    </div>
  )
}

function getInitials(name?: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export default InquiryHeaderBanner

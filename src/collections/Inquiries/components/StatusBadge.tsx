import React from 'react'

import './inquiryAdmin.scss'
import { STATUS_META, type InquiryStatus } from './statusMeta'

export function StatusBadge({ status }: { status: InquiryStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.new

  return (
    <span className="inquiry-badge" style={{ color: meta.color, backgroundColor: meta.background }}>
      {meta.label}
    </span>
  )
}

import React from 'react'

import './adminList.scss'

type Props = {
  label: string
  color: string
  background: string
}

// Generic colored pill for list-view status columns (draft/published/scheduled, etc.)
export function StatusBadge({ label, color, background }: Props) {
  return (
    <span className="admin-list-badge" style={{ color, backgroundColor: background }}>
      {label}
    </span>
  )
}

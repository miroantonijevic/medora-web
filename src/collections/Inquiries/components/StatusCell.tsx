'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import './inquiryAdmin.scss'
import { StatusBadge } from './StatusBadge'
import { STATUS_META, STATUS_ORDER, type InquiryStatus } from './statusMeta'
import { useUpdateInquiryStatus } from './useUpdateInquiryStatus'

export default function StatusCell({ cellData, rowData }: DefaultCellComponentProps) {
  const router = useRouter()
  const { updateStatus, isUpdating } = useUpdateInquiryStatus()
  const [status, setStatus] = useState<InquiryStatus>((cellData as InquiryStatus) ?? 'new')

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const previous = status
    const next = e.target.value as InquiryStatus
    setStatus(next)
    const ok = await updateStatus(rowData.id, next)
    if (ok) {
      router.refresh()
    } else {
      setStatus(previous)
    }
  }

  return (
    // Row is otherwise a link to the document; stop clicks on the select from navigating away.
    <div className="inquiry-status-cell" onClick={(e) => e.stopPropagation()}>
      <StatusBadge status={status} />
      <select
        className="inquiry-status-cell__select"
        value={status}
        disabled={isUpdating}
        onChange={handleChange}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </div>
  )
}

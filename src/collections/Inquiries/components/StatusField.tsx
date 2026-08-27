'use client'

import type { SelectFieldClientComponent } from 'payload'
import { useDocumentInfo } from '@payloadcms/ui'

import './inquiryAdmin.scss'
import { StatusBadge } from './StatusBadge'
import { STATUS_META, STATUS_ORDER, type InquiryStatus } from './statusMeta'
import { useUpdateInquiryStatus } from './useUpdateInquiryStatus'

const StatusField: SelectFieldClientComponent = ({ value, onChange }) => {
  const { id } = useDocumentInfo()
  const { updateStatus, isUpdating, error } = useUpdateInquiryStatus()
  const current = (value as InquiryStatus) ?? 'new'

  async function handleClick(next: InquiryStatus) {
    if (!id || next === current) return
    const ok = await updateStatus(id, next)
    if (ok) onChange?.(next)
  }

  return (
    <div className="inquiry-status-field">
      <StatusBadge status={current} />
      <div className="inquiry-status-field__buttons">
        {STATUS_ORDER.filter((s) => s !== current).map((s) => (
          <button
            key={s}
            type="button"
            className="inquiry-status-field__button"
            disabled={isUpdating}
            onClick={() => handleClick(s)}
          >
            Mark {STATUS_META[s].label}
          </button>
        ))}
      </div>
      {error && <p className="inquiry-status-field__error">Couldn&apos;t update status.</p>}
    </div>
  )
}

export default StatusField

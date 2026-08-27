'use client'

import { useConfig } from '@payloadcms/ui'
import { useCallback, useState } from 'react'

import type { InquiryStatus } from './statusMeta'

export function useUpdateInquiryStatus() {
  const { config } = useConfig()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(false)

  const updateStatus = useCallback(
    async (id: number | string, status: InquiryStatus) => {
      setIsUpdating(true)
      setError(false)
      try {
        const res = await fetch(`${config.serverURL}${config.routes.api}/inquiries/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error('Failed to update inquiry status')
        return true
      } catch {
        setError(true)
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [config.serverURL, config.routes.api],
  )

  return { updateStatus, isUpdating, error }
}

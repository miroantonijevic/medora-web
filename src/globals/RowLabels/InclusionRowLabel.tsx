'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const InclusionRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ label?: string }>()
  const text = data?.label?.trim()
  return <span>{text || `Item ${(rowNumber ?? 0) + 1}`}</span>
}

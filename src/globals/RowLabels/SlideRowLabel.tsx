'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const SlideRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ headline?: string }>()
  const text = data?.headline?.trim()
  return <span>{text || `Slide ${(rowNumber ?? 0) + 1}`}</span>
}

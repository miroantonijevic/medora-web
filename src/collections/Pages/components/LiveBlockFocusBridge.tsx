'use client'

import { useLivePreviewContext } from '@payloadcms/ui'
import { useEffect } from 'react'

// Matches the stable per-row id Payload renders for the top-level `layout` blocks field,
// e.g. `layout-row-2` — deliberately excludes nested array/blocks rows (e.g. `layout.0.columns-row-0`).
const ROW_ID_PATTERN = /^layout-row-(\d+)$/

function getRowIndex(target: EventTarget | null): number | null {
  if (!(target instanceof Element)) return null
  const row = target.closest('[id^="layout-row-"]')
  if (!row) return null
  const match = ROW_ID_PATTERN.exec(row.id)
  return match ? Number(match[1]) : null
}

/**
 * Invisible field-level bridge (no rendered UI) that watches which `layout` block row is
 * being hovered, focused, or edited, and forwards that as the currently "active" block index
 * to the live-preview iframe via postMessage. Safe: does not touch per-row `Label` components.
 */
export function LiveBlockFocusBridge() {
  const { iframeRef, isLivePreviewing } = useLivePreviewContext()

  useEffect(() => {
    if (!isLivePreviewing) return

    let hoverIndex: number | null = null
    let focusIndex: number | null = null
    let lastSent: number | null = null

    const send = (index: number | null) => {
      if (index === lastSent) return
      lastSent = index
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'medora:block-focus', index },
        window.location.origin,
      )
    }

    const update = () => send(hoverIndex ?? focusIndex)

    const onPointerOver = (event: PointerEvent) => {
      hoverIndex = getRowIndex(event.target)
      update()
    }

    const onPointerOut = (event: PointerEvent) => {
      if (getRowIndex(event.relatedTarget) === hoverIndex) return
      hoverIndex = null
      update()
    }

    const onFocusIn = (event: FocusEvent) => {
      focusIndex = getRowIndex(event.target)
      update()
    }

    const onFocusOut = (event: FocusEvent) => {
      if (getRowIndex(event.relatedTarget) === focusIndex) return
      focusIndex = null
      update()
    }

    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout', onPointerOut)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)

    return () => {
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      send(null)
    }
  }, [isLivePreviewing, iframeRef])

  return null
}

'use client'
import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const ACTIVE_BLOCK_CLASS = 'is-live-preview-active'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only accept messages from the admin panel itself (same origin in this app).
      if (event.origin !== window.location.origin) return
      if (!event.data || event.data.type !== 'medora:block-focus') return

      const { index } = event.data as { index: number | null }

      document
        .querySelectorAll(`[data-block-index].${ACTIVE_BLOCK_CLASS}`)
        .forEach((el) => el.classList.remove(ACTIVE_BLOCK_CLASS))

      if (index !== null) {
        document.querySelector(`[data-block-index="${index}"]`)?.classList.add(ACTIVE_BLOCK_CLASS)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return <PayloadLivePreview refresh={router.refresh} serverURL={getClientSideURL()} />
}

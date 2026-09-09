'use client'

import React from 'react'
import { ExternalImageGallery } from '@/components/sections/ExternalImageGallery'
import { cn } from '@/utilities/ui'
import { getWidthClassName, type LayoutSettings } from '@/utilities/getBlockLayoutClasses'

type MediaItem = { url?: string | null; alt?: string | null }

type Props = {
  label?: string | null
  images?: { image?: MediaItem | null }[] | null
  layoutSettings?: LayoutSettings
}

export const PhotoGalleryComponent: React.FC<Props> = ({ label, images, layoutSettings }) => {
  if (!images?.length) return null

  const galleryImages = images
    .filter((item) => item.image?.url)
    .map((item) => ({ src: item.image!.url!, alt: item.image?.alt ?? '' }))

  return (
    <div className={cn(getWidthClassName(layoutSettings?.width, 'max-w-275 mx-auto'), 'px-6 pb-6')}>
      {label && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: 20,
          }}
        >
          {label}
        </p>
      )}
      <ExternalImageGallery images={galleryImages} />
    </div>
  )
}

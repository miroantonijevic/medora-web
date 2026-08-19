'use client'

import React from 'react'
import { ExternalImageGallery } from '@/components/sections/ExternalImageGallery'

type MediaItem = { url?: string | null; alt?: string | null }

type Props = {
  label?: string | null
  images?: { image?: MediaItem | null }[] | null
}

export const PhotoGalleryComponent: React.FC<Props> = ({ label, images }) => {
  if (!images?.length) return null

  const galleryImages = images
    .filter((item) => item.image?.url)
    .map((item) => ({ src: item.image!.url!, alt: item.image?.alt ?? '' }))

  return (
    <div style={{ padding: '0 0 24px' }}>
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

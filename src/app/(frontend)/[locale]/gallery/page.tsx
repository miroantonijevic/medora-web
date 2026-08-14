'use client'

import type { Metadata } from 'next'
import Image from 'next/image'
import { useState } from 'react'

// Static gallery — in a future iteration wire to a Payload Media collection query
const ALL_IMAGES = [
  { src: '/gallery/mainpage_hotel.png', alt: 'Medora Auri hotel exterior' },
  { src: '/gallery/mainpage_skywalk.png', alt: 'Skywalk Biokovo excursion' },
  { src: '/gallery/mainpage_room.png', alt: 'Deluxe guest room' },
  { src: '/gallery/2.png', alt: 'Pool terrace' },
  { src: '/gallery/new.png', alt: 'Beach & sea view' },
  { src: '/gallery/4.png', alt: 'Garden & outdoor dining' },
  { src: '/gallery/7.png', alt: 'Hotel amenities' },
  { src: '/gallery/0S3A3192.jpg', alt: 'Aerial view of the resort' },
]

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + ALL_IMAGES.length) % ALL_IMAGES.length))
  const next = () =>
    setLightbox((i) => (i === null ? null : (i + 1) % ALL_IMAGES.length))

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 700,
          color: '#012B59',
          marginBottom: 8,
        }}
      >
        Gallery
      </h1>
      <p style={{ fontSize: 16, color: '#666', marginBottom: 48 }}>
        Discover Medora Hotels through our photo gallery.
      </p>

      {/* Masonry-style grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {ALL_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            style={{
              position: 'relative',
              height: i % 3 === 0 ? 360 : 240,
              borderRadius: 6,
              overflow: 'hidden',
              cursor: 'zoom-in',
              border: 'none',
              padding: 0,
              background: 'none',
              display: 'block',
              width: '100%',
            }}
            aria-label={`Open ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              style={{
                objectFit: 'cover',
                transition: 'transform 0.35s ease, opacity 0.2s',
              }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'
                ;(e.currentTarget as HTMLImageElement).style.opacity = '0.88'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.transform = ''
                ;(e.currentTarget as HTMLImageElement).style.opacity = '1'
              }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 32,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer',
              width: 48,
              height: 48,
              borderRadius: '50%',
            }}
          >
            ‹
          </button>

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: '90vw', maxWidth: 1000, height: '80vh' }}
          >
            <Image
              src={ALL_IMAGES[lightbox]!.src}
              alt={ALL_IMAGES[lightbox]!.alt}
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer',
              width: 48,
              height: 48,
              borderRadius: '50%',
            }}
          >
            ›
          </button>

          {/* Caption */}
          <p
            style={{
              position: 'absolute',
              bottom: 20,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14,
              textAlign: 'center',
              width: '100%',
            }}
          >
            {ALL_IMAGES[lightbox]!.alt} — {lightbox + 1} / {ALL_IMAGES.length}
          </p>
        </div>
      )}
    </main>
  )
}

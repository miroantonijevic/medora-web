'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

type GalleryImage = { url: string; alt?: string }

type Props = {
  images: GalleryImage[]
  viewGalleryLabel?: string
}

export function RoomGallery({ images, viewGalleryLabel = 'View Gallery' }: Props) {
  const [offset, setOffset] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const prevLightbox = useCallback(() => setLightbox(i => i !== null ? Math.max(0, i - 1) : null), [])
  const nextLightbox = useCallback(() => setLightbox(i => i !== null ? Math.min(images.length - 1, i + 1) : null), [images.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, closeLightbox, prevLightbox, nextLightbox])

  if (images.length === 0) return null

  const visibleCount = Math.min(3, images.length)
  const maxOffset = Math.max(0, images.length - visibleCount)
  const visible = images.slice(offset, offset + visibleCount)

  return (
    <>
      <div id="gallery" style={{ background: '#fff', padding: '60px 0 56px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
          gap: 12,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 clamp(24px, 4vw, 48px)',
        }}>
          {visible.map((img, i) => (
            <div
              key={offset + i}
              onClick={() => setLightbox(offset + i)}
              style={{ position: 'relative', height: 280, borderRadius: 4, overflow: 'hidden', cursor: 'zoom-in' }}
            >
              <Image
                src={img.url}
                alt={img.alt ?? ''}
                fill
                style={{ objectFit: 'cover' }}
                sizes={`${Math.floor(100 / visibleCount)}vw`}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28 }}>
          <button
            onClick={() => setOffset(Math.max(0, offset - 1))}
            disabled={offset === 0}
            aria-label="Previous images"
            style={{
              background: 'none', border: 'none', padding: '8px 12px', fontSize: 22, lineHeight: 1,
              cursor: offset > 0 ? 'pointer' : 'default',
              color: offset > 0 ? '#012B59' : '#ccc',
            }}
          >←</button>
          <button
            onClick={() => setLightbox(offset)}
            style={{
              border: '1.5px solid #012B59', padding: '10px 32px',
              fontSize: 12, fontWeight: 700, color: '#012B59', background: 'none',
              textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer',
            }}
          >
            {viewGalleryLabel}
          </button>
          <button
            onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
            disabled={offset >= maxOffset}
            aria-label="Next images"
            style={{
              background: 'none', border: 'none', padding: '8px 12px', fontSize: 22, lineHeight: 1,
              cursor: offset < maxOffset ? 'pointer' : 'default',
              color: offset < maxOffset ? '#012B59' : '#ccc',
            }}
          >→</button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* close */}
          <button
            onClick={closeLightbox}
            aria-label="Close gallery"
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'none', border: 'none', color: '#fff',
              fontSize: 32, lineHeight: 1, cursor: 'pointer', padding: 4,
            }}
          >✕</button>

          {/* counter */}
          <span style={{
            position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: '0.1em',
          }}>
            {lightbox + 1} / {images.length}
          </span>

          {/* prev */}
          <button
            onClick={e => { e.stopPropagation(); prevLightbox() }}
            disabled={lightbox === 0}
            aria-label="Previous image"
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
              fontSize: 28, padding: '12px 18px', cursor: lightbox > 0 ? 'pointer' : 'default',
              opacity: lightbox > 0 ? 1 : 0.25, borderRadius: 4,
            }}
          >‹</button>

          {/* image */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', width: 'min(90vw, 1100px)', height: 'min(80vh, 700px)' }}
          >
            <Image
              src={images[lightbox]!.url}
              alt={images[lightbox]!.alt ?? ''}
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
              priority
            />
          </div>

          {/* next */}
          <button
            onClick={e => { e.stopPropagation(); nextLightbox() }}
            disabled={lightbox === images.length - 1}
            aria-label="Next image"
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
              fontSize: 28, padding: '12px 18px', cursor: lightbox < images.length - 1 ? 'pointer' : 'default',
              opacity: lightbox < images.length - 1 ? 1 : 0.25, borderRadius: 4,
            }}
          >›</button>

          {/* thumbnail strip */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 8,
            }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  style={{
                    position: 'relative', width: 64, height: 48, borderRadius: 3,
                    overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                    outline: i === lightbox ? '2px solid #009bdb' : '2px solid transparent',
                    opacity: i === lightbox ? 1 : 0.55,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <Image src={img.url} alt={img.alt ?? ''} fill style={{ objectFit: 'cover' }} sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

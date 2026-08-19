'use client'

import { useState, useEffect, useCallback } from 'react'

type Props = { images: { src: string; alt: string }[] }

export function FitnessGallery({ images }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox((i) => (i !== null ? Math.max(0, i - 1) : null)), [])
  const next = useCallback(
    () => setLightbox((i) => (i !== null ? Math.min(images.length - 1, i + 1) : null)),
    [images.length],
  )

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, close, prev, next])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {images.map((img, i) => (
          <div
            key={img.src}
            onClick={() => setLightbox(i)}
            style={{ aspectRatio: '4/3', overflow: 'hidden', cursor: 'zoom-in' }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '0.75')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '1')}
            />
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={close}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 32,
              lineHeight: 1,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>

          <span
            style={{
              position: 'absolute',
              top: 22,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              letterSpacing: '0.1em',
            }}
          >
            {lightbox + 1} / {images.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            disabled={lightbox === 0}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              padding: '12px 18px',
              cursor: lightbox > 0 ? 'pointer' : 'default',
              opacity: lightbox > 0 ? 1 : 0.25,
              borderRadius: 4,
            }}
          >
            ‹
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(90vw, 1100px)',
              height: 'min(80vh, 700px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={images[lightbox]!.src}
              alt={images[lightbox]!.alt}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            disabled={lightbox === images.length - 1}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              padding: '12px 18px',
              cursor: lightbox < images.length - 1 ? 'pointer' : 'default',
              opacity: lightbox < images.length - 1 ? 1 : 0.25,
              borderRadius: 4,
            }}
          >
            ›
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.src}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox(i)
                }}
                style={{
                  width: 64,
                  height: 48,
                  overflow: 'hidden',
                  borderRadius: 3,
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: i === lightbox ? '2px solid #009bdb' : '2px solid transparent',
                  opacity: i === lightbox ? 1 : 0.55,
                  transition: 'opacity 0.15s',
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

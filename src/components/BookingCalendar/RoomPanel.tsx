'use client'

import Image from 'next/image'

import type { RoomImage } from '@/lib/roomImages'

type Props = {
  images: RoomImage[]
  roomName?: string
  roomMeta?: string
  /** 'aside' is the left column of the desktop popup; 'banner' sits on top of the phone popup. */
  layout: 'aside' | 'banner'
  photosLabel: string
  onOpenGallery: (index: number) => void
}

const MAX_THUMBNAILS = 4

/** The room summary of the booking popup: a photo that opens the gallery, thumbnails, name and facts. */
export function RoomPanel({
  images,
  roomName,
  roomMeta,
  layout,
  photosLabel,
  onOpenGallery,
}: Props) {
  const isAside = layout === 'aside'
  const hero = images[0]
  const thumbnails = images.slice(1, 1 + MAX_THUMBNAILS)
  const hiddenCount = images.length - 1 - thumbnails.length

  return (
    <div
      style={{
        flexShrink: 0,
        width: isAside ? 340 : '100%',
        background: '#f8fafc',
        borderRight: isAside ? '1px solid #e2e8f0' : 'none',
        overflowY: isAside ? 'auto' : 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {hero && (
        <button
          type="button"
          onClick={() => onOpenGallery(0)}
          aria-label={`${photosLabel}: ${roomName ?? ''}`}
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            height: isAside ? 240 : 170,
            padding: 0,
            border: 'none',
            background: '#e2e8f0',
            cursor: 'zoom-in',
            flexShrink: 0,
          }}
        >
          <Image
            src={hero.url}
            alt={hero.alt ?? roomName ?? ''}
            fill
            sizes={isAside ? '340px' : '100vw'}
            style={{ objectFit: 'cover' }}
          />
          <span
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              background: 'rgba(15,23,42,0.72)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 999,
            }}
          >
            {photosLabel}
          </span>
        </button>
      )}

      {isAside && thumbnails.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 8px 0' }}>
          {thumbnails.map((image, i) => {
            const isLastWithMore = i === thumbnails.length - 1 && hiddenCount > 0
            return (
              <button
                key={image.url}
                type="button"
                onClick={() => onOpenGallery(i + 1)}
                aria-label={`${photosLabel} ${i + 2}`}
                style={{
                  position: 'relative',
                  flex: 1,
                  height: 58,
                  padding: 0,
                  border: 'none',
                  borderRadius: 6,
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  background: '#e2e8f0',
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? ''}
                  fill
                  sizes="80px"
                  style={{ objectFit: 'cover' }}
                />
                {isLastWithMore && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(15,23,42,0.6)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    +{hiddenCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {roomName && (
        <div style={{ padding: isAside ? '16px 16px 20px' : '14px 16px 4px' }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{roomName}</p>
          {roomMeta && (
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>{roomMeta}</p>
          )}
        </div>
      )}
    </div>
  )
}

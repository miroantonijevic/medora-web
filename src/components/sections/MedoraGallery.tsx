'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

const GALLERY_IMAGES = [
  { src: '/gallery/mainpage_hotel.png', alt: 'Medora Auri hotel exterior' },
  { src: '/gallery/mainpage_skywalk.png', alt: 'Skywalk Biokovo' },
  { src: '/gallery/mainpage_room.png', alt: 'Guest room' },
  { src: '/gallery/2.png', alt: 'Pool area' },
  { src: '/gallery/new.png', alt: 'Beach view' },
  { src: '/gallery/4.png', alt: 'Garden & terrace' },
  { src: '/gallery/7.png', alt: 'Hotel amenities' },
  { src: '/gallery/0S3A3192.jpg', alt: 'Aerial view' },
]

type Props = {
  title?: string
  viewAllLabel?: string
}

export function MedoraGallery({ title = 'Gallery', viewAllLabel = 'view all' }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)

  return (
    <section style={{ padding: '60px 0', background: '#fffaf5' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          marginBottom: '32px',
        }}
      >
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#11131e',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <Link
          href="/gallery"
          style={{
            fontSize: '13px',
            color: '#009bdb',
            textDecoration: 'none',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#11131e')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#009bdb')}
        >
          {viewAllLabel}
        </Link>
      </div>

      {/* Horizontal scrollable row */}
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {GALLERY_IMAGES.map((img, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '430px',
              height: '365px',
              borderRadius: '6px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="430px"
              style={{ objectFit: 'cover', transition: 'opacity 0.3s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '0.5')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '1')}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useRef } from 'react'

export type RoomCard = {
  image: string
  alt: string
  name: string
  href: string
}

const defaultRooms: RoomCard[] = [
  {
    image: '/rooms/double-room.jpg',
    alt: 'Comfort double room with partial sea view',
    name: 'Comfort Double Rooms',
    href: '/accommodation/rooms/double',
  },
  {
    image: '/rooms/family-room.jpg',
    alt: 'Superior family room',
    name: 'Superior Family Rooms',
    href: '/accommodation/rooms/family',
  },
  {
    image: '/rooms/suite.jpg',
    alt: 'Deluxe suite living room',
    name: 'Deluxe Suites',
    href: '/accommodation/rooms/suites',
  },
]

type Props = {
  rooms?: RoomCard[]
  title?: string
  viewAllLabel?: string
  viewAllHref?: string
}

export function MedoraRoomsGrid({ rooms = defaultRooms, title = 'Rooms', viewAllLabel = 'view all', viewAllHref = '/accommodation' }: Props) {
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
          href={viewAllHref}
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

      {/* Horizontally scrollable row */}
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {rooms.map((room) => (
          <Link
            key={room.href}
            href={room.href}
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '400px',
              height: '320px',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'block',
              textDecoration: 'none',
            }}
          >
            <Image
              src={room.image}
              alt={room.alt}
              fill
              sizes="400px"
              style={{ objectFit: 'cover' }}
            />
            {/* Gradient overlay on bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
            {/* Title absolute bottom-left */}
            <h3
              className="room-card-title"
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 700,
                margin: 0,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = 'translateY(-20px)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')
              }
            >
              {room.name}
            </h3>
          </Link>
        ))}
      </div>

      <style>{`
        a:hover .room-card-title {
          transform: translateY(-20px);
        }
      `}</style>
    </section>
  )
}

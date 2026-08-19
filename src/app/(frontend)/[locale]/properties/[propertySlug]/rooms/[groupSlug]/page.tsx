import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import {
  getPropertyBySlug,
  getPublishedProperties,
  getRoomGroupBySlug,
  getRoomGroupChildren,
  getRoomsByGroup,
} from '@/lib/queries'
import { bookingService } from '@/lib/booking'

type Args = {
  params: Promise<{ propertySlug: string; groupSlug: string; locale: string }>
}

export async function generateStaticParams() {
  // Dynamic — no static params needed; groups come from DB
  return []
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { propertySlug, groupSlug, locale } = await paramsPromise
  const [property, group] = await Promise.all([
    getPropertyBySlug(propertySlug),
    getRoomGroupBySlug(groupSlug, locale),
  ])
  if (!property) return {}
  return {
    title: `${group ? String(group.name) : groupSlug} — ${String(property.name)} | Medora Hotels`,
  }
}

export default async function RoomGroupPage({ params: paramsPromise }: Args) {
  const { propertySlug, groupSlug, locale } = await paramsPromise
  setRequestLocale(locale)

  const [tRooms, tNav, tCommon, property, group] = await Promise.all([
    getTranslations({ locale, namespace: 'rooms' }),
    getTranslations({ locale, namespace: 'navigation' }),
    getTranslations({ locale, namespace: 'common' }),
    getPropertyBySlug(propertySlug),
    getRoomGroupBySlug(groupSlug, locale),
  ])

  if (!property || !group) return notFound()

  const groupName = String(group.name)
  const children = await getRoomGroupChildren(group.id as number, locale)

  // If this group has sub-groups, show them as cards
  if (children.length > 0) {
    return (
      <main>
        <div style={{ background: '#012B59', padding: '48px clamp(24px, 4vw, 48px) 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <nav
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 16,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                {tNav('home')}
              </Link>
              <span style={{ margin: '0 6px' }}>/</span>
              <Link
                href={`/properties/${propertySlug}`}
                style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
              >
                {String(property.name)}
              </Link>
              <span style={{ margin: '0 6px' }}>/</span>
              <Link
                href={`/properties/${propertySlug}/rooms`}
                style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
              >
                {tNav('rooms')}
              </Link>
              <span style={{ margin: '0 6px' }}>/</span>
              <span style={{ color: '#fff' }}>{groupName}</span>
            </nav>
            <h1
              style={{
                color: '#fff',
                fontSize: 'clamp(28px, 3vw, 42px)',
                fontWeight: 700,
                margin: 0,
              }}
            >
              {groupName}
            </h1>
          </div>
        </div>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(40px, 5vh, 64px) clamp(24px, 4vw, 48px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {children.map((child) => {
              const heroImage = child.heroImage as { url?: string; alt?: string } | null
              const childName = String(child.name)
              return (
                <Link
                  key={child.slug}
                  href={`/properties/${propertySlug}/rooms/${child.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '480px 1fr',
                      background: '#fff',
                      border: '1px solid #e8e2d9',
                    }}
                  >
                    <div style={{ position: 'relative', minHeight: 300, overflow: 'hidden' }}>
                      {heroImage?.url ? (
                        <Image
                          src={heroImage.url}
                          alt={heroImage.alt ?? childName}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="480px"
                        />
                      ) : (
                        <div style={{ background: '#e5e0d8', height: '100%' }} />
                      )}
                    </div>
                    <div
                      style={{
                        padding: '44px 48px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(22px, 2.5vw, 32px)',
                          fontWeight: 700,
                          color: '#012B59',
                          margin: '0 0 12px',
                          lineHeight: 1.25,
                        }}
                      >
                        {childName}
                      </h2>
                      {child.description && (
                        <p style={{ fontSize: 14, color: '#666', margin: '0 0 36px' }}>
                          {String(child.description)}
                        </p>
                      )}
                      <span
                        style={{
                          display: 'inline-block',
                          border: '1.5px solid #012B59',
                          color: '#012B59',
                          padding: '12px 30px',
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {tCommon('viewDetails')} →
                      </span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  // Leaf group — show rooms
  const roomsResult = await getRoomsByGroup(group.id as number, locale)
  const rooms = roomsResult.docs

  return (
    <main>
      {/* ── HEADER ── */}
      <div style={{ background: '#012B59', padding: '48px clamp(24px, 4vw, 48px) 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <nav
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 16,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              {tNav('home')}
            </Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link
              href={`/properties/${propertySlug}`}
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
            >
              {String(property.name)}
            </Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link
              href={`/properties/${propertySlug}/rooms`}
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
            >
              {tNav('rooms')}
            </Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#fff' }}>{groupName}</span>
          </nav>
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            {groupName}
          </h1>
        </div>
      </div>

      {/* ── ROOM CARDS ── 2-column photo grid matching medorahotels.com */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(40px, 5vh, 64px) clamp(24px, 4vw, 48px)',
        }}
      >
        {rooms.length === 0 && <p style={{ color: '#666' }}>{tRooms('noRooms')}</p>}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 48,
          }}
        >
          {rooms.map((room) => {
            type MediaDoc = { url?: string; alt?: string }
            const images = (room.images ?? []) as MediaDoc[]
            const heroImg = images[0]
            const bookingLink = bookingService.getBookingLink({
              propertySlug,
              roomSlug: room.slug,
              locale,
            })

            return (
              <article key={room.id}>
                <Link
                  href={`/properties/${propertySlug}/rooms/${groupSlug}/${room.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                    {heroImg?.url ? (
                      <Image
                        src={heroImg.url}
                        alt={heroImg.alt ?? String(room.name)}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div style={{ background: '#e5e0d8', width: '100%', height: '100%' }} />
                    )}
                  </div>
                  <h2
                    style={{
                      fontSize: 'clamp(18px, 1.8vw, 22px)',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      margin: '20px 0 8px',
                      lineHeight: 1.35,
                    }}
                  >
                    {String(room.name)}
                  </h2>
                </Link>
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px' }}>
                  {[
                    room.size && String(room.size),
                    room.bedType && String(room.bedType),
                    room.capacity && `${room.capacity} ${tRooms('guests').toLowerCase()}`,
                  ]
                    .filter(Boolean)
                    .join(' | ')}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a
                    href={bookingLink.href}
                    style={{
                      display: 'inline-block',
                      background: '#012B59',
                      color: '#fff',
                      padding: '11px 28px',
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    {tCommon('bookNow')}
                  </a>
                  <Link
                    href={`/properties/${propertySlug}/rooms/${groupSlug}/${room.slug}`}
                    style={{
                      display: 'inline-block',
                      border: '1.5px solid #333',
                      color: '#333',
                      padding: '10px 24px',
                      fontWeight: 600,
                      fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    {tRooms('select')}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}

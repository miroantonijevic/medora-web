import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { getPropertyBySlug, getPublishedProperties, getRoomBySlug, getRoomsByProperty } from '@/lib/queries'
import { bookingService } from '@/lib/booking'
import { groupFromSlug, groupNameForLocale, groupSlugFromCategory } from '@/lib/roomGroups'
import { RichText } from '@/components/RichText'
import { RoomGallery } from '@/components/sections/RoomGallery'

type Args = {
  params: Promise<{ propertySlug: string; groupSlug: string; roomSlug: string; locale: string }>
}

export async function generateStaticParams() {
  const { docs: properties } = await getPublishedProperties()
  const params: { propertySlug: string; groupSlug: string; roomSlug: string }[] = []
  for (const property of properties) {
    const { docs: rooms } = await getRoomsByProperty(property.slug)
    for (const room of rooms) {
      params.push({
        propertySlug: property.slug,
        groupSlug: groupSlugFromCategory(String(room.category ?? '')),
        roomSlug: room.slug,
      })
    }
  }
  return params
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { propertySlug, roomSlug, locale } = await paramsPromise
  const [room, property] = await Promise.all([
    getRoomBySlug(roomSlug, locale),
    getPropertyBySlug(propertySlug),
  ])
  if (!room || !property) return {}
  const firstImage = (room.images as { url?: string }[] | undefined)?.[0]
  return {
    title: `${String(room.name)} — ${String(property.name)} | Medora Hotels`,
    openGraph: {
      title: `${String(room.name)} — ${String(property.name)} | Medora Hotels`,
      images: firstImage?.url ? [{ url: firstImage.url, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function RoomDetailPage({ params: paramsPromise }: Args) {
  const { propertySlug, groupSlug, roomSlug, locale } = await paramsPromise
  setRequestLocale(locale)

  const [tRooms, tNav, tCommon, room, property] = await Promise.all([
    getTranslations({ locale, namespace: 'rooms' }),
    getTranslations({ locale, namespace: 'navigation' }),
    getTranslations({ locale, namespace: 'common' }),
    getRoomBySlug(roomSlug, locale),
    getPropertyBySlug(propertySlug),
  ])

  if (!room || !property) return notFound()

  const group = groupFromSlug(groupSlug)
  const groupName = group ? groupNameForLocale(group, locale) : tNav('rooms')

  type MediaDoc = { url?: string; alt?: string }
  const images = ((room.images ?? []) as MediaDoc[]).filter((img): img is Required<MediaDoc> => Boolean(img.url))
  const heroImage = images[0]
  const bookingLink = bookingService.getBookingLink({ propertySlug, roomSlug })
  type Inclusion = { label?: unknown }
  const inclusions = (room.inclusions ?? []) as Inclusion[]

  return (
    <main>
      {/* ── 1. HERO ── */}
      <div style={{ position: 'relative', width: '100%', height: '65vh', minHeight: 420, background: '#1a2a3a' }}>
        {heroImage && (
          <Image
            src={heroImage.url}
            alt={heroImage.alt ?? String(room.name)}
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 'clamp(24px, 4vh, 44px) clamp(24px, 4vw, 48px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16,
        }}>
          <h1 style={{
            color: '#fff', fontSize: 'clamp(26px, 3.5vw, 50px)', fontWeight: 700,
            margin: 0, lineHeight: 1.2, textShadow: '0 2px 12px rgba(0,0,0,0.5)', maxWidth: '60%',
          }}>
            {String(room.name)}
          </h1>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <a
              href="#gallery"
              style={{
                padding: '11px 22px', border: '2px solid rgba(255,255,255,0.85)',
                color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)',
                whiteSpace: 'nowrap',
              }}
            >
              {tRooms('viewGallery')}
            </a>
            <a
              href={bookingLink.href}
              style={{
                padding: '11px 22px', background: '#009bdb', border: '2px solid #009bdb',
                color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}
            >
              {tCommon('bookNow')}
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. BREADCRUMB ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 4vw, 48px)' }}>
        <nav
          style={{ fontSize: 13, color: '#888', padding: '14px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
          aria-label="breadcrumb"
        >
          <Link href="/" style={{ color: '#009bdb', textDecoration: 'none' }}>{tNav('home')}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <Link href={`/properties/${propertySlug}`} style={{ color: '#009bdb', textDecoration: 'none' }}>{String(property.name)}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <Link href={`/properties/${propertySlug}/rooms`} style={{ color: '#009bdb', textDecoration: 'none' }}>{tNav('rooms')}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <Link href={`/properties/${propertySlug}/rooms/${groupSlug}`} style={{ color: '#009bdb', textDecoration: 'none' }}>{groupName}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <span style={{ color: '#555' }}>{String(room.name)}</span>
        </nav>
      </div>
      <div style={{ borderTop: '1px solid #e5e0d8', margin: '0 clamp(24px, 4vw, 48px)' }} />

      {/* ── 3. TWO-COLUMN INFO: description | capacity + inquiry ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: 'clamp(32px, 5vh, 56px) clamp(24px, 4vw, 48px)',
        display: 'grid', gridTemplateColumns: '1fr 360px',
        gap: 'clamp(32px, 5vw, 64px)', alignItems: 'start',
        borderBottom: '1px solid #e5e0d8',
      }}>
        <div style={{ fontSize: 18, lineHeight: 1.75, color: '#333' }}>
          {room.description && (
            <RichText data={room.description as Parameters<typeof RichText>[0]['data']} />
          )}
        </div>
        <aside style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div>
            <p style={{
              fontSize: 11, color: '#999', textTransform: 'uppercase',
              letterSpacing: '0.14em', fontWeight: 600, marginBottom: 14, marginTop: 0,
            }}>
              {tRooms('capacity')}
            </p>
            {room.capacity && (
              <p style={{ fontSize: 17, color: '#222', margin: '0 0 6px', fontWeight: 600 }}>
                {room.capacity} {tRooms('guests').toLowerCase()}
              </p>
            )}
            {room.size && (
              <p style={{ fontSize: 17, color: '#222', margin: '0 0 6px' }}>{String(room.size)}</p>
            )}
            {room.bedType && (
              <p style={{ fontSize: 17, color: '#222', margin: '0 0 6px' }}>{String(room.bedType)}</p>
            )}
          </div>
          <Link
            href={`/inquiry?property=${propertySlug}&room=${roomSlug}`}
            style={{
              display: 'inline-block', textAlign: 'center',
              border: '1.5px solid #012B59', color: '#012B59',
              background: '#fff', fontWeight: 600, padding: '12px 22px',
              textDecoration: 'none', fontSize: 13, whiteSpace: 'nowrap',
              letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
            }}
          >
            {tCommon('sendInquiry')}
          </Link>
        </aside>
      </div>

      {/* ── 4. SADRŽAJ ── */}
      {inclusions.length > 0 && (
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(40px, 6vh, 64px) clamp(24px, 4vw, 48px)',
          borderBottom: '1px solid #e5e0d8',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(20px, 2vw, 28px)', fontWeight: 700, color: '#012B59', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {tRooms('included')}
            </h2>
          </div>
          <ul style={{
            listStyle: 'none', padding: 0, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0 40px', maxWidth: 760,
          }}>
            {inclusions.map((inc, i) => (
              <li key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                fontSize: 14, color: '#333',
                padding: '10px 0', borderBottom: '1px solid #f0ebe3',
              }}>
                <span style={{ color: '#009bdb', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {String(inc.label ?? '')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 5. GALLERY ── */}
      {images.length > 0 && (
        <RoomGallery images={images} viewGalleryLabel={tRooms('viewGallery')} />
      )}
    </main>
  )
}

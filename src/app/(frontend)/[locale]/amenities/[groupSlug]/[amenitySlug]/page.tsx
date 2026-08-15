import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { getAmenityBySlug, getAmenityGroupBySlug, getAmenitiesByGroup } from '@/lib/queries'
import { RoomGallery } from '@/components/sections/RoomGallery'
import { RichText } from '@/components/RichText'

type Args = {
  params: Promise<{ groupSlug: string; amenitySlug: string; locale: string }>
}

export async function generateStaticParams() {
  const { getAmenityGroups } = await import('@/lib/queries')
  const groups = await getAmenityGroups()
  const params: { groupSlug: string; amenitySlug: string }[] = []
  for (const group of groups) {
    const amenities = await getAmenitiesByGroup(group.slug as string)
    for (const a of amenities) {
      params.push({ groupSlug: group.slug as string, amenitySlug: a.slug as string })
    }
  }
  return params
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { amenitySlug, locale } = await paramsPromise
  const amenity = await getAmenityBySlug(amenitySlug, locale)
  if (!amenity) return {}
  const img = amenity.heroImage as { url?: string } | null
  return {
    title: `${String(amenity.name)} — Medora Hotels`,
    openGraph: img?.url ? { images: [{ url: img.url, width: 1200, height: 630 }] } : undefined,
  }
}

export default async function AmenityDetailPage({ params: paramsPromise }: Args) {
  const { groupSlug, amenitySlug, locale } = await paramsPromise
  setRequestLocale(locale)

  const [tNav, amenity, group] = await Promise.all([
    getTranslations({ locale, namespace: 'navigation' }),
    getAmenityBySlug(amenitySlug, locale),
    getAmenityGroupBySlug(groupSlug, locale),
  ])

  if (!amenity || !group) return notFound()

  type MediaDoc = { url?: string; alt?: string }
  const heroImage = amenity.heroImage as MediaDoc | null
  const images = ((amenity.images ?? []) as MediaDoc[]).filter((i): i is Required<MediaDoc> => Boolean(i.url))
  type Highlight = { text?: unknown }
  const highlights = (amenity.highlights ?? []) as Highlight[]

  return (
    <main>
      {/* ── HERO ── */}
      <div style={{ position: 'relative', width: '100%', height: '60vh', minHeight: 380, background: '#1a2a3a' }}>
        {heroImage?.url && (
          <Image src={heroImage.url} alt={heroImage.alt ?? String(amenity.name)} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(24px, 4vh, 44px) clamp(24px, 4vw, 48px)' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(26px, 3.5vw, 50px)', fontWeight: 700, margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            {String(amenity.name)}
          </h1>
          {amenity.tagline && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(14px, 1.5vw, 18px)', margin: '8px 0 0', fontStyle: 'italic' }}>
              {String(amenity.tagline)}
            </p>
          )}
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 4vw, 48px)' }}>
        <nav style={{ fontSize: 13, color: '#888', padding: '14px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#009bdb', textDecoration: 'none' }}>{tNav('home')}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <Link href={`/amenities/${groupSlug}`} style={{ color: '#009bdb', textDecoration: 'none' }}>{String(group.name)}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <span style={{ color: '#555' }}>{String(amenity.name)}</span>
        </nav>
      </div>
      <div style={{ borderTop: '1px solid #e5e0d8', margin: '0 clamp(24px, 4vw, 48px)' }} />

      {/* ── CONTENT + META ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px, 5vh, 56px) clamp(24px, 4vw, 48px)', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'start' }}>
        <div style={{ fontSize: 18, lineHeight: 1.75, color: '#333' }}>
          {amenity.description && (
            <RichText data={amenity.description as Parameters<typeof RichText>[0]['data']} />
          )}
        </div>
        <aside style={{ border: '1px solid #e5e0d8', padding: 28 }}>
          {highlights.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
              {highlights.map((h, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0ebe3', fontSize: 14, color: '#333' }}>
                  <span style={{ color: '#009bdb', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {String(h.text ?? '')}
                </li>
              ))}
            </ul>
          )}
          {amenity.openingHours && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, margin: '0 0 6px' }}>Opening Hours</p>
              <p style={{ fontSize: 15, color: '#222', margin: 0 }}>{String(amenity.openingHours)}</p>
            </div>
          )}
          {amenity.location && (
            <div>
              <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, margin: '0 0 6px' }}>Location</p>
              <p style={{ fontSize: 15, color: '#222', margin: 0 }}>{String(amenity.location)}</p>
            </div>
          )}
        </aside>
      </div>

      {/* ── GALLERY ── */}
      {images.length > 0 && <RoomGallery images={images} />}
    </main>
  )
}

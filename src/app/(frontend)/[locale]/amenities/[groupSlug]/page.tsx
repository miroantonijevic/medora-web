import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { getAmenityGroupBySlug, getAmenityGroups, getAmenitiesByGroup } from '@/lib/queries'

type Args = {
  params: Promise<{ groupSlug: string; locale: string }>
}

export async function generateStaticParams() {
  const groups = await getAmenityGroups()
  return groups.map((g) => ({ groupSlug: g.slug as string }))
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { groupSlug, locale } = await paramsPromise
  const group = await getAmenityGroupBySlug(groupSlug, locale)
  if (!group) return {}
  return { title: `${String(group.name)} — Medora Hotels` }
}

export default async function AmenityGroupPage({ params: paramsPromise }: Args) {
  const { groupSlug, locale } = await paramsPromise
  setRequestLocale(locale)

  const [tNav, group, amenities] = await Promise.all([
    getTranslations({ locale, namespace: 'navigation' }),
    getAmenityGroupBySlug(groupSlug, locale),
    getAmenitiesByGroup(groupSlug, locale),
  ])

  if (!group) return notFound()

  type MediaDoc = { url?: string; alt?: string }

  return (
    <main>
      {/* ── HERO ── */}
      {(group.heroImage as MediaDoc | null)?.url && (
        <div style={{ position: 'relative', width: '100%', height: '45vh', minHeight: 320, background: '#1a2a3a' }}>
          <Image
            src={(group.heroImage as MediaDoc).url!}
            alt={(group.heroImage as MediaDoc).alt ?? String(group.name)}
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(24px, 4vh, 44px) clamp(24px, 4vw, 48px)' }}>
            <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              {String(group.name)}
            </h1>
          </div>
        </div>
      )}

      {/* ── BREADCRUMB ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 4vw, 48px)' }}>
        <nav style={{ fontSize: 13, color: '#888', padding: '14px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#009bdb', textDecoration: 'none' }}>{tNav('home')}</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <span style={{ color: '#555' }}>{String(group.name)}</span>
        </nav>
      </div>
      <div style={{ borderTop: '1px solid #e5e0d8', margin: '0 clamp(24px, 4vw, 48px)' }} />

      {/* ── DESCRIPTION ── */}
      {group.description && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px, 5vh, 52px) clamp(24px, 4vw, 48px)', fontSize: 18, lineHeight: 1.75, color: '#333' }}>
          <p style={{ margin: 0 }}>{String(group.description)}</p>
        </div>
      )}

      {/* ── AMENITY CARDS ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px, 5vh, 64px) clamp(24px, 4vw, 48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {amenities.map((item) => {
            const img = item.heroImage as MediaDoc | null
            return (
              <Link
                key={item.id}
                href={`/amenities/${groupSlug}/${item.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', border: '1px solid #e5e0d8' }}
              >
                {img?.url && (
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <Image src={img.url} alt={img.alt ?? String(item.name)} fill style={{ objectFit: 'cover' }} sizes="400px" />
                  </div>
                )}
                <div style={{ padding: '20px 24px', flex: 1 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#012B59', margin: '0 0 8px' }}>{String(item.name)}</h2>
                  {item.tagline && <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px', fontStyle: 'italic' }}>{String(item.tagline)}</p>}
                  {item.openingHours && <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{String(item.openingHours)}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

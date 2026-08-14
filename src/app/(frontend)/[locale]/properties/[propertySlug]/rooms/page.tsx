import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { getPropertyBySlug, getPublishedProperties, getRoomSubGroups } from '@/lib/queries'

type Args = {
  params: Promise<{ propertySlug: string; locale: string }>
}

export async function generateStaticParams() {
  const { docs } = await getPublishedProperties()
  return docs.map((p) => ({ propertySlug: p.slug }))
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { propertySlug } = await paramsPromise
  const property = await getPropertyBySlug(propertySlug)
  return {
    title: property ? `Rooms — ${String(property.name)} | Medora Hotels` : 'Rooms | Medora Hotels',
  }
}

export default async function RoomsGroupsPage({ params: paramsPromise }: Args) {
  const { propertySlug, locale } = await paramsPromise
  setRequestLocale(locale)

  const [tNav, property, groups] = await Promise.all([
    getTranslations({ locale, namespace: 'navigation' }),
    getPropertyBySlug(propertySlug),
    getRoomSubGroups(propertySlug, locale),
  ])

  if (!property) return notFound()

  return (
    <main>
      {/* ── HEADER ── */}
      <div style={{ background: '#012B59', padding: '48px clamp(24px, 4vw, 48px) 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{tNav('home')}</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href={`/properties/${propertySlug}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{String(property.name)}</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#fff' }}>{tNav('rooms')}</span>
          </nav>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 700, margin: 0 }}>
            {tNav('rooms')}
          </h1>
        </div>
      </div>

      {/* ── PHOTO GRID ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px, 5vh, 64px) clamp(24px, 4vw, 48px)' }}>
        {groups.length === 0 && (
          <p style={{ color: '#666' }}>No room categories available.</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 4 }}>
          {groups.map((group) => {
            const heroImage = group.heroImage as { url?: string; alt?: string } | null
            const groupName = String(group.name)
            return (
              <Link
                key={group.slug}
                href={`/properties/${propertySlug}/rooms/${group.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer' }}>
                  {heroImage?.url ? (
                    <Image
                      src={heroImage.url}
                      alt={heroImage.alt ?? groupName}
                      fill
                      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div style={{ background: '#c8bfb0', width: '100%', height: '100%' }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
                  }} />
                  <h2 style={{
                    position: 'absolute', bottom: 20, left: 20,
                    color: '#fff', fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 700,
                    margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}>
                    {groupName}
                  </h2>
                </article>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}


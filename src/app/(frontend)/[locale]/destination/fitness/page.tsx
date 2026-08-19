import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ExternalImageGallery } from '@/components/sections/ExternalImageGallery'

export const metadata: Metadata = {
  title: 'Fitness | Medora Hotels',
  description:
    'A fitness experience for the complete vacation — expertly equipped gym with sea views at Medora Auri Hotel.',
}

const BASE = 'https://medorahotels.com/UserDocsImages'

const GALLERY = [
  `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness%20II.jpg`,
  `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness%20I.jpg`,
  `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness%20III.jpg`,
  `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness.jpg`,
  `${BASE}/galerije/Interijer/Medora%20Auri%20Girije.jpg`,
]

type Args = { params: Promise<{ locale: string }> }

export default async function FitnessPage({ params }: Args) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main>
      {/* Hero */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img
          src={`${BASE}//galerije/Wellness-Spa/gym%20desktop.jpg`}
          alt="Fitness centre at Medora Auri"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Fitness title overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: 48,
            color: '#fff',
            fontSize: 48,
            fontWeight: 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          Fitness
        </div>
        {/* Working hours card */}
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            padding: '28px 36px',
            minWidth: 260,
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: 8,
            }}
          >
            Working Hours
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            07 - 21 h
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
            <a
              href="tel:+38521602101"
              style={{
                display: 'block',
                color: '#009bdb',
                textDecoration: 'none',
                fontSize: 15,
                marginBottom: 6,
              }}
            >
              +385 (0)21 602 101
            </a>
            <a
              href="mailto:reservations@medorahotels.com"
              style={{ display: 'block', color: '#009bdb', textDecoration: 'none', fontSize: 13 }}
            >
              reservations@medorahotels.com
            </a>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav
        style={{
          padding: '14px 48px',
          fontSize: 13,
          color: '#888',
          borderBottom: '1px solid #f0ebe3',
          background: '#faf7f2',
        }}
      >
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>
          Medora
        </Link>
        {' / '}
        <Link href="/destination/active-vacation" style={{ color: '#888', textDecoration: 'none' }}>
          Destination
        </Link>
        {' / '}
        <Link href="/destination/active-vacation" style={{ color: '#888', textDecoration: 'none' }}>
          Things to do
        </Link>
        {' / '}
        <Link href="/destination/wellness" style={{ color: '#888', textDecoration: 'none' }}>
          Dream holiday
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 48px' }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 32,
          }}
        >
          An active vacation for active pleasure
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.75, color: '#444', marginBottom: 24 }}>
          An active vacation is not reserved for those who want to fill their daily lives with
          physical activities and excitement; it is also intended for those who want to explore
          something different, discover unique content and let new exciting experiences take over.
          The best place to start your active vacation is definitely the Medora Auri Hotel fitness
          centre.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.75, color: '#444', marginBottom: 56 }}>
          An expertly equipped space to satisfy the highest standards will enable each and every
          user to enjoy a daily dose of physical activity, and all with a lovely view of the sea.
        </p>

        {/* Gallery */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: 20,
          }}
        >
          Fitness photo gallery
        </p>
        <ExternalImageGallery
          images={GALLERY.map((src, i) => ({ src, alt: `Fitness centre ${i + 1}` }))}
        />
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ExternalImageGallery } from '@/components/sections/ExternalImageGallery'

export const metadata: Metadata = {
  title: 'Spa (9th floor) | Medora Hotels',
  description:
    'Finnish & infrared sauna, whirlpool and relax zone on the 9th floor of Medora Auri Hotel.',
}

const BASE = 'https://medorahotels.com/UserDocsImages'

const GALLERY = [
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%206.jpg`,
    alt: 'Medora Auri Wellness spa',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%207.jpg`,
    alt: 'Medora Auri Wellness sauna',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%2010.jpg`,
    alt: 'Medora Auri Wellness relaxation',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%201.jpg`,
    alt: 'Medora Auri Wellness pool',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%2011.jpg`,
    alt: 'Medora Auri Wellness interior',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%203.jpg`,
    alt: 'Medora Auri Wellness lounge',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%204.jpg`,
    alt: 'Medora Auri Wellness treatment',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%208.jpg`,
    alt: 'Medora Auri Wellness steam',
  },
  {
    src: `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%209.jpg`,
    alt: 'Medora Auri Wellness jacuzzi',
  },
]

type Args = { params: Promise<{ locale: string }> }

export default async function SpaPage({ params }: Args) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main>
      {/* Hero */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img
          src={`${BASE}//galerije/Wellness-Spa/spa%20people%20desktop.jpg`}
          alt="Spa at Medora Auri"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Title overlay */}
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
          Spa (9th floor)
        </div>
        {/* Info card */}
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            padding: '28px 36px',
            minWidth: 280,
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
              marginBottom: 16,
            }}
          >
            Working Hours
          </div>
          <div style={{ borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 16 }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#009bdb', fontSize: 18 }}>✓</span>
            <span style={{ fontSize: 15, color: '#333' }}>Finnish &amp; infrared sauna</span>
          </div>
          <Link
            href="/inquiry"
            style={{
              display: 'block',
              background: '#012B59',
              color: '#fff',
              padding: '14px 24px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            Send an inquiry
          </Link>
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
        <h2
          style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 32,
          }}
        >
          Stress doesn&apos;t live here anymore
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            marginBottom: 48,
            alignItems: 'start',
          }}
        >
          <div>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', marginBottom: 20 }}>
              Exposure to stressful situations is a part of everyday life that leaves more or less
              visible traces on all of us. That is why relaxation is of the utmost importance to our
              physical and mental health. Why not start right here and right now?
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', marginBottom: 20 }}>
              In accordance with the highest professional standards, and above all in accordance
              with your needs and expectations, we offer tested methods of relaxation to cleanse
              your body and soul of any traces of stress.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444' }}>
              For a pleasant and total detoxification, we propose the Finnish or infrared sauna. If
              you just want to enjoy the peace and tranquillity, we suggest the relaxation room, and
              if you are a fan of massage or are about to become one, we offer a number of free
              treatments that you will want to repeat every day.
            </p>
          </div>
          <div>
            <img
              src={`${BASE}/galerije/Interijer/welness%20cover.jpg`}
              alt="Wellness at Medora Auri"
              style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* Contact info strip */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            padding: '20px 0',
            borderTop: '1px solid #eee',
            borderBottom: '1px solid #eee',
            marginBottom: 48,
            fontSize: 14,
            color: '#555',
          }}
        >
          <a href="tel:+38521601701" style={{ color: '#009bdb', textDecoration: 'none' }}>
            +385 (0)21 601 701
          </a>
          <a
            href="mailto:reservations@medorahotels.com"
            style={{ color: '#009bdb', textDecoration: 'none' }}
          >
            reservations@medorahotels.com
          </a>
          <span>9th Floor</span>
        </div>

        {/* Free spa section */}
        <h2
          style={{
            fontSize: 'clamp(22px, 3vw, 32px)',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 16,
          }}
        >
          Free spa for your enjoyment!
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', marginBottom: 24 }}>
          Medora Auri Spa offers special treatments to revive your body, feel better and can&apos;t
          wait to come back again.
        </p>
        <ul
          style={{ fontSize: 16, color: '#444', lineHeight: 2, paddingLeft: 24, marginBottom: 56 }}
        >
          <li>Finnish sauna</li>
          <li>Infrared sauna</li>
          <li>Whirlpool</li>
          <li>Relax zone</li>
        </ul>

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
          Spa photo gallery
        </p>
        <ExternalImageGallery images={GALLERY} />

        {/* Send an inquiry CTA */}
        <div
          style={{
            marginTop: 64,
            padding: '40px 48px',
            background: '#f8f5f0',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
            Send an inquiry
          </h3>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 24 }}>
            You can send us an inquiry by filling out a form below or simply call us at +385 21 601
            701
          </p>
          <Link
            href="/inquiry"
            style={{
              display: 'inline-block',
              background: '#012B59',
              color: '#fff',
              padding: '14px 40px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Send an inquiry
          </Link>
        </div>
      </div>
    </main>
  )
}

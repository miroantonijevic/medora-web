import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export const metadata: Metadata = {
  title: 'Destination — Makarska Riviera | Medora Hotels',
  description:
    'Discover the Makarska Riviera — crystal-clear Adriatic sea, Biokovo mountain, medieval towns, and island day trips. The perfect Croatian holiday destination.',
}

const HIGHLIGHTS = [
  {
    image: '/gallery/mainpage_skywalk.png',
    title: 'Skywalk Biokovo',
    text: 'A breathtaking glass walkway 1,228 m above sea level with panoramic views of the Adriatic and the islands. Included as a free excursion for Medora guests.',
  },
  {
    image: '/gallery/mainpage_hotel.png',
    title: 'Makarska Riviera',
    text: 'Miles of pebble and sandy beaches backed by the Biokovo massif. Crystal-clear water, vibrant promenades, and the charming old town of Makarska.',
  },
  {
    image: '/gallery/new.png',
    title: 'Island Day Trips',
    text: 'The islands of Brač, Hvar, and Korčula are just a short boat ride away. Explore hidden coves, lavender fields, and ancient towns.',
  },
  {
    image: '/gallery/4.png',
    title: 'Active Holidays',
    text: 'Hiking, cycling, sea kayaking, diving, and windsurfing — the Makarska Riviera offers endless outdoor activities for every level of fitness.',
  },
]

const DISTANCES = [
  { place: 'Split Airport', dist: '65 km', time: '50 min' },
  { place: 'Dubrovnik Airport', dist: '145 km', time: '2 h' },
  { place: 'Makarska old town', dist: '4 km', time: '5 min' },
  { place: 'Skywalk Biokovo', dist: '18 km', time: '25 min' },
  { place: 'Split city centre', dist: '68 km', time: '55 min' },
  { place: 'Hvar (ferry)', dist: '30 km by sea', time: '60 min' },
]

export default function DestinationPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ position: 'relative', height: 480 }}>
        <Image
          src="/gallery/mainpage_skywalk.png"
          alt="Skywalk Biokovo, Makarska Riviera"
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,43,89,0.50)' }} />
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 48,
            color: '#fff',
          }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.8,
              margin: '0 0 8px',
            }}
          >
            Destination
          </p>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Makarska Riviera
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 0' }}>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: '#333',
            textAlign: 'center',
          }}
        >
          Nestled between the turquoise Adriatic and the dramatic Biokovo mountain range, the
          Makarska Riviera is one of Croatia's most beautiful coastal destinations. Medora Hotels
          sits right on the seafront — so the best of the riviera is at your doorstep.
        </p>
      </section>

      {/* Highlights grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#012B59',
            marginBottom: 36,
            textAlign: 'center',
          }}
        >
          What to See & Do
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 28,
          }}
        >
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ position: 'relative', height: 200 }}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div style={{ padding: '20px 22px 24px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#012B59', margin: '0 0 10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: '#555', margin: 0 }}>
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Distances table */}
      <section style={{ background: '#fffaf5', padding: '60px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#012B59',
              marginBottom: 32,
              textAlign: 'center',
            }}
          >
            Getting Here
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: '#012B59', color: '#fff' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>From</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Distance</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Drive time</th>
              </tr>
            </thead>
            <tbody>
              {DISTANCES.map((row, i) => (
                <tr
                  key={row.place}
                  style={{ background: i % 2 === 0 ? '#fff' : '#f4ede8' }}
                >
                  <td style={{ padding: '11px 16px', color: '#333' }}>{row.place}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', color: '#555' }}>{row.dist}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', color: '#555' }}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: '#012B59',
          color: '#fff',
        }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 700, margin: '0 0 16px' }}>
          Ready to experience the Makarska Riviera?
        </h2>
        <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 32px' }}>
          Book directly and get free excursions and beach perks included.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/properties"
            style={{
              background: '#FF914D',
              color: '#fff',
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            View Properties
          </Link>
          <Link
            href="/offers"
            style={{
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.6)',
              color: '#fff',
              fontWeight: 600,
              padding: '12px 28px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            See Current Offers
          </Link>
        </div>
      </section>
    </main>
  )
}

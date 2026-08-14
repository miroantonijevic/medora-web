import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export const metadata: Metadata = {
  title: 'We Think Green | Medora Hotels',
  description:
    'Medora Hotels is committed to sustainable tourism — solar energy, zero single-use plastic, local sourcing, and eco-certified practices on the Makarska Riviera.',
}

const PILLARS = [
  {
    icon: '☀️',
    title: 'Solar Energy',
    text: 'Our rooftop solar installation covers a significant portion of the hotel\'s electricity needs, reducing CO₂ emissions year-round.',
  },
  {
    icon: '🚫',
    title: 'Zero Single-Use Plastic',
    text: 'We have eliminated single-use plastic from guest rooms, restaurants, and the beach area. Refillable dispensers and biodegradable packaging throughout.',
  },
  {
    icon: '🥗',
    title: 'Local Food Sourcing',
    text: 'Our kitchen partners with local farms, fishermen, and producers. Over 70 % of fresh ingredients come from within 50 km of the hotel.',
  },
  {
    icon: '♻️',
    title: 'Waste Reduction',
    text: 'Comprehensive recycling and composting programmes. Food waste from our restaurants is composted and donated to local agriculture.',
  },
  {
    icon: '💧',
    title: 'Water Conservation',
    text: 'Low-flow fixtures, rainwater harvesting for garden irrigation, and guest linen reuse programmes reduce our water consumption by over 30 %.',
  },
  {
    icon: '🌿',
    title: 'Native Landscaping',
    text: 'Hotel gardens use exclusively native Mediterranean plants — lavender, rosemary, and olive trees — requiring minimal watering and supporting local pollinators.',
  },
]

const CERTIFICATIONS = [
  'EU Ecolabel (European Commission)',
  'Travelife Gold',
  'Green Key Croatia',
  'Blue Flag Beach',
]

export default function WeThinkGreenPage() {
  return (
    <main>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          height: 440,
          background: '#1a3a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/gallery/4.png"
          alt="Medora green gardens and seafront"
          fill
          style={{ objectFit: 'cover', opacity: 0.55 }}
          priority
          sizes="100vw"
        />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: '0 24px' }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 12,
              opacity: 0.8,
            }}
          >
            Sustainability
          </p>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            We Think Green
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 18,
              opacity: 0.9,
              maxWidth: 580,
              margin: '16px auto 0',
            }}
          >
            Responsible tourism for a better Adriatic
          </p>
        </div>
      </section>

      {/* Mission statement */}
      <section
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '64px 24px 0',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#2d5a2d',
            marginBottom: 20,
          }}
        >
          Our commitment to the planet
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#444' }}>
          The Makarska Riviera — its mountains, sea, and biodiversity — is the very reason our
          guests visit. We believe it is our responsibility to protect it for future generations.
          Since 2016, Medora Hotels has been systematically reducing its environmental footprint
          across every aspect of operations.
        </p>
      </section>

      {/* Six pillars */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              style={{
                background: '#f0f7f0',
                borderRadius: 8,
                padding: '28px 24px',
                borderLeft: '4px solid #2d5a2d',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{pillar.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2d5a2d', margin: '0 0 10px' }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#555', margin: 0 }}>
                {pillar.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section style={{ background: '#2d5a2d', padding: '60px 24px', color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 36 }}>
            Certifications &amp; Awards
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 4,
                  padding: '10px 22px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                }}
              >
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        style={{
          background: '#fffaf5',
          padding: '60px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 32,
            textAlign: 'center',
          }}
        >
          {[
            { value: '70%', label: 'Local food sourcing' },
            { value: '30%', label: 'Water use reduction' },
            { value: '100%', label: 'Single-use plastic free' },
            { value: '2016', label: 'Year sustainability plan launched' },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: '#2d5a2d',
                  margin: '0 0 6px',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#012B59', marginBottom: 16 }}>
          Stay with a clear conscience
        </h2>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 28 }}>
          Choose Medora Hotels — where every stay supports responsible tourism on the Adriatic.
        </p>
        <Link
          href="/properties"
          style={{
            display: 'inline-block',
            background: '#2d5a2d',
            color: '#fff',
            fontWeight: 700,
            padding: '14px 32px',
            borderRadius: 4,
            textDecoration: 'none',
            fontSize: 15,
          }}
        >
          View Our Properties
        </Link>
      </section>
    </main>
  )
}

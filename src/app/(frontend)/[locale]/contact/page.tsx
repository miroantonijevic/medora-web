import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Contact | Medora Hotels',
  description: 'Get in touch with Medora Hotels. Find our address, phone, email, and FAQ.',
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'contact' }),
    getSiteSettings().catch(() => null),
  ])
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const email = settings?.contactEmail ?? 'reservations@medorahotels.com'
  const phone = settings?.contactPhone ?? '+385 21 601 701'
  const address = settings?.address ? String(settings.address) : 'Podgora, 21327, Croatia'

  const faqItems = t.raw('faqItems') as { q: string; a: string }[]

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 700,
          color: '#012B59',
          marginBottom: 8,
        }}
      >
        {t('title')}
      </h1>
      <p style={{ fontSize: 16, color: '#666', marginBottom: 56 }}>
        {t('subtitle')}
      </p>

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 64,
          marginBottom: 80,
        }}
      >
        {/* Contact details */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#012B59', marginBottom: 28 }}>
            {t('getInTouch')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Email */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#009bdb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                âœ‰
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('email')}
                </p>
                <a
                  href={`mailto:${email}`}
                  style={{ color: '#012B59', fontWeight: 600, fontSize: 16, textDecoration: 'none' }}
                >
                  {email}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#012B59',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                â˜Ž
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('phone')}
                </p>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  style={{ color: '#012B59', fontWeight: 600, fontSize: 16, textDecoration: 'none' }}
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#25D366',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ðŸ’¬
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('whatsapp')}
                </p>
                <a
                  href={`https://wa.me/${phone.replace(/[\s+]/g, '')}`}
                  style={{ color: '#012B59', fontWeight: 600, fontSize: 16, textDecoration: 'none' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('whatsappLabel')}
                </a>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#FF914D',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ðŸ“
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('address')}
                </p>
                <p style={{ margin: 0, color: '#012B59', fontWeight: 600, fontSize: 16, whiteSpace: 'pre-line' }}>
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Quick inquiry CTA */}
          <div style={{ marginTop: 40 }}>
            <a
              href={`mailto:${email}?subject=Booking%20inquiry`}
              style={{
                display: 'inline-block',
                background: '#FF914D',
                color: '#fff',
                fontWeight: 700,
                padding: '14px 32px',
                borderRadius: 4,
                textDecoration: 'none',
                fontSize: 15,
                letterSpacing: '0.04em',
              }}
            >
              {tCommon('sendInquiry')}
            </a>
          </div>
        </div>

        {/* Map placeholder */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#012B59', marginBottom: 28 }}>
            {t('findUs')}
          </h2>
          <div
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              height: 360,
              background: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontSize: 14,
            }}
          >
            {/* Google Maps embed â€” replace src with real embed URL */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2820.0!2d17.0!3d43.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDA2JzAwLjAiTiAxN8KwMDAnMDAuMCJF!5e0!3m2!1sen!2shr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Medora Hotels location"
            />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#012B59',
            marginBottom: 36,
          }}
        >
          {t('faqTitle')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {faqItems.map((item, i) => (
            <details
              key={i}
              style={{
                borderTop: '1px solid #e5e0d8',
                padding: '20px 0',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#012B59',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {item.q}
                <span style={{ fontSize: 20, flexShrink: 0, color: '#009bdb' }}>+</span>
              </summary>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: '#555',
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid #e5e0d8' }} />
        </div>

        <p style={{ marginTop: 32, fontSize: 15, color: '#666' }}>
          {t('faqFallback')}{' '}
          <Link href={`mailto:${email}`} style={{ color: '#009bdb', fontWeight: 600 }}>
            {t('faqFallbackLink')}
          </Link>{' '}
          and we'll respond within 24 hours.
        </p>
      </section>
    </main>
  )
}

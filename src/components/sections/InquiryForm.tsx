'use client'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'

const INPUT: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #ddd',
  padding: '13px 14px',
  fontSize: 15,
  background: '#fff',
  color: '#333',
  fontFamily: 'inherit',
  outline: 'none',
  borderRadius: 0,
}
const LABEL: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 7 }
const LABEL_TEXT: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}

export function InquiryForm() {
  const t = useTranslations('inquiry')
  const tNav = useTranslations('navigation')
  const searchParams = useSearchParams()
  const propertySlug = searchParams.get('property') ?? ''
  const roomSlug = searchParams.get('room') ?? ''
  const offerTitle = searchParams.get('offer') ?? ''
  const defaultRoom = [propertySlug, roomSlug].filter(Boolean).join(' / ')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    arrival: '',
    departure: '',
    adults: '2',
    children: '0',
    roomPreference: defaultRoom,
    message: offerTitle ? `Regarding offer: ${offerTitle}` : '',
    website: '', // honeypot — left empty by real visitors
  })
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)

  function set(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      style={{
        background: '#fffaf5',
        minHeight: '60vh',
        padding: 'clamp(40px, 6vh, 80px) clamp(24px, 4vw, 48px) 80px',
      }}
    >
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <nav
          style={{
            fontSize: 13,
            color: '#888',
            marginBottom: 36,
            display: 'flex',
            flexWrap: 'wrap',
          }}
          aria-label="breadcrumb"
        >
          <Link href="/" style={{ color: '#009bdb', textDecoration: 'none' }}>
            {tNav('home')}
          </Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <span style={{ color: '#555' }}>{t('title')}</span>
        </nav>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 700,
            color: '#012B59',
            marginBottom: 10,
          }}
        >
          {t('title')}
        </h1>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 48, maxWidth: 540 }}>
          {t('subtitle')}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={set}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
          >
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('name')} *</span>
              <input name="name" required value={form.name} onChange={set} style={INPUT} />
            </label>
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('email')} *</span>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={set}
                style={INPUT}
              />
            </label>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
          >
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('phone')}</span>
              <input name="phone" type="tel" value={form.phone} onChange={set} style={INPUT} />
            </label>
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('roomPreference')}</span>
              <input
                name="roomPreference"
                value={form.roomPreference}
                onChange={set}
                style={INPUT}
              />
            </label>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
          >
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('arrival')}</span>
              <input name="arrival" type="date" value={form.arrival} onChange={set} style={INPUT} />
            </label>
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('departure')}</span>
              <input
                name="departure"
                type="date"
                value={form.departure}
                onChange={set}
                style={INPUT}
              />
            </label>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
          >
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('adults')}</span>
              <input
                name="adults"
                type="number"
                min="1"
                max="20"
                value={form.adults}
                onChange={set}
                style={INPUT}
              />
            </label>
            <label style={LABEL}>
              <span style={LABEL_TEXT}>{t('children')}</span>
              <input
                name="children"
                type="number"
                min="0"
                max="10"
                value={form.children}
                onChange={set}
                style={INPUT}
              />
            </label>
          </div>
          <label style={{ ...LABEL, marginBottom: 32 }}>
            <span style={LABEL_TEXT}>{t('message')}</span>
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={set}
              style={{ ...INPUT, resize: 'vertical' }}
            />
          </label>

          <p style={{ fontSize: 13, color: '#888', marginBottom: 24, maxWidth: 560 }}>
            {t('note')}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: '#009bdb',
              color: '#fff',
              border: 'none',
              padding: '16px 44px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: isSubmitting ? 'default' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {t('submit')}
          </button>

          {sent && (
            <p style={{ marginTop: 20, fontSize: 14, color: '#009bdb', fontWeight: 600 }}>
              ✓ {t('submit')} — {t('note')}
            </p>
          )}
          {error && (
            <p style={{ marginTop: 20, fontSize: 14, color: '#c0392b', fontWeight: 600 }}>
              {t('error')}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}

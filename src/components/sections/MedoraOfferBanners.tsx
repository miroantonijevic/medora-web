'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export type OfferBanner = {
  image: string
  alt: string
  headline: string
  ctaLabel: string
  ctaHref: string
}

const defaultOffer: OfferBanner = {
  image: '/brand/special-offers.jpg',
  alt: 'Special offers at Medora Hotels',
  headline: 'Spring offer with FREE LUNCH AND UNLIMITED DRINKS!',
  ctaLabel: 'Find out more',
  ctaHref: '/offers',
}

type Props = {
  offer?: OfferBanner
  ctaLabel?: string
  specialOffersLabel?: string
}

export function MedoraOfferBanners({ offer = defaultOffer, ctaLabel, specialOffersLabel = 'Special offers' }: Props) {
  const resolvedOffer = ctaLabel ? { ...offer, ctaLabel } : offer
  return (
    <section
      style={{
        background: '#fffaf5',
        padding: '60px 0',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '1800px',
          margin: '0 auto',
          overflow: 'hidden',
          minHeight: '320px',
        }}
      >
        {/* Background image */}
        <Image
          src={resolvedOffer.image}
          alt={resolvedOffer.alt}
          fill
          sizes="1800px"
          style={{ objectFit: 'cover' }}
          priority
        />

        {/* Overlay */}
        <div
          className="special-offer-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
        />

        {/* Text absolutely positioned at left: 55px, top: 10% */}
        <div
          style={{
            position: 'absolute',
            left: '55px',
            top: '10%',
            zIndex: 10,
            color: '#fff',
            maxWidth: '500px',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '12px',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {specialOffersLabel}
          </h3>
          <h2
            style={{
              fontSize: '42px',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '28px',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {resolvedOffer.headline}
          </h2>
          <Link
            href={resolvedOffer.ctaHref}
            style={{
              display: 'inline-block',
              background: '#fff',
              color: '#012B59',
              fontSize: '13px',
              fontWeight: 700,
              padding: '12px 28px',
              borderRadius: '4px',
              textDecoration: 'none',
              border: '2px solid #fff',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#012B59'
              el.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#fff'
              el.style.color = '#012B59'
            }}
          >
            {resolvedOffer.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

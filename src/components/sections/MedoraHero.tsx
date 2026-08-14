'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'

export type HeroSlide = {
  image: string
  alt: string
  headline: string
  benefits: string[]
  ctaLabel: string
  ctaHref: string
}

const defaultSlides: HeroSlide[] = [
  {
    image: '/gallery/mainpage_skywalk.png',
    alt: 'Medora hotels – Skywalk Biokovo',
    headline: 'Book here & get FREE:',
    benefits: [
      'Excursion (Skywalk Biokovo / boat trip to islands)',
      'OR',
      'VIP seats at open air musical',
    ],
    ctaLabel: 'Find out more',
    ctaHref: '/offers',
  },
  {
    image: '/hero/mainpage_hotel.png',
    alt: 'Medora Auri Family Beach Resort',
    headline: 'Book here & get FREE:',
    benefits: [
      'Excursion (Skywalk Biokovo / boat trip to islands)',
      'OR',
      'VIP seats at open air musical',
    ],
    ctaLabel: 'View rooms',
    ctaHref: '/accommodation',
  },
  {
    image: '/gallery/mainpage_room.png',
    alt: 'Medora rooms & suites',
    headline: 'Book here & get FREE:',
    benefits: [
      'Excursion (Skywalk Biokovo / boat trip to islands)',
      'OR',
      'VIP seats at open air musical',
    ],
    ctaLabel: 'Book now',
    ctaHref: '/inquiry',
  },
]

type Props = {
  slides?: HeroSlide[]
}

const AUTOPLAY_MS = 5500

export function MedoraHero({ slides = defaultSlides }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [next, paused])

  return (
    <section
      style={{ position: 'relative', width: '100%', height: '640px', overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ))}

      {/* Navy overlay #19287b at 0.4 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(25, 40, 123, 0.40)',
          pointerEvents: 'none',
        }}
      />

      {/* Content — centered */}
      <div
        className="home-benefits-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#fff',
          padding: '0 20px',
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '16px',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            lineHeight: 1.2,
          }}
        >
          {slides[current]?.headline}
        </h2>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 24px',
            fontSize: '17px',
            lineHeight: 1.8,
          }}
        >
          {slides[current]?.benefits.map((b, i) => (
            <li
              key={i}
              style={{
                fontWeight: b === 'OR' ? 700 : 400,
                opacity: b === 'OR' ? 0.7 : 1,
                textTransform: b === 'OR' ? 'uppercase' : 'none',
              }}
            >
              {b}
            </li>
          ))}
        </ul>

        {/* badge_blue.svg — hidden, kept for future use */}
      </div>

      {/* scroll.svg on first slide */}
      {current === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          <Image src="/brand/scroll.svg" alt="Scroll" width={32} height={32} />
        </div>
      )}

      {/* Dot pagination — bottom center */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 20,
          alignItems: 'center',
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? '12px' : '10px',
              height: i === current ? '12px' : '10px',
              borderRadius: '50%',
              background: i === current ? '#009bdb' : 'rgba(255,255,255,0.6)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.3s, width 0.3s, height 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  )
}

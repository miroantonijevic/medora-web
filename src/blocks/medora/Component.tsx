'use client'

import React from 'react'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  backgroundImage?: { url?: string; alt?: string } | null
}

export const MedoraHeroBlockComponent: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  backgroundImage,
}) => {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: backgroundImage?.url
          ? `url(${backgroundImage.url})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(25,40,123,0.40)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: '#fff',
          padding: '0 24px',
        }}
      >
        {eyebrow && (
          <p
            style={{
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 12,
              opacity: 0.85,
            }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 700,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              marginTop: 16,
              fontSize: 18,
              opacity: 0.9,
              maxWidth: 600,
              margin: '16px auto 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

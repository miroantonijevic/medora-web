import React from 'react'

/** Shown in the top-left of the admin nav sidebar */
export const AdminLogo: React.FC = () => (
  <img
    src="/brand/medora-logo-typo.svg"
    alt="Medora Hotels"
    style={{ height: '28px', width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
  />
)

/** Shown as the small square icon (favicon-style) in collapsed nav / browser tab area */
export const AdminIcon: React.FC = () => (
  <img
    src="/brand/badge_blue.svg"
    alt="Medora"
    style={{ height: '28px', width: '28px', display: 'block' }}
  />
)

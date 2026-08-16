import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const homeDuplicateRedirect = {
    source: '/home',
    destination: '/',
    permanent: true,
  }

  const accommodationRedirects = [
    { source: '/en/accommodation', destination: '/en/properties/medora-auri', permanent: false },
    { source: '/hr/accommodation', destination: '/hr/properties/medora-auri', permanent: false },
    { source: '/de/accommodation', destination: '/de/properties/medora-auri', permanent: false },
    {
      source: '/en/accommodation/auri',
      destination: '/en/properties/medora-auri',
      permanent: false,
    },
    {
      source: '/hr/accommodation/auri',
      destination: '/hr/properties/medora-auri',
      permanent: false,
    },
    {
      source: '/de/accommodation/auri',
      destination: '/de/properties/medora-auri',
      permanent: false,
    },
    {
      source: '/en/accommodation/rooms',
      destination: '/en/properties/medora-auri',
      permanent: false,
    },
    {
      source: '/hr/accommodation/rooms',
      destination: '/hr/properties/medora-auri',
      permanent: false,
    },
    {
      source: '/de/accommodation/rooms',
      destination: '/de/properties/medora-auri',
      permanent: false,
    },
  ]

  return [internetExplorerRedirect, homeDuplicateRedirect, ...accommodationRedirects]
}

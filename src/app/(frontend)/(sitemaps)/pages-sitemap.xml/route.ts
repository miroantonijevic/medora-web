import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    // Static routes always included
    const staticRoutes = [
      { loc: `${SITE_URL}/`, lastmod: dateFallback },
      { loc: `${SITE_URL}/properties`, lastmod: dateFallback },
      { loc: `${SITE_URL}/offers`, lastmod: dateFallback },
      { loc: `${SITE_URL}/gallery`, lastmod: dateFallback },
      { loc: `${SITE_URL}/destination`, lastmod: dateFallback },
      { loc: `${SITE_URL}/we-think-green`, lastmod: dateFallback },
      { loc: `${SITE_URL}/contact`, lastmod: dateFallback },
    ]

    // Dynamic: properties + their rooms
    const propertiesResult = await payload.find({
      collection: 'properties',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 100,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })

    const propertyRoutes = propertiesResult.docs.flatMap((p) =>
      p?.slug
        ? [
            { loc: `${SITE_URL}/properties/${p.slug}`, lastmod: p.updatedAt || dateFallback },
            { loc: `${SITE_URL}/properties/${p.slug}/rooms`, lastmod: p.updatedAt || dateFallback },
          ]
        : [],
    )

    // Dynamic: rooms
    const roomsResult = await payload.find({
      collection: 'rooms',
      overrideAccess: false,
      draft: false,
      depth: 1,
      limit: 500,
      pagination: false,
      select: { slug: true, updatedAt: true, property: true },
    })

    const roomRoutes = roomsResult.docs.flatMap((r) => {
      const propSlug =
        r?.property && typeof r.property === 'object' ? (r.property as { slug?: string }).slug : null
      return propSlug && r?.slug
        ? [{ loc: `${SITE_URL}/properties/${propSlug}/rooms/${r.slug}`, lastmod: r.updatedAt || dateFallback }]
        : []
    })

    // Dynamic: offers
    const offersResult = await payload.find({
      collection: 'offers',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 200,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })

    const offerRoutes = offersResult.docs.flatMap((o) =>
      o?.slug ? [{ loc: `${SITE_URL}/offers/${o.slug}`, lastmod: o.updatedAt || dateFallback }] : [],
    )

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => {
            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    return [...staticRoutes, ...propertyRoutes, ...roomRoutes, ...offerRoutes, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}

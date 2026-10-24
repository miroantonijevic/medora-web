// Slugs of the two `properties` documents the site is built around. The homepages, header and room URLs
// are tied to these specific properties, so they live here instead of being repeated as literals.
export const AURI_SLUG = 'medora-auri'
export const ORBIS_SLUG = 'luxury-camp-orbis'

/**
 * The property a (locale-less) path belongs to: the two homepages and everything under
 * /properties/<slug>. Anything else (offers, contact, ...) belongs to neither, so null.
 */
export function propertySlugForPath(pathname: string): string | null {
  if (pathname === '/') return AURI_SLUG
  if (pathname === '/orbis' || pathname.startsWith('/orbis/')) return ORBIS_SLUG
  const slug = /^\/properties\/([^/]+)/.exec(pathname)?.[1]
  return slug === AURI_SLUG || slug === ORBIS_SLUG ? slug : null
}

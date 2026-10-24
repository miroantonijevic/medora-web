import { describe, expect, it } from 'vitest'

import { AURI_SLUG, ORBIS_SLUG, propertySlugForPath } from '@/lib/properties'

describe('propertySlugForPath', () => {
  it.each([
    ['/', AURI_SLUG],
    ['/properties/medora-auri', AURI_SLUG],
    ['/properties/medora-auri/rooms', AURI_SLUG],
    ['/properties/medora-auri/rooms/auri-suites/some-room', AURI_SLUG],
    ['/orbis', ORBIS_SLUG],
    ['/orbis/anything', ORBIS_SLUG],
    ['/properties/luxury-camp-orbis', ORBIS_SLUG],
    ['/properties/luxury-camp-orbis/rooms/orbis-pitches', ORBIS_SLUG],
  ])('%s belongs to %s', (path, slug) => {
    expect(propertySlugForPath(path)).toBe(slug)
  })

  it.each([
    '/offers',
    '/contact',
    '/destination/wellness',
    '/properties',
    '/properties/unknown-hotel/rooms',
    '/orbisfoo',
    '/properties/medora-auri-annex',
  ])('%s belongs to neither property', (path) => {
    expect(propertySlugForPath(path)).toBeNull()
  })
})

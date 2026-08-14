import type { Payload, PayloadRequest } from 'payload'

/**
 * Seed Medora-specific CMS data:
 *  - 2 properties (Medora Auri Hotel, Luxury Camp Orbis)
 *  - 3 rooms for Medora Auri
 *  - 1 active offer
 *  - MainNav global
 *  - SiteSettings global
 */
export async function seedMedoraData({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}) {
  payload.logger.info('  — Seeding Medora properties, rooms, offers, nav...')

  // ── Properties ───────────────────────────────────────────────────────────

  const [auriProp, orbisProp] = await Promise.all([
    payload.create({
      collection: 'properties',
      depth: 0,
      draft: false,
      context: { disableRevalidate: true },
      data: {
        name: 'Medora Auri Family Hotel & Resort',
        slug: 'medora-auri',
        type: 'hotel',
        shortDescription:
          "A sun-drenched beachfront resort on the Makarska Riviera with four pools, a panoramic spa, and a children's club.",
        address: 'Sv. Martina 26, 21327 Podgora, Croatia',
        coordinates: { lat: 43.2439, lng: 17.0761 },
      },
    }),
    payload.create({
      collection: 'properties',
      depth: 0,
      draft: false,
      context: { disableRevalidate: true },
      data: {
        name: 'Luxury Camp Orbis',
        slug: 'luxury-camp-orbis',
        type: 'camp',
        shortDescription:
          'A glamping experience on the Adriatic coast with premium safari tents, private pools, and a spa in the olive groves.',
        address: 'Sv. Martina 34, 21327 Podgora, Croatia',
        coordinates: { lat: 43.2445, lng: 17.0773 },
      },
    }),
  ])

  // ── Rooms (Auri) ─────────────────────────────────────────────────────────

  await Promise.all([
    payload.create({
      collection: 'rooms',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        name: 'Superior Double Sea View',
        slug: 'superior-double-sea-view',
        property: auriProp.id,
        category: 'room',
        capacity: 2,
        size: '28 m²',
        bedType: 'Double bed or twin beds',
        inclusions: [
          { label: 'Free Wi-Fi' },
          { label: 'Air conditioning' },
          { label: 'Balcony with sea view' },
          { label: 'Daily housekeeping' },
          { label: 'Safe, minibar & flat-screen TV' },
        ],
      },
    }),
    payload.create({
      collection: 'rooms',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        name: 'Family Room',
        slug: 'family-room-auri',
        property: auriProp.id,
        category: 'room',
        capacity: 4,
        size: '38 m²',
        bedType: 'Double bed + bunk beds',
        inclusions: [
          { label: 'Free Wi-Fi' },
          { label: 'Air conditioning' },
          { label: "Children's amenity kit" },
          { label: 'Connecting rooms available' },
          { label: 'Daily housekeeping' },
        ],
      },
    }),
    payload.create({
      collection: 'rooms',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        name: 'Junior Suite Sea View',
        slug: 'junior-suite-sea-view',
        property: auriProp.id,
        category: 'suite',
        capacity: 2,
        size: '48 m²',
        bedType: 'King-size bed',
        inclusions: [
          { label: 'Free Wi-Fi' },
          { label: 'Air conditioning' },
          { label: 'Panoramic sea-view terrace' },
          { label: 'Welcome amenity' },
          { label: 'Bathrobe & slippers' },
          { label: 'Premium minibar' },
        ],
      },
    }),
  ])

  // ── Offer ─────────────────────────────────────────────────────────────────

  await payload.create({
    collection: 'offers',
    depth: 0,
    draft: false,
    context: { disableRevalidate: true },
    data: {
      title: 'Early Bird 2025 — Save up to 20%',
      slug: 'early-bird-2025',
      property: auriProp.id,
      validFrom: '2025-05-01',
      validUntil: '2026-09-30',
    },
  })

  // ── MainNav global ────────────────────────────────────────────────────────

  await payload.updateGlobal({
    slug: 'main-nav',
    data: {
      items: [
        { label: 'Accommodation', href: '/properties' },
        { label: 'Special Offers', href: '/offers' },
        { label: 'Gallery', href: '/gallery' },
        { label: 'Destination', href: '/destination' },
        { label: 'We think green', href: '/we-think-green' },
        { label: 'Contact & FAQ', href: '/contact' },
      ],
    },
  })

  // ── SiteSettings global ───────────────────────────────────────────────────

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: 'Medora Hotels',
      contactEmail: 'reservations@medorahotels.com',
      contactPhone: '+385 21 607 990',
      address: 'Sv. Martina 26, 21327 Podgora, Croatia',
    },
  })

  payload.logger.info('  ✓ Medora data seeded.')
}

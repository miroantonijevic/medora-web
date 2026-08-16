import type { CollectionConfig } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description:
      'Individual amenity items (Spa, Restaurant, Fitness…) each belonging to an amenity group.',
    defaultColumns: ['name', 'group', 'slug'],
    livePreview: {
      url: async ({ data, locale, req }) => {
        const localeCode = (locale as { code?: string })?.code ?? 'en'
        const amenitySlug = data?.slug as string | undefined
        if (!amenitySlug) return null as unknown as string
        const groupRel = data?.group
        let groupSlug: string | null = null
        if (typeof groupRel === 'object' && groupRel !== null) {
          groupSlug = (groupRel as { slug?: string }).slug ?? null
        } else if ((typeof groupRel === 'number' || typeof groupRel === 'string') && req?.payload) {
          try {
            const group = await req.payload.findByID({
              collection: 'amenity-groups',
              id: Number(groupRel),
              depth: 0,
            })
            groupSlug = (group as { slug?: string })?.slug ?? null
          } catch {
            groupSlug = null
          }
        }
        if (!groupSlug) return null as unknown as string
        const secret = process.env.PAYLOAD_DRAFT_SECRET ?? 'draft-secret'
        const pageURL = `/${localeCode}/amenities/${groupSlug}/${amenitySlug}`
        return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(pageURL)}&secret=${secret}&locale=${localeCode}`
      },
    },
  },
  access: { read: () => true },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'amenity-groups',
      required: true,
      index: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'highlights',
      type: 'array',
      localized: true,
      admin: { description: 'Bullet-point features, e.g. "Finnish sauna", "Heated pool".' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'openingHours',
      type: 'text',
      localized: true,
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "9th Floor" or "Ground floor, pool area".' },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Controls display order within the group.' },
    },
  ],
}

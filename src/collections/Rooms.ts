import type { CollectionConfig } from 'payload'

import { revalidateCollectionHook } from '@/hooks/revalidateCollection'
import { getServerSideURL } from '@/utilities/getURL'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description:
      'Room types per property — photos, capacity, bed type, inclusions and pricing details.',
    livePreview: {
      url: async ({ data, locale, req }) => {
        const localeCode = (locale as { code?: string })?.code ?? 'en'
        const roomSlug = data?.slug as string | undefined
        if (!roomSlug) return null as unknown as string
        const prop = data?.property
        let propertySlug: string | null = null
        if (typeof prop === 'object' && prop !== null) {
          propertySlug = (prop as { slug?: string }).slug ?? null
          // Resolve unpopulated relationship (depth:0 gives only an id)
          if (!propertySlug) {
            const id = Number(
              (prop as { id?: unknown; value?: unknown }).id ?? (prop as { value?: unknown }).value,
            )
            propertySlug = id === 1 ? 'medora-auri' : id === 2 ? 'luxury-camp-orbis' : null
          }
        } else if (typeof prop === 'number' || typeof prop === 'string') {
          const id = Number(prop)
          propertySlug = id === 1 ? 'medora-auri' : id === 2 ? 'luxury-camp-orbis' : null
        }
        if (!propertySlug) return null as unknown as string
        const groupRel = data?.group
        let groupSlug: string | null = null
        if (typeof groupRel === 'object' && groupRel !== null) {
          groupSlug = (groupRel as { slug?: string }).slug ?? null
        } else if ((typeof groupRel === 'number' || typeof groupRel === 'string') && req?.payload) {
          try {
            const group = await req.payload.findByID({
              collection: 'room-groups',
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
        const pageURL = `/${localeCode}/properties/${propertySlug}/rooms/${groupSlug}/${roomSlug}`
        return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(pageURL)}&secret=${secret}&locale=${localeCode}`
      },
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateCollectionHook('rooms')],
  },
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
      unique: true,
      index: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      index: true,
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'room-groups',
      index: true,
      admin: {
        description: 'Assign to the leaf sub-group (e.g. "Dvokrevetne sobe"), not the parent.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'capacity',
      type: 'number',
      min: 1,
    },
    {
      name: 'size',
      type: 'text',
      localized: true,
    },
    {
      name: 'bedType',
      type: 'text',
      localized: true,
    },
    {
      name: 'inclusions',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
      ],
    },
  ],
}

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
    defaultColumns: ['name', 'property', 'group', 'capacity', 'updatedAt'],
    components: {
      beforeListTable: ['@/collections/Rooms/components/RoomsStatsBar'],
    },
    livePreview: {
      url: async ({ data, locale, req }) => {
        const localeCode = (locale as { code?: string })?.code ?? 'en'
        const roomSlug = data?.slug as string | undefined
        if (!roomSlug) return null as unknown as string
        const prop = data?.property
        let propertySlug: string | null = null
        if (typeof prop === 'object' && prop !== null) {
          propertySlug = (prop as { slug?: string }).slug ?? null
        }
        // Unpopulated relationship (depth:0 gives only an id, or a { value } wrapper)
        if (!propertySlug && prop && req?.payload) {
          const id =
            typeof prop === 'object'
              ? ((prop as { id?: unknown; value?: unknown }).id ??
                (prop as { value?: unknown }).value)
              : prop
          try {
            const property = await req.payload.findByID({
              collection: 'properties',
              id: id as number | string,
              depth: 0,
            })
            propertySlug = property.slug ?? null
          } catch (err) {
            req.payload.logger.warn({ err }, 'Room live preview: could not resolve property slug')
          }
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
        const secret = process.env.PAYLOAD_DRAFT_SECRET ?? ''
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
      admin: {
        components: {
          Cell: '@/collections/Rooms/components/TitleThumbnailCell',
        },
      },
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
      admin: {
        components: {
          afterInput: ['@/fields/components/MediaGalleryField/AddFolderButtonUpload'],
        },
      },
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
    {
      name: 'phobsUnitId',
      type: 'text',
      admin: {
        description:
          "Phobs PMS UnitId for this room — used by the booking calendar to check availability (must belong to the parent property's Phobs PropertyId).",
      },
    },
    {
      name: 'promoDates',
      type: 'array',
      admin: {
        description:
          'Date ranges highlighted on the booking calendar as promo/lower-price dates (shown in gold to guests). Has no effect on real Phobs availability or pricing — display only.',
      },
      fields: [
        {
          name: 'dateFrom',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'dateTo',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      // Re-declared to override the auto-generated timestamp field's list Cell.
      name: 'updatedAt',
      type: 'date',
      admin: {
        disableBulkEdit: true,
        hidden: true,
        components: {
          Cell: '@/components/admin-list/UpdatedCell',
        },
      },
      index: true,
    },
  ],
}

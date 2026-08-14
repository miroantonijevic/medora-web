import type { CollectionConfig } from 'payload'

import { revalidateCollectionHook } from '@/hooks/revalidateCollection'

export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    group: 'Hotel Content',
    description: 'Special deals and packages. Supports draft, scheduled publish and expiry dates.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollectionHook('offers')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
      schedulePublish: true,
    },
  },
  fields: [
    {
      name: 'title',
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
      required: false,
    },
    {
      name: 'validFrom',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'validUntil',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
    },
  ],
}

import type { CollectionConfig } from 'payload'

import { revalidateCollectionHook } from '@/hooks/revalidateCollection'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description:
      'Manage hotels and camps — names, descriptions, images, amenities and star ratings.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollectionHook('properties')],
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Hotel', value: 'hotel' },
        { label: 'Camp', value: 'camp' },
      ],
      defaultValue: 'hotel',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'heroImages',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'address',
      type: 'text',
      localized: true,
    },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        {
          name: 'lat',
          type: 'number',
        },
        {
          name: 'lng',
          type: 'number',
        },
      ],
    },
    {
      name: 'starRating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        step: 1,
      },
    },
  ],
}

import type { CollectionConfig } from 'payload'

import { revalidateCollectionHook } from '@/hooks/revalidateCollection'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description: 'Room types per property — photos, capacity, bed type, inclusions and pricing details.',
  },
  access: {
    read: () => true,
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Room', value: 'room' },
        { label: 'Suite', value: 'suite' },
        { label: 'Villa', value: 'villa' },
        { label: 'Tent', value: 'tent' },
        { label: 'Cabin', value: 'cabin' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'images',
      type: 'relationship',
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

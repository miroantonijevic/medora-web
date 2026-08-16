import type { CollectionConfig } from 'payload'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description:
      'Individual amenity items (Spa, Restaurant, Fitness…) each belonging to an amenity group.',
    defaultColumns: ['name', 'group', 'slug'],
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

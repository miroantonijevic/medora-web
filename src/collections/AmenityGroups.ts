import type { CollectionConfig } from 'payload'

export const AmenityGroups: CollectionConfig = {
  slug: 'amenity-groups',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description: 'Top-level amenity categories shown in the footer: Wellness, Dining & Bars, Active vacation.',
    defaultColumns: ['name', 'slug'],
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
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Controls display order in navigation.' },
    },
  ],
}

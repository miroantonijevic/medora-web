import type { CollectionConfig } from 'payload'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description: 'Reusable amenity icons (pool, spa, parking…) that appear on property pages.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'Use a lucide icon name, for example: waves, parking-circle, dumbbell.',
      },
    },
    {
      name: 'category',
      type: 'text',
      localized: true,
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const FaqCategories: CollectionConfig = {
  slug: 'faq-categories',
  admin: {
    useAsTitle: 'title',
    group: 'Help Center',
    description: 'FAQ categories (Reservations, Wellness, etc.) with their Q&A items.',
    defaultColumns: ['title', 'slug', 'order'],
  },
  access: { read: () => true },
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
      admin: { description: 'URL slug, e.g. "reservations". Auto-set by seed; editable.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first.' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Q&A items',
      admin: { description: 'Questions and answers shown in an accordion on the category page.' },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'answer',
          type: 'richText',
          localized: true,
        },
      ],
    },
  ],
}

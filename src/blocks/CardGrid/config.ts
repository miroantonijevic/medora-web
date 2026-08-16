import type { Block } from 'payload'

export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: { singular: 'Card Grid', plural: 'Card Grids' },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      admin: { description: 'Optional intro text above the cards.' },
    },
    {
      name: 'cards',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'excerpt',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description: 'URL path the card links to, e.g. /destination/beaches',
          },
        },
      ],
    },
  ],
}

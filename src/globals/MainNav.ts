import type { GlobalConfig } from 'payload'

export const MainNav: GlobalConfig = {
  slug: 'main-nav',
  label: 'Navigation Menu',
  admin: {
    group: 'Website Settings',
    description: 'Edit the header navigation links shown on every page.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'children',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const SEODefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: 'SEO Defaults',
  admin: {
    group: 'Website Settings',
    description: 'Fallback SEO title and description used when a page has no specific SEO set.',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'defaultTitle',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'defaultCanonicalUrl',
      type: 'text',
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

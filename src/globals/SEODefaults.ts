import type { GlobalConfig } from 'payload'

export const SEODefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: 'SEO Defaults',
  admin: {
    group: 'Website Settings',
    description: 'Fallback SEO title and description used when a page has no specific SEO set.',
  },
  access: {
    read: () => true,
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
      type: 'relationship',
      relationTo: 'media',
    },
  ],
}

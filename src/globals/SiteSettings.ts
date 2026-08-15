import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Website Settings',
    description: 'Brand name, contact details, favicon, default OG image and Google Analytics ID.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      defaultValue: 'Medora Hotels',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Favicon image (recommended: 32×32 PNG or SVG)',
      },
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Default OG/social share image (1200×630px recommended)',
      },
    },
    {
      name: 'googleAnalyticsId',
      type: 'text',
      admin: {
        description: 'Google Analytics Measurement ID (e.g. G-XXXXXXXXXX)',
        placeholder: 'G-XXXXXXXXXX',
      },
    },
  ],
}

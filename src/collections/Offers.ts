import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { revalidateCollectionHook } from '@/hooks/revalidateCollection'
import { getServerSideURL } from '@/utilities/getURL'

export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    group: 'Hotel Content',
    description: 'Special deals and packages. Supports draft, scheduled publish and expiry dates.',
    livePreview: {
      url: ({ data, locale }) => {
        const localeCode = (locale as { code?: string })?.code ?? 'en'
        const offerSlug = data?.slug as string | undefined
        if (!offerSlug) return null as unknown as string
        const secret = process.env.PAYLOAD_DRAFT_SECRET ?? 'draft-secret'
        const offerURL = `/${localeCode}/offers/${offerSlug}`
        return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(offerURL)}&secret=${secret}&locale=${localeCode}`
      },
    },
    preview: (data) => {
      const offerSlug = data?.slug as string | undefined
      if (!offerSlug) return null
      const secret = process.env.PAYLOAD_DRAFT_SECRET ?? 'draft-secret'
      const offerURL = `/en/offers/${offerSlug}`
      return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(offerURL)}&secret=${secret}&locale=en`
    },
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollectionHook('offers')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
      schedulePublish: true,
    },
  },
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
      index: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: false,
    },
    {
      name: 'validFrom',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'validUntil',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          UnorderedListFeature(),
        ],
      }),
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

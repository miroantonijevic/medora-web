import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { CardGrid } from '../../blocks/CardGrid/config'
import { Content } from '../../blocks/Content/config'
import { ContentSection } from '../../blocks/ContentSection/config'
import { FormBlock } from '../../blocks/Form/config'
import { MapEmbed } from '../../blocks/MapEmbed/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { PhotoGallery } from '../../blocks/PhotoGallery/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { getServerSideURL } from '../../utilities/getURL'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
    path: true,
  },
  admin: {
    group: 'Content',
    description:
      'CMS-managed pages: destination sub-pages, landing pages, and any ad-hoc content page.',
    defaultColumns: ['title', 'path', 'updatedAt'],
    livePreview: {
      url: ({ data, locale }) => {
        const localeCode = (locale as { code?: string })?.code ?? 'en'
        const pagePath = (data?.path as string) || (data?.slug as string)
        if (!pagePath) return null as unknown as string
        const secret = process.env.PAYLOAD_DRAFT_SECRET ?? 'draft-secret'
        const pageURL = `/${localeCode}/${pagePath}`
        return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(pageURL)}&secret=${secret}&locale=${localeCode}`
      },
    },
    preview: (data) => {
      const pagePath = (data?.path as string) || (data?.slug as string)
      if (!pagePath) return null
      const secret = process.env.PAYLOAD_DRAFT_SECRET ?? 'draft-secret'
      const pageURL = `/en/${pagePath}`
      return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(pageURL)}&secret=${secret}&locale=en`
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'path',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Full URL path without locale prefix, e.g. destination/beaches. Leave blank for flat-slug pages.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                ContentSection,
                CardGrid,
                MediaBlock,
                FormBlock,
                PhotoGallery,
                MapEmbed,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

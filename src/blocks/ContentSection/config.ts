import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const ContentSection: Block = {
  slug: 'contentSection',
  interfaceName: 'ContentSectionBlock',
  labels: { singular: 'Content Section', plural: 'Content Sections' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: { description: 'H2 section heading.' },
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
        ],
      }),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional image beside or below the text.' },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Right of text', value: 'right' },
        { label: 'Below text', value: 'below' },
      ],
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.image),
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      admin: { description: "Optional 'Read more' button URL." },
    },
  ],
}

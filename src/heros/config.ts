import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Info Card',
          value: 'infoCard',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
        description: 'Full-width hero image for the Info Card hero.',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
      },
    },
    {
      name: 'workingHoursText',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
        description: 'e.g. "07 - 21 h". Leave blank to hide the hours.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
      },
    },
    {
      name: 'email',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
      },
    },
    {
      name: 'cardSubtext',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
        description: 'Small line below contact info, e.g. "Finnish & infrared sauna".',
      },
    },
    {
      name: 'showInquiryButton',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (_, { type } = {}) => type === 'infoCard',
      },
    },
  ],
  label: false,
}

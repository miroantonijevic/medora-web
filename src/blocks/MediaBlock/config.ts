import type { Block } from 'payload'

import { layoutSettings } from '@/fields/layoutSettings'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  imageURL: '/admin-thumbnails/media-block.svg',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    layoutSettings(),
  ],
}

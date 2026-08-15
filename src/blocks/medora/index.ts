import type { Block } from 'payload'

export const MedoraHeroBlock: Block = {
  slug: 'medora-hero',
  labels: {
    singular: 'Medora Hero',
    plural: 'Medora Hero Blocks',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export const medoraBlocks: Block[] = [MedoraHeroBlock]

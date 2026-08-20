import type { Block } from 'payload'

export const MapEmbed: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: { singular: 'Map Embed', plural: 'Map Embeds' },
  fields: [
    {
      name: 'lat',
      type: 'number',
      required: true,
    },
    {
      name: 'lng',
      type: 'number',
      required: true,
    },
    {
      name: 'zoom',
      type: 'number',
      defaultValue: 15,
    },
    {
      name: 'directionsUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'External "Driving directions" link, e.g. a Google Maps directions URL.',
      },
    },
  ],
}

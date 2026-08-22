import type { Block } from 'payload'

export const PhotoGallery: Block = {
  slug: 'photo-gallery',
  interfaceName: 'PhotoGalleryBlock',
  labels: { singular: 'Photo Gallery', plural: 'Photo Galleries' },
  imageURL: '/admin-thumbnails/photo-gallery.svg',
  fields: [
    {
      name: 'label',
      type: 'text',
      localized: true,
      admin: { description: 'Section label shown above the grid, e.g. "Spa photo gallery".' },
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      admin: {
        components: {
          afterInput: ['@/fields/components/MediaGalleryField/AddFolderButtonArray'],
        },
      },
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

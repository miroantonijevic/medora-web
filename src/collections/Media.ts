import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  // browseByFolder disabled: the native folder-browsing view is replaced by
  // our custom Media Library (the `folder` field/collection is still used by it).
  folders: {
    browseByFolder: false,
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description:
          'Alternative text describing the image, read aloud by screen readers and used for SEO. E.g. "Hotel room with sea view balcony".',
      },
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  admin: {
    group: false,
    // The API tab just links to the raw JSON endpoint; not useful for editors.
    hideAPIURL: true,
    components: {
      Description: '@/components/MediaLibrary/MediaDescription#MediaDescription',
      views: {
        list: {
          Component: '@/components/MediaLibrary/ListRedirect#MediaListRedirectView',
        },
      },
      edit: {
        beforeDocumentControls: ['@/components/MediaLibrary/MediaEditExtras#MediaEditExtras'],
      },
    },
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    // Images and videos are what the frontend's media renderers support. PDFs are documents that pages
    // link to by URL (sustainability reports etc.); they live in the "Documents" folder.
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    // Use a large derivative (not the 300px 'thumbnail') so the big edit-view preview isn't blurry.
    adminThumbnail: 'xlarge',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}

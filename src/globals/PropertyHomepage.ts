import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { getServerSideURL } from '@/utilities/getURL'

const makePropertyHomepage = (
  slug: 'auri-homepage' | 'orbis-homepage',
  label: string,
  pageURL: string,
  propertySlug: string,
): GlobalConfig => ({
  slug,
  label,
  admin: {
    // No group — these are primary dashboard items, not buried in settings
    description: `Controls every section of the ${label} — slides, inclusions, rooms, offer.`,
    livePreview: {
      url: ({ locale }) => {
        const secret = process.env.PAYLOAD_DRAFT_SECRET ?? 'draft-secret'
        const localeCode = locale?.code ?? 'en'
        const localizedURL = `/${localeCode}${pageURL === '/' ? '' : pageURL}`
        return `${getServerSideURL()}/api/draft?url=${encodeURIComponent(localizedURL)}&secret=${secret}&locale=${localeCode}`
      },
    },
  },
  access: { read: () => true },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        // Only revalidate the live site when publishing, not on draft saves
        if (doc._status === 'published') {
          req.payload.logger.info(`Revalidating homepage at ${pageURL}`)
          revalidatePath(pageURL)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─── Tab 1: Hero ───────────────────────────────────────────────────
        {
          label: 'Hero Slides',
          description: 'Full-screen rotating banner at the top of the page.',
          fields: [
            {
              name: 'slides',
              type: 'array',
              label: 'Slides',
              minRows: 1,
              admin: {
                components: {
                  RowLabel: '@/globals/RowLabels/SlideRowLabel#SlideRowLabel',
                },
                initCollapsed: true,
                description:
                  'Drag to reorder. Each slide shows a full-screen background image with headline, bullet points and a CTA button.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Background image',
                },
                {
                  name: 'headline',
                  type: 'text',
                  localized: true,
                  label: 'Headline',
                  defaultValue: 'Book here & get FREE:',
                },
                {
                  name: 'benefits',
                  type: 'array',
                  label: 'Bullet points',
                  admin: {
                    initCollapsed: true,
                    description: 'Short benefit lines shown below the headline.',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      localized: true,
                      label: 'Line',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      localized: true,
                      label: 'Button label',
                      defaultValue: 'View offers',
                      admin: { width: '50%', hidden: true },
                    },
                    {
                      name: 'ctaHref',
                      type: 'text',
                      label: 'Slide link',
                      defaultValue: '/offers/book-directly-and-feel-safe',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─── Tab 2: Benefits strip ─────────────────────────────────────────
        {
          label: 'Benefits Strip',
          description: 'The icon row below the hero showing free inclusions.',
          fields: [
            {
              name: 'inclusionsHeadline',
              type: 'text',
              localized: true,
              label: 'Headline',
              defaultValue: 'Children stay for FREE! Save €483 compared to other hotels for:',
              admin: {
                description: 'Bold text shown above the benefit icons.',
              },
            },
            {
              name: 'inclusions',
              type: 'array',
              label: 'Icons',
              admin: {
                components: {
                  RowLabel: '@/globals/RowLabels/InclusionRowLabel#InclusionRowLabel',
                },
                initCollapsed: true,
                description: 'Drag to reorder. Defaults are used when the list is empty.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Icon (SVG/PNG)',
                      admin: { width: '30%' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                      required: true,
                      label: 'Label',
                      admin: { width: '40%' },
                    },
                    {
                      name: 'href',
                      type: 'text',
                      label: 'Link',
                      defaultValue: '/offers/book-directly-and-feel-safe',
                      admin: { width: '30%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'inclusionsSubtitle',
              type: 'text',
              localized: true,
              label: 'Subtitle',
              admin: {
                description: 'Smaller text shown below the benefit icons.',
              },
            },
          ],
        },

        // ─── Tab 3: Rooms & Offer ──────────────────────────────────────────
        {
          label: 'Rooms & Offer',
          description: 'Pick which room groups and offer appear on the homepage.',
          fields: [
            {
              name: 'featuredGroups',
              type: 'relationship',
              relationTo: 'room-groups',
              hasMany: true,
              maxRows: 6,
              label: 'Featured Room Groups',
              admin: {
                description: `Pick which room groups to show on the homepage. Leave empty to auto-show all top-level groups for ${propertySlug}.`,
              },
            },
            {
              name: 'featuredOffer',
              type: 'relationship',
              relationTo: 'offers',
              hasMany: false,
              label: 'Featured Offer',
              admin: {
                description:
                  'The offer shown in the homepage banner. Leave empty to use the latest active offer.',
              },
            },
          ],
        },
      ],
    },
  ],
})

export const AuriHomepage = makePropertyHomepage(
  'auri-homepage',
  'Medora Auri Homepage',
  '/',
  'medora-auri',
)

export const OrbisHomepage = makePropertyHomepage(
  'orbis-homepage',
  'Luxury Camp Orbis Homepage',
  '/orbis',
  'luxury-camp-orbis',
)

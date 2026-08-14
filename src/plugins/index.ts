import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post, Property, Room, Offer } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type SeoDoc = Post | Page | Property | Room | Offer

const getDocTitle = (doc: SeoDoc): string => {
  if ('title' in doc && doc.title) return doc.title as string
  if ('name' in doc && doc.name) return doc.name as string
  return ''
}

const generateTitle: GenerateTitle<SeoDoc> = ({ doc }) => {
  const title = getDocTitle(doc)
  return title ? `${title} | Medora Hotels` : 'Medora Hotels'
}

const generateURL: GenerateURL<SeoDoc> = ({ doc, collectionSlug }) => {
  const url = getServerSideURL()
  const slug = 'slug' in doc && doc.slug ? (doc.slug as string) : ''

  switch (collectionSlug) {
    case 'properties':
      return slug ? `${url}/properties/${slug}` : `${url}/properties`
    case 'rooms':
      return slug ? `${url}/rooms/${slug}` : `${url}/rooms`
    case 'offers':
      return slug ? `${url}/offers/${slug}` : `${url}/offers`
    default:
      return slug ? `${url}/${slug}` : url
  }
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'properties', 'offers'],
    overrides: {
      admin: {
        group: 'System',
        description: 'URL redirects (301/302). Managed automatically when slugs change.',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    collections: ['pages', 'posts', 'properties', 'rooms', 'offers'],
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: {
        hidden: true,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: {
        hidden: true,
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        group: 'Blog',
        hidden: true,
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]

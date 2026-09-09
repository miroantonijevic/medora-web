import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Config } from 'payload'

import { removeSearchIndexForDoc, syncSearchIndexForDoc } from '@/search/syncSearchIndex'

const SEARCHABLE_COLLECTIONS = [
  'posts',
  'rooms',
  'properties',
  'pages',
  'offers',
  'media',
  'faq-categories',
  'room-groups',
  'inquiries',
] as const

/**
 * Custom, minimal replacement for `@payloadcms/plugin-search`: that plugin's
 * afterChange hook fans out per-locale internally on localized collections, and
 * those per-locale invocations race each other (each sees no existing search doc
 * yet and creates its own), producing duplicate index entries. This plugin syncs
 * once per save using a single multi-locale-aware read, avoiding the race entirely.
 */
export const globalSearchIndexPlugin =
  () =>
  (config: Config): Config => {
    if (!config.collections) return config

    const collections = config.collections.map((collection) => {
      if (!(SEARCHABLE_COLLECTIONS as readonly string[]).includes(collection.slug)) {
        return collection
      }

      const collectionSlug = collection.slug

      const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
        await syncSearchIndexForDoc({
          payload: req.payload,
          req,
          collection: collectionSlug,
          doc,
        })
        return doc
      }

      const afterDelete: CollectionAfterDeleteHook = async ({ id, req }) => {
        await removeSearchIndexForDoc({
          payload: req.payload,
          req,
          collection: collectionSlug,
          id,
        })
      }

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange || []), afterChange],
          afterDelete: [...(collection.hooks?.afterDelete || []), afterDelete],
        },
      }
    })

    return { ...config, collections }
  }

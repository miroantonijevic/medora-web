import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

// Auto-generated, rebuildable index powering the admin-only global search Nav UI.
// Never edited directly by users - synced via the globalSearchIndexPlugin hooks.
export const SearchIndex: CollectionConfig = {
  slug: 'search-index',
  labels: {
    singular: 'Search Index Entry',
    plural: 'Search Index',
  },
  admin: {
    hidden: true,
    useAsTitle: 'title',
  },
  access: {
    read: authenticated,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
    },
    {
      // Concatenation of every locale variant of title/slug, for matching regardless
      // of which locale the admin UI is currently viewing. `hidden` (not `admin.hidden`)
      // would exclude it from queries entirely, so just hide it from the admin form.
      name: 'searchText',
      type: 'text',
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'docCollection',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'docId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
    },
  ],
}

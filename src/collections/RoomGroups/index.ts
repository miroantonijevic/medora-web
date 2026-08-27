import type { CollectionConfig } from 'payload'

import { revalidateCollectionHook } from '@/hooks/revalidateCollection'

export const RoomGroups: CollectionConfig = {
  slug: 'room-groups',
  admin: {
    useAsTitle: 'name',
    group: 'Hotel Content',
    description:
      'Hierarchical room groups (e.g. "Sobe i suiteovi" → "Dvokrevetne sobe"). Assign rooms to leaf groups.',
    defaultColumns: ['name', 'property', 'order', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollectionHook('room-groups')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        components: {
          Cell: '@/collections/RoomGroups/components/TitleThumbnailCell',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      index: true,
    },
    {
      // null = top-level group; set to point at a parent group for sub-groups
      name: 'parent',
      type: 'relationship',
      relationTo: 'room-groups',
      index: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      // Re-declared to override the auto-generated timestamp field's list Cell.
      name: 'updatedAt',
      type: 'date',
      admin: {
        disableBulkEdit: true,
        hidden: true,
        components: {
          Cell: '@/components/admin-list/UpdatedCell',
        },
      },
      index: true,
    },
  ],
}

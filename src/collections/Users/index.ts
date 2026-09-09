import type { CollectionConfig } from 'payload'

import { isAdmin } from '../../access/isAdmin'
import { isAdminOrSelf } from '../../access/isAdminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    group: 'System',
    description: 'Admin users who can log in to this CMS.',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    useAsTitle: 'name',
    components: {
      beforeListTable: ['@/collections/Users/components/UsersStatsBar'],
    },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      // Embeds the role in the JWT so access control functions don't need an extra DB lookup.
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only admins can change a user's role - prevents an editor from self-promoting.
        update: isAdmin,
      },
      admin: {
        description: 'Admins have full access, including Users and site-wide settings.',
        components: {
          Cell: '@/collections/Users/components/RoleCell',
        },
      },
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
  timestamps: true,
}

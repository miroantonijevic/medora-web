import type { Access } from 'payload'

import type { User } from '@/payload-types'

// Admins can manage every user; everyone else can only read/update their own account.
export const isAdminOrSelf: Access<User> = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  return {
    id: {
      equals: user.id,
    },
  }
}

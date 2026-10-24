import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

// Only `req` is needed, so one function serves both collection and field access.
type IsAdmin = (args: Pick<AccessArgs<User>, 'req'>) => boolean

export const isAdmin: IsAdmin = ({ req: { user } }) => {
  return user?.role === 'admin'
}

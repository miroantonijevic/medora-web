import type { BeforeListTableServerProps } from 'payload'

import { StatsBar } from '@/components/admin-list/StatsBar'

export default async function UsersStatsBar({ payload }: BeforeListTableServerProps) {
  const [admins, editors, total] = await Promise.all([
    payload.count({ collection: 'users', where: { role: { equals: 'admin' } } }),
    payload.count({ collection: 'users', where: { role: { equals: 'editor' } } }),
    payload.count({ collection: 'users', where: {} }),
  ])

  return (
    <StatsBar
      items={[
        {
          key: 'total',
          label: 'Total',
          count: total.totalDocs,
          color: 'var(--theme-elevation-400)',
        },
        { key: 'admin', label: 'Admins', count: admins.totalDocs, color: '#1d4ed8' },
        { key: 'editor', label: 'Editors', count: editors.totalDocs, color: '#15803d' },
      ]}
    />
  )
}

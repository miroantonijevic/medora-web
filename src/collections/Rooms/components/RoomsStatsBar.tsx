import type { BeforeListTableServerProps } from 'payload'

import { StatsBar } from '@/components/admin-list/StatsBar'

export default async function RoomsStatsBar({ payload }: BeforeListTableServerProps) {
  const [draft, published, total] = await Promise.all([
    payload.count({ collection: 'rooms', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'rooms', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'rooms', where: {} }),
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
        { key: 'published', label: 'Published', count: published.totalDocs, color: '#15803d' },
        { key: 'draft', label: 'Draft', count: draft.totalDocs, color: '#b45309' },
      ]}
    />
  )
}

import type { BeforeListTableServerProps } from 'payload'

import { StatsBar } from '@/components/admin-list/StatsBar'

export default async function OffersStatsBar({ payload }: BeforeListTableServerProps) {
  const now = new Date().toISOString()
  const [draft, published, expired, total] = await Promise.all([
    payload.count({ collection: 'offers', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'offers', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'offers', where: { validUntil: { less_than: now } } }),
    payload.count({ collection: 'offers', where: {} }),
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
        { key: 'expired', label: 'Expired', count: expired.totalDocs, color: '#b91c1c' },
      ]}
    />
  )
}

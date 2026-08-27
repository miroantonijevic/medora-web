import type { BeforeListTableServerProps } from 'payload'

import './inquiryAdmin.scss'
import { STATUS_META, STATUS_ORDER } from './statusMeta'

export default async function StatsBar({ payload }: BeforeListTableServerProps) {
  const counts = await Promise.all(
    STATUS_ORDER.map((status) =>
      payload.count({ collection: 'inquiries', where: { status: { equals: status } } }),
    ),
  )

  return (
    <div className="inquiry-stats-bar">
      {STATUS_ORDER.map((status, i) => (
        <div
          key={status}
          className="inquiry-stats-bar__item"
          style={{ ['--inquiry-stat-color' as string]: STATUS_META[status].color }}
        >
          <span className="inquiry-stats-bar__count">{counts[i]?.totalDocs ?? 0}</span>
          <span className="inquiry-stats-bar__label">{STATUS_META[status].label}</span>
        </div>
      ))}
    </div>
  )
}

import './adminList.scss'

export type StatItem = {
  key: string
  label: string
  count: number
  color: string
}

// Generic stat-pill row for beforeListTable — pass in whatever counts a collection wants to surface.
export function StatsBar({ items }: { items: StatItem[] }) {
  return (
    <div className="admin-list-stats-bar">
      {items.map((item) => (
        <div
          key={item.key}
          className="admin-list-stats-bar__item"
          style={{ ['--admin-list-stat-color' as string]: item.color }}
        >
          <span className="admin-list-stats-bar__count">{item.count}</span>
          <span className="admin-list-stats-bar__label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

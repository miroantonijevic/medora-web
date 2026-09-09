import type { DefaultServerCellComponentProps } from 'payload'

import type { User } from '@/payload-types'

import { getCellLinkHref } from '@/components/admin-list/getCellLinkHref'
import { StatusBadge } from '@/components/admin-list/StatusBadge'
import '@/components/admin-list/adminList.scss'

const ROLE_META = {
  admin: { label: 'Admin', color: '#1d4ed8', background: '#dbeafe' },
  editor: { label: 'Editor', color: '#15803d', background: '#dcfce7' },
} as const

export default function RoleCell({
  rowData,
  link,
  linkURL,
  collectionSlug,
  payload,
}: DefaultServerCellComponentProps) {
  const row = rowData as User
  const meta = ROLE_META[row.role as keyof typeof ROLE_META] ?? ROLE_META.editor
  const content = <StatusBadge label={meta.label} color={meta.color} background={meta.background} />

  if (link) {
    const href = getCellLinkHref({ collectionSlug, id: row.id, linkURL, payload })

    return (
      <a href={href} className="admin-list-meta-cell">
        {content}
      </a>
    )
  }

  return <div className="admin-list-meta-cell">{content}</div>
}

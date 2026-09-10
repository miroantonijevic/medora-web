import React from 'react'

import { StatusBadge } from './StatusBadge'
import './adminList.scss'

// Two independent pills — because "published" and "has a pending draft" are
// separate, simultaneous facts about a doc, not one blended state. A page can
// be live AND have unpublished edits sitting on top of it at once.
export function PublishBadges({
  isPublished,
  hasPendingDraft,
}: {
  isPublished: boolean
  hasPendingDraft: boolean
}) {
  // Only show the extra "Draft" pill when it adds information, i.e. a live page
  // has a newer draft on top of it — otherwise the first pill already says "Draft".
  const showDraftPill = isPublished && hasPendingDraft

  return (
    <span className="admin-list-badge-group">
      <StatusBadge
        label={isPublished ? 'Published' : 'Draft'}
        color={isPublished ? '#15803d' : '#b45309'}
        background={isPublished ? '#dcfce7' : '#fef3c7'}
      />
      {showDraftPill && <StatusBadge label="Draft" color="#b45309" background="#fef3c7" />}
    </span>
  )
}

import { redirect } from 'next/navigation'
import type { ListViewServerProps } from 'payload'
import React from 'react'

// The default Media list view should never render — everything routes through
// the custom Media Library grid instead (see NavLink.tsx / index.tsx).
export const MediaListRedirectView: React.FC<ListViewServerProps> = ({ payload }) => {
  redirect(`${payload.config.routes.admin}/media-library`)
}

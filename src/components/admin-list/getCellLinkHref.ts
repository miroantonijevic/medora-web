import type { Payload } from 'payload'

import { formatAdminURL } from 'payload/shared'

// Payload only supplies `linkURL` when a custom `admin.formatDocURL` is configured, so
// linked cells must fall back to building the default document URL themselves.
export function getCellLinkHref({
  collectionSlug,
  id,
  linkURL,
  payload,
}: {
  collectionSlug: string
  id: number | string
  linkURL?: string
  payload: Payload
}) {
  if (linkURL) {
    return linkURL
  }

  const adminRoute = payload.config.routes?.admin || '/admin'

  return formatAdminURL({
    adminRoute,
    path: `/collections/${collectionSlug}/${encodeURIComponent(String(id))}`,
  })
}

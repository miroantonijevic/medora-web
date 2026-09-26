'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * The Media collection's list view is also used by Payload to render its
 * built-in List Drawer (e.g. "Choose from existing" on upload fields), in
 * which case this component mounts while the browser stays on the *host*
 * page (e.g. a Pages document) — the URL never changes to
 * `/admin/collections/media`.
 *
 * We only want to redirect real, standalone visits to
 * `/admin/collections/media` over to the custom Media Library. Doing this
 * check client-side (via the actual browser pathname) is the only reliable
 * way to distinguish the two cases — Payload does not expose a "rendered
 * inside a drawer" flag to server-rendered list view components.
 */
export const RedirectIfStandaloneList: React.FC<{
  mediaLibraryPath: string
  mediaListPath: string
}> = ({ mediaLibraryPath, mediaListPath }) => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === mediaListPath) {
      router.replace(mediaLibraryPath)
    }
  }, [pathname, mediaListPath, mediaLibraryPath, router])

  return null
}

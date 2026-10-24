'use client'

import { useSyncExternalStore } from 'react'

/**
 * Whether a CSS media query currently matches. It is false on the server and during hydration,
 * so use it for UI that only renders after the page has loaded (modals, popups).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

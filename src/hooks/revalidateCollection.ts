import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

/**
 * Asks the running Next.js server to drop its cached pages by POSTing to /next/revalidate.
 * Requires REVALIDATE_SECRET + NEXT_PUBLIC_SERVER_URL env vars.
 */
async function requestRevalidation(body: { collection: string; id?: string | number }) {
  const secret = process.env.REVALIDATE_SECRET
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  if (!secret) return

  try {
    await fetch(`${baseUrl}/next/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify(body),
    })
  } catch {
    // Non-fatal — the hook fires best-effort; do not break the save
  }
}

/** Fires after any document of the collection is saved. */
export const revalidateCollectionHook =
  (collection: string): CollectionAfterChangeHook =>
  async ({ doc }) => {
    await requestRevalidation({ collection, id: doc.id })
    return doc
  }

/** Fires after the global is saved (navigation, site settings, SEO defaults). */
export const revalidateGlobalHook =
  (slug: string): GlobalAfterChangeHook =>
  async ({ doc }) => {
    await requestRevalidation({ collection: slug })
    return doc
  }

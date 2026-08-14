import type { CollectionAfterChangeHook } from 'payload'

/**
 * Fires a POST to /next/revalidate after any document save.
 * Requires REVALIDATE_SECRET + NEXT_PUBLIC_SERVER_URL env vars.
 */
export const revalidateCollectionHook =
  (collection: string): CollectionAfterChangeHook =>
  async ({ doc }) => {
    const secret = process.env.REVALIDATE_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

    if (!secret) return doc

    try {
      await fetch(`${baseUrl}/next/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ collection, id: doc.id }),
      })
    } catch {
      // Non-fatal — the hook fires best-effort; do not break the save
    }

    return doc
  }

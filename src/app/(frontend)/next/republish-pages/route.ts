import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 120

// One-off maintenance endpoint.
//
// The Pages admin list view queries with `draft=true`, so it displays each row's
// *latest version* status rather than the main table row's real `_status`.
// Autosave (versions.drafts.autosave on the Pages collection) silently creates a
// new draft version snapshot whenever a document's fields are touched in the
// admin UI (even just opening it for QA), WITHOUT ever writing back to the main
// `pages` row. That leaves the main row correctly `_status: 'published'` (and the
// public site keeps serving the right content), while the list shows "Draft".
//
// This re-publishes every page whose real, persisted `_status` is already
// 'published', which creates a fresh version snapshot with `_status: 'published'`
// as the latest — clearing the stray draft badge. No `data` fields are changed,
// only the publish action is repeated on the page's own current content.
export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 0,
      pagination: false,
      draft: false,
      where: { _status: { equals: 'published' } },
      overrideAccess: true,
    })

    const republished: Array<number | string> = []
    for (const doc of docs) {
      await payload.update({
        collection: 'pages',
        id: doc.id,
        data: { _status: 'published' },
        draft: false,
        overrideAccess: true,
      })
      republished.push(doc.id)
    }

    return Response.json({ success: true, count: republished.length, ids: republished })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('republish-pages error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

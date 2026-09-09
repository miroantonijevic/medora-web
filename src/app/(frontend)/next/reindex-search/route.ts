import { getPayload } from 'payload'
import config from '@payload-config'
import { syncSearchIndexForDoc } from '@/search/syncSearchIndex'

export const maxDuration = 120

const SEARCH_COLLECTIONS = [
  'posts',
  'rooms',
  'properties',
  'pages',
  'offers',
  'media',
  'faq-categories',
  'room-groups',
  'inquiries',
] as const

// Rebuilds the search-index collection from scratch by syncing every doc in each
// searchable collection directly, rather than resaving real content to trigger hooks.
export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const counts: Record<string, number> = {}

    await payload.delete({
      collection: 'search-index',
      where: { id: { exists: true } },
      overrideAccess: true,
    })

    for (const collection of SEARCH_COLLECTIONS) {
      const { docs } = await payload.find({
        collection,
        depth: 0,
        limit: 0,
        pagination: false,
        draft: true,
        select: { id: true },
      })

      for (const doc of docs) {
        await syncSearchIndexForDoc({ payload, collection, doc })
      }

      counts[collection] = docs.length
    }

    return Response.json({ success: true, counts })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('reindex-search error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

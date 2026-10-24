import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /next/revalidate
 *
 * Called by Payload `afterChange` hooks to bust Next.js cache tags.
 * Expects header: `x-revalidate-secret: <REVALIDATE_SECRET>`
 * Body: { collection: string, id: string | number }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-revalidate-secret')

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET env var not set' }, { status: 500 })
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { collection?: string; id?: string | number; tag?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const tags: string[] = []

  // Allow explicit tag override
  if (body.tag) {
    tags.push(body.tag)
  }

  // Derive cache tags from collection + id
  if (body.collection) {
    // Global collection tag (e.g. all pages, all rooms)
    tags.push(body.collection)

    // Per-document tag (e.g. pages-42)
    if (body.id !== undefined) {
      tags.push(`${body.collection}-${body.id}`)
    }

    // Special mappings
    if (body.collection === 'pages') {
      tags.push('pages-home')
    }
    if (body.collection === 'main-nav' || body.collection === 'mainNav') {
      tags.push('nav')
    }
    if (body.collection === 'footer') {
      tags.push('footer')
    }
  }

  if (tags.length === 0) {
    return NextResponse.json({ error: 'No cache tags to revalidate' }, { status: 400 })
  }

  for (const tag of tags) {
    // expire: 0 keeps the previous immediate-invalidation behaviour of the single-argument form
    revalidateTag(tag, { expire: 0 })
  }

  // The pages read Payload directly (no cache tags), so the tags above do not reach them and a
  // prerendered or cached page would otherwise stay stale for a year. The site is small, so drop
  // every cached page; the next visit renders it again.
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, tags })
}

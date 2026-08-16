import { getPayload } from 'payload'
import config from '@payload-config'
import { seedPages } from '@/endpoints/seed/seed-pages'
import { revalidateTag } from 'next/cache'

export const maxDuration = 120

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seedPages({ payload })
    // Bust the nav cache so the next page load gets fresh data
    revalidateTag('global_main-nav')
    return Response.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('seed-pages error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

import { getPayload } from 'payload'
import config from '@payload-config'
import { seedHomepages } from '@/endpoints/seed/seed-homepages'

export const maxDuration = 120

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  const force = url.searchParams.get('force') === 'true'

  if (secret !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seedHomepages({ payload, force })
    return Response.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('seed-homepages error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

import { getPayload } from 'payload'
import config from '@payload-config'
import { seedRooms } from '@/endpoints/seed/seed-rooms'

export const maxDuration = 120

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seedRooms({ payload })
    return Response.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('seed-rooms error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

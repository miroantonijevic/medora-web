import { getPayload } from 'payload'
import config from '@payload-config'
import { seedTestRoom } from '@/endpoints/seed/seed-test-room'

export const maxDuration = 60

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const id = await seedTestRoom({ payload })
    return Response.json({ success: true, roomId: id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('seed-test-room error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

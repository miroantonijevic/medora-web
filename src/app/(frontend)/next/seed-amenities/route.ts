import { getPayload } from 'payload'
import config from '@payload-config'
import { seedAmenities } from '@/endpoints/seed/seed-amenities'

export const maxDuration = 60

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seedAmenities({ payload })
    return Response.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('seed-amenities error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

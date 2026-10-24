import { getPayload } from 'payload'
import config from '@payload-config'
import { seedOffers } from '@/endpoints/seed/seed-offers'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seedOffers({ payload })
    return Response.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('seed-offers error:', e)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

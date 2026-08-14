import { getPayload } from 'payload'
import config from '@payload-config'
import { seedOffers } from '@/endpoints/seed/seed-offers'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  await seedOffers({ payload })

  return Response.json({ success: true })
}

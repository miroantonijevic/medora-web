import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getUnitRatePlans } from '@/lib/phobs'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomSlug = searchParams.get('room')
  const dateFrom = searchParams.get('from')
  const dateTo = searchParams.get('to')
  const adults = Number(searchParams.get('adults') ?? '2')
  const childAges = (searchParams.get('children') ?? '')
    .split(',')
    .map((age) => Number(age.trim()))
    .filter((age) => Number.isFinite(age) && age >= 0)
  if (!roomSlug || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }

  const nights = Math.round(
    (new Date(`${dateTo}T00:00:00`).getTime() - new Date(`${dateFrom}T00:00:00`).getTime()) /
      86_400_000,
  )
  if (!Number.isFinite(nights) || nights < 1) {
    return NextResponse.json({ error: 'invalid_range' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: roomSlug } },
    depth: 0,
    limit: 1,
  })
  const room = result.docs[0]
  const unitId = room?.phobsUnitId
  if (!unitId) {
    return NextResponse.json({ error: 'not_configured' }, { status: 404 })
  }

  try {
    const { propertyId, ratePlans } = await getUnitRatePlans(
      unitId,
      dateFrom,
      nights,
      adults,
      childAges,
    )
    return NextResponse.json({ propertyId, ratePlans })
  } catch (err) {
    console.error('Phobs rates fetch failed:', err)
    return NextResponse.json({ error: 'phobs_unavailable' }, { status: 502 })
  }
}

import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getUnitRatePlans, isTestModeUnit } from '@/lib/phobs'
import {
  MAX_NIGHTS,
  daysBetweenYMD,
  isValidAdults,
  parseChildAges,
  parseYMD,
} from '@/lib/phobsParams'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomSlug = searchParams.get('room')
  const dateFrom = parseYMD(searchParams.get('from'))
  const dateTo = parseYMD(searchParams.get('to'))
  const adults = Number(searchParams.get('adults') ?? '2')
  const childAges = parseChildAges(searchParams.get('children'))
  if (!roomSlug || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }
  if (!isValidAdults(adults) || !childAges) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
  }

  const nights = daysBetweenYMD(dateFrom, dateTo)
  if (nights < 1 || nights > MAX_NIGHTS) {
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
    return NextResponse.json({ propertyId, ratePlans, isTestMode: isTestModeUnit(unitId) })
  } catch (err) {
    console.error('Phobs rates fetch failed:', err)
    return NextResponse.json({ error: 'phobs_unavailable' }, { status: 502 })
  }
}

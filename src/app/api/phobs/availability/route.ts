import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { checkUnitAvailability, getPropertyForUnit } from '@/lib/phobs'

type PromoRange = { dateFrom?: string | null; dateTo?: string | null }

function isWithinPromoRange(date: string, ranges: PromoRange[]): boolean {
  return ranges.some((range) => {
    if (!range.dateFrom || !range.dateTo) return false
    const from = range.dateFrom.slice(0, 10)
    const to = range.dateTo.slice(0, 10)
    return date >= from && date <= to
  })
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomSlug = searchParams.get('room')
  if (!roomSlug) {
    return NextResponse.json({ error: 'missing_room' }, { status: 400 })
  }

  const today = new Date()
  const defaultTo = new Date(today)
  defaultTo.setMonth(defaultTo.getMonth() + 18)
  const toYMD = (d: Date) => d.toISOString().slice(0, 10)
  const dateFrom = searchParams.get('from') ?? toYMD(today)
  const dateTo = searchParams.get('to') ?? toYMD(defaultTo)

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: roomSlug } },
    depth: 0,
    limit: 1,
  })
  const room = result.docs[0]
  if (!room) {
    return NextResponse.json({ error: 'room_not_found' }, { status: 404 })
  }

  const unitId = room.phobsUnitId
  if (!unitId) {
    return NextResponse.json({ error: 'not_configured' }, { status: 404 })
  }

  const promoRanges = (room.promoDates ?? []) as PromoRange[]

  try {
    const propertyId = await getPropertyForUnit(unitId)
    if (!propertyId) {
      return NextResponse.json({ error: 'not_configured' }, { status: 404 })
    }

    const { entries } = await checkUnitAvailability(unitId, dateFrom, dateTo)
    const days = entries.map((entry) => ({
      date: entry.date,
      available: entry.available,
      isPromo: entry.available && isWithinPromoRange(entry.date, promoRanges),
    }))
    return NextResponse.json({ propertyId, days })
  } catch (err) {
    console.error('Phobs availability check failed:', err)
    return NextResponse.json({ error: 'phobs_unavailable' }, { status: 502 })
  }
}

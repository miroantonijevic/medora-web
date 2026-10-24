import { NextResponse } from 'next/server'

import { getUnitDeals, isTestModeUnit } from '@/lib/phobs'
import { parseStayParams } from '@/lib/phobsParams'
import { getGroupRoomsForDeals } from '@/lib/phobsRooms'

const LOCALES = ['en', 'hr', 'de'] as const

/**
 * Every room of this room's group with its rate plans for a stay ("show all family deals"). Test
 * rooms (Phobs TEST account) and real rooms are never mixed in one list.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomSlug = searchParams.get('room')
  const lang = searchParams.get('lang') ?? 'en'

  const parsed = parseStayParams(searchParams)
  if (!roomSlug || !parsed.ok) {
    return NextResponse.json(
      { error: parsed.ok ? 'missing_params' : parsed.error },
      { status: 400 },
    )
  }
  if (!(LOCALES as readonly string[]).includes(lang)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
  }

  const group = await getGroupRoomsForDeals(roomSlug, lang as (typeof LOCALES)[number])
  if (!group) {
    return NextResponse.json({ error: 'not_configured' }, { status: 404 })
  }

  const sameEnvironment = isTestModeUnit(group.currentUnitId)
  const rooms = group.rooms.filter((room) => isTestModeUnit(room.unitId) === sameEnvironment)
  const { dateFrom, nights, adults, childAges } = parsed.stay

  try {
    const deals = await getUnitDeals({
      unitIds: rooms.map((room) => room.unitId),
      dateFrom,
      nights,
      adults,
      childAges,
    })
    return NextResponse.json({ groupName: group.groupName, rooms, deals })
  } catch (err) {
    console.error('Phobs deals failed:', err)
    return NextResponse.json({ error: 'phobs_unavailable' }, { status: 502 })
  }
}

import { NextResponse } from 'next/server'

import { getRateDetails, type PhobsLang } from '@/lib/phobs'
import { getPhobsUnitIdForRoom } from '@/lib/phobsRooms'
import { parseStayParams } from '@/lib/phobsParams'

const RATE_ID = /^[A-Za-z0-9_-]{1,40}$/
const LANGS: readonly string[] = ['en', 'hr', 'de']

/** Policies of one rate plan for a stay (cancellation, guarantee, check-in/out, VAT, payment methods). */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomSlug = searchParams.get('room')
  const rateId = searchParams.get('rate')
  const lang = searchParams.get('lang') ?? 'en'

  const parsed = parseStayParams(searchParams)
  if (!roomSlug || !rateId || !parsed.ok) {
    return NextResponse.json(
      { error: parsed.ok ? 'missing_params' : parsed.error },
      { status: 400 },
    )
  }
  if (!RATE_ID.test(rateId) || !LANGS.includes(lang)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
  }

  const unitId = await getPhobsUnitIdForRoom(roomSlug)
  if (!unitId) {
    return NextResponse.json({ error: 'not_configured' }, { status: 404 })
  }

  const { dateFrom, nights, adults, childAges } = parsed.stay
  try {
    const details = await getRateDetails({
      unitId,
      rateId,
      dateFrom,
      nights,
      adults,
      childAges,
      lang: lang as PhobsLang,
    })
    return NextResponse.json({ details })
  } catch (err) {
    console.error('Phobs rate details failed:', err)
    return NextResponse.json({ error: 'phobs_unavailable' }, { status: 502 })
  }
}

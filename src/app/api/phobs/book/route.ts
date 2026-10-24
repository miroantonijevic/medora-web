import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getPriceQuote, createTestBooking, verifyBooking, isTestModeUnit } from '@/lib/phobs'
import { MAX_CHILDREN, MAX_CHILD_AGE, MAX_NIGHTS, isValidAdults, parseYMD } from '@/lib/phobsParams'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type BookRequestBody = {
  roomSlug?: unknown
  rateId?: unknown
  dateFrom?: unknown
  nights?: unknown
  adults?: unknown
  childAges?: unknown
  guest?: {
    firstName?: unknown
    lastName?: unknown
    email?: unknown
    phone?: unknown
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: BookRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const roomSlug = typeof body.roomSlug === 'string' ? body.roomSlug : null
  const rateId = typeof body.rateId === 'string' ? body.rateId : null
  const dateFrom = parseYMD(body.dateFrom)
  const nights = Number(body.nights)
  const adults = Number(body.adults)
  const childAges = Array.isArray(body.childAges)
    ? body.childAges.filter(
        (age): age is number => typeof age === 'number' && age >= 0 && age <= MAX_CHILD_AGE,
      )
    : []
  const firstName = typeof body.guest?.firstName === 'string' ? body.guest.firstName.trim() : ''
  const lastName = typeof body.guest?.lastName === 'string' ? body.guest.lastName.trim() : ''
  const email = typeof body.guest?.email === 'string' ? body.guest.email.trim() : ''
  const phone = typeof body.guest?.phone === 'string' ? body.guest.phone.trim() : undefined

  if (
    !roomSlug ||
    !rateId ||
    !dateFrom ||
    !Number.isInteger(nights) ||
    nights < 1 ||
    nights > MAX_NIGHTS ||
    !isValidAdults(adults) ||
    childAges.length > MAX_CHILDREN
  ) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
  }
  if (!firstName || firstName.length > 100 || !lastName || lastName.length > 100) {
    return NextResponse.json({ error: 'missing_guest_name' }, { status: 400 })
  }
  if (!email || email.length > 200 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (phone && phone.length > 40) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
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
    return NextResponse.json({ error: 'room_not_found' }, { status: 404 })
  }

  // Booking creation is only wired up for the internal test room — production has no
  // PCBookingNew permission yet. Reject early with a clear reason instead of calling Phobs.
  if (!isTestModeUnit(unitId)) {
    return NextResponse.json({ error: 'not_available_yet' }, { status: 403 })
  }

  try {
    const quote = await getPriceQuote({ unitId, rateId, dateFrom, nights, adults, childAges })
    if (!quote.success) {
      console.error('Phobs price quote failed:', quote.errors)
      return NextResponse.json({ error: 'quote_failed' }, { status: 502 })
    }

    const booking = await createTestBooking({
      unitId,
      rateId,
      dateFrom,
      nights,
      adults,
      childAges,
      guest: { firstName, lastName, email, phone },
    })
    if (!booking.success || !booking.reservationId) {
      console.error('Phobs booking creation failed:', booking.errors)
      return NextResponse.json({ error: 'booking_failed' }, { status: 502 })
    }

    const verification = await verifyBooking({
      unitId,
      bookingId: booking.bookingId,
      reservationId: booking.reservationId,
    })

    return NextResponse.json({
      success: true,
      reservationId: booking.reservationId,
      currency: quote.currency,
      grandTotal: quote.grandTotal,
      checkIn: verification.checkIn ?? dateFrom,
      checkOut: verification.checkOut,
    })
  } catch (err) {
    console.error('Phobs booking flow failed:', err)
    return NextResponse.json({ error: 'phobs_unavailable' }, { status: 502 })
  }
}

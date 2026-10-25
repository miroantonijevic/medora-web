'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { bookingService } from '@/lib/booking'
import { buildPhobsBookingLink } from '@/lib/phobsBookingLink'
import { resolveDayClick, spansTakenNight } from '@/lib/stayRange'
import { useMediaQuery } from '@/utilities/useMediaQuery'

import type { PhobsDeal, PhobsRateDetails } from '@/lib/phobs'
import type { RoomImage } from '@/lib/roomImages'

import { DealsView } from './DealsView'
import { fetchRateDetails } from './fetchRateDetails'
import { RateDetailsPanel } from './RateDetailsPanel'
import { RoomPanel } from './RoomPanel'
import { SecurityNotice } from './SecurityNotice'

import type { NightStatus as DayStatus } from '@/lib/stayRange'

type AvailabilityDay = {
  date: string
  available: boolean
  isPromo: boolean
}

type AvailabilityResponse = {
  propertyId: string
  days: AvailabilityDay[]
}

type RatePlan = {
  rateId: string
  name: string
  pricePerNight: number | null
  priceOriginalPerNight: number | null
  stayTotal: number | null
  currency: string | null
  bookUrl: string | null
  highlights: string[]
  occupancyMin: number | null
  occupancyMax: number | null
  occupancyMinAdult: number | null
  occupancyMaxAdult: number | null
  occupancyMinChd: number | null
  occupancyMaxChd: number | null
  occupancyMaxChdAge: number | null
}

type RatesResponse = {
  propertyId: string
  ratePlans: RatePlan[]
  isTestMode?: boolean
}

type GuestDetails = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type BookingResult = {
  reservationId: string
  currency: string | null
  grandTotal: number | null
  checkIn: string
  checkOut: string | null
}

type BookingStage = 'rates' | 'guest-details' | 'submitting' | 'confirmed' | 'failed'

type BookingCalendarProps = {
  roomSlug: string
  propertySlug: string
  locale: string
  triggerLabel: string
  triggerStyle: React.CSSProperties
  /** Phobs unit id for this room; when missing, falls back to the plain contact link. */
  unitPhobsId?: string | null
  /** Optional room summary shown beside the booking steps (photos + title + size/bed/capacity line). */
  roomName?: string
  /** All photos of the room; the first one is the main photo, a click opens the gallery. */
  images?: RoomImage[]
  roomMeta?: string
  /** Name of the room's group; with other rooms in it, the popup offers "show all deals" for the group. */
  groupName?: string
  hasGroupDeals?: boolean
}

const STATUS_COLOR: Record<Exclude<DayStatus, 'unknown'>, string> = {
  available: 'transparent',
  unavailable: '#fcb6b6',
  promo: '#F4B400',
}

function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

function daysBetween(fromYMD: string, toYMD_: string): number {
  const from = new Date(`${fromYMD}T00:00:00`)
  const to = new Date(`${toYMD_}T00:00:00`)
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** Builds a Mon-first 6-week grid for the given month, including leading/trailing days. */
function buildMonthGrid(monthStart: Date): Date[] {
  const firstWeekday = (monthStart.getDay() + 6) % 7 // 0 = Monday
  const gridStart = addDays(monthStart, -firstWeekday)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

export function BookingCalendar({
  roomSlug,
  propertySlug,
  locale,
  triggerLabel,
  triggerStyle,
  unitPhobsId,
  roomName,
  images,
  roomMeta,
  groupName,
  hasGroupDeals,
}: BookingCalendarProps) {
  const t = useTranslations('bookingCalendar')
  const fallbackLink = useMemo(
    () => bookingService.getBookingLink({ propertySlug, roomSlug, locale }),
    [propertySlug, roomSlug, locale],
  )

  // No Phobs mapping for this room yet — behave exactly like before (plain contact link).
  if (!unitPhobsId) {
    return (
      <a href={fallbackLink.href} style={triggerStyle}>
        {triggerLabel}
      </a>
    )
  }

  return (
    <BookingCalendarModal
      roomSlug={roomSlug}
      locale={locale}
      triggerLabel={triggerLabel}
      triggerStyle={triggerStyle}
      unitPhobsId={unitPhobsId}
      roomName={roomName}
      images={images}
      groupName={hasGroupDeals ? groupName : undefined}
      roomMeta={roomMeta}
      fallbackHref={fallbackLink.href}
      fallbackLabel={fallbackLink.label}
      t={t}
    />
  )
}

// Phobs returns per-rate-plan occupancy caps; take the most restrictive one across
// the returned plans so the guest selector never lets the user pick an unbookable combination.
function computeOccupancyLimits(ratePlans: RatePlan[] | null) {
  if (!ratePlans || ratePlans.length === 0) return null
  let maxAdults: number | null = null
  let maxChildren: number | null = null
  let maxChildAge: number | null = null
  let minOccupancy: number | null = null
  let maxTotal: number | null = null
  for (const plan of ratePlans) {
    if (plan.occupancyMaxAdult != null) {
      maxAdults =
        maxAdults == null ? plan.occupancyMaxAdult : Math.min(maxAdults, plan.occupancyMaxAdult)
    }
    if (plan.occupancyMaxChd != null) {
      maxChildren =
        maxChildren == null ? plan.occupancyMaxChd : Math.min(maxChildren, plan.occupancyMaxChd)
    }
    if (plan.occupancyMaxChdAge != null) {
      maxChildAge =
        maxChildAge == null
          ? plan.occupancyMaxChdAge
          : Math.min(maxChildAge, plan.occupancyMaxChdAge)
    }
    // Most restrictive minimum: Phobs may omit StayTotal (but still return a nightly
    // average) for a stay that doesn't meet a plan's minimum total occupancy.
    if (plan.occupancyMin != null) {
      minOccupancy =
        minOccupancy == null ? plan.occupancyMin : Math.max(minOccupancy, plan.occupancyMin)
    }
    // Combined adults+children cap — can be stricter than maxAdults/maxChildren added
    // together (e.g. max 3 adults, max 2 children, but only 3 guests total allowed).
    if (plan.occupancyMax != null) {
      maxTotal = maxTotal == null ? plan.occupancyMax : Math.min(maxTotal, plan.occupancyMax)
    }
  }
  return { maxAdults, maxChildren, maxChildAge, minOccupancy, maxTotal }
}

type OccupancyLimits = NonNullable<ReturnType<typeof computeOccupancyLimits>>

function clampGuests(adults: number, childAges: number[], limits: OccupancyLimits | null) {
  if (!limits) return { adults, childAges }
  let nextAdults = adults
  let nextChildAges = childAges
  if (limits.maxAdults != null && nextAdults > limits.maxAdults) nextAdults = limits.maxAdults
  if (limits.maxChildren != null && nextChildAges.length > limits.maxChildren) {
    nextChildAges = nextChildAges.slice(0, limits.maxChildren)
  }
  if (limits.maxTotal != null && nextAdults + nextChildAges.length > limits.maxTotal) {
    const maxChildAgesLeft = Math.max(0, limits.maxTotal - nextAdults)
    if (nextChildAges.length > maxChildAgesLeft) {
      nextChildAges = nextChildAges.slice(0, maxChildAgesLeft)
    } else {
      nextAdults = Math.max(1, limits.maxTotal - nextChildAges.length)
    }
  }
  return { adults: nextAdults, childAges: nextChildAges }
}

function getRatesKey(
  range: { start: string | null; end: string | null },
  adults: number,
  childAges: number[],
): string | null {
  if (!range.start || !range.end) return null
  return `${range.start}|${range.end}|${adults}|${childAges.join(',')}`
}

function BookingCalendarModal({
  roomSlug,
  locale,
  triggerLabel,
  triggerStyle,
  unitPhobsId,
  roomName,
  images,
  roomMeta,
  groupName,
  fallbackHref,
  fallbackLabel,
  t,
}: {
  roomSlug: string
  locale: string
  triggerLabel: string
  triggerStyle: React.CSSProperties
  unitPhobsId: string
  roomName?: string
  images?: RoomImage[]
  roomMeta?: string
  groupName?: string
  fallbackHref: string
  fallbackLabel: string
  t: ReturnType<typeof useTranslations>
}) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 900px)')
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [showDeals, setShowDeals] = useState(false)
  // The check-in for which a too-long stay was refused; the notice goes away once the check-in changes.
  const [blockedStart, setBlockedStart] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)
  const [availability, setAvailability] = useState<Map<string, AvailabilityDay>>(new Map())
  const [propertyPhobsId, setPropertyPhobsId] = useState<string | null>(null)
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [range, setRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  // Rates are keyed by the stay they were fetched for; plans/loading/error are derived from it.
  const [ratesResult, setRatesResult] = useState<{
    key: string
    plans: RatePlan[] | null
    error: boolean
  } | null>(null)
  const [adults, setAdults] = useState(2)
  const [childAges, setChildAges] = useState<number[]>([])
  const [isTestMode, setIsTestMode] = useState(false)
  const [bookingStage, setBookingStage] = useState<BookingStage>('rates')
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | null>(null)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [bookingErrorCode, setBookingErrorCode] = useState<string | null>(null)
  const [submittedGuestName, setSubmittedGuestName] = useState<string | null>(null)
  // Rapid +/- clicks (or dropdown jumps) shouldn't each trigger their own rates refetch —
  // only the settled value (after a short pause) is used to fetch/build the booking link.
  const [debouncedAdults, setDebouncedAdults] = useState(adults)
  const [debouncedChildAges, setDebouncedChildAges] = useState<number[]>(childAges)

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedAdults(adults)
      setDebouncedChildAges(childAges)
    }, 500)
    return () => clearTimeout(handle)
  }, [adults, childAges])

  const ratesKey = getRatesKey(range, debouncedAdults, debouncedChildAges)
  const currentRates = ratesKey && ratesResult?.key === ratesKey ? ratesResult : null
  const ratePlans = currentRates?.plans ?? null
  const ratesLoading = ratesKey !== null && currentRates === null
  const ratesError = currentRates?.error ?? false

  useEffect(() => {
    if (!open) return
    let cancelled = false

    fetch(
      `/api/phobs/availability?room=${encodeURIComponent(roomSlug)}&from=${toYMD(addDays(startOfMonth(new Date()), -7))}`,
    )
      .then(async (res) => {
        if (cancelled) return
        if (res.status === 404) {
          setNotConfigured(true)
          return
        }
        if (!res.ok) throw new Error('request_failed')
        const data = (await res.json()) as AvailabilityResponse
        const map = new Map<string, AvailabilityDay>()
        for (const entry of data.days) map.set(entry.date, entry)
        setAvailability(map)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, roomSlug])

  function getStatus(dateStr: string): DayStatus {
    const entry = availability.get(dateStr)
    if (!entry) return 'unknown'
    if (!entry.available) return 'unavailable'
    return entry.isPromo ? 'promo' : 'available'
  }

  function handleDayClick(dateStr: string) {
    const next = resolveDayClick(range, dateStr, getStatus)
    if (!next) {
      if (spansTakenNight(range, dateStr, getStatus)) setBlockedStart(range.start)
      return
    }

    setRange(next)
    setHoverDate(null)
  }

  // Once both dates are picked, fetch rate plans + pricing for that stay instead of redirecting blindly.
  useEffect(() => {
    const key = getRatesKey(range, debouncedAdults, debouncedChildAges)
    if (!key || !range.start || !range.end) return
    let cancelled = false

    const childrenParam =
      debouncedChildAges.length > 0 ? `&children=${debouncedChildAges.join(',')}` : ''
    fetch(
      `/api/phobs/rates?room=${encodeURIComponent(roomSlug)}&from=${range.start}&to=${range.end}&adults=${debouncedAdults}${childrenParam}`,
    )
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) throw new Error('request_failed')
        const data = (await res.json()) as RatesResponse
        if (cancelled) return
        setRatesResult({ key, plans: data.ratePlans, error: false })
        setPropertyPhobsId(data.propertyId)
        setIsTestMode(Boolean(data.isTestMode))
        // Phobs doesn't reject over-occupancy requests, so correct a selection that exceeds the
        // caps learned from this response instead of silently showing a stale/incomplete price.
        const clamped = clampGuests(
          debouncedAdults,
          debouncedChildAges,
          computeOccupancyLimits(data.ratePlans),
        )
        if (clamped.adults !== debouncedAdults) setAdults(clamped.adults)
        if (clamped.childAges.length !== debouncedChildAges.length) setChildAges(clamped.childAges)
      })
      .catch(() => {
        if (!cancelled) setRatesResult({ key, plans: null, error: true })
      })

    return () => {
      cancelled = true
    }
  }, [range, roomSlug, debouncedAdults, debouncedChildAges])

  // Phobs returns per-rate-plan occupancy caps; take the most restrictive one across
  // the returned plans so the guest selector never lets the user pick an unbookable combination.
  const occupancyLimits = useMemo(() => computeOccupancyLimits(ratePlans), [ratePlans])

  function changeDates() {
    setShowDeals(false)
    setRange({ start: null, end: null })
    setRatesResult(null)
    setHoverDate(null)
    setBookingStage('rates')
    setSelectedRatePlan(null)
    setBookingResult(null)
    setBookingErrorCode(null)
  }

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])
  const monthLabel = viewMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const initialMonth = useMemo(() => startOfMonth(new Date()), [])
  const isAtInitialMonth = viewMonth.getTime() <= initialMonth.getTime()
  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 1) // a Monday
    return Array.from({ length: 7 }, (_, i) =>
      addDays(base, i).toLocaleDateString(locale, { weekday: 'short' }),
    )
  }, [locale])

  function openModal() {
    setLoading(true)
    setError(false)
    setNotConfigured(false)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setShowDeals(false)
    setRange({ start: null, end: null })
    setRatesResult(null)
    setHoverDate(null)
    setBookingStage('rates')
    setSelectedRatePlan(null)
    setBookingResult(null)
    setBookingErrorCode(null)
  }

  function selectTestRate(plan: RatePlan) {
    setShowDeals(false)
    setSelectedRatePlan(plan)
    setBookingStage('guest-details')
  }

  function selectDealInSite(deal: PhobsDeal): boolean {
    if (!isTestMode || deal.unitId !== unitPhobsId) return false
    selectTestRate({
      rateId: deal.rateId,
      name: deal.rateName,
      pricePerNight: deal.pricePerNight,
      priceOriginalPerNight: deal.priceOriginalPerNight,
      stayTotal: deal.stayTotal,
      currency: deal.currency,
      bookUrl: null,
      highlights: deal.highlights,
      occupancyMin: null,
      occupancyMax: null,
      occupancyMinAdult: null,
      occupancyMaxAdult: null,
      occupancyMinChd: null,
      occupancyMaxChd: null,
      occupancyMaxChdAge: null,
    })
    return true
  }

  function dealHref(deal: PhobsDeal): string {
    return buildPhobsBookingLink({
      propertyPhobsId: deal.propertyId,
      unitPhobsId: deal.unitId,
      dateFrom: range.start!,
      nights: daysBetween(range.start!, range.end!),
      lang: locale,
      rateId: deal.rateId,
      adults: debouncedAdults,
      childAges: debouncedChildAges,
    })
  }

  async function submitTestBooking(guest: GuestDetails) {
    if (!selectedRatePlan || !range.start || !range.end) return
    setBookingStage('submitting')
    setBookingErrorCode(null)
    setSubmittedGuestName(guest.firstName)
    try {
      const res = await fetch('/api/phobs/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomSlug,
          rateId: selectedRatePlan.rateId,
          dateFrom: range.start,
          nights: daysBetween(range.start, range.end),
          adults: debouncedAdults,
          childAges: debouncedChildAges,
          guest: {
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phone: guest.phone || undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setBookingErrorCode(typeof data.error === 'string' ? data.error : 'unknown')
        setBookingStage('failed')
        return
      }
      setBookingResult({
        reservationId: data.reservationId,
        currency: data.currency ?? null,
        grandTotal: data.grandTotal ?? null,
        checkIn: data.checkIn ?? range.start,
        checkOut: data.checkOut ?? range.end,
      })
      setBookingStage('confirmed')
    } catch {
      setBookingErrorCode('network')
      setBookingStage('failed')
    }
  }

  const showRates = Boolean(range.start && range.end)

  return (
    <>
      <button type="button" style={triggerStyle} onClick={openModal}>
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isDesktop ? 24 : 0,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: isDesktop ? 16 : 0,
              boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              width: '100%',
              maxWidth: isDesktop ? 1280 : 'none',
              height: isDesktop ? 'auto' : '100dvh',
              maxHeight: isDesktop ? 'min(920px, calc(100dvh - 48px))' : '100dvh',
              display: 'flex',
              flexDirection: isDesktop ? 'row' : 'column',
              overflow: isDesktop ? 'hidden' : 'auto',
              fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
              position: 'relative',
            }}
          >
            <RoomPanel
              images={images ?? []}
              roomName={roomName}
              roomMeta={roomMeta}
              layout={isDesktop ? 'aside' : 'banner'}
              photosLabel={t('photos', { count: images?.length ?? 0 })}
              onOpenGallery={setGalleryIndex}
            />

            <button
              type="button"
              aria-label={t('close')}
              onClick={close}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                border: 'none',
                background: 'rgba(255,255,255,0.92)',
                color: '#334155',
                boxShadow: '0 1px 4px rgba(15,23,42,0.25)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ flex: 1, minWidth: 0, overflowY: isDesktop ? 'auto' : 'visible' }}>
              <div style={{ padding: isDesktop ? '24px 28px 24px' : '16px 16px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
                  {showRates && (
                    <button
                      type="button"
                      onClick={changeDates}
                      aria-label={t('changeDates')}
                      style={{
                        border: 'none',
                        background: '#f1f5f9',
                        borderRadius: 8,
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#334155',
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      ←
                    </button>
                  )}
                  <div>
                    <p style={{ margin: 0, fontSize: 14.5, color: '#1e293b', fontWeight: 700 }}>
                      {showRates ? (
                        <>
                          {range.start} <span style={{ color: '#94a3b8', fontWeight: 500 }}>→</span>{' '}
                          {range.end}
                        </>
                      ) : (
                        t('selectDates')
                      )}
                    </p>
                    {showRates && (
                      <p
                        style={{
                          margin: '2px 0 0',
                          fontSize: 12,
                          color: '#94a3b8',
                          fontWeight: 500,
                        }}
                      >
                        {t('nights', { count: daysBetween(range.start!, range.end!) })}
                      </p>
                    )}
                  </div>
                </div>

                {notConfigured ? (
                  <div style={{ padding: '20px 0' }}>
                    <a
                      href={fallbackHref}
                      style={{
                        display: 'inline-block',
                        background: '#4f8ef7',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {fallbackLabel}
                    </a>
                  </div>
                ) : showRates ? (
                  <>
                    {isTestMode && <TestModeBanner t={t} />}
                    {bookingStage === 'rates' &&
                      showDeals &&
                      groupName &&
                      range.start &&
                      range.end && (
                        <DealsView
                          roomSlug={roomSlug}
                          groupName={groupName}
                          from={range.start}
                          to={range.end}
                          adults={debouncedAdults}
                          childAges={debouncedChildAges}
                          locale={locale}
                          buildHref={dealHref}
                          onSelectInSite={selectDealInSite}
                          onBack={() => setShowDeals(false)}
                          t={t}
                        />
                      )}
                    {bookingStage === 'rates' && !(showDeals && groupName) && (
                      <>
                        <GuestSelector
                          adults={adults}
                          childAges={childAges}
                          onAdultsChange={setAdults}
                          onChildAgesChange={setChildAges}
                          maxAdults={occupancyLimits?.maxAdults ?? null}
                          maxChildren={occupancyLimits?.maxChildren ?? null}
                          maxChildAge={occupancyLimits?.maxChildAge ?? null}
                          minOccupancy={occupancyLimits?.minOccupancy ?? null}
                          maxTotal={occupancyLimits?.maxTotal ?? null}
                          t={t}
                        />
                        <RatePlanList
                          ratePlans={ratePlans}
                          loading={ratesLoading}
                          error={ratesError}
                          isTestMode={isTestMode}
                          onSelectTestRate={selectTestRate}
                          nights={daysBetween(range.start!, range.end!)}
                          stayKey={ratesKey ?? ''}
                          loadDetails={(rateId) =>
                            fetchRateDetails({
                              roomSlug,
                              rateId,
                              from: range.start!,
                              to: range.end!,
                              adults: debouncedAdults,
                              childAges: debouncedChildAges,
                              lang: locale,
                            })
                          }
                          buildHref={(rateId) =>
                            propertyPhobsId
                              ? buildPhobsBookingLink({
                                  propertyPhobsId,
                                  unitPhobsId,
                                  dateFrom: range.start!,
                                  nights: daysBetween(range.start!, range.end!),
                                  lang: locale,
                                  rateId,
                                  adults: debouncedAdults,
                                  childAges: debouncedChildAges,
                                })
                              : null
                          }
                          t={t}
                        />
                        {groupName && !ratesLoading && ratePlans && ratePlans.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowDeals(true)}
                            style={{
                              width: '100%',
                              marginTop: 14,
                              padding: '11px 14px',
                              background: '#fff',
                              border: '1.5px solid #2563eb',
                              borderRadius: 10,
                              color: '#2563eb',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            {t('showAllDeals', { group: groupName })}
                          </button>
                        )}
                        {!ratesLoading && ratePlans && ratePlans.length > 0 && (
                          <SecurityNotice t={t} />
                        )}
                      </>
                    )}
                    {bookingStage === 'guest-details' && selectedRatePlan && (
                      <GuestDetailsForm
                        plan={selectedRatePlan}
                        nights={daysBetween(range.start!, range.end!)}
                        onBack={() => setBookingStage('rates')}
                        onSubmit={submitTestBooking}
                        t={t}
                      />
                    )}
                    {bookingStage === 'submitting' && <BookingSubmitting t={t} />}
                    {bookingStage === 'confirmed' && bookingResult && (
                      <BookingConfirmation
                        result={bookingResult}
                        guestFirstName={submittedGuestName}
                        onClose={close}
                        onBookAnother={changeDates}
                        t={t}
                      />
                    )}
                    {bookingStage === 'failed' && (
                      <BookingFailed
                        errorCode={bookingErrorCode}
                        onRetry={() => setBookingStage('guest-details')}
                        onBackToRates={() => setBookingStage('rates')}
                        t={t}
                      />
                    )}
                  </>
                ) : error ? (
                  <p style={{ color: '#b91c1c', fontSize: 13 }}>{t('error')}</p>
                ) : loading ? (
                  <CalendarSkeleton weekdayLabels={weekdayLabels} />
                ) : (
                  <>
                    <CalendarGrid
                      monthLabel={monthLabel}
                      weekdayLabels={weekdayLabels}
                      grid={grid}
                      viewMonth={viewMonth}
                      getStatus={getStatus}
                      range={range}
                      t={t}
                      hoverDate={hoverDate}
                      onDayHover={setHoverDate}
                      onDayClick={handleDayClick}
                      onPrevMonth={() =>
                        setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                      }
                      onNextMonth={() =>
                        setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                      }
                      prevMonthDisabled={isAtInitialMonth}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 20,
                        padding: '8px 0 2px',
                        fontSize: '11.5px',
                        fontWeight: 500,
                        color: '#64748b',
                        borderTop: '1px solid #f1f5f9',
                        marginTop: 6,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: 3,
                            display: 'inline-block',
                            background: '#fcb6b6',
                            border: '1px solid #e88',
                          }}
                        />
                        {t('unavailable')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: 3,
                            display: 'inline-block',
                            background: '#F4B400',
                            border: '1px solid #c8900a',
                          }}
                        />
                        {t('lowerPrice')}
                      </span>
                    </div>

                    {range.start && (
                      <p
                        style={{
                          fontSize: 13,
                          color: '#334155',
                          margin: '10px 0 0',
                          textAlign: 'center',
                        }}
                      >
                        {t('checkIn')}: <strong>{range.start}</strong>
                        {range.end && (
                          <>
                            {' '}
                            — {t('checkOut')}: <strong>{range.end}</strong>
                          </>
                        )}
                      </p>
                    )}
                    {range.start && !range.end && blockedStart === range.start && (
                      <p
                        role="alert"
                        style={{
                          fontSize: 12.5,
                          color: '#b91c1c',
                          margin: '6px 0 0',
                          textAlign: 'center',
                        }}
                      >
                        {t('rangeTakenNight')}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {galleryIndex !== null && images && images.length > 0 && (
        <Lightbox
          labels={{ Close: t('close'), Next: t('next'), Previous: t('previous') }}
          open
          index={galleryIndex}
          close={() => setGalleryIndex(null)}
          slides={images.map((image) => ({ src: image.url, alt: image.alt ?? roomName ?? '' }))}
        />
      )}
    </>
  )
}

function TestModeBanner({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff7ed',
        border: '1px solid #fdba74',
        color: '#9a3412',
        borderRadius: 10,
        padding: '9px 12px',
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 14,
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }} aria-hidden>
        🧪
      </span>
      <span>{t('testModeBanner')}</span>
    </div>
  )
}

function GuestDetailsForm({
  plan,
  nights,
  onBack,
  onSubmit,
  t,
}: {
  plan: RatePlan
  nights: number
  onBack: () => void
  onSubmit: (guest: GuestDetails) => void
  t: ReturnType<typeof useTranslations>
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0 && emailValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '9px 11px',
    fontSize: 13.5,
    color: '#0f172a',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 5,
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="button"
        onClick={onBack}
        style={{
          border: 'none',
          background: 'none',
          color: '#4f8ef7',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ← {t('backToRates')}
      </button>

      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
            {plan.name || plan.rateId}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#64748b' }}>
            {t('nights', { count: nights })}
          </p>
        </div>
        {plan.stayTotal != null && (
          <p
            style={{
              margin: 0,
              fontSize: 15.5,
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
            }}
          >
            {plan.stayTotal} {plan.currency}
          </p>
        )}
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
        {t('guestDetailsTitle')}
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('firstName')}</label>
          <input
            style={inputStyle}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('lastName')}</label>
          <input
            style={inputStyle}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>{t('email')}</label>
        <input
          type="email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          required
        />
        {touched && !emailValid && (
          <p style={{ margin: '5px 0 0', fontSize: 11.5, color: '#b91c1c' }}>{t('invalidEmail')}</p>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{t('phoneOptional')}</label>
        <input
          type="tel"
          style={inputStyle}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
        />
      </div>

      <SecurityNotice t={t} />

      <button
        type="submit"
        style={{
          width: '100%',
          border: 'none',
          background: '#4f8ef7',
          color: '#fff',
          padding: '11px 16px',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13.5,
          cursor: 'pointer',
        }}
      >
        {t('confirmTestBooking')}
      </button>
    </form>
  )
}

function BookingSubmitting({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '36px 0',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '3px solid #e2e8f0',
          borderTopColor: '#4f8ef7',
          animation: 'medora-spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0, fontSize: 13, color: '#334155', fontWeight: 600 }}>
        {t('submittingBooking')}
      </p>
      <style>{`@keyframes medora-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 700, color: '#0f172a' }}>{value}</span>
    </div>
  )
}

function BookingConfirmation({
  result,
  guestFirstName,
  onClose,
  onBookAnother,
  t,
}: {
  result: BookingResult
  guestFirstName: string | null
  onClose: () => void
  onBookAnother: () => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div style={{ padding: '8px 0 4px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#166534',
          }}
        >
          ✓
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: '#0f172a',
            textAlign: 'center',
          }}
        >
          {guestFirstName ? t('confirmedWithName', { name: guestFirstName }) : t('confirmedTitle')}
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
        }}
      >
        <SummaryRow label={t('reservationId')} value={result.reservationId} />
        <SummaryRow label={t('checkIn')} value={result.checkIn} />
        {result.checkOut && <SummaryRow label={t('checkOut')} value={result.checkOut} />}
        {result.grandTotal != null && (
          <SummaryRow
            label={t('totalStay')}
            value={`${result.grandTotal} ${result.currency ?? ''}`}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          onClick={onBookAnother}
          style={{
            flex: 1,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#334155',
            padding: '10px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {t('bookAnother')}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            border: 'none',
            background: '#4f8ef7',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  )
}

function BookingFailed({
  onRetry,
  onBackToRates,
  t,
}: {
  errorCode: string | null
  onRetry: () => void
  onBackToRates: () => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div style={{ padding: '8px 0 4px', textAlign: 'center' }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          color: '#b91c1c',
          margin: '0 auto 12px',
        }}
      >
        ✕
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
        {t('bookingFailedTitle')}
      </p>
      <p style={{ margin: '0 0 18px', fontSize: 12.5, color: '#64748b' }}>
        {t('bookingFailedBody')}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onBackToRates}
          style={{
            flex: 1,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#334155',
            padding: '10px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {t('backToRates')}
        </button>
        <button
          type="button"
          onClick={onRetry}
          style={{
            flex: 1,
            border: 'none',
            background: '#4f8ef7',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}

function GuestSelector({
  adults,
  childAges,
  onAdultsChange,
  onChildAgesChange,
  maxAdults,
  maxChildren,
  maxChildAge,
  minOccupancy,
  maxTotal,
  t,
}: {
  adults: number
  childAges: number[]
  onAdultsChange: (value: number) => void
  onChildAgesChange: (value: number[]) => void
  maxAdults: number | null
  maxChildren: number | null
  maxChildAge: number | null
  minOccupancy: number | null
  maxTotal: number | null
  t: ReturnType<typeof useTranslations>
}) {
  const effectiveMaxAdults = maxAdults ?? 8
  const effectiveMaxChildren = maxChildren ?? 4
  const effectiveMaxChildAge = maxChildAge ?? 17
  const belowMinOccupancy = minOccupancy != null && adults + childAges.length < minOccupancy
  // Combined cap can be stricter than the per-type maxes added together (e.g. max 3 adults,
  // max 2 children, but only 3 guests total) — clamp both steppers against the remaining headroom.
  const adultsCap =
    maxTotal != null
      ? Math.min(effectiveMaxAdults, maxTotal - childAges.length)
      : effectiveMaxAdults
  const childrenCap =
    maxTotal != null ? Math.min(effectiveMaxChildren, maxTotal - adults) : effectiveMaxChildren

  function handleChildrenCountChange(count: number) {
    if (count > childAges.length) {
      const extra = Array.from({ length: count - childAges.length }, () =>
        Math.min(5, effectiveMaxChildAge),
      )
      onChildAgesChange([...childAges, ...extra])
    } else {
      onChildAgesChange(childAges.slice(0, count))
    }
  }

  function stepperButtonStyle(disabled: boolean): React.CSSProperties {
    return {
      width: 26,
      height: 26,
      borderRadius: 7,
      border: '1px solid #e2e8f0',
      background: disabled ? '#f8fafc' : '#fff',
      color: disabled ? '#cbd5e1' : '#334155',
      fontSize: 14,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      lineHeight: '24px',
    }
  }

  const countSelectStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 7,
    padding: '4px 6px',
    fontSize: 13.5,
    fontWeight: 600,
    color: '#1e293b',
    background: '#fff',
    cursor: 'pointer',
    minWidth: 44,
    textAlign: 'center',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{t('adults')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            disabled={adults <= 1}
            onClick={() => onAdultsChange(Math.max(1, adults - 1))}
            style={stepperButtonStyle(adults <= 1)}
          >
            −
          </button>
          <select
            aria-label={t('adults')}
            value={adults}
            onChange={(e) => onAdultsChange(Number(e.target.value))}
            style={countSelectStyle}
          >
            {Array.from({ length: Math.max(1, adultsCap) }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={adults >= adultsCap}
            onClick={() => onAdultsChange(Math.min(adultsCap, adults + 1))}
            style={stepperButtonStyle(adults >= adultsCap)}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{t('children')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            disabled={childAges.length <= 0}
            onClick={() => onChildAgesChange(childAges.slice(0, -1))}
            style={stepperButtonStyle(childAges.length <= 0)}
          >
            −
          </button>
          <select
            aria-label={t('children')}
            value={childAges.length}
            onChange={(e) => handleChildrenCountChange(Number(e.target.value))}
            style={countSelectStyle}
          >
            {Array.from({ length: Math.max(0, childrenCap) + 1 }, (_, i) => i).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={childAges.length >= childrenCap}
            onClick={() => onChildAgesChange([...childAges, Math.min(5, effectiveMaxChildAge)])}
            style={stepperButtonStyle(childAges.length >= childrenCap)}
          >
            +
          </button>
        </div>
      </div>

      {childAges.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {childAges.map((age, index) => (
            <div
              key={index}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span style={{ fontSize: 12.5, color: '#64748b' }}>
                {t('age')} — {t('children')} {index + 1}
              </span>
              <select
                value={age}
                onChange={(e) => {
                  const next = [...childAges]
                  next[index] = Number(e.target.value)
                  onChildAgesChange(next)
                }}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 7,
                  padding: '4px 8px',
                  fontSize: 12.5,
                  color: '#1e293b',
                }}
              >
                {Array.from({ length: effectiveMaxChildAge + 1 }, (_, i) => i).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {maxAdults != null && (
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>
          {t('maxOccupancyNote', { adults: maxAdults, children: maxChildren ?? 0 })}
        </p>
      )}
      {belowMinOccupancy && (
        <p style={{ fontSize: 11.5, color: '#b45309', margin: 0 }}>
          {t('minOccupancyNote', { count: minOccupancy! })}
        </p>
      )}
    </div>
  )
}

function RatePlanList({
  ratePlans,
  loading,
  error,
  buildHref,
  isTestMode,
  onSelectTestRate,
  nights,
  stayKey,
  loadDetails,
  t,
}: {
  ratePlans: RatePlan[] | null
  loading: boolean
  error: boolean
  buildHref: (rateId: string) => string | null
  isTestMode?: boolean
  onSelectTestRate?: (plan: RatePlan) => void
  nights: number
  /** Identifies the stay the rates belong to, so open detail panels reset when it changes. */
  stayKey: string
  loadDetails: (rateId: string) => Promise<PhobsRateDetails>
  t: ReturnType<typeof useTranslations>
}) {
  const [hoveredRateId, setHoveredRateId] = useState<string | null>(null)

  const bestRateId = useMemo(() => {
    if (!ratePlans || ratePlans.length < 2) return null
    let best: RatePlan | null = null
    for (const plan of ratePlans) {
      const value = plan.stayTotal ?? plan.pricePerNight
      if (value == null) continue
      const bestValue = best ? (best.stayTotal ?? best.pricePerNight) : null
      if (bestValue == null || value < bestValue) best = plan
    }
    return best?.rateId ?? null
  }, [ratePlans])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 64,
              borderRadius: 12,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #f8fafc 37%, #f1f5f9 63%)',
              backgroundSize: '400% 100%',
              animation: 'medora-rate-shimmer 1.4s ease infinite',
            }}
          />
        ))}
        <style>{`
          @keyframes medora-rate-shimmer {
            0% { background-position: 100% 50%; }
            100% { background-position: 0 50%; }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return <p style={{ color: '#b91c1c', fontSize: 13 }}>{t('ratesError')}</p>
  }

  if (!ratePlans || ratePlans.length === 0) {
    return <p style={{ color: '#64748b', fontSize: 13 }}>{t('noRatesFound')}</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ratePlans.map((plan) => {
        const hasDiscount =
          plan.priceOriginalPerNight != null &&
          plan.pricePerNight != null &&
          plan.priceOriginalPerNight > plan.pricePerNight
        const discountPct = hasDiscount
          ? Math.round((1 - plan.pricePerNight! / plan.priceOriginalPerNight!) * 100)
          : null
        const isBest = plan.rateId === bestRateId
        const isHovered = plan.rateId === hoveredRateId
        const href = buildHref(plan.rateId)

        return (
          <div
            key={plan.rateId}
            onMouseEnter={() => setHoveredRateId(plan.rateId)}
            onMouseLeave={() => setHoveredRateId(null)}
            style={{
              position: 'relative',
              border: isBest
                ? '2px solid #2563eb'
                : isHovered
                  ? '1px solid #4f8ef7'
                  : '1px solid #e2e8f0',
              background: isBest ? '#eff6ff' : '#fff',
              borderRadius: 12,
              // The 2px border of the highlighted rate is compensated so all cards keep the same size.
              padding: isBest ? '13px 15px' : '14px 16px',
              transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
              boxShadow: isHovered
                ? '0 6px 16px rgba(79,142,247,0.16)'
                : '0 1px 2px rgba(15,23,42,0.04)',
              transform: isHovered ? 'translateY(-1px)' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                    {plan.name || plan.rateId}
                  </p>
                  {isBest && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#fff',
                        background: '#2563eb',
                        padding: '2px 7px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('bestPrice')}
                    </span>
                  )}
                  {discountPct != null && discountPct > 0 && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#9a3412',
                        background: '#ffedd5',
                        padding: '2px 7px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      -{discountPct}%
                    </span>
                  )}
                </div>
                {plan.highlights?.length > 0 && (
                  <ul
                    style={{
                      margin: '6px 0 0',
                      padding: 0,
                      listStyle: 'none',
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    {plan.highlights.map((item) => (
                      <li key={item}>✓ {item}</li>
                    ))}
                  </ul>
                )}
                {plan.pricePerNight != null && (
                  <p style={{ margin: '6px 0 0', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    {hasDiscount && (
                      <span
                        style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}
                      >
                        {plan.priceOriginalPerNight} {plan.currency}
                      </span>
                    )}
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: '#0f172a' }}>
                      {plan.pricePerNight} {plan.currency}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>/ {t('perNight')}</span>
                  </p>
                )}
                {plan.stayTotal != null && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                    {t('totalStay')}: {plan.stayTotal} {plan.currency}
                  </p>
                )}
              </div>
              {isTestMode ? (
                <button
                  type="button"
                  onClick={() => onSelectTestRate?.(plan)}
                  style={{
                    flexShrink: 0,
                    border: 'none',
                    background: isHovered ? '#3d7ce0' : '#4f8ef7',
                    color: '#fff',
                    padding: '9px 16px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 12.5,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                >
                  {t('selectRate')} →
                </button>
              ) : (
                href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flexShrink: 0,
                      background: isHovered ? '#3d7ce0' : '#4f8ef7',
                      color: '#fff',
                      padding: '9px 16px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: 12.5,
                      whiteSpace: 'nowrap',
                      transition: 'background 150ms ease',
                    }}
                  >
                    {t('continueToBook')} →
                  </a>
                )
              )}
            </div>
            <RateDetailsPanel
              key={`${plan.rateId}|${stayKey}`}
              load={() => loadDetails(plan.rateId)}
              saving={
                hasDiscount && discountPct
                  ? {
                      amount:
                        Math.round(
                          (plan.priceOriginalPerNight! - plan.pricePerNight!) * nights * 100,
                        ) / 100,
                      percent: discountPct,
                      currency: plan.currency,
                    }
                  : null
              }
              t={t}
            />
          </div>
        )
      })}
    </div>
  )
}

function CalendarSkeleton({ weekdayLabels }: { weekdayLabels: string[] }) {
  const shimmerStyle: React.CSSProperties = {
    borderRadius: 8,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #f8fafc 37%, #f1f5f9 63%)',
    backgroundSize: '400% 100%',
    animation: 'medora-rate-shimmer 1.4s ease infinite',
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ ...shimmerStyle, width: 28, height: 28, borderRadius: '50%' }} />
        <div style={{ ...shimmerStyle, width: 110, height: 16 }} />
        <div style={{ ...shimmerStyle, width: 28, height: 28, borderRadius: '50%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {weekdayLabels.map((label) => (
          <div
            key={label}
            style={{
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textAlign: 'center',
              padding: '4px 0',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: 42 }, (_, i) => (
          <div key={i} style={{ ...shimmerStyle, aspectRatio: '1', margin: 2 }} />
        ))}
      </div>

      <style>{`
        @keyframes medora-rate-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </div>
  )
}

function CalendarGrid({
  monthLabel,
  weekdayLabels,
  grid,
  viewMonth,
  getStatus,
  range,
  hoverDate,
  onDayHover,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  prevMonthDisabled,
  t,
}: {
  t: ReturnType<typeof useTranslations>
  monthLabel: string
  weekdayLabels: string[]
  grid: Date[]
  viewMonth: Date
  getStatus: (dateStr: string) => DayStatus
  range: { start: string | null; end: string | null }
  hoverDate: string | null
  onDayHover: (dateStr: string | null) => void
  onDayClick: (dateStr: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  prevMonthDisabled: boolean
}) {
  const todayStr = toYMD(new Date())

  // While picking the second date, preview the range between the first pick and the hovered day,
  // regardless of whether the hovered day is before or after it.
  // A day that cannot be picked (a stay would span a taken night) previews nothing.
  const hoverStay =
    range.start && !range.end && hoverDate && hoverDate !== range.start
      ? resolveDayClick(range, hoverDate, getStatus)
      : null
  const isPreviewing = !!hoverStay?.end
  const previewLow = isPreviewing ? hoverStay!.start : null
  const previewHigh = isPreviewing ? hoverStay!.end : null
  // Before any date is picked, preview just the hovered day.
  const isFirstPickPreview =
    !range.start && !!hoverDate && !!resolveDayClick(range, hoverDate, getStatus)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <button
          type="button"
          onClick={onPrevMonth}
          disabled={prevMonthDisabled}
          aria-label={t('previousMonth')}
          style={{ ...navButtonStyle, opacity: prevMonthDisabled ? 0.35 : 1 }}
        >
          ‹
        </button>
        <span
          style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label={t('nextMonth')}
          style={navButtonStyle}
        >
          ›
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {weekdayLabels.map((label) => (
          <div
            key={label}
            style={{
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textAlign: 'center',
              padding: '4px 0',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {grid.map((date) => {
          const dateStr = toYMD(date)
          const prevDateStr = toYMD(addDays(date, -1))
          const status = getStatus(dateStr)
          const prevStatus = getStatus(prevDateStr)
          const isOtherMonth = date.getMonth() !== viewMonth.getMonth()
          const isToday = dateStr === todayStr
          const isSelectedEdge = dateStr === range.start || dateStr === range.end
          const isPreviewEdge = (isPreviewing || isFirstPickPreview) && dateStr === hoverDate
          const isInRange =
            !!(range.start && range.end && dateStr > range.start && dateStr < range.end) ||
            !!(previewLow && previewHigh && dateStr > previewLow && dateStr < previewHigh)
          // Taken days still end a stay that arrives on them, so they stay clickable when they can.
          const disabled =
            range.start && !range.end
              ? dateStr < todayStr
              : !resolveDayClick(range, dateStr, getStatus)

          const leftColor = STATUS_COLOR[prevStatus === 'unknown' ? 'available' : prevStatus]
          const rightColor = STATUS_COLOR[status === 'unknown' ? 'available' : status]
          const splitBackground =
            leftColor === 'transparent' && rightColor === 'transparent'
              ? 'none'
              : `linear-gradient(to right, ${leftColor} 0%, ${leftColor} 50%, ${rightColor} 50%, ${rightColor} 100%)`

          let background = splitBackground
          let color = isOtherMonth ? '#cbd5e1' : '#334155'
          if (isSelectedEdge) {
            background = '#4f8ef7'
            color = '#fff'
          } else if (isPreviewEdge) {
            background = '#7fb2f7'
            color = '#fff'
          } else if (isInRange) {
            background = '#dbeafe'
            color = '#1e40af'
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={(disabled && !isOtherMonth) || isOtherMonth}
              onClick={() => onDayClick(dateStr)}
              onMouseEnter={() => onDayHover(dateStr)}
              onMouseLeave={() => onDayHover(null)}
              style={{
                aspectRatio: '1',
                border: isToday ? '1.5px solid #4f8ef7' : 'none',
                borderRadius: 8,
                backgroundColor: background.startsWith('linear-gradient')
                  ? 'transparent'
                  : background === 'none'
                    ? 'transparent'
                    : background,
                backgroundImage: background.startsWith('linear-gradient') ? background : 'none',
                backgroundClip: 'padding-box',
                color,
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 500,
                cursor: disabled || isOtherMonth ? 'default' : 'pointer',
                opacity: isOtherMonth ? 0.5 : 1,
              }}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const navButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: 8,
  backgroundColor: '#f1f5f9',
  border: '1.5px solid #e2e8f0',
  fontSize: 16,
  color: '#475569',
}

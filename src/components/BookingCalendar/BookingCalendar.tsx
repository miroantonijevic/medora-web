'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { bookingService } from '@/lib/booking'
import { buildPhobsBookingLink } from '@/lib/phobsBookingLink'

type DayStatus = 'unknown' | 'available' | 'unavailable' | 'promo'

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
}

type BookingCalendarProps = {
  roomSlug: string
  propertySlug: string
  locale: string
  triggerLabel: string
  triggerStyle: React.CSSProperties
  /** Phobs unit id for this room; when missing, falls back to the plain contact link. */
  unitPhobsId?: string | null
  /** Optional room summary shown at the top of the modal (image + title + size/bed/capacity line). */
  roomName?: string
  roomImageUrl?: string | null
  roomMeta?: string
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
  roomImageUrl,
  roomMeta,
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
      roomImageUrl={roomImageUrl}
      roomMeta={roomMeta}
      fallbackHref={fallbackLink.href}
      fallbackLabel={fallbackLink.label}
      t={t}
    />
  )
}

function BookingCalendarModal({
  roomSlug,
  locale,
  triggerLabel,
  triggerStyle,
  unitPhobsId,
  roomName,
  roomImageUrl,
  roomMeta,
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
  roomImageUrl?: string | null
  roomMeta?: string
  fallbackHref: string
  fallbackLabel: string
  t: ReturnType<typeof useTranslations>
}) {
  const [open, setOpen] = useState(false)
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
  const [ratePlans, setRatePlans] = useState<RatePlan[] | null>(null)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState(false)
  const [adults, setAdults] = useState(2)
  const [childAges, setChildAges] = useState<number[]>([])
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

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(false)
    setNotConfigured(false)

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

  function handleDayClick(dateStr: string, status: DayStatus) {
    if (status === 'unavailable' || status === 'unknown') return

    setRange((prev) => {
      if (!prev.start || prev.end) {
        return { start: dateStr, end: null }
      }
      if (dateStr === prev.start) return prev
      // Second click can land before or after the first — always resolve into an ordered range.
      if (dateStr < prev.start) return { start: dateStr, end: prev.start }
      return { start: prev.start, end: dateStr }
    })
    setHoverDate(null)
  }

  // Once both dates are picked, fetch rate plans + pricing for that stay instead of redirecting blindly.
  useEffect(() => {
    if (!range.start || !range.end) return
    let cancelled = false
    setRatesLoading(true)
    setRatesError(false)
    setRatePlans(null)

    const childrenParam =
      debouncedChildAges.length > 0 ? `&children=${debouncedChildAges.join(',')}` : ''
    fetch(
      `/api/phobs/rates?room=${encodeURIComponent(roomSlug)}&from=${range.start}&to=${range.end}&adults=${debouncedAdults}${childrenParam}`,
    )
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) throw new Error('request_failed')
        const data = (await res.json()) as RatesResponse
        setRatePlans(data.ratePlans)
        setPropertyPhobsId(data.propertyId)
      })
      .catch(() => {
        if (!cancelled) setRatesError(true)
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [range, roomSlug, debouncedAdults, debouncedChildAges])

  // Phobs returns per-rate-plan occupancy caps; take the most restrictive one across
  // the returned plans so the guest selector never lets the user pick an unbookable combination.
  const occupancyLimits = useMemo(() => {
    if (!ratePlans || ratePlans.length === 0) return null
    let maxAdults: number | null = null
    let maxChildren: number | null = null
    let maxChildAge: number | null = null
    let minOccupancy: number | null = null
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
    }
    return { maxAdults, maxChildren, maxChildAge, minOccupancy }
  }, [ratePlans])

  // Auto-correct a selection that exceeds a newly-learned occupancy cap instead of silently
  // showing a stale/incomplete price (Phobs itself doesn't reject over-occupancy requests).
  useEffect(() => {
    if (!occupancyLimits) return
    if (occupancyLimits.maxAdults != null && adults > occupancyLimits.maxAdults) {
      setAdults(occupancyLimits.maxAdults)
    }
    if (occupancyLimits.maxChildren != null && childAges.length > occupancyLimits.maxChildren) {
      setChildAges((prev) => prev.slice(0, occupancyLimits.maxChildren!))
    }
  }, [occupancyLimits, adults, childAges])

  function changeDates() {
    setRange({ start: null, end: null })
    setRatePlans(null)
    setRatesError(false)
    setHoverDate(null)
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

  function close() {
    setOpen(false)
    setRange({ start: null, end: null })
    setRatePlans(null)
    setRatesError(false)
    setHoverDate(null)
  }

  const showRates = Boolean(range.start && range.end)

  return (
    <>
      <button type="button" style={triggerStyle} onClick={() => setOpen(true)}>
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
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              maxWidth: showRates ? 520 : 460,
              width: '100%',
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
              position: 'relative',
            }}
          >
            {roomImageUrl && (
              <div style={{ position: 'relative', width: '100%', height: 150, flexShrink: 0 }}>
                <Image
                  src={roomImageUrl}
                  alt={roomName ?? ''}
                  fill
                  sizes="520px"
                  style={{ objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px 16px 0 0',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)',
                  }}
                />
              </div>
            )}

            <button
              type="button"
              aria-label={t('close')}
              onClick={close}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                border: 'none',
                background: roomImageUrl ? 'rgba(15,23,42,0.45)' : 'none',
                color: roomImageUrl ? '#fff' : '#64748b',
                borderRadius: '50%',
                width: roomImageUrl ? 30 : 'auto',
                height: roomImageUrl ? 30 : 'auto',
                display: roomImageUrl ? 'flex' : 'block',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ padding: '20px 20px 12px' }}>
              {roomName && (
                <div style={{ margin: '0 0 16px' }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                    {roomName}
                  </p>
                  {roomMeta && (
                    <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                      {roomMeta}
                    </p>
                  )}
                </div>
              )}

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
                      style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}
                    >
                      {daysBetween(range.start!, range.end!)} {t('nights')}
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
                  <GuestSelector
                    adults={adults}
                    childAges={childAges}
                    onAdultsChange={setAdults}
                    onChildAgesChange={setChildAges}
                    maxAdults={occupancyLimits?.maxAdults ?? null}
                    maxChildren={occupancyLimits?.maxChildren ?? null}
                    maxChildAge={occupancyLimits?.maxChildAge ?? null}
                    minOccupancy={occupancyLimits?.minOccupancy ?? null}
                    t={t}
                  />
                  <RatePlanList
                    ratePlans={ratePlans}
                    loading={ratesLoading}
                    error={ratesError}
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
                            childrenCount: debouncedChildAges.length,
                          })
                        : null
                    }
                    t={t}
                  />
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
  t: ReturnType<typeof useTranslations>
}) {
  const effectiveMaxAdults = maxAdults ?? 8
  const effectiveMaxChildren = maxChildren ?? 4
  const effectiveMaxChildAge = maxChildAge ?? 17
  const belowMinOccupancy = minOccupancy != null && adults + childAges.length < minOccupancy

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
            {Array.from({ length: effectiveMaxAdults }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={adults >= effectiveMaxAdults}
            onClick={() => onAdultsChange(Math.min(effectiveMaxAdults, adults + 1))}
            style={stepperButtonStyle(adults >= effectiveMaxAdults)}
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
            {Array.from({ length: effectiveMaxChildren + 1 }, (_, i) => i).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={childAges.length >= effectiveMaxChildren}
            onClick={() => onChildAgesChange([...childAges, Math.min(5, effectiveMaxChildAge)])}
            style={stepperButtonStyle(childAges.length >= effectiveMaxChildren)}
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
  t,
}: {
  ratePlans: RatePlan[] | null
  loading: boolean
  error: boolean
  buildHref: (rateId: string) => string | null
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
              border: isHovered ? '1px solid #4f8ef7' : '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
              boxShadow: isHovered
                ? '0 6px 16px rgba(79,142,247,0.16)'
                : '0 1px 2px rgba(15,23,42,0.04)',
              transform: isHovered ? 'translateY(-1px)' : 'none',
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
                      color: '#166534',
                      background: '#dcfce7',
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
            {href && (
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
            )}
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
}: {
  monthLabel: string
  weekdayLabels: string[]
  grid: Date[]
  viewMonth: Date
  getStatus: (dateStr: string) => DayStatus
  range: { start: string | null; end: string | null }
  hoverDate: string | null
  onDayHover: (dateStr: string | null) => void
  onDayClick: (dateStr: string, status: DayStatus) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  prevMonthDisabled: boolean
}) {
  const todayStr = toYMD(new Date())

  // While picking the second date, preview the range between the first pick and the hovered day,
  // regardless of whether the hovered day is before or after it.
  const isPreviewing = !!(range.start && !range.end && hoverDate && hoverDate !== range.start)
  const previewLow = isPreviewing ? (hoverDate! < range.start! ? hoverDate! : range.start!) : null
  const previewHigh = isPreviewing ? (hoverDate! < range.start! ? range.start! : hoverDate!) : null
  // Before any date is picked, preview just the hovered day.
  const isFirstPickPreview = !range.start && !!hoverDate

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
          aria-label="Previous month"
          style={{ ...navButtonStyle, opacity: prevMonthDisabled ? 0.35 : 1 }}
        >
          ‹
        </button>
        <span
          style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}
        >
          {monthLabel}
        </span>
        <button type="button" onClick={onNextMonth} aria-label="Next month" style={navButtonStyle}>
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
          const disabled = status === 'unavailable' || status === 'unknown'

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
              onClick={() => onDayClick(dateStr, status)}
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

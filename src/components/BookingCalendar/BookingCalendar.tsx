'use client'

import { useEffect, useMemo, useState } from 'react'
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

type BookingCalendarProps = {
  roomSlug: string
  propertySlug: string
  locale: string
  triggerLabel: string
  triggerStyle: React.CSSProperties
  /** Phobs unit id for this room; when missing, falls back to the plain contact link. */
  unitPhobsId?: string | null
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
  fallbackHref,
  fallbackLabel,
  t,
}: {
  roomSlug: string
  locale: string
  triggerLabel: string
  triggerStyle: React.CSSProperties
  unitPhobsId: string
  fallbackHref: string
  fallbackLabel: string
  t: ReturnType<typeof useTranslations>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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
        setPropertyPhobsId(data.propertyId)
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

  // Once both dates are picked, build the (secret-free) booking link and open it.
  useEffect(() => {
    if (!range.start || !range.end || !propertyPhobsId) return
    const url = buildPhobsBookingLink({
      propertyPhobsId,
      unitPhobsId,
      dateFrom: range.start,
      nights: daysBetween(range.start, range.end),
      lang: locale,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
    setRange({ start: null, end: null })
    setHoverDate(null)
  }, [range, propertyPhobsId, unitPhobsId, locale])

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
    setHoverDate(null)
  }

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
              padding: '20px 20px 12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              maxWidth: 400,
              width: '100%',
              fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
              position: 'relative',
            }}
          >
            <button
              type="button"
              aria-label={t('close')}
              onClick={close}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                border: 'none',
                background: 'none',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              ✕
            </button>

            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#334155', fontWeight: 500 }}>
              {t('selectDates')}
            </p>

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
            ) : error ? (
              <p style={{ color: '#b91c1c', fontSize: 13 }}>{t('error')}</p>
            ) : loading ? (
              <p style={{ color: '#64748b', fontSize: 13 }}>{t('loading')}</p>
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
      )}
    </>
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

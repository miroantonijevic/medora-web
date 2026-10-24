'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { useTranslations } from 'next-intl'

import type { PhobsDeal } from '@/lib/phobs'
import type { DealRoom } from '@/lib/phobsRooms'

type Translate = ReturnType<typeof useTranslations>

type DealsResponse = { groupName: string | null; rooms: DealRoom[]; deals: PhobsDeal[] }

type Props = {
  roomSlug: string
  groupName: string
  from: string
  to: string
  adults: number
  childAges: number[]
  locale: string
  /** The link that continues the booking of this deal (the Phobs booking page). */
  buildHref: (deal: PhobsDeal) => string | null
  /** Starts the in-site booking of the internal test room; returns false for every other deal. */
  onSelectInSite: (deal: PhobsDeal) => boolean
  onBack: () => void
  t: Translate
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: DealsResponse }

function cheaperThan(a: PhobsDeal, b: PhobsDeal): boolean {
  return (a.stayTotal ?? Infinity) < (b.stayTotal ?? Infinity)
}

/** All rooms of the room's group with their rates for the chosen stay ("show all family deals"). */
export function DealsView({
  roomSlug,
  groupName,
  from,
  to,
  adults,
  childAges,
  locale,
  buildHref,
  onSelectInSite,
  onBack,
  t,
}: Props) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    const query = new URLSearchParams({
      room: roomSlug,
      from,
      to,
      adults: String(adults),
      lang: locale,
    })
    if (childAges.length > 0) query.set('children', childAges.join(','))

    fetch(`/api/phobs/deals?${query.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`deals request failed: ${res.status}`)
        const data = (await res.json()) as DealsResponse
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })

    return () => {
      cancelled = true
    }
    // childAges is compared by value through its join, so an equal list does not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomSlug, from, to, adults, childAges.join(','), locale])

  const cheapest = useMemo(() => {
    if (state.status !== 'ready') return null
    return state.data.deals.reduce<PhobsDeal | null>(
      (best, deal) => (!best || cheaperThan(deal, best) ? deal : best),
      null,
    )
  }, [state])

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          marginBottom: 12,
          color: '#2563eb',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        ← {t('backToRoom')}
      </button>
      <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
        {t('dealsTitle', { group: groupName })}
      </p>

      {state.status === 'loading' && (
        <p style={{ color: '#64748b', fontSize: 13 }}>{t('dealsLoading')}</p>
      )}
      {state.status === 'error' && (
        <p style={{ color: '#b91c1c', fontSize: 13 }}>{t('dealsError')}</p>
      )}
      {state.status === 'ready' && state.data.deals.length === 0 && (
        <p style={{ color: '#64748b', fontSize: 13 }}>{t('noDeals')}</p>
      )}

      {state.status === 'ready' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {state.data.rooms.map((room) => {
            const deals = state.data.deals
              .filter((deal) => deal.unitId === room.unitId)
              .sort((a, b) => (a.stayTotal ?? Infinity) - (b.stayTotal ?? Infinity))
            if (deals.length === 0) return null

            return (
              <section
                key={room.unitId}
                style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}
              >
                <header
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: 10,
                    background: '#f8fafc',
                  }}
                >
                  {room.imageUrl && (
                    <div
                      style={{
                        position: 'relative',
                        width: 76,
                        height: 56,
                        flexShrink: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={room.imageUrl}
                        alt=""
                        fill
                        sizes="76px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      {room.name}
                    </p>
                    {room.meta && (
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                        {room.meta}
                      </p>
                    )}
                  </div>
                </header>

                {deals.map((deal) => (
                  <DealRow
                    key={`${deal.unitId}-${deal.rateId}`}
                    deal={deal}
                    isCheapest={deal === cheapest}
                    href={buildHref(deal)}
                    onSelectInSite={onSelectInSite}
                    t={t}
                  />
                ))}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DealRow({
  deal,
  isCheapest,
  href,
  onSelectInSite,
  t,
}: {
  deal: PhobsDeal
  isCheapest: boolean
  href: string | null
  onSelectInSite: (deal: PhobsDeal) => boolean
  t: Translate
}) {
  const hasDiscount =
    deal.priceOriginalPerNight != null &&
    deal.pricePerNight != null &&
    deal.priceOriginalPerNight > deal.pricePerNight
  const percent = hasDiscount
    ? Math.round((1 - deal.pricePerNight! / deal.priceOriginalPerNight!) * 100)
    : null

  const buttonStyle: React.CSSProperties = {
    flexShrink: 0,
    border: 'none',
    background: '#4f8ef7',
    color: '#fff',
    padding: '9px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 12.5,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderTop: '1px solid #e2e8f0',
        background: isCheapest ? '#eff6ff' : '#fff',
        boxShadow: isCheapest ? 'inset 3px 0 0 #2563eb' : 'none',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
            {deal.rateName}
          </p>
          {isCheapest && <span style={badgeStyle('#fff', '#2563eb')}>{t('bestPrice')}</span>}
          {percent != null && percent > 0 && (
            <span style={badgeStyle('#9a3412', '#ffedd5')}>-{percent}%</span>
          )}
        </div>
        {deal.highlights.length > 0 && (
          <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#475569' }}>
            {deal.highlights.map((item) => `✓ ${item}`).join('   ')}
          </p>
        )}
        {deal.pricePerNight != null && (
          <p style={{ margin: '6px 0 0', display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {hasDiscount && (
              <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                {deal.priceOriginalPerNight} {deal.currency}
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {deal.pricePerNight} {deal.currency}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>/ {t('perNight')}</span>
          </p>
        )}
        {deal.stayTotal != null && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
            {t('totalStay')}: {deal.stayTotal} {deal.currency}
          </p>
        )}
      </div>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (onSelectInSite(deal)) event.preventDefault()
          }}
          style={buttonStyle}
        >
          {t('continueToBook')} →
        </a>
      ) : null}
    </div>
  )
}

function badgeStyle(color: string, background: string): React.CSSProperties {
  return {
    fontSize: 10.5,
    fontWeight: 700,
    color,
    background,
    padding: '2px 7px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
  }
}

'use client'

import { useState } from 'react'
import type { useTranslations } from 'next-intl'

import type { PhobsPolicy, PhobsRateDetails } from '@/lib/phobs'

type Translate = ReturnType<typeof useTranslations>

type Props = {
  /** Loads the details of this rate for the stay the popup is showing. */
  load: () => Promise<PhobsRateDetails>
  /** The saving against the standard price for the whole stay, when the rate is discounted. */
  saving: { amount: number; percent: number; currency: string | null } | null
  t: Translate
}

type Section = 'cancellation' | 'payment' | 'stay' | 'included' | 'other'

const SECTION_ORDER: Section[] = ['included', 'cancellation', 'payment', 'stay', 'other']

const SECTION_TITLE_KEY: Record<Section, string> = {
  included: 'sectionIncluded',
  cancellation: 'sectionCancellation',
  payment: 'sectionPayment',
  stay: 'sectionStay',
  other: 'sectionOther',
}

const PAYMENT_POLICIES = new Set(['valid_card', 'hotel_policy_depozit'])
const STAY_POLICIES = new Set(['check_in', 'check_out', 'chd_age'])
const CHANGE_POLICIES = new Set(['reservation_change', 'reservation_nocancel'])

function sectionOf(policy: PhobsPolicy): Section {
  if (
    policy.type === 'CANCELLATION' ||
    policy.type === 'MODIFICATION' ||
    CHANGE_POLICIES.has(policy.detail)
  ) {
    return 'cancellation'
  }
  if (PAYMENT_POLICIES.has(policy.detail)) return 'payment'
  if (STAY_POLICIES.has(policy.detail)) return 'stay'
  // The untyped entry with an amount is the VAT that the price already includes.
  if (!policy.type && !policy.detail) return 'included'
  return 'other'
}

const CARD_NAMES: Record<string, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  DINERS: 'Diners Club',
  DISCOVER: 'Discover',
  JCB: 'JCB',
}

const KNOWN_BOARDS = new Set(['BB', 'HB', 'FB', 'AI', 'RO'])

function paymentLine(group: string, cardTypes: string[], t: Translate): string | null {
  const cards = cardTypes.map((type) => CARD_NAMES[type] ?? type).join(', ')
  switch (group) {
    case 'CCARD_GUARANTEE':
      return cards ? `${t('payGuaranteeCard')}: ${cards}` : t('payGuaranteeCard')
    case 'CCARD_PAYMENT':
      return cards ? `${t('payCard')}: ${cards}` : t('payCard')
    case 'BANKTRANSFER':
      return t('payBankTransfer')
    default:
      return null
  }
}

type State =
  | { status: 'closed' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; details: PhobsRateDetails }

/** "Rate details" under a rate: opens on request, loads the policies from Phobs once, then keeps them. */
export function RateDetailsPanel({ load, saving, t }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>({ status: 'closed' })

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && (state.status === 'closed' || state.status === 'error')) {
      setState({ status: 'loading' })
      load()
        .then((details) => setState({ status: 'ready', details }))
        .catch(() => setState({ status: 'error' }))
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          color: '#2563eb',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {open ? t('hideRateDetails') : t('rateDetails')} {open ? '▴' : '▾'}
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid #e2e8f0',
            fontSize: 12.5,
            color: '#334155',
            lineHeight: 1.5,
          }}
        >
          {state.status === 'loading' && (
            <p style={{ margin: 0, color: '#64748b' }}>{t('rateDetailsLoading')}</p>
          )}
          {state.status === 'error' && (
            <p style={{ margin: 0, color: '#b45309' }}>{t('rateDetailsError')}</p>
          )}
          {state.status === 'ready' && (
            <DetailsBody details={state.details} saving={saving} t={t} />
          )}
        </div>
      )}
    </div>
  )
}

function DetailsBody({
  details,
  saving,
  t,
}: {
  details: PhobsRateDetails
  saving: Props['saving']
  t: Translate
}) {
  const grouped = new Map<Section, PhobsPolicy[]>()
  for (const policy of details.policies) {
    const section = sectionOf(policy)
    grouped.set(section, [...(grouped.get(section) ?? []), policy])
  }
  const paymentLines = details.paymentMethods
    .map((method) => paymentLine(method.group, method.cardTypes, t))
    .filter((line): line is string => Boolean(line))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {details.board && (
          <Chip>
            {KNOWN_BOARDS.has(details.board) ? t(`board${details.board}`) : details.board}
          </Chip>
        )}
        {saving && (
          <Chip tone="green">
            {t('youSave', {
              amount: saving.amount,
              currency: saving.currency ?? '',
              percent: saving.percent,
            })}
          </Chip>
        )}
      </div>

      {SECTION_ORDER.map((section) => {
        const policies = grouped.get(section)
        const showPayment = section === 'payment' && paymentLines.length > 0
        if (!policies?.length && !showPayment) return null

        return (
          <div key={section}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a' }}>
              {t(SECTION_TITLE_KEY[section])}
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc' }}>
              {policies?.map((policy, index) => (
                <li key={`${policy.detail}-${index}`} style={{ whiteSpace: 'pre-line' }}>
                  {policy.text}
                </li>
              ))}
              {showPayment && paymentLines.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function Chip({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'green'
}) {
  return (
    <span
      style={{
        fontSize: 11.5,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 999,
        color: tone === 'green' ? '#166534' : '#334155',
        background: tone === 'green' ? '#dcfce7' : '#e2e8f0',
      }}
    >
      {children}
    </span>
  )
}

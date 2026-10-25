import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildPhobsBookingLink } from '@/lib/phobsBookingLink'

const stay = {
  propertyPhobsId: 'P1',
  unitPhobsId: '10073',
  dateFrom: '2026-10-27',
  nights: 2,
  lang: 'en',
  rateId: 'RATE534426',
  adults: 2,
  childAges: [5, 9],
}

function configure(pconnectId: string) {
  vi.stubEnv('NEXT_PUBLIC_PHOBS_BOOKING_BASE_URL', 'https://book.example.com/book.php')
  vi.stubEnv('NEXT_PUBLIC_PHOBS_COMPANY_ID', 'C1')
  vi.stubEnv('NEXT_PUBLIC_PHOBS_PCONNECT_ID', pconnectId)
}

afterEach(() => vi.unstubAllEnvs())

describe('buildPhobsBookingLink', () => {
  it('carries room, rate, dates and guests, and tells Phobs to take the guest count as given', () => {
    configure('189')
    const url = new URL(buildPhobsBookingLink(stay))

    expect(url.origin + url.pathname).toBe('https://book.example.com/book.php')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      company_id: 'C1',
      hotel: 'P1',
      date: '2026-10-27',
      nights: '2',
      room: '10073',
      unit_select: '1',
      lang: 'en',
      rate: '534426',
      'adult[1]': '2',
      'chd[1]': '2',
      'chdage[1][1]': '5',
      'chdage[1][2]': '9',
      pconnect: '189',
    })
  })

  it('leaves out pconnect when it is not configured, so the link still works', () => {
    configure('')

    expect(new URL(buildPhobsBookingLink(stay)).searchParams.has('pconnect')).toBe(false)
  })

  it('refuses to build a link without the base settings', () => {
    vi.stubEnv('NEXT_PUBLIC_PHOBS_BOOKING_BASE_URL', '')

    expect(() => buildPhobsBookingLink(stay)).toThrow(/not configured/)
  })
})

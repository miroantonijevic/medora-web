import { describe, expect, it } from 'vitest'

import { resolveDayClick, spansTakenNight, type NightStatus } from '@/lib/stayRange'

// Nights (the night that begins on the date) of a week: the 3rd and 4th are taken, the 8th is unknown.
const statusOf = (dateStr: string): NightStatus => {
  if (dateStr === '2026-11-03' || dateStr === '2026-11-04') return 'unavailable'
  if (dateStr === '2026-11-08') return 'unknown'
  return 'available'
}
const none = { start: null, end: null }

describe('resolveDayClick', () => {
  it('starts a stay on a day whose night is free', () => {
    expect(resolveDayClick(none, '2026-11-01', statusOf)).toEqual({
      start: '2026-11-01',
      end: null,
    })
  })

  it('does not start a stay on a day whose night is taken or unknown', () => {
    expect(resolveDayClick(none, '2026-11-03', statusOf)).toBeNull()
    expect(resolveDayClick(none, '2026-11-08', statusOf)).toBeNull()
  })

  it('ends a stay on a day whose own night is taken, when the nights before it are free', () => {
    const range = { start: '2026-11-01', end: null }

    expect(resolveDayClick(range, '2026-11-03', statusOf)).toEqual({
      start: '2026-11-01',
      end: '2026-11-03',
    })
  })

  it('does not span a taken night', () => {
    const range = { start: '2026-11-01', end: null }

    // the 4th, 5th and 6th lie beyond the taken 3rd night: refused, the check-in stays
    for (const day of ['2026-11-04', '2026-11-05', '2026-11-06']) {
      expect(resolveDayClick(range, day, statusOf)).toBeNull()
      expect(spansTakenNight(range, day, statusOf)).toBe(true)
    }
  })

  it('refuses a stay that would run from an earlier day over a taken night', () => {
    const range = { start: '2026-11-06', end: null }

    expect(resolveDayClick(range, '2026-11-02', statusOf)).toBeNull()
    expect(spansTakenNight(range, '2026-11-02', statusOf)).toBe(true)
  })

  it('does not call a click a refused stay when no check-in is waiting for a check-out', () => {
    expect(spansTakenNight(none, '2026-11-04', statusOf)).toBe(false)
    expect(
      spansTakenNight({ start: '2026-11-01', end: '2026-11-02' }, '2026-11-05', statusOf),
    ).toBe(false)
  })

  it('orders a second click that lands before the first', () => {
    const range = { start: '2026-11-06', end: null }

    expect(resolveDayClick(range, '2026-11-05', statusOf)).toEqual({
      start: '2026-11-05',
      end: '2026-11-06',
    })
  })

  it('ignores a second click on the start day, and starts over after a complete stay', () => {
    expect(resolveDayClick({ start: '2026-11-01', end: null }, '2026-11-01', statusOf)).toBeNull()
    expect(
      resolveDayClick({ start: '2026-11-01', end: '2026-11-02' }, '2026-11-05', statusOf),
    ).toEqual({ start: '2026-11-05', end: null })
  })

  it('works across a month end', () => {
    const range = { start: '2026-10-30', end: null }

    expect(resolveDayClick(range, '2026-11-02', statusOf)).toEqual({
      start: '2026-10-30',
      end: '2026-11-02',
    })
  })
})

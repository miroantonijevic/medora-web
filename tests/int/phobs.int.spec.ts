import { afterEach, describe, expect, it, vi } from 'vitest'

import { phobsFetch } from '@/lib/phobs'
import {
  MAX_AVAILABILITY_RANGE_DAYS,
  MAX_CHILDREN,
  MAX_CHILD_AGE,
  daysBetweenYMD,
  isValidAdults,
  parseChildAges,
  parseStayParams,
  parseYMD,
} from '@/lib/phobsParams'

describe('parseYMD', () => {
  it('accepts a real calendar date', () => {
    expect(parseYMD('2026-10-24')).toBe('2026-10-24')
    expect(parseYMD('2028-02-29')).toBe('2028-02-29')
  })

  it.each(['2026-02-31', '2027-02-29', '2026-13-01', '2026-10-24T00:00', '24-10-2026', '', 'abc'])(
    'rejects %s',
    (value) => {
      expect(parseYMD(value)).toBeNull()
    },
  )

  it('rejects non-strings', () => {
    expect(parseYMD(null)).toBeNull()
    expect(parseYMD(20261024)).toBeNull()
    expect(parseYMD(undefined)).toBeNull()
  })
})

describe('daysBetweenYMD', () => {
  it('counts nights across a month and a leap day', () => {
    expect(daysBetweenYMD('2026-10-26', '2026-10-28')).toBe(2)
    expect(daysBetweenYMD('2028-02-28', '2028-03-01')).toBe(2)
  })

  it('is negative when the range is reversed', () => {
    expect(daysBetweenYMD('2026-10-28', '2026-10-26')).toBe(-2)
  })

  it('is not affected by daylight-saving changes', () => {
    expect(daysBetweenYMD('2026-03-28', '2026-03-30')).toBe(2)
    expect(daysBetweenYMD('2026-10-24', '2026-10-26')).toBe(2)
  })

  it('keeps the availability window above the default 18 months', () => {
    expect(MAX_AVAILABILITY_RANGE_DAYS).toBeGreaterThan(18 * 31)
  })
})

describe('parseChildAges', () => {
  it('treats an empty value as no children', () => {
    expect(parseChildAges(null)).toEqual([])
    expect(parseChildAges('')).toEqual([])
  })

  it('parses a list', () => {
    expect(parseChildAges('3, 7,12')).toEqual([3, 7, 12])
  })

  it('rejects out-of-bounds or non-numeric input instead of dropping entries silently', () => {
    expect(parseChildAges('3,abc')).toBeNull()
    expect(parseChildAges('-1')).toBeNull()
    expect(parseChildAges('2.5')).toBeNull()
    expect(parseChildAges(String(MAX_CHILD_AGE + 1))).toBeNull()
    expect(
      parseChildAges(
        Array(MAX_CHILDREN + 1)
          .fill(5)
          .join(','),
      ),
    ).toBeNull()
  })
})

describe('isValidAdults', () => {
  it('accepts whole numbers from 1 up to the limit', () => {
    expect(isValidAdults(1)).toBe(true)
    expect(isValidAdults(8)).toBe(true)
  })

  it.each([0, 9, 2.5, NaN, -1])('rejects %s', (value) => {
    expect(isValidAdults(value)).toBe(false)
  })
})

describe('phobsFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('gives up on a Phobs that never answers instead of hanging', async () => {
    // A fetch that only settles when it is aborted, like a real stalled connection.
    vi.stubGlobal(
      'fetch',
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )

    const started = Date.now()
    await expect(phobsFetch('https://phobs.invalid/', { method: 'POST' }, 50)).rejects.toBeTruthy()
    expect(Date.now() - started).toBeLessThan(2000)
  })

  it('passes the request through unchanged when Phobs answers in time', async () => {
    const fetchMock = vi.fn(async () => new Response('<ok/>', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await phobsFetch('https://phobs.invalid/', { method: 'POST', body: '<rq/>' })

    expect(await res.text()).toBe('<ok/>')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://phobs.invalid/',
      expect.objectContaining({ method: 'POST', body: '<rq/>', signal: expect.any(AbortSignal) }),
    )
  })
})

describe('parseStayParams', () => {
  const stay = (query: string) => parseStayParams(new URLSearchParams(query))

  it('reads a valid stay and defaults to two adults', () => {
    expect(stay('from=2026-10-26&to=2026-10-28')).toEqual({
      ok: true,
      stay: { dateFrom: '2026-10-26', dateTo: '2026-10-28', nights: 2, adults: 2, childAges: [] },
    })
    expect(stay('from=2026-10-26&to=2026-10-28&adults=3&children=4,9')).toMatchObject({
      ok: true,
      stay: { adults: 3, childAges: [4, 9] },
    })
  })

  it.each([
    ['from=2026-10-26', 'missing_params'],
    ['from=2026-02-31&to=2026-03-02', 'missing_params'],
    ['from=2026-10-26&to=2026-10-28&adults=99', 'invalid_params'],
    ['from=2026-10-26&to=2026-10-28&children=3,x', 'invalid_params'],
    ['from=2026-10-28&to=2026-10-26', 'invalid_range'],
    ['from=2026-10-26&to=2026-10-26', 'invalid_range'],
    ['from=2026-01-01&to=2026-06-01', 'invalid_range'],
  ])('rejects %s as %s', (query, error) => {
    expect(stay(query)).toEqual({ ok: false, error })
  })
})

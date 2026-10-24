import type { PhobsRateDetails } from '@/lib/phobs'

type Params = {
  roomSlug: string
  rateId: string
  from: string
  to: string
  adults: number
  childAges: number[]
  lang: string
}

export async function fetchRateDetails(params: Params): Promise<PhobsRateDetails> {
  const query = new URLSearchParams({
    room: params.roomSlug,
    rate: params.rateId,
    from: params.from,
    to: params.to,
    adults: String(params.adults),
    lang: params.lang,
  })
  if (params.childAges.length > 0) query.set('children', params.childAges.join(','))

  const res = await fetch(`/api/phobs/rate-details?${query.toString()}`)
  if (!res.ok) throw new Error(`rate details request failed: ${res.status}`)

  const data = (await res.json()) as { details: PhobsRateDetails }
  return data.details
}

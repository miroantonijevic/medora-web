/**
 * Builds the Phobs booking redirect URL. This is a plain string template with
 * no secrets involved (company_id / property id are not sensitive), so it is
 * safe to call from both server and client code.
 */
export function buildPhobsBookingLink(params: {
  propertyPhobsId: string
  unitPhobsId: string
  dateFrom: string
  nights: number
  lang: string
  rateId?: string
  adults?: number
  childrenCount?: number
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_PHOBS_BOOKING_BASE_URL
  const companyId = process.env.NEXT_PUBLIC_PHOBS_COMPANY_ID
  if (!baseUrl || !companyId) {
    throw new Error(
      'Phobs booking link is not configured — missing NEXT_PUBLIC_PHOBS_BOOKING_BASE_URL or NEXT_PUBLIC_PHOBS_COMPANY_ID',
    )
  }
  const { propertyPhobsId, unitPhobsId, dateFrom, nights, lang, rateId, adults, childrenCount } =
    params
  const search = new URLSearchParams({
    company_id: companyId,
    hotel: propertyPhobsId,
    date: dateFrom,
    nights: String(nights),
    unit_id: unitPhobsId,
    lang,
  })
  if (rateId) search.set('rate', rateId)
  if (adults != null) search.set('adult[1]', String(adults))
  if (childrenCount != null) search.set('chd[1]', String(childrenCount))
  return `${baseUrl}?${search.toString()}`
}

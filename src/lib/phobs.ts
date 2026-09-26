/**
 * Server-only Phobs PMS client — OAuth2 token exchange, unit→property resolution and
 * availability lookup. NEVER import this from client components; credentials must stay server-side.
 */

type PhobsAvailabilityEntry = {
  date: string
  available: boolean
  rate: number | null
  currency: string | null
}

type PhobsRatePlan = {
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

type CachedToken = {
  accessToken: string
  expiresAtMs: number
}

let cachedToken: CachedToken | null = null

function getConfig() {
  const apiUrl = process.env.PHOBS_API_URL
  const username = process.env.PHOBS_USERNAME
  const password = process.env.PHOBS_PASSWORD
  const siteId = process.env.PHOBS_SITE_ID
  if (!apiUrl || !username || !password || !siteId) {
    throw new Error(
      'Phobs is not configured — missing one of PHOBS_API_URL, PHOBS_USERNAME, PHOBS_PASSWORD, PHOBS_SITE_ID',
    )
  }
  return { apiUrl, username, password, siteId }
}

function deriveOAuthTokenUrl(apiUrl: string): string {
  return apiUrl.replace('/pconnect/service.php', '/oauth/index.php')
}

async function getOAuthToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAtMs - now > 5 * 60 * 1000) {
    return cachedToken.accessToken
  }

  const { apiUrl, username, password } = getConfig()
  const tokenUrl = deriveOAuthTokenUrl(apiUrl)
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'X-Client-ID': 'service',
    },
  })
  if (!res.ok) {
    throw new Error(`Phobs OAuth token request failed: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as { access_token: string; exp: number }
  cachedToken = {
    accessToken: data.access_token,
    expiresAtMs: data.exp * 1000,
  }
  return cachedToken.accessToken
}

function buildAvailabilityRequestXml(params: {
  siteId: string
  propertyId: string
  unitId: string
  dateFrom: string
  dateTo: string
}): string {
  const { siteId, propertyId, unitId, dateFrom, dateTo } = params
  return `<?xml version="1.0" encoding="utf-8"?>
<PCAvailabilityCalendarRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
    <PropertyId>${propertyId}</PropertyId>
    <Period Start="${dateFrom}" End="${dateTo}" />
    <UnitId>${unitId}</UnitId>
    <ShowUnits>true</ShowUnits>
</PCAvailabilityCalendarRQ>`
}

function parseAvailabilityXml(xml: string, unitId: string): PhobsAvailabilityEntry[] {
  const entries: PhobsAvailabilityEntry[] = []
  // Namespace-agnostic tag match — Phobs responses declare the phobs: prefix but
  // the default namespace binding can vary, so match on local tag name instead of a fixed regex prefix.
  const tagPattern = /<(?:\w+:)?Availability\b([^>]*)\/?>/g
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(xml)) !== null) {
    const attrsStr = match[1]
    const attrs: Record<string, string> = {}
    const attrPattern = /(\w+)="([^"]*)"/g
    let attrMatch: RegExpExecArray | null
    while ((attrMatch = attrPattern.exec(attrsStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2]
    }
    if (attrs.UnitId !== unitId) continue
    if (!attrs.Date) continue
    entries.push({
      date: attrs.Date,
      available: attrs.Available === 'true' || attrs.Available === '1',
      rate: attrs.RateFromValue ? Number(attrs.RateFromValue) : null,
      currency: attrs.RateFromCurrency ?? null,
    })
  }
  return entries
}

function parseAttrList(xml: string, tag: string, attrName: string): string[] {
  const values: string[] = []
  const tagPattern = new RegExp(`<(?:\\w+:)?${tag}\\b([^>]*)\\/?>`, 'g')
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(xml)) !== null) {
    const attrPattern = new RegExp(`${attrName}="([^"]*)"`)
    const attrMatch = attrPattern.exec(match[1])
    if (attrMatch) values.push(attrMatch[1])
  }
  return values
}

function buildPropertyAvailabilityRequestXml(params: {
  siteId: string
  propertyId: string
  unitId: string
  dateFrom: string
  nights: number
  adults: number
  childAges: number[]
}): string {
  const { siteId, propertyId, unitId, dateFrom, nights, adults, childAges } = params
  const childrenXml =
    childAges.length > 0
      ? `<Children>${childAges.map((age) => `<ChildAge>${age}</ChildAge>`).join('')}</Children>`
      : ''
  return `<?xml version="1.0" encoding="utf-8"?>
<PCPropertyAvailabilityRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
    <PropertyId>${propertyId}</PropertyId>
    <UnitFilter>
        <Date>${dateFrom}</Date>
        <Nights>${nights}</Nights>
        <UnitId>${unitId}</UnitId>
        <UnitItem>
            <Item>
                <Adults>${adults}</Adults>
                ${childrenXml}
            </Item>
        </UnitItem>
    </UnitFilter>
</PCPropertyAvailabilityRQ>`
}

/** Extracts per-RatePlan pricing/BookUrl from a PCPropertyAvailabilityRS body (assumes a single Unit per plan, since the request is UnitId-scoped). */
function parseRatePlansXml(xml: string): PhobsRatePlan[] {
  const plans: PhobsRatePlan[] = []
  const blockPattern = /<RatePlan RateId="([^"]+)">([\s\S]*?)<\/RatePlan>/g
  let match: RegExpExecArray | null
  while ((match = blockPattern.exec(xml)) !== null) {
    const rateId = match[1]
    const block = match[2]
    const name = /<Name>([^<]*)<\/Name>/.exec(block)?.[1] ?? ''
    const priceMatch = /<Price Currency="([^"]+)" PriceType="PerNight">([\d.]+)<\/Price>/.exec(
      block,
    )
    const originalMatch = /<PriceOriginal[^>]*>\s*<Price>([\d.]+)<\/Price>/.exec(block)
    const stayTotalMatch = /<StayTotal[^>]*>\s*<Price>([\d.]+)<\/Price>/.exec(block)
    const bookUrlMatch = /<BookUrl>\s*([^<]+?)\s*<\/BookUrl>/.exec(block)
    const unitAttrs = /<Unit\s+([^>]*)>/.exec(block)?.[1] ?? ''
    const occupancyMinMatch = /OccupancyMin="(\d+)"/.exec(unitAttrs)
    const occupancyMaxMatch = /OccupancyMax="(\d+)"/.exec(unitAttrs)
    const occupancyMinAdultMatch = /OccupancyMinAdult="(\d+)"/.exec(unitAttrs)
    const occupancyMaxAdultMatch = /OccupancyMaxAdult="(\d+)"/.exec(unitAttrs)
    const occupancyMinChdMatch = /OccupancyMinChd="(\d+)"/.exec(unitAttrs)
    const occupancyMaxChdMatch = /OccupancyMaxChd="(\d+)"/.exec(unitAttrs)
    const occupancyMaxChdAgeMatch = /OccupancyMaxChdAge="(\d+)"/.exec(unitAttrs)
    plans.push({
      rateId,
      name,
      pricePerNight: priceMatch ? Number(priceMatch[2]) : null,
      currency: priceMatch ? priceMatch[1] : null,
      priceOriginalPerNight: originalMatch ? Number(originalMatch[1]) : null,
      stayTotal: stayTotalMatch ? Number(stayTotalMatch[1]) : null,
      bookUrl: bookUrlMatch ? bookUrlMatch[1].replace(/\s+/g, '') : null,
      occupancyMin: occupancyMinMatch ? Number(occupancyMinMatch[1]) : null,
      occupancyMax: occupancyMaxMatch ? Number(occupancyMaxMatch[1]) : null,
      occupancyMinAdult: occupancyMinAdultMatch ? Number(occupancyMinAdultMatch[1]) : null,
      occupancyMaxAdult: occupancyMaxAdultMatch ? Number(occupancyMaxAdultMatch[1]) : null,
      occupancyMinChd: occupancyMinChdMatch ? Number(occupancyMinChdMatch[1]) : null,
      occupancyMaxChd: occupancyMaxChdMatch ? Number(occupancyMaxChdMatch[1]) : null,
      occupancyMaxChdAge: occupancyMaxChdAgeMatch ? Number(occupancyMaxChdAgeMatch[1]) : null,
    })
  }
  return plans
}

async function phobsRequest(xmlBody: string): Promise<string> {
  const { apiUrl } = getConfig()
  const token = await getOAuthToken()
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      Authorization: `Bearer ${token}`,
    },
    body: xmlBody,
  })
  if (!res.ok) {
    throw new Error(`Phobs request failed: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

/**
 * Cache mapping every known Phobs UnitId to its PropertyId, built by listing all properties
 * for this SiteId (PCListPropertiesRQ) and then all units per property (PCListUnitRQ) — same
 * approach ChatNav uses. Avoids needing to store a Phobs property id anywhere in Payload.
 */
let unitToPropertyCache: Map<string, string> | null = null
let unitToPropertyCacheAtMs = 0
const UNIT_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

async function refreshUnitToPropertyCache(): Promise<Map<string, string>> {
  const { siteId } = getConfig()

  const propertiesXml = await phobsRequest(
    `<?xml version="1.0" encoding="utf-8"?>
<PCListPropertiesRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
</PCListPropertiesRQ>`,
  )
  const propertyIds = parseAttrList(propertiesXml, 'Property', 'PropertyId')

  const map = new Map<string, string>()
  for (const propertyId of propertyIds) {
    const unitsXml = await phobsRequest(
      `<?xml version="1.0" encoding="utf-8"?>
<PCListUnitRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
    <PropertyId>${propertyId}</PropertyId>
</PCListUnitRQ>`,
    )
    for (const unitId of parseAttrList(unitsXml, 'Unit', 'UnitId')) {
      map.set(unitId, propertyId)
    }
  }

  unitToPropertyCache = map
  unitToPropertyCacheAtMs = Date.now()
  return map
}

export async function getPropertyForUnit(unitId: string): Promise<string | null> {
  const isStale = !unitToPropertyCache || Date.now() - unitToPropertyCacheAtMs > UNIT_CACHE_TTL_MS
  const map = isStale ? await refreshUnitToPropertyCache() : unitToPropertyCache
  return map?.get(unitId) ?? null
}

/**
 * Fetch per-day availability for a single Phobs unit within a date range.
 * Resolves the unit's PropertyId automatically and retries a couple of times on
 * transient network/timeout errors.
 */
export async function checkUnitAvailability(
  unitId: string,
  dateFrom: string,
  dateTo: string,
  maxRetries = 3,
): Promise<{ propertyId: string; entries: PhobsAvailabilityEntry[] }> {
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }

  const { apiUrl, siteId } = getConfig()
  const body = buildAvailabilityRequestXml({ siteId, propertyId, unitId, dateFrom, dateTo })

  let lastError: unknown
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = await getOAuthToken()
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          Authorization: `Bearer ${token}`,
        },
        body,
      })
      if (!res.ok) {
        throw new Error(`Phobs availability request failed: ${res.status} ${res.statusText}`)
      }
      const xml = await res.text()
      return { propertyId, entries: parseAvailabilityXml(xml, unitId) }
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Phobs availability request failed')
}

/**
 * Fetch rate plans + pricing for a single Phobs unit and stay, using PCPropertyAvailabilityRQ
 * (unlike PCAvailabilityCalendarRQ, this returns per-rate-plan pricing and a ready-to-use BookUrl).
 */
export async function getUnitRatePlans(
  unitId: string,
  dateFrom: string,
  nights: number,
  adults = 2,
  childAges: number[] = [],
): Promise<{ propertyId: string; ratePlans: PhobsRatePlan[] }> {
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }

  const { siteId } = getConfig()
  const body = buildPropertyAvailabilityRequestXml({
    siteId,
    propertyId,
    unitId,
    dateFrom,
    nights,
    adults,
    childAges,
  })
  const xml = await phobsRequest(body)
  return { propertyId, ratePlans: parseRatePlansXml(xml) }
}

export type { PhobsAvailabilityEntry, PhobsRatePlan }

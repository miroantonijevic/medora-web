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

type PhobsEnv = 'production' | 'test'

// Single known-good dummy unit on the Phobs TEST account (property b6bdc2e958d3d01c64ba7482071e0d3b,
// unit 1447) — used by exactly one internal Payload room while we build/polish the booking-creation
// UI, since production has no PCBookingNew permission yet. Remove once production is certified.
const TEST_MODE_UNIT_IDS = new Set(['1447'])

function envForUnit(unitId: string): PhobsEnv {
  return TEST_MODE_UNIT_IDS.has(unitId) ? 'test' : 'production'
}

const cachedTokens = new Map<PhobsEnv, CachedToken>()

// Phobs normally answers in well under a second; without a bound, a stalled Phobs would pile up requests.
export const PHOBS_TIMEOUT_MS = 10_000

export function phobsFetch(
  url: string,
  init: RequestInit,
  timeoutMs = PHOBS_TIMEOUT_MS,
): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
}

function getConfig(env: PhobsEnv = 'production') {
  const prefix = env === 'test' ? 'PHOBS_TEST_' : 'PHOBS_'
  const apiUrl = process.env[`${prefix}API_URL`]
  const username = process.env[`${prefix}USERNAME`]
  const password = process.env[`${prefix}PASSWORD`]
  const siteId = process.env[`${prefix}SITE_ID`]
  if (!apiUrl || !username || !password || !siteId) {
    throw new Error(
      `Phobs is not configured — missing one of ${prefix}API_URL, ${prefix}USERNAME, ${prefix}PASSWORD, ${prefix}SITE_ID`,
    )
  }
  return { apiUrl, username, password, siteId }
}

function deriveOAuthTokenUrl(apiUrl: string): string {
  return apiUrl.replace('/pconnect/service.php', '/oauth/index.php')
}

async function getOAuthToken(env: PhobsEnv = 'production'): Promise<string> {
  const now = Date.now()
  const cached = cachedTokens.get(env)
  if (cached && cached.expiresAtMs - now > 5 * 60 * 1000) {
    return cached.accessToken
  }

  const { apiUrl, username, password } = getConfig(env)
  const tokenUrl = deriveOAuthTokenUrl(apiUrl)
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')

  const res = await phobsFetch(tokenUrl, {
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
  const token: CachedToken = {
    accessToken: data.access_token,
    expiresAtMs: data.exp * 1000,
  }
  cachedTokens.set(env, token)
  return token.accessToken
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

export function parseAvailabilityXml(xml: string, unitId: string): PhobsAvailabilityEntry[] {
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

export function parseAttrList(xml: string, tag: string, attrName: string): string[] {
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

// Phobs escapes text and attribute values (e.g. "nature park &amp; sea view"); undo that before showing or linking them.
function decodeXmlEntities(value: string): string {
  return value
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Extracts per-RatePlan pricing/BookUrl from a PCPropertyAvailabilityRS body (assumes a single Unit per plan, since the request is UnitId-scoped). */
export function parseRatePlansXml(xml: string): PhobsRatePlan[] {
  const plans: PhobsRatePlan[] = []
  const blockPattern = /<RatePlan RateId="([^"]+)">([\s\S]*?)<\/RatePlan>/g
  let match: RegExpExecArray | null
  while ((match = blockPattern.exec(xml)) !== null) {
    const rateId = match[1]
    const block = match[2]
    const name = decodeXmlEntities(/<Name>([^<]*)<\/Name>/.exec(block)?.[1] ?? '')
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
      bookUrl: bookUrlMatch ? decodeXmlEntities(bookUrlMatch[1].replace(/\s+/g, '')) : null,
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

async function phobsRequest(xmlBody: string, env: PhobsEnv = 'production'): Promise<string> {
  const { apiUrl } = getConfig(env)
  const token = await getOAuthToken(env)
  const res = await phobsFetch(apiUrl, {
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
const unitToPropertyCaches = new Map<PhobsEnv, Map<string, string>>()
const unitToPropertyCacheAtMs = new Map<PhobsEnv, number>()
const UNIT_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

async function refreshUnitToPropertyCache(env: PhobsEnv): Promise<Map<string, string>> {
  const { siteId } = getConfig(env)

  const propertiesXml = await phobsRequest(
    `<?xml version="1.0" encoding="utf-8"?>
<PCListPropertiesRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
</PCListPropertiesRQ>`,
    env,
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
      env,
    )
    for (const unitId of parseAttrList(unitsXml, 'Unit', 'UnitId')) {
      map.set(unitId, propertyId)
    }
  }

  unitToPropertyCaches.set(env, map)
  unitToPropertyCacheAtMs.set(env, Date.now())
  return map
}

export async function getPropertyForUnit(unitId: string): Promise<string | null> {
  const env = envForUnit(unitId)
  const cachedAt = unitToPropertyCacheAtMs.get(env) ?? 0
  const isStale = !unitToPropertyCaches.has(env) || Date.now() - cachedAt > UNIT_CACHE_TTL_MS
  const map = isStale ? await refreshUnitToPropertyCache(env) : unitToPropertyCaches.get(env)
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
  const env = envForUnit(unitId)
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }

  const { apiUrl, siteId } = getConfig(env)
  const body = buildAvailabilityRequestXml({ siteId, propertyId, unitId, dateFrom, dateTo })

  let lastError: unknown
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = await getOAuthToken(env)
      const res = await phobsFetch(apiUrl, {
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
  const env = envForUnit(unitId)
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }

  const { siteId } = getConfig(env)
  const body = buildPropertyAvailabilityRequestXml({
    siteId,
    propertyId,
    unitId,
    dateFrom,
    nights,
    adults,
    childAges,
  })
  const xml = await phobsRequest(body, env)
  return { propertyId, ratePlans: parseRatePlansXml(xml) }
}

export function isTestModeUnit(unitId: string): boolean {
  return envForUnit(unitId) === 'test'
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseAttrsFromString(attrsStr: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const attrPattern = /(\w+)="([^"]*)"/g
  let attrMatch: RegExpExecArray | null
  while ((attrMatch = attrPattern.exec(attrsStr)) !== null) {
    attrs[attrMatch[1]] = attrMatch[2]
  }
  return attrs
}

/** Finds the first tag (any name) carrying the given attribute, returning all of its attributes. */
function findTagByAttr(xml: string, attrName: string): Record<string, string> | null {
  const re = new RegExp(`<\\w+([^>]*\\b${attrName}="[^"]*"[^>]*)\\/?>`)
  const match = re.exec(xml)
  return match ? parseAttrsFromString(match[1]) : null
}

function parseResponseErrors(xml: string): string[] {
  const errors: string[] = []
  const errorPattern = /<Error\b[^>]*>([^<]*)<\/Error>/g
  let match: RegExpExecArray | null
  while ((match = errorPattern.exec(xml)) !== null) {
    errors.push(match[1].trim())
  }
  return errors
}

function buildChildrenXml(childAges: number[]): string {
  return childAges.length > 0
    ? `<Children ChildrenNumber="${childAges.length}">${childAges.map((age) => `<Age>${age}</Age>`).join('')}</Children>`
    : `<Children ChildrenNumber="0" />`
}

type PhobsPriceQuote = {
  success: boolean
  currency: string | null
  grandTotal: number | null
  errors: string[]
}

/** PCPriceQuoteRQ — locks in the exact price for a RateId+Unit+occupancy combo. Must not be cached. */
export async function getPriceQuote(params: {
  unitId: string
  rateId: string
  dateFrom: string
  nights: number
  adults: number
  childAges: number[]
}): Promise<PhobsPriceQuote> {
  const { unitId, rateId, dateFrom, nights, adults, childAges } = params
  const env = envForUnit(unitId)
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }
  const { siteId } = getConfig(env)

  const body = `<?xml version="1.0" encoding="utf-8"?>
<PCPriceQuoteRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
    <PropertyId>${propertyId}</PropertyId>
    <Date>${dateFrom}</Date>
    <Nights>${nights}</Nights>
    <RateId>${rateId}</RateId>
    <Units>
        <Unit UnitId="${unitId}">
            <Adults AdultsNumber="${adults}" />
            ${buildChildrenXml(childAges)}
        </Unit>
    </Units>
</PCPriceQuoteRQ>`

  const xml = await phobsRequest(body, env)
  const errors = parseResponseErrors(xml)
  if (errors.length > 0) {
    return { success: false, currency: null, grandTotal: null, errors }
  }

  // Docs shape: <Price Currency="EUR" GrandTotal="1234.56" />. A GrandTotal-attr lookup is
  // used (rather than a fixed tag name) since this sandbox has shown quirks elsewhere where
  // Phobs' real responses don't exactly match the documented element shape.
  const totalAttrs = findTagByAttr(xml, 'GrandTotal')
  if (!totalAttrs) {
    return { success: false, currency: null, grandTotal: null, errors: ['missing_grand_total'] }
  }
  return {
    success: true,
    currency: totalAttrs.Currency ?? null,
    grandTotal: Number(totalAttrs.GrandTotal),
    errors: [],
  }
}

type PhobsBookingResult = {
  success: boolean
  reservationId: string | null
  bookingId: string
  errors: string[]
}

/**
 * PCBookingNewRQ — creates a real reservation. Guarded to TEST-mode units only: production has
 * no booking-creation permission yet (pending PCI DSS certification), so this must never be
 * reachable for real rooms even if a caller forgets the check at the API-route level.
 * Uses a hardcoded Phobs test-card number since this only ever runs against the TEST sandbox.
 */
export async function createTestBooking(params: {
  unitId: string
  rateId: string
  dateFrom: string
  nights: number
  adults: number
  childAges: number[]
  guest: { firstName: string; lastName: string; email: string; phone?: string }
}): Promise<PhobsBookingResult> {
  const { unitId, rateId, dateFrom, nights, adults, childAges, guest } = params
  const env = envForUnit(unitId)
  if (env !== 'test') {
    throw new Error(
      'Booking creation is only enabled for the internal test room — production lacks PCBookingNew permission pending certification.',
    )
  }
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }
  const { siteId } = getConfig(env)

  const bookingId = `mt${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`
  const firstName = escapeXml(guest.firstName)
  const lastName = escapeXml(guest.lastName)
  const email = escapeXml(guest.email)
  const phoneXml = guest.phone ? `<Telephone>${escapeXml(guest.phone)}</Telephone>` : ''

  const body = `<?xml version="1.0" encoding="utf-8"?>
<PCBookingNewRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
    <BookingID>${bookingId}</BookingID>
    <PropertyId>${propertyId}</PropertyId>
    <Date>${dateFrom}</Date>
    <Nights>${nights}</Nights>
    <RateId>${rateId}</RateId>
    <Units>
        <Unit UnitId="${unitId}">
            <Adults AdultsNumber="${adults}" />
            ${buildChildrenXml(childAges)}
            <RoomingList>
                <Guest><FirstName>${firstName}</FirstName><LastName>${lastName}</LastName></Guest>
            </RoomingList>
        </Unit>
    </Units>
    <Client>
        <FirstName>${firstName}</FirstName>
        <LastName>${lastName}</LastName>
        <BillingAddress Country="HR" />
        <Email>${email}</Email>
        ${phoneXml}
    </Client>
    <Payment>
        <CreditCard CreditCardType="VISA" CreditCardNo="4111111111111111" VerificationCode="123" ValidThroughMonth="12" ValidThroughYear="2030">
            <FirstName>${firstName}</FirstName>
            <LastName>${lastName}</LastName>
        </CreditCard>
    </Payment>
</PCBookingNewRQ>`

  const xml = await phobsRequest(body, env)
  const errors = parseResponseErrors(xml)
  if (errors.length > 0) {
    return { success: false, reservationId: null, bookingId, errors }
  }
  const reservationAttrs = findTagByAttr(xml, 'Id')
  return {
    success: true,
    reservationId: reservationAttrs?.Id ?? null,
    bookingId,
    errors: [],
  }
}

type PhobsBookingVerification = {
  success: boolean
  reservationId: string | null
  checkIn: string | null
  checkOut: string | null
  errors: string[]
}

/** PCBookingVerifyRQ — confirms a just-created reservation actually exists on Phobs' side. */
export async function verifyBooking(params: {
  unitId: string
  bookingId: string
  reservationId: string
}): Promise<PhobsBookingVerification> {
  const { unitId, bookingId, reservationId } = params
  const env = envForUnit(unitId)
  const propertyId = await getPropertyForUnit(unitId)
  if (!propertyId) {
    throw new Error(`No Phobs property found for unit ${unitId}`)
  }
  const { siteId } = getConfig(env)

  const body = `<?xml version="1.0" encoding="utf-8"?>
<PCBookingVerifyRQ Lang="en">
    <Auth><SiteId>${siteId}</SiteId></Auth>
    <ReservationID>${reservationId}</ReservationID>
    <BookingID>${bookingId}</BookingID>
    <PropertyId>${propertyId}</PropertyId>
</PCBookingVerifyRQ>`

  const xml = await phobsRequest(body, env)
  const errors = parseResponseErrors(xml)
  if (errors.length > 0) {
    return { success: false, reservationId: null, checkIn: null, checkOut: null, errors }
  }
  const periodAttrs = findTagByAttr(xml, 'CheckIn')
  return {
    success: true,
    reservationId,
    checkIn: periodAttrs?.CheckIn ?? null,
    checkOut: periodAttrs?.CheckOut ?? null,
    errors: [],
  }
}

export type {
  PhobsAvailabilityEntry,
  PhobsRatePlan,
  PhobsPriceQuote,
  PhobsBookingResult,
  PhobsBookingVerification,
}

import { describe, expect, it } from 'vitest'

import { parseAttrList, parseAvailabilityXml, parseRatePlansXml } from '@/lib/phobs'

// Structures copied from real Phobs responses (PCAvailabilityCalendarRS, PCPropertyAvailabilityRS,
// PCListPropertiesRS, PCListUnitRS); ids, company id and names are made up.
const NS = 'xmlns="http://www.phobs.net/phobs/connect/2013/"'

const calendarXml = `<?xml version = "1.0" encoding = "UTF-8"?><PCAvailabilityCalendarRS ${NS}>
  <AvailabilityCalendar>
    <Availability Date="2026-10-24" Available="1" UnitId="1447" RateFromValue="210" RateFromCurrency="EUR"></Availability>
    <Availability Date="2026-10-25" Available="0" UnitId="1447"></Availability>
    <Availability Date="2026-10-26" Available="true" UnitId="1447" RateFromValue="199.5" RateFromCurrency="EUR"/>
    <Availability Date="2026-10-24" Available="1" UnitId="9999" RateFromValue="50" RateFromCurrency="EUR"></Availability>
  </AvailabilityCalendar>
  <ResponseType><Success /></ResponseType>
</PCAvailabilityCalendarRS>`

const ratePlansXml = `<?xml version = "1.0" encoding = "UTF-8"?><PCPropertyAvailabilityRS ${NS}>
  <AvailabilityList>
    <RatePlans>
      <RatePlan RateId="RATE100">
        <Name>Best available rate</Name>
        <Units>
          <Unit OccupancyMax="3" OccupancyMin="1" Occupancy="2" UnitId="1447" AvailableUnits="3" OccupancyMaxAdult="3" OccupancyMinAdult="1" OccupancyMaxChd="2" OccupancyMinChd="0"
          OccupancyMaxChdAge="16">
            <Name>Comfort double room</Name>
            <Rate>
              <Board>HB</Board>
              <Price Currency="EUR" PriceType="PerNight">240</Price>
              <StayTotal Currency="EUR" PriceType="PerStay">
                <Price>480</Price>
                <Currency>EUR</Currency>
                <PriceType>PerStay</PriceType>
              </StayTotal>
            </Rate>
            <BookUrl>
            book.php?company_id=abc&amp;hotel=def&amp;date=2026-10-26&amp;nights=2&amp;rate=100&amp;room=1447
            </BookUrl>
          </Unit>
        </Units>
      </RatePlan>
      <RatePlan RateId="RATE200">
        <Name>Spring &amp; summer &quot;early&quot; offer</Name>
        <Units>
          <Unit OccupancyMax="3" OccupancyMin="2" UnitId="1447" OccupancyMaxAdult="3" OccupancyMaxChd="2" OccupancyMaxChdAge="12">
            <Rate>
              <Price Currency="EUR" PriceType="PerNight">216.50</Price>
              <PriceOriginal Currency="EUR" PriceType="PerNight">
                <Price>240</Price>
              </PriceOriginal>
            </Rate>
          </Unit>
        </Units>
      </RatePlan>
    </RatePlans>
  </AvailabilityList>
</PCPropertyAvailabilityRS>`

describe('parseAvailabilityXml', () => {
  it('reads dates, availability and the from-rate for the requested unit only', () => {
    expect(parseAvailabilityXml(calendarXml, '1447')).toEqual([
      { date: '2026-10-24', available: true, rate: 210, currency: 'EUR' },
      { date: '2026-10-25', available: false, rate: null, currency: null },
      { date: '2026-10-26', available: true, rate: 199.5, currency: 'EUR' },
    ])
  })

  it('returns nothing for a unit that is not in the response', () => {
    expect(parseAvailabilityXml(calendarXml, '4242')).toEqual([])
  })

  it('also reads responses that use a namespace prefix', () => {
    const prefixed = `<phobs:PCAvailabilityCalendarRS xmlns:phobs="http://www.phobs.net/phobs/connect/2013/">
      <phobs:Availability Date="2026-10-24" Available="1" UnitId="1447" RateFromValue="210" RateFromCurrency="EUR"/>
    </phobs:PCAvailabilityCalendarRS>`

    expect(parseAvailabilityXml(prefixed, '1447')).toHaveLength(1)
  })

  it('skips entries without a date and survives an empty or error response', () => {
    expect(parseAvailabilityXml('<Availability UnitId="1447" Available="1"/>', '1447')).toEqual([])
    expect(parseAvailabilityXml('', '1447')).toEqual([])
    expect(parseAvailabilityXml('<Error>nope</Error>', '1447')).toEqual([])
  })
})

describe('parseRatePlansXml', () => {
  const plans = parseRatePlansXml(ratePlansXml)

  it('finds every rate plan', () => {
    expect(plans.map((plan) => plan.rateId)).toEqual(['RATE100', 'RATE200'])
  })

  it('reads price, stay total and currency', () => {
    expect(plans[0]).toMatchObject({
      name: 'Best available rate',
      pricePerNight: 240,
      stayTotal: 480,
      currency: 'EUR',
      priceOriginalPerNight: null,
    })
  })

  it('reads the occupancy caps even when the Unit tag spans several lines', () => {
    expect(plans[0]).toMatchObject({
      occupancyMin: 1,
      occupancyMax: 3,
      occupancyMinAdult: 1,
      occupancyMaxAdult: 3,
      occupancyMinChd: 0,
      occupancyMaxChd: 2,
      occupancyMaxChdAge: 16,
    })
  })

  it('reads a discounted plan: original price, decimals, and no stay total', () => {
    expect(plans[1]).toMatchObject({
      pricePerNight: 216.5,
      priceOriginalPerNight: 240,
      stayTotal: null,
      occupancyMin: 2,
      occupancyMaxChdAge: 12,
    })
  })

  it('decodes XML entities in plan names instead of showing "&amp;" to guests', () => {
    expect(plans[1]!.name).toBe('Spring & summer "early" offer')
  })

  it('returns a usable booking URL: whitespace stripped and entities decoded', () => {
    expect(plans[0]!.bookUrl).toBe(
      'book.php?company_id=abc&hotel=def&date=2026-10-26&nights=2&rate=100&room=1447',
    )
    expect(plans[1]!.bookUrl).toBeNull()
  })

  it('returns no plans for an empty or unrelated response', () => {
    expect(parseRatePlansXml('')).toEqual([])
    expect(
      parseRatePlansXml('<PCPropertyAvailabilityRS><Error/></PCPropertyAvailabilityRS>'),
    ).toEqual([])
  })
})

describe('parseAttrList', () => {
  const propertiesXml = `<PCListPropertiesRS ${NS}>
    <Properties>
      <Property PropertyId="aaa111" Type="hotel"><Name>One</Name></Property>
      <Property Type="camp" PropertyId="bbb222"><Name>Two</Name></Property>
    </Properties>
  </PCListPropertiesRS>`
  const unitsXml = `<PCListUnitRS ${NS}><Units>
      <Unit OccupancyMax="3" UnitId="1447"><Name>A</Name></Unit>
      <Unit UnitId="1448" OccupancyMax="3"><Name>B</Name></Unit>
    </Units></PCListUnitRS>`

  it('lists property ids whatever the attribute order', () => {
    expect(parseAttrList(propertiesXml, 'Property', 'PropertyId')).toEqual(['aaa111', 'bbb222'])
  })

  it('does not confuse <Units> with <Unit>', () => {
    expect(parseAttrList(unitsXml, 'Unit', 'UnitId')).toEqual(['1447', '1448'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(parseAttrList('<x/>', 'Unit', 'UnitId')).toEqual([])
  })
})

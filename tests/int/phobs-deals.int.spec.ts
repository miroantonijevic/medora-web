import { describe, expect, it } from 'vitest'

import { parseHighlights, parseUnitDealsXml } from '@/lib/phobs'

const unit = (id: string, name: string, price: number, original: number | null, total: number) => `
  <Unit OccupancyMax="3" Occupancy="2" UnitId="${id}" AvailableUnits="5">
    <Name>${name}</Name>
    <Rate>
      <Board>BB</Board>
      <Price Currency="EUR" PriceType="PerNight">${price}</Price>
      <StayTotal Currency="EUR" PriceType="PerStay"><Price>${total}</Price></StayTotal>
      ${original ? `<PriceOriginal Currency="EUR" PriceType="PerNight"><Price>${original}</Price></PriceOriginal>` : ''}
    </Rate>
  </Unit>`

// Structure of a real property-wide PCPropertyAvailabilityRS (shortened).
const xml = `<?xml version="1.0"?>
<PCPropertyAvailabilityRS xmlns="http://www.phobs.net/phobs/connect/2013/">
  <AvailabilityList><RatePlans>
    <RatePlan RateId="RATE1">
      <Name>Best available rate, with breakfast</Name>
      <Units>${unit('7135', 'Double Room &amp; balcony', 106, 119, 218)}</Units>
    </RatePlan>
    <RatePlan RateId="RATE2">
      <Name>Today only deal</Name>
      <ShortDescription>✔️&#160; breakfast and dinner included✔️&#160; parking &amp; sunbeds included</ShortDescription>
      <Units>${unit('7134', 'Family Room', 201, 223, 404)}${unit('7135', 'Double Room', 99, null, 200)}</Units>
    </RatePlan>
  </RatePlans></AvailabilityList>
</PCPropertyAvailabilityRS>`

describe('parseHighlights', () => {
  it('splits the check-marked phrases, with or without the emoji variation selector', () => {
    expect(parseHighlights('<ShortDescription>✔️&#160; a b✔ c ☑ d</ShortDescription>')).toEqual([
      'a b',
      'c',
      'd',
    ])
  })

  it('returns the whole text when there are no check marks, and nothing without a description', () => {
    expect(parseHighlights('<ShortDescription>Free parking</ShortDescription>')).toEqual([
      'Free parking',
    ])
    expect(parseHighlights('<Name>x</Name>')).toEqual([])
  })
})

describe('parseUnitDealsXml', () => {
  const deals = parseUnitDealsXml(xml, 'P1')

  it('returns one deal per rate plan and unit', () => {
    expect(deals.map((d) => `${d.rateId}/${d.unitId}`)).toEqual([
      'RATE1/7135',
      'RATE2/7134',
      'RATE2/7135',
    ])
  })

  it('reads prices, the original price and the currency', () => {
    expect(deals[1]).toMatchObject({
      propertyId: 'P1',
      rateName: 'Today only deal',
      pricePerNight: 201,
      priceOriginalPerNight: 223,
      stayTotal: 404,
      currency: 'EUR',
      board: 'BB',
      availableUnits: 5,
    })
    expect(deals[2]!.priceOriginalPerNight).toBeNull()
  })

  it('decodes entities and carries the highlights of the rate plan to each of its units', () => {
    expect(deals[0]!.unitName).toBe('Double Room & balcony')
    expect(deals[1]!.highlights).toEqual([
      'breakfast and dinner included',
      'parking & sunbeds included',
    ])
    expect(deals[0]!.highlights).toEqual([])
  })

  it('returns nothing for an answer without rate plans', () => {
    expect(parseUnitDealsXml('<PCPropertyAvailabilityRS/>', 'P1')).toEqual([])
  })
})

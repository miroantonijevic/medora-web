/**
 * Limits and parsing for guest-supplied Phobs request parameters. Every /api/phobs route
 * validates through this one place so the bounds cannot drift between availability, rates and booking.
 */

export const MAX_NIGHTS = 60
export const MAX_ADULTS = 8
export const MAX_CHILDREN = 6
export const MAX_CHILD_AGE = 17
// A bit over the 18 months the availability route uses as its default window.
export const MAX_AVAILABILITY_RANGE_DAYS = 600

const DAY_MS = 86_400_000

/** A real calendar date as YYYY-MM-DD, or null (rejects "2026-02-31" as well as malformed text). */
export function parseYMD(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
}

export function daysBetweenYMD(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS)
}

/** Parses a comma-separated list of child ages, or null if it is out of bounds or not numeric. */
export function parseChildAges(value: string | null): number[] | null {
  if (!value) return []
  const ages = value.split(',').map((part) => Number(part.trim()))
  if (ages.length > MAX_CHILDREN) return null
  if (!ages.every((age) => Number.isInteger(age) && age >= 0 && age <= MAX_CHILD_AGE)) return null
  return ages
}

export function isValidAdults(adults: number): boolean {
  return Number.isInteger(adults) && adults >= 1 && adults <= MAX_ADULTS
}

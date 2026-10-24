import { test, expect } from '@playwright/test'

import {
  deleteE2eInquiries,
  E2E_INQUIRY_PREFIX,
  findE2eInquiries,
  isSmtpConfigured,
} from '../helpers/inquiries'

// These tests run against the development server and need the seeded development database
// (properties, rooms and the internal test room, see the /next/seed-* endpoints). They avoid
// asserting on text editors can change.

const TEST_ROOM_URL = '/en/properties/medora-auri/rooms/auri-double-rooms/test-booking-demo'

test.describe('Frontend', () => {
  test('homepage loads in every locale', async ({ page }) => {
    for (const locale of ['en', 'hr', 'de']) {
      const response = await page.goto(`/${locale}`)

      expect(response?.status(), `/${locale}`).toBe(200)
      await expect(page).toHaveTitle(/Medora Auri/)
    }
  })

  test('every page declares its language on <html>', async ({ page }) => {
    for (const path of ['/en', '/hr', '/de', '/hr/orbis', '/de/offers']) {
      await page.goto(path)

      await expect(page.locator('html'), path).toHaveAttribute('lang', path.split('/')[1]!)
    }
  })

  test('the header offers a quick inquiry link', async ({ page }) => {
    await page.goto('/en')

    await expect(page.getByRole('link', { name: 'Quick inquiry' }).first()).toBeVisible()
  })

  test.describe('rooms button in the header', () => {
    // The blue bar under the main header; it links to the rooms of the property being viewed.
    const roomsButton = (page: import('@playwright/test').Page) =>
      page.getByRole('link', { name: 'Choose a room' })

    for (const [path, property] of [
      ['/en', 'medora-auri'],
      ['/en/properties/medora-auri', 'medora-auri'],
      ['/en/orbis', 'luxury-camp-orbis'],
      ['/en/properties/luxury-camp-orbis', 'luxury-camp-orbis'],
    ]) {
      test(`${path} links to the rooms of ${property}`, async ({ page }) => {
        await page.goto(path!)

        await expect(roomsButton(page)).toHaveAttribute('href', `/en/properties/${property}/rooms`)
      })
    }
  })

  test.describe('booking calendar', () => {
    test('opens on the internal test room and closes again', async ({ page }) => {
      const response = await page.goto(TEST_ROOM_URL)
      test.skip(response?.status() !== 200, 'the internal test room is not in this database')

      await page.getByRole('button', { name: 'Book now' }).first().click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByText('Select your check-in and check-out dates')).toBeVisible()
      const month = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })
      await expect(dialog.getByText(month)).toBeVisible()
      // Availability comes from Phobs; whatever it answers, the calendar must settle on a grid
      // (days) or an error message instead of staying on the loading skeleton.
      await expect(
        dialog
          .getByRole('button', { name: /^\d{1,2}$/ })
          .first()
          .or(dialog.getByText('Availability is temporarily unavailable')),
      ).toBeVisible({ timeout: 20_000 })

      await dialog.getByRole('button', { name: 'Close' }).click()
      await expect(dialog).toBeHidden()
    })
  })

  test.describe('inquiry form', () => {
    test.afterAll(async () => {
      await deleteE2eInquiries()
    })

    test('a submitted inquiry is saved', async ({ page }) => {
      test.skip(
        await isSmtpConfigured(),
        'SMTP is configured: submitting would send real emails to the hotel and the guest',
      )

      const name = `${E2E_INQUIRY_PREFIX}${Date.now()}`
      // Wait until the page has settled: text typed before React hydrates the form is discarded.
      await page.goto('/en/inquiry', { waitUntil: 'networkidle' })

      await page.locator('input[name="arrival"]').fill('2027-07-10')
      await page.locator('input[name="departure"]').fill('2027-07-14')
      await page.locator('input[name="name"]').fill(name)
      await page.locator('input[name="email"]').fill('e2e-guest@example.com')
      await page.getByRole('button', { name: 'Send inquiry' }).click()

      await expect(page.getByText(/^✓/)).toBeVisible()

      const saved = (await findE2eInquiries()).find((inquiry) => inquiry.name === name)
      expect(saved, 'the inquiry exists in the database').toBeDefined()
      expect(saved?.status).toBe('new')
      expect(saved?.adults).toBe(2)
    })
  })
})

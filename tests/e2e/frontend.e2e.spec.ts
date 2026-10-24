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

    test('fits the screen: room beside the steps on a desktop, full screen on a phone', async ({
      page,
    }) => {
      const openPopup = async () => {
        const response = await page.goto(TEST_ROOM_URL)
        test.skip(response?.status() !== 200, 'the internal test room is not in this database')
        await page.getByRole('button', { name: 'Book now' }).first().click()
        const dialog = page.getByRole('dialog')
        await expect(dialog.getByText('Select your check-in and check-out dates')).toBeVisible()
        return dialog
      }

      await page.setViewportSize({ width: 1440, height: 900 })
      let dialog = await openPopup()
      let photo = await dialog.getByRole('button', { name: /photo/i }).first().boundingBox()
      let heading = await dialog.getByText('Select your check-in and check-out dates').boundingBox()
      let popup = await dialog.locator('> div').first().boundingBox()
      expect(photo!.x + photo!.width, 'photo is left of the steps').toBeLessThanOrEqual(heading!.x)
      expect(popup!.width, 'a bounded width on a big screen').toBeLessThanOrEqual(1040)
      expect(popup!.height, 'never taller than the window').toBeLessThanOrEqual(900)

      await page.setViewportSize({ width: 390, height: 844 })
      dialog = await openPopup()
      photo = await dialog.getByRole('button', { name: /photo/i }).first().boundingBox()
      heading = await dialog.getByText('Select your check-in and check-out dates').boundingBox()
      popup = await dialog.locator('> div').first().boundingBox()
      expect(photo!.y, 'photo is above the steps').toBeLessThan(heading!.y)
      expect(popup!.width).toBe(390)
      expect(popup!.height).toBe(844)
    })

    // Picks the first two open days of the calendar and waits for the rates of that stay. The rates
    // come from Phobs, so the test skips when the test account has none for these days.
    async function openRates(page: import('@playwright/test').Page) {
      const response = await page.goto(TEST_ROOM_URL)
      test.skip(response?.status() !== 200, 'the internal test room is not in this database')
      await page.getByRole('button', { name: 'Book now' }).first().click()

      const dialog = page.getByRole('dialog')
      const openDays = dialog.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}$/ })
      await expect(openDays.first()).toBeVisible({ timeout: 20_000 })
      test.skip((await openDays.count()) < 2, 'the Phobs test account has no open days')
      await openDays.nth(0).click()
      await openDays.nth(1).click()

      const rates = dialog.getByRole('button', { name: /^Select/ })
      await rates
        .first()
        .waitFor({ timeout: 25_000 })
        .catch(() => undefined)
      test.skip((await rates.count()) === 0, 'the Phobs test account has no rates for these days')
      return { dialog, rateCount: await rates.count() }
    }

    test('rate details open on request and show the policies', async ({ page }) => {
      const { dialog } = await openRates(page)

      await dialog.getByRole('button', { name: 'Rate details' }).first().click()

      // The policies come from Phobs; either they show, or the panel says they are unavailable.
      await expect(
        dialog
          .getByText(/Check-in time/)
          .first()
          .or(dialog.getByText('The rate details are temporarily unavailable')),
      ).toBeVisible({ timeout: 25_000 })
      await dialog.getByRole('button', { name: 'Hide details' }).first().click()
      await expect(dialog.getByText(/Check-in time/)).toBeHidden()
    })

    test('the cheapest rate is highlighted in blue', async ({ page }) => {
      const { dialog, rateCount } = await openRates(page)
      test.skip(rateCount < 2, 'a single rate has nothing to be cheaper than')

      const badge = dialog.getByText('Best price')
      await expect(badge).toHaveCount(1)
      await expect(badge).toHaveCSS('background-color', 'rgb(37, 99, 235)')
    })

    test('a click on the room photo opens the gallery', async ({ page }) => {
      const response = await page.goto(TEST_ROOM_URL)
      test.skip(response?.status() !== 200, 'the internal test room is not in this database')
      await page.getByRole('button', { name: 'Book now' }).first().click()

      await page.getByRole('dialog').getByRole('button', { name: /photo/i }).first().click()

      const lightbox = page.locator('.yarl__root')
      await expect(lightbox).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(lightbox).toBeHidden()
      await expect(page.getByRole('dialog')).toBeVisible()
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

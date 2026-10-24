import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

// Logs in as a throwaway admin user (created in, and removed from, the development database).
test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    // A wide window: on narrower ones the admin collapses its sidebar, which holds the search box.
    const context = await browser.newContext({ viewport: { width: 1500, height: 900 } })
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    // Payload appends ?depth=...&limit=... to the URL once the list has loaded.
    await expect(page).toHaveURL(/\/admin\/collections\/users(\?.*)?$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test('the media library lists media and folders', async () => {
    await page.goto('http://localhost:3000/admin/media-library')

    await expect(page.getByText('All Media').first()).toBeVisible()
    await expect(page.locator('.media-library__sidebar')).toBeVisible()
  })

  test('global search finds content and shows it in a readable colour', async () => {
    test.setTimeout(60_000)
    await page.goto('http://localhost:3000/admin')

    const input = page.locator('input[placeholder="Search everything…"]')
    const results = page.locator('.global-search-results')
    // The first search request compiles the API route in the dev server, so allow time for it.
    await input.pressSequentially('auri', { delay: 40 })
    await expect(results.locator('button').first()).toBeVisible({ timeout: 30_000 })

    // The popup sits inside the dark sidebar, whose rule makes buttons white; it must stay dark on its white background.
    const color = await results
      .locator('button')
      .first()
      .evaluate((element) => getComputedStyle(element).color)
    expect(color).not.toMatch(/^rgba?\(255, 255, 255/)
  })
})

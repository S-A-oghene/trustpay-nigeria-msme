import { test, expect } from '@playwright/test'

test('demo landing and core public surfaces load', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', {name:/trust and control layer/i})).toBeVisible()
  await page.getByRole('link', {name:/run the demo/i}).click()
  await expect(page.getByText('DEMO / SIMULATED')).toBeVisible()
  await page.getByRole('link', {name:/buyer view/i}).first().click()
  await expect(page.getByText('PUBLIC TRUST CARD')).toBeVisible()
})

import { test, expect } from '@playwright/test'

test('demo landing and core public surfaces load', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: /make online commerce feel accountable/i,
    }),
  ).toBeVisible()

  await page
    .getByRole('link', { name: /explore the live simulation/i })
    .click()

  await expect(page).toHaveURL(/\/demo\/?$/)

  // The shipped DemoBanner is a semantic status region and says
  // "Simulated environment." rather than the old "DEMO / SIMULATED" text.
  await expect(page.getByRole('status')).toContainText(
    /simulated environment/i,
  )

  const buyerView = page
    .getByRole('link', { name: /^buyer view$/i })
    .first()

  await expect(buyerView).toBeVisible()
  await buyerView.click()

  await expect(page).toHaveURL(/\/trust\/trust-demo-1001\/?$/)
  await expect(
    page.getByText('PUBLIC TRUST CARD', { exact: false }),
  ).toBeVisible()
})

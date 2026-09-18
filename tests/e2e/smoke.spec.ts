import { test, expect } from '@playwright/test'

test('demo landing and core public surfaces load', async ({ page }) => {
  await page.goto('/')

  // Keep the smoke test aligned with the shipped homepage hero.
  await expect(
    page.getByRole('heading', { name: /make online commerce feel accountable/i }),
  ).toBeVisible()

  // Use the actual public CTA shipped on the homepage.
  await page.getByRole('link', { name: /explore the live simulation/i }).click()
  await expect(page).toHaveURL(/\/demo\/?$/)

  await expect(page.getByText('DEMO / SIMULATED', { exact: false })).toBeVisible()

  // The demo contains two buyer views; exercise the first deterministic merchant.
  const buyerView = page.getByRole('link', { name: /^buyer view$/i }).first()
  await expect(buyerView).toBeVisible()
  await buyerView.click()

  await expect(page).toHaveURL(/\/trust\/trust-demo-1001\/?$/)
  await expect(page.getByText('PUBLIC TRUST CARD · EVIDENCE VIEW')).toBeVisible()
})

import { test, expect } from '@playwright/test'

test.describe('Forgot/Reset Password Flow', () => {
  test('should navigate to forgot-password from login', async ({ page }) => {
    await page.goto('/login')

    await page.locator('a[href="/forgot-password"]').click()
    await expect(page).toHaveURL(/\/forgot-password$/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show mismatch error before calling reset endpoint', async ({ page }) => {
    let resetEndpointCalled = false

    await page.route('**/auth/reset-password', async (route) => {
      resetEndpointCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'password_reset' }),
      })
    })

    await page.goto('/reset-password#token=fake-reset-token')
    await expect(page.locator('input#new-password')).toBeVisible()
    await page.waitForTimeout(200)
    await page.fill('input#new-password', 'NewSecurePass2@')
    await page.fill('input#confirm-password', 'DifferentPass3@')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Les mots de passe ne correspondent pas.')).toBeVisible()
    await page.waitForTimeout(300)
    expect(resetEndpointCalled).toBeFalsy()
  })
})

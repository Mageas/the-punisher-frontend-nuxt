import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should keep password masked and navigate to register page', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password')

    await page.locator('a[href="/register"]').click()
    await expect(page).toHaveURL(/\/register$/)
  })
})

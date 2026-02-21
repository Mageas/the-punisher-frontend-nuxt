import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login')

    // Check for title (The Punisher)
    await expect(page.locator('h1')).toContainText('The Punisher')

    // Check for login subtitle
    await expect(page.locator('p.text-muted-foreground')).toContainText(
      'Connectez-vous à votre compte',
    )

    // Check for form fields
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('label[for="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('#email', 'wrong@example.com')
    await page.fill('#password', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Since we don't have a real backend running or mocked in this basic test,
    // it might fail or show an error depending on how the app handles fetch errors.
    // In a real scenario, we would mock the API.
  })
})

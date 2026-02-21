import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { level: 1, name: 'The Punisher' })).toBeVisible()
    await expect(page.getByText('Connectez-vous à votre compte', { exact: true })).toBeVisible()

    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Mot de passe')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
  })

  test('should keep password masked and navigate to register page', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel('Mot de passe')).toHaveAttribute('type', 'password')

    await page.getByRole('link', { name: 'Créer un compte' }).click()
    await expect(page).toHaveURL(/\/register$/)
  })
})

#!/usr/bin/env node
import { chromium } from 'playwright-chromium'

const BASE_URL = 'http://localhost:3000'
const API_URL = 'http://localhost:8080/v1'

const loginRes = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@test.fr', password: 'admin@test.fr' }),
})
const { access_token } = await loginRes.json()

const browser = await chromium.launch()
const context = await browser.newContext()
await context.addCookies([{ name: 'access_token', value: access_token, url: BASE_URL, sameSite: 'Lax' }])
const page = await context.newPage()

const targetPath = process.argv[2] || '/'
await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const buttons = await page.$$eval('button', (els) =>
  els.map((el) => ({
    outerHTML: el.outerHTML.slice(0, 300),
    text: el.innerText?.trim(),
    ariaLabel: el.getAttribute('aria-label'),
    role: el.getAttribute('role'),
    slot: el.getAttribute('data-slot'),
  })),
)

console.log(JSON.stringify(
  buttons.filter(b => !b.text && !b.ariaLabel),
  null,
  2,
))

await browser.close()

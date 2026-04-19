#!/usr/bin/env node
/* eslint-disable no-console */
import { chromium } from 'playwright-chromium'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const API_URL = process.env.API_URL || 'http://localhost:8080/v1'
const EMAIL = process.env.A11Y_EMAIL || 'admin@test.fr'
const PASSWORD = process.env.A11Y_PASSWORD || 'admin@test.fr'

const publicRoutes = ['/login', '/register', '/forgot-password']
const authRoutes = [
  '/',
  '/penalties',
  '/punishments',
  '/bonuses',
  '/students',
  '/classes',
  '/rules',
  '/penalty-types',
  '/punishment-types',
  '/bonus-types',
  '/schedule/slots',
  '/schedule/exceptions',
  '/settings',
  '/management/danger',
]

async function loginViaApi() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) {
    throw new Error(`Login failed: HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.access_token
}

async function scanPage(page, path, results) {
  const url = `${BASE_URL}${path}`
  process.stdout.write(`• ${path} ... `)
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
  } catch (err) {
    console.log(`FAILED to load (${err.message})`)
    results.push({ path, error: err.message, violations: [] })
    return
  }

  // Allow client render to settle
  await page.waitForTimeout(1000)

  const axe = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .exclude('#nuxt-devtools-container')
    .exclude('.nuxt-devtools-icon-button')
    .exclude('#__nuxt-devtools__')
  const axeResult = await axe.analyze()
  const violations = axeResult.violations
  console.log(`${violations.length} violations`)
  results.push({ path, violations })
}

function formatViolations(results) {
  const perRule = new Map()
  for (const { path, violations } of results) {
    for (const v of violations) {
      const entry = perRule.get(v.id) ?? {
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        pages: new Set(),
        samples: [],
      }
      entry.pages.add(path)
      if (entry.samples.length < 3) {
        for (const node of v.nodes.slice(0, 2)) {
          entry.samples.push({
            path,
            target: node.target,
            html: node.html?.slice(0, 200),
            summary: node.failureSummary,
          })
        }
      }
      perRule.set(v.id, entry)
    }
  }
  return Array.from(perRule.values()).map((r) => ({
    ...r,
    pages: Array.from(r.pages),
  }))
}

async function main() {
  const token = await loginViaApi()
  console.log(`✓ API login OK (token ${token.slice(0, 12)}...)`)

  const browser = await chromium.launch()

  // Public pages: no auth cookie, otherwise guest-only pages redirect.
  const publicContext = await browser.newContext()
  const publicPage = await publicContext.newPage()
  const results = []
  for (const path of publicRoutes) {
    await scanPage(publicPage, path, results)
  }
  await publicContext.close()

  // Auth pages: with access_token cookie.
  const authContext = await browser.newContext()
  await authContext.addCookies([
    {
      name: 'access_token',
      value: token,
      url: BASE_URL,
      httpOnly: false,
      sameSite: 'Lax',
    },
  ])
  const authPage = await authContext.newPage()
  for (const path of authRoutes) {
    await scanPage(authPage, path, results)
  }

  await browser.close()

  const summary = formatViolations(results)
  const totalViolations = results.reduce((acc, r) => acc + r.violations.length, 0)

  mkdirSync(`${__dirname}/../.a11y`, { recursive: true })
  writeFileSync(
    `${__dirname}/../.a11y/report.json`,
    JSON.stringify({ totalViolations, perPage: results, perRule: summary }, null, 2),
  )

  console.log('')
  console.log('═'.repeat(70))
  console.log(`TOTAL violations: ${totalViolations}`)
  console.log(`Unique rules violated: ${summary.length}`)
  console.log('═'.repeat(70))
  for (const rule of summary) {
    console.log(
      `\n[${rule.impact ?? 'n/a'}] ${rule.id} — ${rule.help}\n  on: ${rule.pages.join(', ')}`,
    )
    for (const s of rule.samples.slice(0, 2)) {
      console.log(`   ↳ ${s.path} ${s.target?.join(' ')}`)
      console.log(`     ${s.html}`)
    }
  }

  if (totalViolations > 0) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})

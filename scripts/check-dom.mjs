import { chromium } from 'playwright-chromium'
const loginRes = await fetch('http://localhost:8080/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@test.fr', password: 'admin@test.fr' }),
})
const { access_token } = await loginRes.json()
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } })
await ctx.addCookies([{ name:'access_token', value:access_token, url:'http://localhost:3000', sameSite:'Lax' }])
const page = await ctx.newPage()
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
const data = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button[data-slot="popover-trigger"]')).map((el) => ({
    class: el.className,
    display: window.getComputedStyle(el).display,
    visibility: window.getComputedStyle(el).visibility,
    text: el.innerText?.trim(),
    parentDisplay: el.parentElement ? window.getComputedStyle(el.parentElement).display : null,
  }))
})
console.log(JSON.stringify(data, null, 2))
await browser.close()

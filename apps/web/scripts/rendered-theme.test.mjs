import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close(() => resolve(port))
    })
  })
}

function waitForText(child, pattern, timeoutMs) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    const timer = setTimeout(() => {
      reject(new Error(`next did not report ready\n${buffer.slice(-2000)}`))
    }, timeoutMs)
    const onData = (chunk) => {
      buffer += chunk.toString()
      if (pattern.test(buffer)) {
        clearTimeout(timer)
        resolve(buffer)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.once('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`next exited ${code}\n${buffer.slice(-2000)}`))
    })
  })
}

let child
let base
let browser

async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch {
    const install = spawn(
      'pnpm',
      ['exec', 'playwright', 'install', 'chromium'],
      { cwd: webRoot, stdio: 'inherit' },
    )
    const code = await new Promise((resolve) => install.once('exit', resolve))
    assert.equal(code, 0, 'playwright install chromium failed')
    return chromium.launch()
  }
}

function channel(value) {
  const normalized = value / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function contrast(foreground, background) {
  const lum = (rgb) =>
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  const lighter = Math.max(lum(foreground), lum(background))
  const darker = Math.min(lum(foreground), lum(background))
  return (lighter + 0.05) / (darker + 0.05)
}

async function paint(page, selector, property) {
  return page.locator(selector).evaluate((element, name) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const raw = getComputedStyle(element)[name]
    context.fillStyle = '#0b0a09'
    context.fillRect(0, 0, 1, 1)
    context.fillStyle = raw
    context.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
    return { r, g, b, a, raw }
  }, property)
}

test.before(async () => {
  const port = await freePort()
  base = `http://127.0.0.1:${port}`
  child = spawn('pnpm', ['exec', 'next', 'dev', '--port', String(port), '--hostname', '127.0.0.1'], {
    cwd: webRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      BETTER_AUTH_SECRET: 'render-test-secret',
      BETTER_AUTH_URL: base,
      GITHUB_CLIENT_ID: 'render-test',
      GITHUB_CLIENT_SECRET: 'render-test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await waitForText(child, /Ready|Local:/, 60000)
  browser = await launchBrowser()
})

test.after(async () => {
  await browser?.close()
  if (child && !child.killed) child.kill('SIGTERM')
})

test('admin light renders its own colors and no public chrome', { timeout: 180000 }, async () => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  const response = await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  assert.equal(response.status(), 200)
  assert.equal((await page.locator('html').getAttribute('class')) ?? '', '')
  assert.equal(await page.locator('header.sticky').count(), 0)
  assert.equal(await page.locator('footer').count(), 0)
  assert.equal(await page.locator('img[src*="logo-dark"]').count(), 0)
  const background = await paint(page, '.admin-theme', 'backgroundColor')
  const foreground = await paint(page, '.admin-theme', 'color')
  assert.ok(background.r > 240 && background.g > 240 && background.b > 240, JSON.stringify(background))
  assert.ok(foreground.r < 40 && foreground.g < 40 && foreground.b < 40, JSON.stringify(foreground))
  const ratio = contrast(foreground, background)
  assert.ok(ratio >= 4.5, `admin light is ${ratio.toFixed(2)}:1`)
  await context.close()

  const themed = await browser.newContext()
  await themed.addCookies([
    { name: 'better-auth.session_token', value: 'fake', url: base },
  ])
  await themed.addInitScript(() => localStorage.setItem('theme', 'light'))
  const admin = await themed.newPage()
  const adminResponse = await admin.goto(`${base}/admin`, { waitUntil: 'networkidle', timeout: 120000 })
  assert.equal(adminResponse.status(), 200)
  assert.equal(await admin.locator('html').getAttribute('class'), 'light')
  assert.equal(await admin.locator('header.sticky').count(), 0)
  assert.equal(await admin.locator('footer').count(), 0)
  const adminBackground = await paint(admin, '.admin-theme', 'backgroundColor')
  const adminForeground = await paint(admin, '.admin-theme', 'color')
  assert.ok(contrast(adminForeground, adminBackground) >= 4.5)
  const missingAdmin = await admin.goto(`${base}/admin/does-not-exist`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  assert.equal(missingAdmin.status(), 404)
  assert.equal(await admin.locator('header.sticky').count(), 0)
  assert.equal(await admin.locator('footer').count(), 0)
  await themed.close()
})

test('a public page with no dark class keeps the polaroid palette', { timeout: 180000 }, async () => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  const response = await page.goto(`${base}/design`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  assert.equal(response.status(), 200)
  assert.equal((await page.locator('html').getAttribute('class')) ?? '', '')
  assert.equal(await page.locator('header.sticky').count(), 1)
  assert.equal(await page.locator('footer').count(), 1)
  const logo = page.locator('header img')
  assert.equal(await logo.count(), 1)
  assert.match(await logo.getAttribute('src'), /logo-dark\.svg/)
  const background = await paint(page, 'body', 'backgroundColor')
  const foreground = await paint(page, 'body', 'color')
  assert.deepEqual([background.r, background.g, background.b], [11, 10, 9])
  assert.deepEqual([foreground.r, foreground.g, foreground.b], [232, 225, 214])
  const ratio = contrast(foreground, background)
  assert.ok(ratio >= 4.5, `public text is ${ratio.toFixed(2)}:1`)

  const missing = await page.goto(`${base}/does-not-exist`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  assert.equal(missing.status(), 404)
  assert.equal(await page.locator('header.sticky').count(), 1)
  assert.equal(await page.locator('footer').count(), 1)
  await context.close()
})

function className(rel, pattern) {
  const source = fs.readFileSync(path.join(webRoot, rel), 'utf8')
  const match = source.match(pattern)
  assert.ok(match, `${rel} has no class for ${pattern}`)
  return match[1]
}

test('dark variants and prose-invert do not restyle a page with no dark class', async () => {
  const cssPath = path.join(webRoot, 'src/app/globals.css')
  const input = `${fs.readFileSync(cssPath, 'utf8')}\n@source "../**/*.{tsx,ts}";\n`
  const compiled = await postcss([tailwind()]).process(input, { from: cssPath })
  assert.equal(compiled.css.includes('prose-invert'), false)

  const terminal = className(
    'src/components/about/life-source-code.tsx',
    /className="([^"]*bg-zinc-950[^"]*)"/,
  )
  const badge = className(
    'src/components/about/certificate-card.tsx',
    /coursera: \{ label: 'Coursera', color: '([^']+)' \}/,
  )
  const errorIcon = className(
    'src/components/layout/error-view.tsx',
    /className="([^"]*bg-red-50[^"]*)"/,
  )

  const plain = (value) =>
    value
      .split(/\s+/)
      .filter((token) => token && !token.startsWith('dark:'))
      .join(' ')
  const page = await browser.newPage()
  await page.setContent(`<!doctype html><html><head><style>${compiled.css}</style></head><body>
    <div class="diary-prose"><div class="prose"><blockquote id="quote">quote</blockquote></div></div>
    <div id="terminal" class="${terminal}"></div>
    <div id="terminal-plain" class="${plain(terminal)}"></div>
    <span id="badge" class="${badge}"></span>
    <span id="badge-plain" class="${plain(badge)}"></span>
    <div id="error" class="${errorIcon}"></div>
    <div id="error-plain" class="${plain(errorIcon)}"></div>
  </body></html>`)

  const rgb = async (selector, property) => {
    const color = await paint(page, selector, property)
    return [color.r, color.g, color.b]
  }
  assert.deepEqual(await rgb('body', 'backgroundColor'), [11, 10, 9])
  const quoteLight = await rgb('#quote', 'backgroundColor')
  assert.deepEqual(await rgb('#terminal', 'backgroundColor'), await rgb('#terminal-plain', 'backgroundColor'))
  assert.deepEqual(await rgb('#badge', 'backgroundColor'), await rgb('#badge-plain', 'backgroundColor'))
  assert.deepEqual(await rgb('#error', 'backgroundColor'), await rgb('#error-plain', 'backgroundColor'))

  await page.evaluate(() => document.documentElement.classList.add('dark'))
  assert.deepEqual(await rgb('body', 'backgroundColor'), [11, 10, 9])
  assert.notDeepEqual(await rgb('#quote', 'backgroundColor'), quoteLight)
  assert.notDeepEqual(await rgb('#terminal', 'backgroundColor'), await rgb('#terminal-plain', 'backgroundColor'))
  assert.notDeepEqual(await rgb('#badge', 'backgroundColor'), await rgb('#badge-plain', 'backgroundColor'))
  assert.notDeepEqual(await rgb('#error', 'backgroundColor'), await rgb('#error-plain', 'backgroundColor'))
  await page.close()
})

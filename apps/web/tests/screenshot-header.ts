import { chromium } from '@playwright/test'

const BASE_URL = 'http://localhost:3099'
const SCREENSHOT_DIR = 'plans/reports/screenshots'

async function screenshotHeader() {
  const browser = await chromium.launch()

  // Desktop Light Mode
  const lightPage = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await lightPage.goto(BASE_URL)
  await lightPage.waitForLoadState('networkidle')
  await lightPage.screenshot({ path: `${SCREENSHOT_DIR}/header-desktop-light.png`, fullPage: false })

  // Switch to dark mode via theme toggle
  await lightPage.click('[data-slot="dropdown-menu-trigger"]')
  await lightPage.waitForTimeout(300)
  await lightPage.screenshot({ path: `${SCREENSHOT_DIR}/theme-dropdown-open.png`, fullPage: false })

  // Click "Dark" option
  const darkOption = lightPage.getByText('Dark', { exact: true })
  await darkOption.click()
  await lightPage.waitForTimeout(500)
  await lightPage.screenshot({ path: `${SCREENSHOT_DIR}/header-desktop-dark.png`, fullPage: false })

  // Open command palette with Cmd+K
  await lightPage.keyboard.press('Meta+k')
  await lightPage.waitForTimeout(500)
  await lightPage.screenshot({ path: `${SCREENSHOT_DIR}/command-palette-dark.png`, fullPage: false })

  // Close and switch back to light for command palette screenshot
  await lightPage.keyboard.press('Escape')
  await lightPage.waitForTimeout(200)

  // Switch to light
  await lightPage.click('[data-slot="dropdown-menu-trigger"]')
  await lightPage.waitForTimeout(300)
  const lightOption = lightPage.getByText('Light', { exact: true })
  await lightOption.click()
  await lightPage.waitForTimeout(500)

  // Open command palette in light mode
  await lightPage.keyboard.press('Meta+k')
  await lightPage.waitForTimeout(500)
  await lightPage.screenshot({ path: `${SCREENSHOT_DIR}/command-palette-light.png`, fullPage: false })
  await lightPage.keyboard.press('Escape')

  // Mobile screenshots (375px)
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } })
  await mobilePage.goto(BASE_URL)
  await mobilePage.waitForLoadState('networkidle')
  await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/header-mobile-light.png`, fullPage: false })

  await browser.close()
  console.log('Screenshots saved to', SCREENSHOT_DIR)
}

screenshotHeader().catch(console.error)

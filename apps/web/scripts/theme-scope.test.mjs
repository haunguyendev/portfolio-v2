import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const css = fs.readFileSync(path.join(webRoot, 'src/app/globals.css'), 'utf8')

function read(rel) {
  return fs.readFileSync(path.join(webRoot, rel), 'utf8')
}

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|\\n)${escaped}\\s*\\{`).exec(source)
  assert.ok(match, `missing ${selector}`)
  const open = match.index + match[0].length - 1
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open + 1, index)
    }
  }
  assert.fail(`${selector} did not close`)
}

function oklch(block, name) {
  const match = block.match(
    new RegExp(`${name}:\\s*oklch\\(\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)`),
  )
  assert.ok(match, `${name} is missing an oklch() value`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function linearSrgb([lightness, chroma, hue]) {
  const radians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(radians)
  const b = chroma * Math.sin(radians)
  const lms = [
    lightness + 0.3963377774 * a + 0.2158037573 * b,
    lightness - 0.1055613458 * a - 0.0638541728 * b,
    lightness - 0.0894841775 * a - 1.291485548 * b,
  ].map((channel) => channel ** 3)
  const [l, m, s] = lms
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)))
}

function luminance(linear) {
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function assertPaintsItself(block, label) {
  assert.match(
    block,
    /(?:^|\n)\s*color:\s*var\(--foreground\)\s*;/,
    `${label} does not set color, so text keeps the cream inherited from body`,
  )
  assert.match(
    block,
    /(?:^|\n)\s*background-color:\s*var\(--background\)\s*;/,
    `${label} does not set background-color`,
  )
  const ratio = contrast(
    linearSrgb(oklch(block, '--foreground')),
    linearSrgb(oklch(block, '--background')),
  )
  assert.ok(
    ratio >= 4.5,
    `${label} foreground on background is ${ratio.toFixed(2)}:1, below 4.5:1`,
  )
}

test('admin light theme paints its own text and background', () => {
  assertPaintsItself(cssBlock(css, '.admin-theme'), 'admin light')
})

test('admin dark theme overrides text and background', () => {
  assertPaintsItself(cssBlock(css, '.dark .admin-theme'), 'admin dark')
})

test('the public logo is the dark mark with no dark: switch', () => {
  const logo = read('src/components/layout/logo.tsx')
  assert.match(logo, /logo-dark\.svg/)
  assert.doesNotMatch(logo, /logo-light\.svg/)
  assert.doesNotMatch(logo, /dark:/)
})

test('public sections do not swap background with the dark class', () => {
  const files = [
    'src/components/layout/footer.tsx',
    'src/components/home/featured-projects-section.tsx',
    'src/components/home/latest-blog-section.tsx',
  ]
  for (const rel of files) {
    const source = read(rel)
    assert.doesNotMatch(source, /dark:/, `${rel} still depends on the dark class`)
    assert.match(source, /bg-background/, `${rel} does not use the page background`)
    assert.doesNotMatch(source, /bg-muted/, `${rel} still uses the muted surface`)
  }
})

test('the login page sits in the admin theme', () => {
  const login = read('src/app/(auth)/admin/login/page.tsx')
  assert.match(login, /className="[^"]*\badmin-theme\b/)
})

test('the theme menu portals into the admin theme when that node exists', () => {
  const menu = read('src/components/ui/dropdown-menu.tsx')
  assert.match(menu, /querySelector\(\s*['"]\.admin-theme['"]\s*\)/)
  assert.match(menu, /container=\{/)
})

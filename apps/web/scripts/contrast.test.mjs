import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const css = fs.readFileSync(path.join(webRoot, 'src/app/globals.css'), 'utf8')

const requiredHex = {
  '--polaroid-bg': '#0B0A09',
  '--polaroid-text': '#E8E1D6',
  '--polaroid-muted': '#A39A8C',
  '--polaroid-accent': '#F2C14E',
  '--polaroid-link': '#9CC3D5',
  '--polaroid-surface': '#16130F',
  '--polaroid-paper': '#F4EEE3',
  '--polaroid-ink': '#1A1612',
  '--polaroid-dim': '#7A7164',
  '--polaroid-lamp': '#E8A75A',
  '--polaroid-frame-memory': '#C9C1B4',
  '--polaroid-ink-memory': '#2A251F',
}

function token(name) {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})\\b`))
  assert.ok(match, `${name} is missing a 6-digit hex value in globals.css`)
  return match[1].toUpperCase()
}

function channel(hex, index) {
  const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  return (
    0.2126 * channel(hex, 0) +
    0.7152 * channel(hex, 1) +
    0.0722 * channel(hex, 2)
  )
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

test('polaroid palette hex values match the spec', () => {
  for (const [name, hex] of Object.entries(requiredHex)) {
    assert.equal(token(name), hex)
  }
})

test('tailwind theme points at the polaroid variables', () => {
  for (const name of Object.keys(requiredHex)) {
    const colorName = name.replace('--polaroid-', '--color-polaroid-')
    assert.match(css, new RegExp(`${colorName}:\\s*var\\(${name}\\)`))
  }
  for (const name of [
    '--polaroid-border',
    '--polaroid-dim',
    '--polaroid-lamp',
    '--polaroid-frame-memory',
    '--polaroid-ink-memory',
  ]) {
    const colorName = name.replace('--polaroid-', '--color-polaroid-')
    assert.match(css, new RegExp(`${colorName}:\\s*var\\(${name}\\)`))
    token(name)
  }
})

test('public semantic colors use the polaroid background and text', () => {
  assert.match(css, /--background:\s*var\(--polaroid-bg\)/)
  assert.match(css, /--foreground:\s*var\(--polaroid-text\)/)
  assert.match(css, /--muted-foreground:\s*var\(--polaroid-muted\)/)
})

test('text, muted, link, and accent clear 4.5:1 on the background', () => {
  const background = token('--polaroid-bg')
  const pairs = [
    ['text', token('--polaroid-text')],
    ['muted', token('--polaroid-muted')],
    ['link', token('--polaroid-link')],
    ['accent', token('--polaroid-accent')],
  ]
  for (const [name, foreground] of pairs) {
    const ratio = contrast(foreground, background)
    assert.ok(
      ratio >= 4.5,
      `${name} ${foreground} on ${background} is ${ratio.toFixed(2)}:1, below 4.5:1`,
    )
  }
})

test('caption ink clears 4.5:1 on polaroid paper', () => {
  const pairs = [
    ['ink', token('--polaroid-ink'), token('--polaroid-paper')],
    [
      'memory ink',
      token('--polaroid-ink-memory'),
      token('--polaroid-frame-memory'),
    ],
  ]
  for (const [name, foreground, background] of pairs) {
    const ratio = contrast(foreground, background)
    assert.ok(
      ratio >= 4.5,
      `${name} ${foreground} on ${background} is ${ratio.toFixed(2)}:1, below 4.5:1`,
    )
  }
})

test('dim clears 3:1 on the background for large text', () => {
  const foreground = token('--polaroid-dim')
  const background = token('--polaroid-bg')
  const ratio = contrast(foreground, background)
  assert.ok(
    ratio >= 3,
    `dim ${foreground} on ${background} is ${ratio.toFixed(2)}:1, below 3:1 for text at 24px or larger`,
  )
})

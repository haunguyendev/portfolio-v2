import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('the design demo is noindex and absent from the sitemap', () => {
  const page = fs.readFileSync(
    path.join(webRoot, 'src/app/(public)/(internal)/design/page.tsx'),
    'utf8',
  )
  const sitemap = fs.readFileSync(path.join(webRoot, 'src/app/sitemap.ts'), 'utf8')
  const robots = fs.readFileSync(path.join(webRoot, 'src/app/robots.ts'), 'utf8')

  assert.match(page, /index:\s*false/)
  assert.match(page, /follow:\s*false/)
  assert.doesNotMatch(sitemap, /\/design/)
  assert.match(robots, /disallow:\s*'\/design'/)
})

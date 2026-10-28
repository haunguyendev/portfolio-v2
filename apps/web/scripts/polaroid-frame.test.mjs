import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(
  path.join(webRoot, 'src/components/polaroid/polaroid.tsx'),
  'utf8',
)

function variantClasses(name) {
  const match = source.match(new RegExp(`${name}:\\s*'([^']*)'`))
  assert.ok(match, `${name} is missing its class string`)
  return match[1]
}

test('the five frames use distinct fills and rings', () => {
  const memory = variantClasses('memory')
  const project = variantClasses('project')
  const work = variantClasses('work')
  const lab = variantClasses('lab')
  const post = variantClasses('post')

  assert.match(memory, /bg-polaroid-frame-memory/)
  assert.match(memory, /text-polaroid-ink-memory/)
  assert.match(memory, /border-0/)
  assert.match(project, /bg-polaroid-paper/)
  assert.match(project, /text-polaroid-ink/)
  assert.match(project, /ring-2/)
  assert.match(project, /ring-polaroid-accent/)
  assert.match(project, /ring-offset-2/)
  assert.match(project, /ring-offset-polaroid-bg/)
  assert.match(work, /ring-2/)
  assert.match(work, /ring-polaroid-link/)
  assert.match(work, /ring-offset-polaroid-bg/)
  assert.match(lab, /outline-dashed/)
  assert.match(lab, /outline-polaroid-muted/)
  assert.match(post, /ring-2/)
  assert.match(post, /ring-polaroid-text/)
  assert.match(post, /ring-offset-polaroid-bg/)
})

test('the caption mark is 4px by 40px', () => {
  assert.match(source, /h-1 w-10/)
})

test('a blurred photo dims and restores on hover and focus', () => {
  assert.match(source, /blur-\[3px\]/)
  assert.match(source, /saturate-50/)
  assert.match(source, /brightness-75/)
  assert.match(source, /opacity-70/)
  assert.match(source, /group-hover:blur-\[0px\]/)
  assert.match(source, /group-hover:saturate-100/)
  assert.match(source, /group-hover:brightness-100/)
  assert.match(source, /group-hover:opacity-100/)
  assert.match(source, /group-focus-within:blur-\[0px\]/)
  assert.match(source, /group-focus-within:saturate-100/)
  assert.match(source, /group-focus-within:brightness-100/)
  assert.match(source, /group-focus-within:opacity-100/)
  assert.match(source, /duration-300/)
  assert.match(source, /motion-reduce:transition-none/)
  assert.match(source, /focus-visible:outline-2/)
  assert.match(source, /focus-visible:outline-offset-2/)
  assert.match(source, /focus-visible:outline-polaroid-link/)
})

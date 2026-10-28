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

test('the five frames use distinct fills and rings', () => {
  assert.match(source, /memory:[^}]*bg-polaroid-frame-memory/)
  assert.match(source, /memory:[^}]*text-polaroid-ink-memory/)
  assert.match(source, /memory:[^}]*border-0/)
  assert.match(source, /project:[^}]*bg-polaroid-paper/)
  assert.match(source, /project:[^}]*text-polaroid-ink/)
  assert.match(source, /project:[^}]*ring-2/)
  assert.match(source, /project:[^}]*ring-polaroid-accent/)
  assert.match(source, /project:[^}]*ring-offset-2/)
  assert.match(source, /project:[^}]*ring-offset-polaroid-bg/)
  assert.match(source, /work:[^}]*ring-2/)
  assert.match(source, /work:[^}]*ring-polaroid-link/)
  assert.match(source, /work:[^}]*ring-offset-polaroid-bg/)
  assert.match(source, /lab:[^}]*outline-dashed/)
  assert.match(source, /lab:[^}]*outline-polaroid-muted/)
  assert.match(source, /post:[^}]*ring-2/)
  assert.match(source, /post:[^}]*ring-polaroid-text/)
  assert.match(source, /post:[^}]*ring-offset-polaroid-bg/)
})

test('the caption mark is 4px by 40px', () => {
  assert.match(source, /h-1 w-10/)
})

test('a blurred photo dims and restores on hover and focus', () => {
  assert.match(source, /blur-\[3px\]/)
  assert.match(source, /saturate-50/)
  assert.match(source, /brightness-75/)
  assert.match(source, /opacity-70/)
  assert.match(source, /group-hover:blur-0/)
  assert.match(source, /group-hover:saturate-100/)
  assert.match(source, /group-hover:brightness-100/)
  assert.match(source, /group-hover:opacity-100/)
  assert.match(source, /group-focus-within:blur-0/)
  assert.match(source, /group-focus-within:saturate-100/)
  assert.match(source, /group-focus-within:brightness-100/)
  assert.match(source, /group-focus-within:opacity-100/)
  assert.match(source, /duration-300/)
  assert.match(source, /motion-reduce:transition-none/)
  assert.match(source, /focus-visible:outline-2/)
  assert.match(source, /focus-visible:outline-offset-2/)
  assert.match(source, /focus-visible:outline-polaroid-link/)
})

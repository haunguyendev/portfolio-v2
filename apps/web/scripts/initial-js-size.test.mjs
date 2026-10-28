import assert from 'node:assert/strict'
import test from 'node:test'
import { explainSizeCheck } from './initial-js-size.mjs'

test('an empty size-limit glob says the glob matched no files', () => {
  assert.equal(
    explainSizeCheck({ name: 'Homepage initial JS' }),
    'glob matched no files',
  )
})

test('a real 130000 byte limit is left for size-limit to fail', () => {
  assert.equal(explainSizeCheck({ sizeLimit: 130000, size: 317813 }), null)
})

test('a parsed limit other than 130000 is still named as that number', () => {
  const message = explainSizeCheck({ sizeLimit: 1 })
  assert.match(message, /1/)
  assert.doesNotMatch(message, /glob matched no files/)
})

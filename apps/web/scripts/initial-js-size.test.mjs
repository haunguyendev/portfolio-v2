import assert from 'node:assert/strict'
import test from 'node:test'
import {
  collectInitialClientJs,
  explainSizeCheck,
  pageLoadableFiles,
} from './initial-js-size.mjs'

const entryJSFiles = {
  '/page': ['/_next/static/chunks/main.js'],
}
const html = `<script src="/_next/static/chunks/main.js"></script>
<script src="/_next/static/chunks/polyfill.js" noModule></script>`

test('page loadable chunks count when the homepage script tags omit them', () => {
  const files = collectInitialClientJs({
    entryJSFiles,
    rootMainFiles: [],
    rootMainFilesTree: undefined,
    loadableFiles: [
      'static/chunks/7bdf7643602c1959.js',
      'static/chunks/63ea296f8d10903f.js',
      'static/chunks/0dc112edbbecf445.js',
    ],
    html,
  })
  assert.deepEqual(files, [
    '.next/static/chunks/0dc112edbbecf445.js',
    '.next/static/chunks/63ea296f8d10903f.js',
    '.next/static/chunks/7bdf7643602c1959.js',
    '.next/static/chunks/main.js',
  ])
})

test('a layout dynamic chunk is counted only when the page list includes it', () => {
  const files = collectInitialClientJs({
    entryJSFiles,
    rootMainFiles: ['/_next/static/chunks/layout.js'],
    rootMainFilesTree: undefined,
    loadableFiles: ['static/chunks/7bdf7643602c1959.js'],
    html: `<script src="/_next/static/chunks/main.js"></script><script src="/_next/static/chunks/layout.js"></script>`,
  })
  assert.equal(files.includes('.next/static/chunks/13347721a122a5d3.js'), false)
  assert.equal(files.includes('.next/static/chunks/7bdf7643602c1959.js'), true)
})

test('pageLoadableFiles returns only the files the page manifest lists', () => {
  const files = pageLoadableFiles({
    51597: {
      id: 51597,
      files: [
        'static/chunks/7bdf7643602c1959.js',
        'static/chunks/63ea296f8d10903f.js',
      ],
    },
    89645: {
      id: 89645,
      files: ['static/chunks/0dc112edbbecf445.js'],
    },
  })
  assert.deepEqual(files, [
    'static/chunks/7bdf7643602c1959.js',
    'static/chunks/63ea296f8d10903f.js',
    'static/chunks/0dc112edbbecf445.js',
  ])
  assert.equal(
    files.some((file) => file.includes('13347721a122a5d3')),
    false,
  )
})

test('a homepage module script missing from the measured set throws', () => {
  assert.throws(
    () =>
      collectInitialClientJs({
        entryJSFiles,
        rootMainFiles: [],
        rootMainFilesTree: undefined,
        loadableFiles: [],
        html: `<script src="/_next/static/chunks/main.js"></script><script src="/_next/static/chunks/extra.js"></script>`,
      }),
    /extra\.js/,
  )
})

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

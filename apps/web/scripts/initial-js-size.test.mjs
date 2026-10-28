import assert from "node:assert/strict";
import test from "node:test";
import { collectInitialClientJs } from "./initial-js-size.mjs";

const entryJSFiles = {
  "/page": ["/_next/static/chunks/main.js"],
};
const html = `<script src="/_next/static/chunks/main.js"></script>
<script src="/_next/static/chunks/polyfill.js" noModule></script>`;

test("page loadable chunks count when the homepage script tags omit them", () => {
  const files = collectInitialClientJs({
    entryJSFiles,
    rootMainFiles: [],
    rootMainFilesTree: undefined,
    loadableFiles: [
      "static/chunks/7bdf7643602c1959.js",
      "static/chunks/63ea296f8d10903f.js",
      "static/chunks/0dc112edbbecf445.js",
    ],
    html,
  });
  assert.deepEqual(files, [
    ".next/static/chunks/0dc112edbbecf445.js",
    ".next/static/chunks/63ea296f8d10903f.js",
    ".next/static/chunks/7bdf7643602c1959.js",
    ".next/static/chunks/main.js",
  ]);
});

test("a layout dynamic chunk is counted only when the page list includes it", () => {
  const files = collectInitialClientJs({
    entryJSFiles,
    rootMainFiles: ["/_next/static/chunks/layout.js"],
    rootMainFilesTree: undefined,
    loadableFiles: ["static/chunks/7bdf7643602c1959.js"],
    html: `<script src="/_next/static/chunks/main.js"></script><script src="/_next/static/chunks/layout.js"></script>`,
  });
  assert.equal(
    files.includes(".next/static/chunks/13347721a122a5d3.js"),
    false,
  );
  assert.equal(files.includes(".next/static/chunks/7bdf7643602c1959.js"), true);
});

test("a homepage module script missing from the measured set throws", () => {
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
  );
});

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedSizeLimit = 130000;
const homepageHtml = path.join(webRoot, ".next/server/app/index.html");
const clientManifestPath = path.join(
  webRoot,
  ".next/server/app/page_client-reference-manifest.js",
);
const buildManifestPath = path.join(webRoot, ".next/build-manifest.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function scanJsonObject(source, openAt) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = openAt; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openAt, index + 1);
    }
  }
  throw new Error("client-reference manifest object did not close");
}

function parseClientReferenceManifest(source) {
  const marker = 'globalThis.__RSC_MANIFEST["/page"]';
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) {
    throw new Error('client-reference manifest has no "/page" assignment');
  }
  const equalsAt = source.indexOf("=", markerAt + marker.length);
  if (equalsAt < 0) {
    throw new Error('client-reference manifest "/page" assignment is missing');
  }
  let cursor = equalsAt + 1;
  while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
  if (source[cursor] !== "{") {
    throw new Error(
      'client-reference manifest "/page" assignment is not an object',
    );
  }
  return JSON.parse(scanJsonObject(source, cursor));
}

function toAppRelativeJs(value) {
  if (typeof value !== "string") return null;
  const pathname = value.split("?")[0].split("#")[0];
  if (!pathname.endsWith(".js")) return null;
  let relative = pathname;
  if (relative.startsWith("/_next/")) {
    relative = `.next/${relative.slice("/_next/".length)}`;
  } else if (relative.startsWith("_next/")) {
    relative = `.next/${relative.slice("_next/".length)}`;
  } else if (relative.startsWith("/.next/")) {
    relative = relative.slice(1);
  } else if (!relative.startsWith(".next/")) {
    relative = relative.startsWith("/")
      ? `.next${relative}`
      : `.next/${relative}`;
  }
  if (!relative.startsWith(".next/static/")) return null;
  return relative;
}

function addJsFiles(into, values) {
  if (!Array.isArray(values)) return;
  for (const value of values) {
    const relative = toAppRelativeJs(value);
    if (relative) into.add(relative);
  }
}

function sameMembers(left, right) {
  if (left.length !== right.length) return false;
  const sortedRight = [...right].sort();
  return [...left].sort().every((item, index) => item === sortedRight[index]);
}

function assertRootMainFilesTree(tree) {
  if (!tree || typeof tree !== "object") return;
  if (!Object.hasOwn(tree, "/page") || !Object.hasOwn(tree, "/")) return;
  const appFiles = tree["/page"];
  const urlFiles = tree["/"];
  if (!Array.isArray(appFiles) || !Array.isArray(urlFiles)) {
    throw new Error(
      'rootMainFilesTree has both the app path "/page" and "/" and the arrays differ',
    );
  }
  if (sameMembers(appFiles.map(String), urlFiles.map(String))) return;
  const message = [
    'rootMainFilesTree has both the app path "/page" and "/" and the arrays differ',
    `"/page": ${JSON.stringify(appFiles)}`,
    `"/": ${JSON.stringify(urlFiles)}`,
  ].join("\n");
  console.error(message);
  throw new Error(message);
}

function htmlModuleScripts(html) {
  const files = new Set();
  const tags = html.match(/<script\b[^>]*>/g) ?? [];
  for (const tag of tags) {
    if (tag.includes("noModule")) continue;
    const src = tag.match(/\bsrc="([^"]+)"/);
    if (!src) continue;
    const relative = toAppRelativeJs(src[1]);
    files.add(relative ?? src[1]);
  }
  return files;
}

function assertHomeRoute() {
  const routes = JSON.parse(
    fs.readFileSync(
      path.join(webRoot, ".next/app-path-routes-manifest.json"),
      "utf8",
    ),
  );
  const keys = Object.entries(routes)
    .filter(([, route]) => route === "/")
    .map(([key]) => key);
  if (keys.length !== 1 || keys[0] !== "/page") {
    throw new Error(
      `route / must map to exactly /page, got ${JSON.stringify(keys)}`,
    );
  }
}

function initialClientJsFiles() {
  assertHomeRoute();
  const manifest = parseClientReferenceManifest(
    fs.readFileSync(clientManifestPath, "utf8"),
  );
  const entryJSFiles = manifest.entryJSFiles;
  if (!entryJSFiles || typeof entryJSFiles !== "object") {
    throw new Error("client-reference manifest has no entryJSFiles");
  }
  const files = new Set();
  for (const value of Object.values(entryJSFiles)) addJsFiles(files, value);
  const build = JSON.parse(fs.readFileSync(buildManifestPath, "utf8"));
  assertRootMainFilesTree(build.rootMainFilesTree);
  addJsFiles(files, build.rootMainFiles);
  const htmlFiles = htmlModuleScripts(fs.readFileSync(homepageHtml, "utf8"));
  const manifestList = [...files].sort();
  const htmlList = [...htmlFiles].sort();
  if (!sameMembers(manifestList, htmlList)) {
    const message = [
      "initial JS file lists differ",
      "manifest:",
      ...manifestList,
      "html:",
      ...htmlList,
    ].join("\n");
    console.error(message);
    throw new Error(message);
  }
  return manifestList;
}

function readBudget() {
  const budgets = JSON.parse(
    fs.readFileSync(path.join(webRoot, ".size-limit.json"), "utf8"),
  );
  const entry = budgets[0];
  if (
    !entry ||
    typeof entry.name !== "string" ||
    typeof entry.limit !== "string" ||
    typeof entry.gzip !== "boolean"
  ) {
    throw new Error(
      "apps/web/.size-limit.json first entry must include name, limit, and gzip",
    );
  }
  return { name: entry.name, limit: entry.limit, gzip: entry.gzip };
}

function runSizeLimit(configPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "corepack",
      ["pnpm", "exec", "size-limit", "--config", configPath, "--json"],
      { cwd: webRoot },
    );
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (status) => {
      resolve({
        status: status ?? 1,
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr),
      });
    });
  });
}

function reportedSizeLimit(stdout) {
  let parsed;
  try {
    parsed = JSON.parse(stdout.toString("utf8"));
  } catch {
    return undefined;
  }
  const check = Array.isArray(parsed) ? parsed[0] : parsed;
  return check?.sizeLimit;
}

async function main() {
  if (!fs.existsSync(path.join(webRoot, ".next")) || !fs.existsSync(homepageHtml)) {
    fail("pnpm --filter @portfolio/web build has to run first");
  }
  const files = initialClientJsFiles();
  const budget = readBudget();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "size-limit-"));
  const configPath = path.join(directory, "size-limit.json");
  // size-limit globs path from the config file directory, so a relative path would look in the temp dir.
  const config = [
    {
      name: budget.name,
      limit: budget.limit,
      gzip: budget.gzip,
      path: files.map((file) => path.join(webRoot, file)),
    },
  ];
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  let status = 1;
  try {
    const result = await runSizeLimit(configPath);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    const sizeLimit = reportedSizeLimit(result.stdout);
    if (sizeLimit !== expectedSizeLimit) {
      console.error(
        `size-limit parsed the limit string as ${String(sizeLimit)}, which is something other than 130000 metric bytes`,
      );
      status = 1;
    } else {
      status = result.status;
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  process.exit(status);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});

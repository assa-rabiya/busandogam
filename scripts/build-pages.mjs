import {
  existsSync,
  readFileSync,
  readdirSync,
  cpSync,
  copyFileSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const result = spawnSync(
  process.execPath,
  [join("node_modules", "vinext", "dist", "cli.js"), "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_BASE_PATH: "/busandogam",
      WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
    },
  },
);

if (result.status !== 0) process.exit(result.status ?? 1);

const pagesOutput = join("dist", "client");
const indexPath = join(pagesOutput, "index.html");
if (!existsSync(indexPath)) {
  throw new Error("GitHub Pages 정적 산출물 dist/client/index.html을 찾을 수 없습니다.");
}

// GitHub Pages can treat framework folders beginning with `_` specially.
// Publish the compiled Next/Vinext assets under a neutral directory and
// update every generated reference so CSS and client-side navigation load.
const pagesAssetsPath = join(pagesOutput, "assets");
function findNextAssetsDirectory(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (!statSync(path).isDirectory()) continue;
    if (name === "_next") return path;
    const nested = findNextAssetsDirectory(path);
    if (nested) return nested;
  }
  return null;
}

const nextAssetsPath = findNextAssetsDirectory(pagesOutput);
if (nextAssetsPath && !existsSync(pagesAssetsPath)) {
  // Keep the original `_next` files for clients that still have an older
  // GitHub Pages document cached, while publishing a neutral `assets` copy
  // for fresh static pages.
  cpSync(nextAssetsPath, pagesAssetsPath, { recursive: true });
}

const rewriteExtensions = new Set([".html", ".js", ".json", ".css"]);
function rewriteAssetReferences(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      rewriteAssetReferences(path);
      continue;
    }

    const extension = name.slice(name.lastIndexOf("."));
    if (!rewriteExtensions.has(extension)) continue;
    const source = readFileSync(path, "utf8");
    const rewritten = source.replaceAll("_next/", "assets/");
    if (rewritten !== source) writeFileSync(path, rewritten);
  }
}

rewriteAssetReferences(pagesOutput);

// Vinext exports route documents as `login.html` and `identify/result.html`.
// GitHub Pages serves directory URLs such as `/login/` from `login/index.html`,
// so create matching directory documents for every route. This keeps direct
// visits and browser navigation from returning GitHub Pages' 404 document.
function createDirectoryRouteDocuments(directory, relative = "") {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      if (name !== "assets" && name !== "_next") createDirectoryRouteDocuments(path, join(relative, name));
      continue;
    }
    if (!name.endsWith(".html") || name === "index.html" || name === "404.html") continue;
    const routeName = name.slice(0, -".html".length);
    const destination = join(pagesOutput, relative, routeName, "index.html");
    mkdirSync(join(pagesOutput, relative, routeName), { recursive: true });
    copyFileSync(path, destination);
  }
}

createDirectoryRouteDocuments(pagesOutput);
writeFileSync(join(pagesOutput, ".nojekyll"), "");

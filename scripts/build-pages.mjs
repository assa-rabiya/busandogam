import { existsSync, writeFileSync } from "node:fs";
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

writeFileSync(join(pagesOutput, ".nojekyll"), "");

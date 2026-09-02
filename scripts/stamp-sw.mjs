// Stamps the built service worker with the build time.
// A byte-identical sw.js is never re-fetched by the browser, so without this
// a new deploy leaves old clients (tablets, installed PWAs) on a stale
// bundle forever. Changing one line guarantees the worker updates.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve("dist/sw.js");
const stamp = new Date().toISOString();
const source = readFileSync(target, "utf8");
writeFileSync(target, `// build: ${stamp}\n${source}`);
console.log(`stamped dist/sw.js with build ${stamp}`);

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { test } = require("./cjs-entry.js");

export default async function handler(req) {
  return new Response(test);
}

export const config = {
  path: "/*",
};

// hack, without it CJS module don't end up in eszip
// but even with those included, it doesn't seem like they can be resolved
try {
  await import("./cjs-entry.js");
  await import("./cjs-mod.js");
} catch {}

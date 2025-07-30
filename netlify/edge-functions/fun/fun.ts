import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { test } = require("./cjs-entry.cjs");

export default async function handler(req) {
  return new Response(test);
}

export const config = {
  path: "/*",
};

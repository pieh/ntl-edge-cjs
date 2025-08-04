import { createRequire } from "node:module";
import { registerCJSModules } from "../../../helper.mjs";

const virtualModules = new Map();
virtualModules.set("./cjs-mod.js", 'exports.test = "test";');
virtualModules.set(
  "./cjs-entry.js",
  'module.exports = require("./cjs-mod.js");'
);

registerCJSModules(import.meta.url, virtualModules);

const require = createRequire(import.meta.url);
// this will use our virtual module
console.error("loading commonjs from edge function start");
const { test } = require("./cjs-entry.js");
console.error("loading commonjs from edge function end");

export default async function handler(req) {
  return Response.json({ test });
}

export const config = {
  path: "/*",
};

import { createRequire, Module } from "node:module";
import vm from "node:vm";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);

function seedCJSModuleCache(filename, source) {
  const mod = new Module(filename);
  mod.filename = filename;
  mod.path = dirname(filename);
  mod.paths = Module._nodeModulePaths(mod.path);
  require.cache[filename] = mod;
  const wrappedSource = `(function (exports, require, module, __filename, __dirname) { ${source}\n});`;
  const compiled = vm.runInThisContext(wrappedSource, {
    filename,
    lineOffset: 0,
    displayErrors: true,
  });
  compiled(mod.exports, require, mod, filename, dirname(filename));
}

// before CJS module cache is used `_resolveFilename` is called to get absolute path
// of the module, but because those file won't actually exist on disk, we point them
// to "virtual" modules compiled above
const orig = Module._resolveFilename.bind(Module);
Module._resolveFilename = (...args) => {
  console.log("resolving file name", args);
  // this need to be way smarter, this is hardcoded right now just to evaluate
  // wether those hacks could even work
  if (args?.[0] === "./cjs-entry.js") {
    return "/virtual/cjs-entry.js";
  } else if (args?.[0] === "./cjs-mod.js") {
    return "/virtual/cjs-mod.js";
  }
  return orig(...args);
};

seedCJSModuleCache("/virtual/cjs-mod.js", 'exports.test = "test";');
seedCJSModuleCache(
  "/virtual/cjs-entry.js",
  'module.exports = require("./cjs-mod.js");'
);

// this will use our virtual module
const { test } = require("./cjs-entry.js");

export default async function handler(req) {
  return Response.json({ test });
}

export const config = {
  path: "/*",
};

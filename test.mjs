import { createRequire } from "node:module";
// import vm from "node:vm";
// import { dirname } from "node:path";

import { registerCJSModules } from "./helper.mjs";

const require = createRequire(import.meta.url);

// // /Users/misiek/test/ntl-edge-cjs/netlify/edge-functions/fun/cjs-entry.js
// function wrapModule(source) {
//   return `(function (exports, require, module, __filename, __dirname) { ${source}\n});`;
// }
// const filename = "/Users/misiek/test/ntl-edge-cjs/virtual/cjs-entry.js";

// const mod = new Module(filename);
// mod.filename = filename;
// mod.path = dirname(filename);
// mod.paths = Module._nodeModulePaths(mod.path);
// require.cache[filename] = mod;
// const source = `exports.test = "test";`;
// const wrappedSource = wrapModule(source);
// const compiled = vm.runInThisContext(wrappedSource, {
//   filename,
//   lineOffset: 0,
//   displayErrors: true,
// });
// compiled(mod.exports, require, mod, filename, dirname(filename));

// // console.log({ wat });

// const cache = require.cache;

// // const testMod = require("./netlify/edge-functions/fun/cjs-entry.js");

// // console.log({ testMod });

// // mod.exports = testMod;

// const orig = Module._resolveFilename.bind(Module);

// Module._resolveFilename = (...args) => {
//   if (args?.[0] === "./virtual/cjs-entry.js") {
//     console.log("returning virtual path", filename);
//     return filename;
//   }
//   console.log("resolving file name", args);
//   return orig(...args);
// };

// const original_load = Module._load.bind(Module);
// Module._load = (...args) => {
//   console.log("loading module", args);
//   const retval = original_load(...args);
//   console.log("loaded module", args, retval);
//   return retval;
// };

// function seedCJSModuleCache(filename, source) {
//   const mod = new Module(filename);
//   mod.filename = filename;
//   mod.path = dirname(filename);
//   mod.paths = Module._nodeModulePaths(mod.path);
//   require.cache[filename] = mod;
//   const wrappedSource = `(function (exports, require, module, __filename, __dirname) { ${source}\n});`;
//   const compiled = vm.runInThisContext(wrappedSource, {
//     filename,
//     lineOffset: 0,
//     displayErrors: true,
//   });
//   compiled(mod.exports, require, mod, filename, dirname(filename));
//   mod.loaded = true;
// }

// // before CJS module cache is used `_resolveFilename` is called to get absolute path
// // of the module, but because those file won't actually exist on disk, we point them
// // to "virtual" modules compiled above
// const original_resolveFilename = Module._resolveFilename.bind(Module);
// Module._resolveFilename = (...args) => {
//   console.trace("resolving file name", args);
//   // this need to be way smarter, this is hardcoded right now just to evaluate
//   // wether those hacks could even work
//   if (args?.[0] === "./cjs-entry.js") {
//     return "/virtual/cjs-entry.js";
//   } else if (args?.[0] === "./cjs-mod.js") {
//     return "/virtual/cjs-mod.js";
//   }
//   return original_resolveFilename(...args);
// };

const virtualModules = new Map();
virtualModules.set("./cjs-mod.js", 'exports.test = "test";');
virtualModules.set(
  "./cjs-entry.js",
  'module.exports = require("./cjs-mod.js");'
);

registerCJSModules(import.meta.url, virtualModules);

// seedCJSModuleCache(
//   "/virtual/cjs-entry.js",
//   'module.exports = require("./cjs-mod.js");'
// );
// seedCJSModuleCache("/virtual/cjs-mod.js", 'exports.test = "test";');

const testMod2 = require("./cjs-entry.js");

console.log("are we good", testMod2.test);
debugger;

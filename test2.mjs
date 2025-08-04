import { registerHooks, createRequire } from "node:module";

const virtualModules = {
  "virtual://cjs-entry.js": `module.exports = require("./cjs-mod.js");`,
  "virtual://cjs-mod.js": `exports.test = "test";`,
};

registerHooks({
  resolve(specifier, context, defaultResolve) {
    console.log("resolving", { specifier, context });
    if (specifier.endsWith("/cjs-entry.js")) {
      return {
        shortCircuit: true,
        url: "virtual://cjs-entry.js",
      };
    } else if (specifier.endsWith("/cjs-mod.js")) {
      return {
        shortCircuit: true,
        url: "virtual://cjs-mod.js",
      };
    }

    return defaultResolve(specifier, context);
  },
  load(url, context, defaultLoad) {
    console.log("loading", { url, context });
    if (url in virtualModules) {
      return {
        shortCircuit: true,
        format: "commonjs",
        source: virtualModules[url],
      };
    }

    return defaultLoad(url, context);
  },
});

const require = createRequire(import.meta.url);
const testMod2 = require("./cjs-entry.js");

console.log("are we good", testMod2.test);
debugger;

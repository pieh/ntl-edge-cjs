import { Module, createRequire } from "node:module";
import vm from "node:vm";
import { join, dirname } from "node:path/posix";
import { fileURLToPath, pathToFileURL } from "node:url";

const registeredModules = new Map();

const require = createRequire(import.meta.url);

let hookedIn = false;

function seedCJSModuleCache(filename, source, parent) {
  if (require.cache[filename]) {
    return;
  }
  console.error("evaluating module", { filename });

  const mod = new Module(filename);
  mod.parent = parent;
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
  compiled(
    mod.exports,
    createRequire(pathToFileURL(filename)),
    mod,
    filename,
    dirname(filename)
  );
  mod.loaded = true;

  console.error("evaluated module", { filename });
}

export function registerCJSModules(baseUrl, modules) {
  const basePath = dirname(fileURLToPath(baseUrl));

  for (const [filename, source] of modules.entries()) {
    registeredModules.set(join(basePath, filename), source);
  }

  console.error(registeredModules);

  if (!hookedIn) {
    // magic
    const original_resolveFilename = Module._resolveFilename.bind(Module);
    Module._resolveFilename = (...args) => {
      console.error(
        "resolving file name",
        args[0],
        "from",
        args[1]?.filename ?? "unknown"
      );
      if (args?.[0].startsWith(".")) {
        // only handle relative require paths
        const requireFrom = args?.[1]?.filename;

        const target = join(dirname(requireFrom), args[0]);

        console.error("target", target);
        if (registeredModules.has(target)) {
          // register module in cache

          seedCJSModuleCache(target, registeredModules.get(target), args[1]);

          console.error("returning virtual path", target);
          return target;
        }
      }

      return original_resolveFilename(...args);
    };

    hookedIn = true;
  }
}

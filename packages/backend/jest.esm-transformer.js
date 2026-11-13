/**
 * ts-jest for ES-module dependencies, with Node's default-import rule.
 *
 * Compiled to CommonJS, `import X from 'pkg'` becomes `__importDefault(require('pkg'))`,
 * which yields `exports.default` whenever the module sets `__esModule`. Node does
 * not: an ES module importing CommonJS always gets the whole `module.exports`.
 * The two disagree on CommonJS that is itself compiled from TypeScript — it sets
 * `__esModule` without a default — so a dependency that works in Node would get
 * `undefined` here.
 *
 * Every module this transformer compiles is marked as having been ES, and the
 * helper is swapped for one that tells the two apart: a marked module keeps its
 * `default` export, anything else is real CommonJS and gets `module.exports`.
 */
const { default: tsJest } = require('ts-jest');

const MARKER = '__compiledFromEsm';

const NODE_IMPORT_DEFAULT = `var __importDefault = function (mod) {
  return mod && mod.${MARKER} ? mod : { "default": mod };
};`;

/** Matches TypeScript's emitted helper, whatever its exact formatting. */
const TS_IMPORT_DEFAULT =
  /var __importDefault = \(this && this\.__importDefault\) \|\| function \(mod\) \{[\s\S]*?\n\};/;

/**
 * Only files written as ES modules get the marker. A CommonJS file compiled
 * here (one that merely contains a dynamic `import()`) has no imports to fix,
 * and marking it would hide its `module.exports` from default imports.
 */
const isEsmSource = (source) => /^\s*(import|export)\s/m.test(source);

const rewrite = (code, source) => {
  if (!isEsmSource(source)) {
    return code;
  }

  return `${code.replace(TS_IMPORT_DEFAULT, NODE_IMPORT_DEFAULT)}
Object.defineProperty(exports, '${MARKER}', { value: true });`;
};

module.exports = {
  createTransformer(options) {
    const inner = tsJest.createTransformer(options);

    return {
      ...inner,
      process(source, path, config) {
        const result = inner.process(source, path, config);

        return { ...result, code: rewrite(result.code, source) };
      },
      async processAsync(source, path, config) {
        const result = await inner.processAsync(source, path, config);

        return { ...result, code: rewrite(result.code, source) };
      },
      getCacheKey(source, path, config) {
        return `${inner.getCacheKey(source, path, config)}:node-default-import`;
      },
      async getCacheKeyAsync(source, path, config) {
        return `${await inner.getCacheKeyAsync(source, path, config)}:node-default-import`;
      },
    };
  },
};

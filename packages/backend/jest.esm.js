/**
 * Lets Jest load dependencies that ship only as ES modules.
 *
 * Node resolves these packages through their `module-sync` export and loads
 * them with `require()`; Jest knows neither, so it gets the condition added and
 * the packages compiled to CommonJS by `jest.esm-transformer.js`.
 *
 * When a new ESM-only dependency fails with "Must use import to load ES Module",
 * add it to ESM_PACKAGES — including copies nested under another package.
 */
const ESM_PACKAGES = [
  'music-metadata',
  '@borewit/text-codec',
  'file-type',
  '@tokenizer/inflate',
  'token-types',
  'strtok3',
  'uint8array-extras',
  'win-guid',
  // Nested under music-metadata; the root copy is an older CommonJS release.
  'media-typer',

  // vk-io is CommonJS but calls `import('node-fetch')` at load, which Jest
  // refuses outside experimental VM modules; compiling it turns that into a
  // `require`. node-fetch and the rest are its ESM-only dependencies.
  'vk-io',
  'node-fetch',
  'data-uri-to-buffer',
  'fetch-blob',
  'formdata-polyfill',
];

const pattern = ESM_PACKAGES.map((name) => name.replace('/', '\\/')).join('|');

module.exports = {
  transformIgnorePatterns: [`/node_modules/(?!(${pattern})/)`],
  esmTransform: {
    [`/node_modules/(${pattern})/.+\\.js$`]: [
      `${__dirname}/jest.esm-transformer.js`,
      { tsconfig: `${__dirname}/tsconfig.jest-esm.json` },
    ],
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'module-sync', 'default'],
  },
};

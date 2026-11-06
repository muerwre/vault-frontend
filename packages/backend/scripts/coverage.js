/* eslint-disable @typescript-eslint/no-var-requires -- plain CommonJS, run by node directly */
/**
 * One coverage number for the backend: runs the unit and integration suites
 * with coverage, merges both maps, prints the merged report and fails when any
 * metric is below its floor in `coverage-thresholds.json`.
 *
 *   node scripts/coverage.js           run both suites, then merge and gate
 *   node scripts/coverage.js --merge   only merge and gate existing results
 *
 * The integration suite needs the database (`yarn db:up`).
 *
 * Floors only ever go up: raise them as modules gain specs, never lower them to
 * get a red run through.
 */
const { execFileSync } = require('child_process');
const { existsSync, readFileSync, rmSync } = require('fs');
const { join } = require('path');

const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'coverage');

/**
 * Measured sources, relative to `src`. Not measured: the bootstrap and the three
 * manual check scripts, which only run by hand against a real database.
 */
const SOURCES = [
  '**/*.ts',
  '!**/*.spec.ts',
  '!database/migrations/**',
  '!main.ts',
  '!database/read-check.ts',
  '!database/schema-drift.ts',
  '!globals/auth-check.ts',
];

/** Prefixes a glob, keeping a leading negation in front. */
const under = (prefix) => (glob) =>
  glob.startsWith('!') ? `!${prefix}${glob.slice(1)}` : `${prefix}${glob}`;

// Each suite keeps its own config; globs are relative to that config's rootDir.
const SUITES = [
  { name: 'unit', args: [], sources: SOURCES },
  {
    name: 'int',
    args: ['--config', 'test/jest-integration.json', '--runInBand'],
    sources: SOURCES.map(under('src/')),
  },
];

const jestBin = require.resolve('jest/bin/jest');

const run = (suite) => {
  const dir = join(OUT, suite.name);
  rmSync(dir, { recursive: true, force: true });

  execFileSync(
    process.execPath,
    [
      jestBin,
      ...suite.args,
      '--coverage',
      '--coverageReporters=json',
      `--coverageDirectory=${dir}`,
      ...suite.sources.map((glob) => `--collectCoverageFrom=${glob}`),
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );
};

const merge = () => {
  const map = libCoverage.createCoverageMap({});

  for (const suite of SUITES) {
    const file = join(OUT, suite.name, 'coverage-final.json');

    if (!existsSync(file)) {
      throw new Error(`missing ${file}; run without --merge first`);
    }

    map.merge(JSON.parse(readFileSync(file, 'utf8')));
  }

  return map;
};

const report = (map) => {
  const context = libReport.createContext({
    dir: join(OUT, 'merged'),
    coverageMap: map,
    defaultSummarizer: 'nested',
  });

  // Fully covered files are noise in the console; the html report has them all.
  reports.create('text', { skipFull: true }).execute(context);
  reports.create('text-summary').execute(context);
  reports.create('html').execute(context);
  reports.create('json-summary').execute(context);
};

const gate = (map) => {
  const floors = JSON.parse(
    readFileSync(join(ROOT, 'coverage-thresholds.json'), 'utf8'),
  );
  const summary = map.getCoverageSummary().toJSON();

  const failures = Object.entries(floors)
    .filter(([metric, floor]) => summary[metric].pct < floor)
    .map(
      ([metric, floor]) =>
        `${metric} ${summary[metric].pct}% is below the floor of ${floor}%`,
    );

  if (failures.length) {
    console.error(`\ncoverage gate failed:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }

  console.log('\ncoverage gate passed; html report in coverage/merged');
};

if (!process.argv.includes('--merge')) {
  SUITES.forEach(run);
}

const map = merge();
report(map);
gate(map);

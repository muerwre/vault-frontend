const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

/**
 * Reads only the given keys from the repo-root env files. The root `.env.local`
 * also holds backend secrets, which must not leak into the frontend process.
 * Real environment variables win over the files, as everywhere else.
 */
const readRootEnv = (keys) => {
  const values = {};

  for (const file of ['.env', '.env.local']) {
    const path = join(__dirname, '../..', file);

    if (!existsSync(path)) {
      continue;
    }

    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);

      if (match && keys.includes(match[1])) {
        values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
      }
    }
  }

  for (const key of keys) {
    if (process.env[key]) {
      values[key] = process.env[key];
    }
  }

  return values;
};

const rootEnv = readRootEnv(['PUBLIC_URL', 'PORT', 'TELEGRAM_BOT_USERNAME']);

/**
 * Addresses are read at runtime, not baked in: the browser uses its own origin,
 * and the Next server reads PUBLIC_URL and BACKEND_URL from its environment (see
 * src/utils/config). A built image gets them from its container. For `next dev`,
 * which runs this file in the serving process, they default from the root env
 * to the local backend that fronts the app.
 */
const localBackend = `http://localhost:${rootEnv.PORT || 3000}`;
process.env.PUBLIC_URL =
  process.env.PUBLIC_URL || rootEnv.PUBLIC_URL || localBackend;
process.env.BACKEND_URL = process.env.BACKEND_URL || localBackend;

// The bot behind the Telegram login widget and the contact link. It must be the
// bot whose TELEGRAM_TOKEN the backend checks the widget against. The browser
// has no runtime env, so this one is inlined at build time. Empty hides
// Telegram in the app.
process.env.NEXT_PUBLIC_BOT_USERNAME = (
  rootEnv.TELEGRAM_BOT_USERNAME || ''
).replace(/^@/, '');

/** used to transpile UMD and CJS modules */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')([
  'ramda',
  '@v9v/ts-react-telegram-login',
]);

module.exports = withBundleAnalyzer(
  withTM({
    output: 'standalone',
    experimental: {
      // Dependencies are hoisted to the monorepo root, outside this package.
      // Tracing from the root puts them into the standalone output; from here
      // they would be left out and the server would fail to start.
      outputFileTracingRoot: join(__dirname, '../..'),
    },
    /** rewrite old-style node paths */
    async rewrites() {
      return [
        {
          // everything except 'post' is for backwards compatibility here
          source: '/(post|photo|blog|song|video|cell):id',
          destination: '/node/:id',
        },
        {
          source: '/~:username',
          destination: '/profile/:username',
        },
      ];
    },

    /** don't try to optimize fonts */
    optimizeFonts: false,
    images: {
      remotePatterns: [
        {
          // Uploads on any vault48.org host (production, unstable, tunnel).
          // Image hosts are fixed at build time, unlike the site's address.
          protocol: 'https',
          hostname: 'vault48.org',
          pathname: '/static/**',
        },
        {
          protocol: 'https',
          hostname: '**.vault48.org',
          pathname: '/static/**',
        },
        {
          protocol: 'https',
          hostname: '*.ytimg.com',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          pathname: '/**',
        },
      ],
    },
  }),
);

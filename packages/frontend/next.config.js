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

/**
 * The site's public root, shared with the backend. Every address the client
 * uses is derived from it, so moving the site (a tunnel, staging) needs this one
 * setting. Defaults to the backend on localhost, which serves the pages too.
 */
const rootEnv = readRootEnv(['PUBLIC_URL', 'PORT']);
const PUBLIC_URL = (
  rootEnv.PUBLIC_URL || `http://localhost:${rootEnv.PORT || 3000}`
).replace(/\/+$/, '');

// Inlined into the client bundle at build time, so they must be set before Next
// reads them. They replace any value from the frontend's own env files.
process.env.NEXT_PUBLIC_PUBLIC_HOST = `${PUBLIC_URL}/`;
process.env.NEXT_PUBLIC_API_HOST = `${PUBLIC_URL}/api/`;
process.env.NEXT_PUBLIC_REMOTE_CURRENT = `${PUBLIC_URL}/static/`;

const publicHost = new URL(PUBLIC_URL);

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
          // Uploads, served by the backend under the public root.
          protocol: publicHost.protocol.replace(':', ''),
          hostname: publicHost.hostname,
          port: publicHost.port,
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

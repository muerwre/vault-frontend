/** used to transpile UMD and CJS modules */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')(['ramda']);

module.exports = withBundleAnalyzer(
  withTM({
    /** rewrite old-style node paths */
    async rewrites() {
      return [
        {
          source: '/post:id',
          destination: '/node/:id',
        },
        {
          source: '/~:username',
          destination: '/profile/:username',
        }
      ];
    },

    /** don't try to optimize fonts */
    optimizeFonts: false,
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vault48.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
        pathname: '/**',
      },
    ],
  },
  })
);

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
      ];
    },

    /** don't try to optimize fonts */
    optimizeFonts: false,
  })
);

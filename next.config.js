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
          protocol: 'https',
          hostname: 'vault48.org',
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

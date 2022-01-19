/** used to transpile UMD and CJS modules */
const withTM = require('next-transpile-modules')(['ramda']);

module.exports = withTM({
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
});

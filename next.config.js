const withTM = require('next-transpile-modules')(['ramda']);

module.exports = withTM({
  /* Your Next.js config */
  async rewrites() {
    return [
      {
        source: '/post:id',
        destination: '/node/:id',
      },
    ];
  },
});

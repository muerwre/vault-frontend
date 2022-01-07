const CracoAlias = require('craco-alias');

module.exports = {
  webpack: {
    alias: {
      '~': `src`,
    },
    output: {
      publicPath: '/',
    },
    rules: [
      {
        test: /\.(svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  eslint: {
    enable: false,
    mode: 'file',
    rules: {
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
    },
  },
  jest: {
    setupTestFrameworkScriptFile: '<rootDir>/src/setupTests.js',
    configure: {
      moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
        '^.+\\.scss$': 'identity-obj-proxy',
      },
      snapshotSerializers: ['enzyme-to-json/serializer'],
      moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'jsx', 'node'],
      verbose: true,
      roots: ['<rootDir>/src'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.ts?$': 'babel-jest',
        '^.+\\.js?$': 'ts-jest',
        '^.+\\.jsx?$': 'babel-jest',
      },
      preset: 'ts-jest/presets/js-with-ts',
      testEnvironment: 'node',
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        tsConfigPath: 'tsconfig.paths.json',
      },
    },
  ],
};

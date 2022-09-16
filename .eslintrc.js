module.exports = {
  extends: ['plugin:react/recommended', 'plugin:@next/next/recommended'],
  rules: {
    'react/prop-types': 0,
    'react/display-name': 0,
    'react/react-in-jsx-scope': 0,
    '@next/next/no-img-element': 0,
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'unknown'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          { pattern: '~/**', group: 'internal' },
          { pattern: './**', group: 'sibling' },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'ramda',
            message:
              'import from \'~/utils/ramda\' instead',
          },
        ],
      },
    ]
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
  },
  plugins: ['import', 'react-hooks'],
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: '17',
    },
  },
};

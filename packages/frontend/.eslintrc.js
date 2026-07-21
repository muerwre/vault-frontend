module.exports = {
  extends: ['plugin:react/recommended', 'plugin:@next/next/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'react/prop-types': 0,
    'react/display-name': 0,
    'react/react-in-jsx-scope': 0,
    '@next/next/no-img-element': 0,
    'unused-imports/no-unused-imports': 'warn',
    // 'no-unused-vars': 'warn',
    quotes: [2, 'single', { avoidEscape: true }],
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'unknown',
        ],
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
            message: "import from '~/utils/ramda' instead",
          },
        ],
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
  },
  plugins: ['import', 'react-hooks', 'unused-imports', 'prettier'],
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: '17',
    },
  },
};

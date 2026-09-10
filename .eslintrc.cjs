/*global module*/
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  rules: {
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
          { pattern: '@vault/**', group: 'internal' },
          { pattern: 'src/**', group: 'internal' },
          { pattern: './**', group: 'sibling' },
        ],
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        // `_name` marks a deliberate discard, as does destructuring a key out
        // of an object to drop it.
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
  plugins: ['import', '@typescript-eslint'],
  root: true,
  ignorePatterns: ['.eslintrc.cjs', 'dist', 'node_modules'],
};

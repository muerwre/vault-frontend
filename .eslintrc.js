// module.exports = {
//   extends: ['airbnb', 'airbnb-base', 'plugin:@typescript-eslint/recommended'],
//   // "parser": "babel-eslint",
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaFeatures: {
//       jsx: true
//     },
//     project: './tsconfig.json'
//   },
//   plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'import', 'react-hooks'],
//   rules: {
//     indent: ['error', 2],
//     '@typescript-eslint/indent': ['error', 2],
//     'comma-dangle': 0,
//     'no-restricted-syntax': 1,
//     'new-cap': 1,
//     'no-continue': 1,
//     'no-underscore-dangle': 1,
//     'global-require': 1,
//     'react/no-multi-comp': 1,
//     'react/jsx-filename-extension': 0,
//     camelcase: 1,
//     'import/no-unresolved': 1,
//     'import/prefer-default-export': 1,
//     'import/extensions': 1,
//     'no-return-assign': 1,
//     'max-len': 1,
//     'jsx-a11y/no-static-element-interactions': 0,
//     'jsx-a11y/click-events-have-key-events': 0,
//     'jsx-a11y/interactive-supports-focus': 0,
//     'react-hooks/rules-of-hooks': 'error',
//     'react-hooks/exhaustive-deps': 'warn',
//     'no-nested-ternary': 1
//   },
//   globals: {
//     document: false,
//     window: false,
//     HTMLInputElement: false,
//     HTMLDivElement: false
//   }
// };
module.exports = {
  extends: ['plugin:@typescript-eslint/recommended'],
  plugins: ['import', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  globals: {
    Reactotron: true,
  },
  rules: {
    curly: ['error', 'all'],
    'valid-jsdoc': 'error',
    'linebreak-style': 'off',
    'no-console': 'off',
    'object-curly-newline': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          object: true,
        },
      },
    ],
    'function-paren-newline': ['error', 'consistent'],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],

    'eslint-comments/no-unlimited-disable': 'off',

    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',

    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        parser: 'flow',
        trailingComma: 'all',
        printWidth: 100,
      },
      '@format',
    ],

    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
};

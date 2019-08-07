module.exports = {
  extends: ['airbnb', 'airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier'],
  // "parser": "babel-eslint",
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'import', 'react-hooks', 'prettier'],
  settings: {
    'import/resolver': {
      // node: {
      //   extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // },
      typescript: {}
    }
  },
  rules: {
    indent: ['error', 2],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/indent': ['error', 2],
    'comma-dangle': 0,
    'no-restricted-syntax': 1,
    'react/prop-types': 0,
    'new-cap': 1,
    'no-continue': 1,
    'no-underscore-dangle': 1,
    'global-require': 1,
    'react/no-multi-comp': 1,
    'react/jsx-filename-extension': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    camelcase: 0,
    'import/no-unresolved': 1,
    'import/prefer-default-export': 1,
    'import/extensions': 1,
    'no-return-assign': 1,
    'max-len': 1,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/interactive-supports-focus': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-nested-ternary': 1,
    'arrow-parens': 0,
    'import/prefer-default-export': 0,
    'no-return-await': 0,
    'prefer-promise-reject-errors': 0,
    'import/order': 0
  },
  globals: {
    document: false,
    window: false,
    HTMLInputElement: false,
    HTMLDivElement: false
  }
};

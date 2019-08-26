module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'airbnb', 'airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'import', 'react-hooks'],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    // '@typescript-eslint/indent': ['warn', 2],
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
    'import/prefer-default-export': 0,
    'max-line-length': [true, 100],
    // 'max-len': 100,
    // 'max-len': { "code": 100 },
    'max-len': ["warn", { "code": 100 }],
    "template-curly-spacing": "off",
    "comma-dangle": ["warn", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "never"
    }],
    indent: "off",
    "import/order": "off",
    "arrow-parens": ["warn", "as-needed"],
  },
  globals: {
    document: false,
    window: false,
    HTMLInputElement: false,
    HTMLDivElement: false,
    FormData: false,
  },
};

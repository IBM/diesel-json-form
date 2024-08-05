// const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const reactRecommended = require('eslint-plugin-react/configs/recommended');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  {
    ignores: [
      '**/node_modules/',
      '**/build/',
      '**/dist/',
      '**/target/',
      '**/webpack.config.js',
      '**/.DS_Store',
      '**/.vscode/',
      'eslint.config.js',
    ],
  },
  prettierRecommended,
  reactRecommended,
  ...tseslint.config(
    // eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ),
  {
    settings: {
      react: {
        version: "detect"
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-object-literal-type-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off', // TODO @sgregoire: due to images
      ...reactHooks.configs.recommended.rules,
    },
  },
];

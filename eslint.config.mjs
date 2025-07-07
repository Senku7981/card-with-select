import Codex from 'eslint-config-codex';
import { plugin as TsPlugin, parser as TsParser } from 'typescript-eslint';

export default [
  ...Codex,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: TsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: './',
        sourceType: 'module',
      },
    },
    rules: {
      'jsdoc/require-jsdoc': ['off'],
      'n/no-missing-import': ['off'],
      'n/no-unsupported-features/node-builtins': ['off'],
      'jsdoc/require-returns-description': ['off'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
    },
  },
  {
    ignores: [
      'dev/**',
      'eslint.config.mjs',
      'vite.config.js',
      'postcss.config.js',
    ],
  },
];

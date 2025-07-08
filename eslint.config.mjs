import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: true,
  ignorePatterns: [
    'dev/**',
    'eslint.config.mjs',
    'vite.config.js',
    'postcss.config.js',
  ],
  overrides: [
    {
      files: ['**/*.{js,ts,vue}'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: 2021,
          sourceType: 'module',
          tsconfigRootDir: __dirname,
          project: ['./tsconfig.json'],
        },
        globals: { defineOptions: 'readonly' },
      },
      plugins: {
        '@typescript-eslint': tsPlugin,
        prettier: prettierPlugin,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
});

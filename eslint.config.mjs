import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: [
      'jest.config.js',
      'jest.setup.js',
      'next.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'lighthouserc.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  globalIgnores([
    'node_modules/',
    '.next/',
    'out/',
    'dist/',
    'coverage/',
    'scripts/',
    '**/.opencode/**',
  ]),
])

export default eslintConfig

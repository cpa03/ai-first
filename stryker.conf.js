/**
 * Stryker Mutation Testing Configuration
 *
 * Mutation testing evaluates test quality by introducing small changes (mutations)
 * to source code and verifying tests catch them.
 *
 * Run with: npm run test:mutation
 *
 * Note: Optimized for CI performance
 */
module.exports = {
  packageManager: 'npm',

  // Test runner: Jest
  testRunner: 'jest',

  // Enable TypeScript checker
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',

  // Jest configuration
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFindRelatedTests: true,
  },

  // Files to mutate - focused on smaller core files for faster execution
  // For full mutation testing, remove these restrictions
  mutate: [
    'src/lib/utils.ts',
    'src/lib/type-guards.ts',
    'src/lib/validation.ts',
    'src/lib/cache.ts',
    'src/lib/metrics.ts',
  ],

  // Disable type checks in mutants
  disableTypeChecks: 'src/**/*.{ts,tsx,js,jsx}',

  // Thresholds for mutation testing (issue requirement: >80%)
  thresholds: {
    high: 80, // Good mutation score
    low: 70, // Warning threshold
    break: 60, // Fail if below this
  },

  // Reporters
  reporters: ['progress', 'clear-text'],

  // Concurrency settings
  concurrency: 2,

  // Use 'all' coverage analysis for better CI performance
  coverageAnalysis: 'all',

  // Timeout for tests
  timeoutMS: 10000,
};

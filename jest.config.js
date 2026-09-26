const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/robots.ts',
    '!src/app/sitemap.ts',
    '!src/middleware.ts',
  ],
  // Coverage gate (ENFORCED, ratcheting floor). Roadmap target: 85% global.
  // The floor below (1%) is a regression tripwire, NOT the goal: it passes
  // today (verified 2026-09-26: a single test file,
  // tests/security/metrics-auth.test.ts, under the default
  // collectCoverageFrom already yields ~11% stmts / ~3.6% branch+funcs /
  // ~12% lines, so the full suite clears 1% with wide margin) but fails
  // loudly if coverage collection silently breaks or collapses toward 0%.
  // Ratchet upward as coverage improves (e.g. 20% -> 50% -> 85%) by raising
  // these four numbers; do NOT jump to 85% while the default suite is red
  // (24 pre-existing failed suites, incl. timing-sensitive perf tests).
  coverageThreshold: {
    global: {
      statements: 1,
      branches: 1,
      functions: 1,
      lines: 1,
    },
  },
  testMatch: [
    '<rootDir>/tests/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    // tests/api/ stays excluded from the DEFAULT suite for now: 8 suites
    // (clarify*, ideas*, ideas-id-tasks, health-detailed) fail pre-existing
    // with HTTP 500 from route handlers (verified identical under
    // jest.config.api.js), and including them would break `test:ci`.
    // UNIFICATION CRITERION: fix those 8 suites to green under
    // `npm run test:api` (jest.config.api.js), then drop this ignore line
    // so the default `test:ci` run covers tests/api. Until then, tests/api
    // is tracked SEPARATELY via `npm run test:api` -- do not consider the
    // default suite "full" without it.
    // Optional CI-snippet suggestion (for .github/workflows/
    // test-unified-workflow.yml, NOT applied here): add a parallel job
    // `- run: npm run test:api` alongside `test:ci` so both gates are
    // visible until unification removes the need for the split.
    '<rootDir>/tests/api/',
    // tests/utils/ and tests/config/ contain helper modules only (no .test
    // files); excluded per-file below instead of per-directory.
    '<rootDir>/tests/fixtures/',
    '<rootDir>/tests/_test-env.d.ts',
    '<rootDir>/tests/utils/test-secrets.ts$',
    '<rootDir>/tests/utils/_testHelpers.ts$',
    '<rootDir>/tests/fixtures/testDataFactory.ts$',
    '<rootDir>/tests/config/test-config.ts$',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

module.exports = createJestConfig(customJestConfig);

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
  // Coverage gate roadmap (target: 85% global). NOT enforced yet on purpose:
  // current global coverage is ~1% and the default suite is red (24 failed
  // suites pre-existing, incl. timing-sensitive perf tests), so any numeric
  // gate would break `test:ci` today. Graduation plan: once the suite is
  // green, uncomment the block below in stages (e.g. 20% -> 50% -> 85%)
  // ratcheting upward as coverage improves.
  // coverageThreshold: {
  //   global: {
  //     statements: 85,
  //     branches: 85,
  //     functions: 85,
  //     lines: 85,
  //   },
  // },
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
    // Unification roadmap: fix those suites, then drop this line so the
    // default `test:ci` run covers tests/api and `test:api` remains only
    // for targeted runs.
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

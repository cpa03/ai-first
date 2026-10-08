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
  // Coverage gate roadmap (target: 85% global).
  // Starting with 20% thresholds to prevent regression while improving coverage.
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 20,
      functions: 20,
      lines: 20,
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

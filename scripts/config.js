/**
 * Script Configuration
 * Centralized configuration for audit and scan scripts
 * This file is in JavaScript format so it can be imported by Node.js scripts
 * without requiring TypeScript compilation
 */

/**
 * Pages to scan/audit
 */
const PAGES = ['/', '/dashboard', '/clarify', '/results'];

/**
 * Default base URL for scripts
 */
const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * Console scanner configuration
 */
const CONSOLE_SCANNER = {
  NAVIGATION_TIMEOUT_MS: 30000,
  ASYNC_WAIT_MS: 2000,
  REPORT_FILENAME: 'console-scan-report.json',
};

/**
 * Lighthouse audit configuration
 */
const LIGHTHOUSE = {
  LOW_SCORE_THRESHOLD: 70,
  REPORT_FILENAME: 'lighthouse-report.json',
  CONFIG: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      emulatedUserAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  },
};

module.exports = {
  PAGES,
  DEFAULT_BASE_URL,
  CONSOLE_SCANNER,
  LIGHTHOUSE,
};

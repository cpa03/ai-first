/**
 * Scripts Configuration
 * Centralizes configuration for build/audit scripts
 * All values support environment variable overrides
 */

/**
 * Get number value from environment variable with validation
 */
function getEnvNumber(key, defaultValue, min, max) {
  const value = process.env[key];
  if (value === undefined) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(
      `Invalid number value for ${key}: "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  if (min !== undefined && parsed < min) {
    console.warn(
      `${key} value ${parsed} is below minimum ${min}. Using minimum.`
    );
    return min;
  }

  if (max !== undefined && parsed > max) {
    console.warn(
      `${key} value ${parsed} is above maximum ${max}. Using maximum.`
    );
    return max;
  }

  return parsed;
}

/**
 * Get string value from environment variable
 */
function getEnvString(key, defaultValue) {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

/**
 * Console Scanner Configuration
 */
const CONSOLE_SCANNER_CONFIG = {
  /**
   * Navigation timeout in milliseconds
   * Env: SCANNER_NAVIGATION_TIMEOUT (default: 30000)
   */
  NAVIGATION_TIMEOUT: getEnvNumber(
    'SCANNER_NAVIGATION_TIMEOUT',
    30000,
    5000,
    120000
  ),

  /**
   * Wait time after page load for async errors in milliseconds
   * Env: SCANNER_ASYNC_WAIT_MS (default: 2000)
   */
  ASYNC_WAIT_MS: getEnvNumber('SCANNER_ASYNC_WAIT_MS', 2000, 500, 10000),

  /**
   * Base URL for scanning
   * Env: BASE_URL (default: http://localhost:3000)
   */
  BASE_URL: getEnvString('BASE_URL', 'http://localhost:3000'),

  /**
   * Pages to scan (not configurable via env, but centralized)
   */
  PAGES: ['/', '/dashboard', '/clarify', '/results'],
};

/**
 * Lighthouse Auditor Configuration
 */
const LIGHTHOUSE_CONFIG = {
  /**
   * Base URL for auditing
   * Env: BASE_URL (default: http://localhost:3000)
   */
  BASE_URL: getEnvString('BASE_URL', 'http://localhost:3000'),

  /**
   * Chrome executable path
   * Env: CHROME_PATH (default: Auto-detected from Playwright)
   *
   * Priority:
   * 1. CHROME_PATH environment variable
   * 2. Playwright's bundled Chromium (auto-detected)
   * 3. Fallback paths for common CI environments
   */
  CHROME_PATH: (() => {
    const envPath = getEnvString('CHROME_PATH', '');
    if (envPath) return envPath;

    // Try to get Playwright's bundled Chromium path
    try {
      const { chromium } = require('playwright');
      const playwrightPath = chromium.executablePath();
      if (playwrightPath) return playwrightPath;
    } catch {
      // Playwright not available or path not found
    }

    // Fallback paths for common CI environments
    const fallbackPaths = [
      // GitHub Actions (Linux)
      '/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome',
      // GitHub Actions (alternative versions)
      '/home/runner/.cache/ms-playwright/chromium-1155/chrome-linux/chrome',
      // macOS
      '/Users/runner/.cache/ms-playwright/chromium-1208/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      // Windows
      'C:\\Users\\runneradmin\\.cache\\ms-playwright\\chromium-1208\\chrome-win\\chrome.exe',
    ];

    const fs = require('fs');
    for (const fallback of fallbackPaths) {
      try {
        if (fs.existsSync(fallback)) return fallback;
      } catch {
        // Ignore errors checking path existence
      }
    }

    // Final fallback - let Lighthouse find Chrome
    return undefined;
  })(),

  /**
   * Low score threshold for warnings
   * Env: LIGHTHOUSE_LOW_SCORE_THRESHOLD (default: 70)
   */
  LOW_SCORE_THRESHOLD: getEnvNumber(
    'LIGHTHOUSE_LOW_SCORE_THRESHOLD',
    70,
    0,
    100
  ),

  /**
   * Public pages to audit
   */
  PAGES: ['/'],

  /**
   * Pages requiring authentication (skipped)
   */
  AUTH_PAGES: ['/dashboard', '/clarify', '/results'],

  /**
   * Lighthouse throttling configuration
   */
  THROTTLING: {
    RTT_MS: getEnvNumber('LIGHTHOUSE_RTT_MS', 40, 0, 1000),
    THROUGHPUT_KBPS: getEnvNumber(
      'LIGHTHOUSE_THROUGHPUT_KBPS',
      10240,
      1000,
      100000
    ),
    CPU_SLOWDOWN_MULTIPLIER: getEnvNumber('LIGHTHOUSE_CPU_SLOWDOWN', 1, 1, 10),
    REQUEST_LATENCY_MS: getEnvNumber(
      'LIGHTHOUSE_REQUEST_LATENCY_MS',
      0,
      0,
      1000
    ),
    DOWNLOAD_THROUGHPUT_KBPS: getEnvNumber(
      'LIGHTHOUSE_DOWNLOAD_THROUGHPUT_KBPS',
      0,
      0,
      100000
    ),
    UPLOAD_THROUGHPUT_KBPS: getEnvNumber(
      'LIGHTHOUSE_UPLOAD_THROUGHPUT_KBPS',
      0,
      0,
      100000
    ),
  },

  /**
   * Screen emulation settings
   */
  SCREEN_EMULATION: {
    WIDTH: getEnvNumber('LIGHTHOUSE_SCREEN_WIDTH', 1350, 320, 3840),
    HEIGHT: getEnvNumber('LIGHTHOUSE_SCREEN_HEIGHT', 940, 240, 2160),
    DEVICE_SCALE_FACTOR: getEnvNumber('LIGHTHOUSE_DEVICE_SCALE', 1, 1, 4),
  },
};

/**
 * Lighthouse CI Configuration
 */
const LHCI_CONFIG = {
  /**
   * URL for Lighthouse CI
   * Env: LHCI_URL or BASE_URL (default: http://localhost:3000)
   */
  URL: getEnvString(
    'LHCI_URL',
    getEnvString('BASE_URL', 'http://localhost:3000')
  ),

  /**
   * Number of runs
   * Env: LHCI_NUMBER_OF_RUNS (default: 1)
   */
  NUMBER_OF_RUNS: getEnvNumber('LHCI_NUMBER_OF_RUNS', 1, 1, 5),

  /**
   * Minimum score thresholds
   */
  MIN_SCORES: {
    PERFORMANCE: getEnvNumber('LHCI_MIN_PERFORMANCE', 70, 0, 100) / 100,
    ACCESSIBILITY: getEnvNumber('LHCI_MIN_ACCESSIBILITY', 90, 0, 100) / 100,
    BEST_PRACTICES: getEnvNumber('LHCI_MIN_BEST_PRACTICES', 80, 0, 100) / 100,
    SEO: getEnvNumber('LHCI_MIN_SEO', 80, 0, 100) / 100,
  },
};

module.exports = {
  CONSOLE_SCANNER_CONFIG,
  LIGHTHOUSE_CONFIG,
  LHCI_CONFIG,
  getEnvNumber,
  getEnvString,
};

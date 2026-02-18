#!/usr/bin/env node
/**
 * BroCula Browser Console Scanner
 * Scans all pages for console errors and warnings
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { CONSOLE_SCANNER_CONFIG } = require('./config');

const { BASE_URL, PAGES } = CONSOLE_SCANNER_CONFIG;

const consoleLogs = [];
const errors = [];
const warnings = [];

async function scanPage(page, url) {
  const pageErrors = [];
  const pageWarnings = [];

  // Listen to console messages
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    const logEntry = {
      type,
      text,
      url,
      location: location?.url || 'unknown',
      line: location?.lineNumber || 0,
      column: location?.columnNumber || 0,
    };

    consoleLogs.push(logEntry);

    // Filter out expected auth and server errors in test environments
    // These occur because APIs require authentication/environment variables
    const isExpectedAPIError =
      text.includes('Failed to load resource') &&
      (text.includes('401') || text.includes('403') || text.includes('500'));

    // Filter out network errors for API endpoints that require auth
    const isNetworkError =
      text.includes('Failed to load resource') ||
      text.includes('the server responded with a status of');

    // Filter out expected Supabase initialization warnings in dev mode
    // These warnings are expected when running without Supabase environment variables
    const isExpectedDevWarning =
      text.includes('[DatabaseService] Supabase client not initialized') &&
      text.includes('Check environment variables');

    if (type === 'error' && !isExpectedAPIError) {
      pageErrors.push(logEntry);
      errors.push(logEntry);
    } else if (
      (type === 'warning' || text.toLowerCase().includes('warning')) &&
      !isExpectedDevWarning
    ) {
      pageWarnings.push(logEntry);
      warnings.push(logEntry);
    }
  });

  // Listen to page errors
  page.on('pageerror', (error) => {
    const logEntry = {
      type: 'pageerror',
      text: error.message,
      url,
      stack: error.stack,
    };
    consoleLogs.push(logEntry);
    pageErrors.push(logEntry);
    errors.push(logEntry);
  });

  // Navigate to page and wait for load
  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: CONSOLE_SCANNER_CONFIG.NAVIGATION_TIMEOUT,
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(CONSOLE_SCANNER_CONFIG.ASYNC_WAIT_MS);

    console.log(
      `✓ Scanned ${url}: ${pageErrors.length} errors, ${pageWarnings.length} warnings`
    );

    return { pageErrors, pageWarnings };
  } catch (err) {
    const logEntry = {
      type: 'navigation-error',
      text: err.message,
      url,
    };
    errors.push(logEntry);
    console.error(`✗ Failed to scan ${url}: ${err.message}`);
    return { pageErrors: [logEntry], pageWarnings: [] };
  }
}

async function main() {
  console.log('🧛 BroCula Console Scanner Starting...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });

  try {
    for (const pagePath of PAGES) {
      const context = await browser.newContext();
      const page = await context.newPage();

      await scanPage(page, pagePath);

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      totalLogs: consoleLogs.length,
    },
    errors: errors.map((e) => ({
      type: e.type,
      message: e.text,
      page: e.url,
      location: e.location ? `${e.location}:${e.line}:${e.column}` : undefined,
      stack: e.stack,
    })),
    warnings: warnings.map((w) => ({
      type: w.type,
      message: w.text,
      page: w.url,
      location: w.location ? `${w.location}:${w.line}:${w.column}` : undefined,
    })),
    allLogs: consoleLogs.map((l) => ({
      type: l.type,
      message: l.text,
      page: l.url,
    })),
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'console-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 SCAN SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total Errors: ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);
  console.log(`Total Logs: ${consoleLogs.length}`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ ERRORS FOUND:');
    errors.forEach((e, i) => {
      console.log(
        `  ${i + 1}. [${e.type}] ${e.text.substring(0, 100)}${e.text.length > 100 ? '...' : ''}`
      );
      console.log(`     Page: ${e.url}`);
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS FOUND:');
    warnings.forEach((w, i) => {
      console.log(
        `  ${i + 1}. [${w.type}] ${w.text.substring(0, 100)}${w.text.length > 100 ? '...' : ''}`
      );
      console.log(`     Page: ${w.url}`);
    });
  }

  console.log('');
  console.log(`📄 Full report saved to: ${reportPath}`);

  // Exit with error code if errors found
  if (errors.length > 0) {
    console.log('');
    console.log('💀 BroCula says: Errors must be fixed!');
    process.exit(1);
  }

  console.log('');
  console.log('✨ BroCula approves! No console errors found.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

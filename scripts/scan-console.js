#!/usr/bin/env node
/**
 * BroCula Browser Console Scanner
 * Scans all pages for console errors and warnings
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/dashboard', '/clarify', '/results'];

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

    const isExpectedAuthError =
      text.includes('401 (Unauthorized)') &&
      (location?.url?.includes('/api/') || text.includes('/api/'));

    if (type === 'error' && !isExpectedAuthError) {
      pageErrors.push(logEntry);
      errors.push(logEntry);
    } else if (type === 'warning' || text.toLowerCase().includes('warning')) {
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
      timeout: 30000,
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

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

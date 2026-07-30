#!/usr/bin/env node
/**
 * BroCula Direct Console Scanner
 * Scans pages for console errors using Playwright
 * Supports environment variable BASE_URL override
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { BROWSER_SCANNER_CONFIG } = require('./config');

const { BASE_URL, PAGES, NAVIGATION_TIMEOUT, ASYNC_WAIT_MS, CHROME_FLAGS } =
  BROWSER_SCANNER_CONFIG;

const errors = [];
const warnings = [];
const allLogs = [];

async function scanPage(page, url) {
  const pageErrors = [];
  const pageWarnings = [];

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

    allLogs.push(logEntry);

    // Filter out expected errors
    const isExpectedAPIError =
      text.includes('Failed to load resource') &&
      (text.includes('401') || text.includes('403') || text.includes('500'));

    const isNetworkError =
      text.includes('Failed to load resource') ||
      text.includes('the server responded with a status of');

    const isExpectedDevWarning =
      text.includes('[DatabaseService] Supabase client not initialized') &&
      text.includes('Check environment variables');

    const isExpectedInfoLog =
      text.includes('Global error handlers registered') ||
      text.includes('Global error handlers unregistered');

    if (
      type === 'error' &&
      !isExpectedAPIError &&
      !isNetworkError &&
      !isExpectedInfoLog
    ) {
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

  page.on('pageerror', (error) => {
    const logEntry = {
      type: 'pageerror',
      text: error.message,
      url,
      stack: error.stack,
    };
    pageErrors.push(logEntry);
    errors.push(logEntry);
  });

  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT,
    });

    await page.waitForTimeout(ASYNC_WAIT_MS);

    console.log(
      `✓ Scanned ${url}: ${pageErrors.length} errors, ${pageWarnings.length} warnings`
    );

    return { pageErrors, pageWarnings };
  } catch (err) {
    console.error(`✗ Failed to scan ${url}: ${err.message}`);
    return { pageErrors: [], pageWarnings: [] };
  }
}

async function main() {
  console.log('🧛 BroCula Direct Console Scanner Starting...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages to scan: ${PAGES.join(', ')}`);
  console.log('');

  const http = require('http');
  try {
    await new Promise((resolve, reject) => {
      const url = new URL(BASE_URL);
      const req = http.request(url, (res) => {
        console.log(
          `✓ Server is reachable at ${BASE_URL} (status: ${res.statusCode})`
        );
        res.resume();
        resolve();
      });
      req.on('error', (e) => {
        console.error(`❌ Cannot reach server at ${BASE_URL}`);
        console.error(`   Error: ${e.message}`);
        reject(e);
      });
      req.setTimeout(ASYNC_WAIT_MS, () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });
      req.end();
    });
  } catch (err) {
    console.error('   Make sure the dev server is running');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: CHROME_FLAGS.COMMON,
  });

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

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 SCAN SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total Errors: ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);
  console.log(`Total Logs: ${allLogs.length}`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ ERRORS FOUND:');
    errors.forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.type}] ${e.text.substring(0, 150)}`);
      console.log(`     Page: ${e.url}`);
      if (e.location && e.location !== 'unknown') {
        console.log(`     Location: ${e.location}:${e.line}:${e.column}`);
      }
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS FOUND:');
    warnings.forEach((w, i) => {
      console.log(`  ${i + 1}. [${w.type}] ${w.text.substring(0, 150)}`);
      console.log(`     Page: ${w.url}`);
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✨ BroCula approves! No console errors found.');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      totalLogs: allLogs.length,
    },
    errors,
    warnings,
  };

  const reportPath = path.join(process.cwd(), 'console-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to ${reportPath}`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

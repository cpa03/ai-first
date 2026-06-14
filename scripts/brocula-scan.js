#!/usr/bin/env node

const { chromium } = require('playwright');
const { BROWSER_SCANNER_CONFIG } = require('./config');

const {
  BASE_URL,
  CONSOLE_SCAN_PAGES: PAGES,
  NAVIGATION_TIMEOUT,
  ASYNC_WAIT_MS,
} = BROWSER_SCANNER_CONFIG;

const consoleLogs = [];
const errors = [];
const warnings = [];

async function scanPage(browser, page, url) {
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

    consoleLogs.push(logEntry);

    const isExpectedAPIError =
      text.includes('Failed to load resource') &&
      (text.includes('401') || text.includes('403') || text.includes('500'));

    const isExpectedDevWarning =
      text.includes('[DatabaseService] Supabase client not initialized') &&
      text.includes('Check environment variables');

    const isExpectedInfoLog =
      text.includes('Global error handlers registered') ||
      text.includes('Global error handlers unregistered');

    if (type === 'error' && !isExpectedAPIError && !isExpectedInfoLog) {
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
    consoleLogs.push(logEntry);
    pageErrors.push(logEntry);
    errors.push(logEntry);
  });

  try {
    console.log(`Scanning ${url}...`);
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: NAVIGATION_TIMEOUT,
    });
    await page.waitForTimeout(ASYNC_WAIT_MS);
    console.log(`  ✓ ${url} scanned`);
  } catch (err) {
    console.log(`  ✗ Failed to scan ${url}: ${err.message}`);
    const logEntry = {
      type: 'navigation-error',
      text: err.message,
      url,
    };
    errors.push(logEntry);
  }

  return { pageErrors, pageWarnings };
}

async function main() {
  console.log('🧛 BroCula Console Scanner Starting...');
  console.log(`Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext();

    for (const pagePath of PAGES) {
      const page = await context.newPage();
      const url = `${BASE_URL}${pagePath}`;
      await scanPage(browser, page, url);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('📊 SCAN SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total Errors: ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);
  console.log(`Total Logs: ${consoleLogs.length}`);

  if (consoleLogs.length > 0) {
    console.log('\n📝 CONSOLE LOGS:');
    consoleLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. [${log.type}] ${log.text.substring(0, 150)}`);
      if (log.url) console.log(`     Page: ${log.url}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.type}] ${err.text.substring(0, 100)}`);
      if (err.url) console.log(`     Page: ${err.url}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS FOUND:');
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. [${warn.type}] ${warn.text.substring(0, 100)}`);
      if (warn.url) console.log(`     Page: ${warn.url}`);
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ No errors or warnings found!');
  }

  console.log('\n💀 BroCula says: Errors must be fixed!');

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(console.error);

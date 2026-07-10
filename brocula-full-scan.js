import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:3000';
const PAGES = ['/', '/login', '/signup', '/dashboard', '/clarify', '/results'];

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function scanPage(page, url) {
  const pageErrors = [];
  const pageWarnings = [];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    if (
      type === 'error' &&
      !text.includes('Failed to load resource') &&
      !text.includes('Global error handlers')
    ) {
      pageErrors.push({ type, text, url });
    } else if (type === 'warning' && !text.includes('[DatabaseService]')) {
      pageWarnings.push({ type, text, url });
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push({ type: 'pageerror', text: error.message, url });
  });

  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    console.log(
      `✓ Scanned ${url}: ${pageErrors.length} errors, ${pageWarnings.length} warnings`
    );
    return { pageErrors, pageWarnings };
  } catch (err) {
    console.error(`✗ Failed to scan ${url}: ${err.message}`);
    return {
      pageErrors: [{ type: 'navigation-error', text: err.message, url }],
      pageWarnings: [],
    };
  }
}

async function main() {
  console.log('🧛 BroCula Full Scan Starting...');

  // Start dev server
  console.log('Starting dev server...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Ready in')) {
      console.log('✓ Dev server ready');
    }
  });

  server.stderr.on('data', () => {});

  // Wait for server to be ready
  console.log('Waiting for server...');
  const serverReady = await waitForServer(BASE_URL);
  if (!serverReady) {
    console.error('❌ Server failed to start');
    server.kill();
    process.exit(1);
  }

  console.log('✓ Server is ready, starting scan...');

  // Run scan
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      '/home/runner/.cache/ms-playwright/chromium-1228/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allErrors = [];
  const allWarnings = [];

  for (const pagePath of PAGES) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const result = await scanPage(page, pagePath);
    allErrors.push(...result.pageErrors);
    allWarnings.push(...result.pageWarnings);
    await context.close();
  }

  await browser.close();
  server.kill();

  console.log('\n═══════════════════════════════════════════');
  console.log('📊 SCAN SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total Errors: ${allErrors.length}`);
  console.log(`Total Warnings: ${allWarnings.length}`);

  if (allErrors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    allErrors.forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.type}] ${e.text.substring(0, 120)}`);
      console.log(`     Page: ${e.url}`);
    });
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  WARNINGS FOUND:');
    allWarnings.forEach((w, i) => {
      console.log(`  ${i + 1}. [${w.type}] ${w.text.substring(0, 120)}`);
      console.log(`     Page: ${w.url}`);
    });
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    errors: allErrors,
    warnings: allWarnings,
  };
  writeFileSync(
    '/home/runner/work/ai-first/ai-first/console-scan-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('\n📄 Report saved to console-scan-report.json');

  process.exit(allErrors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

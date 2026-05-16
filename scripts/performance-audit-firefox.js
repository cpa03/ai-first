#!/usr/bin/env node

const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/login', '/signup', '/dashboard', '/clarify', '/results'];

const audits = [];

async function auditPage(browser, pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    url,
    metrics: {},
    issues: [],
    recommendations: [],
  };

  try {
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;

    results.metrics.loadTime = `${loadTime}ms`;

    const metrics = await page.evaluate(() => {
      const perfData = performance.timing
        ? {
            domContentLoaded:
              performance.timing.domContentLoadedEventEnd -
              performance.timing.navigationStart,
            loadComplete:
              performance.timing.loadEventEnd -
              performance.timing.navigationStart,
          }
        : null;

      return {
        domContentLoaded: perfData?.domContentLoaded || 'N/A',
        loadComplete: perfData?.loadComplete || 'N/A',
        resources: performance.getEntriesByType('resource').length,
      };
    });

    results.metrics.domContentLoaded =
      metrics.domContentLoaded !== 'N/A'
        ? `${metrics.domContentLoaded}ms`
        : 'N/A';
    results.metrics.resources = metrics.resources;

    const blockingResources = await page.evaluate(() => {
      const blocking = [];
      const scripts = document.querySelectorAll('script[src]');
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

      scripts.forEach((s) => {
        if (!s.async && !s.defer) blocking.push({ type: 'script', src: s.src });
      });
      stylesheets.forEach((s) => {
        blocking.push({ type: 'stylesheet', src: s.href });
      });

      return blocking;
    });

    if (blockingResources.length > 0) {
      results.issues.push({
        severity: 'warning',
        message: `${blockingResources.length} render-blocking resources found`,
        details: blockingResources.slice(0, 3),
      });
      results.recommendations.push(
        'Consider adding async/defer to blocking scripts'
      );
    }

    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const largeImages = [];
      imgs.forEach((img) => {
        if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
          largeImages.push({
            src: img.src,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }
      });
      return largeImages;
    });

    if (images.length > 0) {
      results.issues.push({
        severity: 'warning',
        message: `${images.length} large images found that may affect performance`,
        details: images.slice(0, 3),
      });
      results.recommendations.push('Optimize images or use responsive images');
    }

    const hasViewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !!meta;
    });

    if (!hasViewport) {
      results.issues.push({
        severity: 'warning',
        message: 'Missing viewport meta tag',
      });
      results.recommendations.push(
        'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
      );
    }

    const hasDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return !!meta;
    });

    if (!hasDescription) {
      results.issues.push({
        severity: 'info',
        message: 'Missing meta description for SEO',
      });
      results.recommendations.push('Add a meta description for better SEO');
    }

    const hasTitle = await page.evaluate(() => document.title);
    results.metrics.title = hasTitle;

    console.log(
      `  ✓ ${pagePath}: load ${loadTime}ms, ${metrics.resources} resources`
    );

    await context.close();
    return results;
  } catch (err) {
    console.error(`  ✗ Failed to audit ${pagePath}: ${err.message}`);
    results.error = err.message;
    await context.close();
    return results;
  }
}

async function main() {
  console.log('🧛 BroCula Performance Auditor Starting...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Auditing ${PAGES.length} pages`);
  console.log('');

  const browser = await firefox.launch({ headless: true });

  try {
    for (const pagePath of PAGES) {
      const results = await auditPage(browser, pagePath);
      audits.push(results);
    }
  } finally {
    await browser.close();
  }

  const validAudits = audits.filter((a) => !a.error);

  const totalIssues = validAudits.reduce((sum, a) => sum + a.issues.length, 0);
  const warnings = validAudits.reduce(
    (sum, a) => sum + a.issues.filter((i) => i.severity === 'warning').length,
    0
  );
  const infos = validAudits.reduce(
    (sum, a) => sum + a.issues.filter((i) => i.severity === 'info').length,
    0
  );

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: PAGES.length,
      successfulAudits: validAudits.length,
      totalIssues,
      warnings,
      infos,
    },
    audits,
  };

  const reportPath = path.join(process.cwd(), 'performance-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 PERFORMANCE AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Total Pages: ${PAGES.length}`);
  console.log(`Total Issues: ${totalIssues}`);
  console.log(`  - Warnings: ${warnings}`);
  console.log(`  - Info: ${infos}`);
  console.log('');

  if (totalIssues > 0) {
    console.log('⚠️  ISSUES FOUND:');
    validAudits.forEach((a) => {
      if (a.issues.length > 0) {
        console.log(`  ${a.url}:`);
        a.issues.forEach((issue) => {
          console.log(`    [${issue.severity}] ${issue.message}`);
        });
      }
    });
    console.log('');
    console.log('📝 RECOMMENDATIONS:');
    const allRecs = validAudits.flatMap((a) => a.recommendations);
    const uniqueRecs = [...new Set(allRecs)];
    uniqueRecs.forEach((rec) => console.log(`  - ${rec}`));
  }

  console.log('');
  console.log(`📄 Full report saved to: ${reportPath}`);

  if (warnings > 0) {
    console.log('');
    console.log('💀 BroCula says: Performance issues found!');
    process.exit(1);
  }

  console.log('');
  console.log('✨ BroCula approves! No major performance issues found.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

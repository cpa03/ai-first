#!/usr/bin/env node
/**
 * BroCula Performance Analysis - Firefox Version
 * Analyzes performance metrics without Lighthouse
 */

const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/login', '/signup'];
const NAVIGATION_TIMEOUT = 30000;

async function analyzePage(page, url) {
  const startTime = Date.now();

  await page.goto(`${BASE_URL}${url}`, {
    waitUntil: 'networkidle',
    timeout: NAVIGATION_TIMEOUT,
  });

  const loadTime = Date.now() - startTime;

  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const paint = performance.getEntriesByType('paint');
    const navigation = performance.getEntriesByType('navigation')[0];

    // Get all resource entries
    const resources = performance.getEntriesByType('resource');

    // Calculate total transfer size
    const totalTransferSize = resources.reduce(
      (sum, r) => sum + (r.transferSize || 0),
      0
    );

    // Count resources by type
    const scriptCount = resources.filter(
      (r) => r.initiatorType === 'script'
    ).length;
    const cssCount = resources.filter(
      (r) => r.initiatorType === 'css' || r.initiatorType === 'link'
    ).length;
    const imageCount = resources.filter(
      (r) => r.initiatorType === 'img'
    ).length;
    const fontCount = resources.filter(
      (r) => r.initiatorType === 'font'
    ).length;

    // Get largest contentful paint
    let lcp = null;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Get cumulative layout shift
    let cls = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    layoutShiftEntries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });

    // Get DOM size
    const domSize = document.querySelectorAll('*').length;

    // Get first input delay (if available)
    let fid = null;
    const fidEntries = performance.getEntriesByType('first-input');
    if (fidEntries.length > 0) {
      fid = fidEntries[0].processingStart - fidEntries[0].startTime;
    }

    return {
      // Core Web Vitals
      lcp,
      cls,
      fid,

      // Navigation timing
      domContentLoaded:
        navigation?.domContentLoadedEventEnd - navigation?.startTime,
      loadComplete: navigation?.loadEventEnd - navigation?.startTime,
      ttfb: navigation?.responseStart - navigation?.startTime,

      // Paint timing
      firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(
        (p) => p.name === 'first-contentful-paint'
      )?.startTime,

      // Resource metrics
      totalTransferSize,
      scriptCount,
      cssCount,
      imageCount,
      fontCount,
      totalResources: resources.length,

      // DOM metrics
      domSize,

      // DOM depth
      domDepth: (() => {
        let maxDepth = 0;
        const walk = (el, depth) => {
          if (depth > maxDepth) maxDepth = depth;
          Array.from(el.children).forEach((child) => walk(child, depth + 1));
        };
        walk(document.body, 0);
        return maxDepth;
      })(),

      // Long tasks (if available)
      longTasks: performance.getEntriesByType('longtask').length,
    };
  });

  // Check for optimization opportunities
  const opportunities = [];

  if (metrics.lcp && metrics.lcp > 2500) {
    opportunities.push({
      type: 'LCP',
      value: `${(metrics.lcp / 1000).toFixed(2)}s`,
      threshold: '2.5s',
      recommendation:
        'Optimize largest contentful paint element (image optimization, preloading)',
    });
  }

  if (metrics.cls > 0.1) {
    opportunities.push({
      type: 'CLS',
      value: metrics.cls.toFixed(3),
      threshold: '0.1',
      recommendation:
        'Reduce layout shifts (set explicit dimensions, avoid dynamic content insertion)',
    });
  }

  if (metrics.fid && metrics.fid > 100) {
    opportunities.push({
      type: 'FID',
      value: `${metrics.fid.toFixed(0)}ms`,
      threshold: '100ms',
      recommendation:
        'Reduce JavaScript execution time (code splitting, lazy loading)',
    });
  }

  if (metrics.domSize > 1500) {
    opportunities.push({
      type: 'DOM Size',
      value: metrics.domSize,
      threshold: 1500,
      recommendation: 'Reduce DOM size (virtualization, lazy loading)',
    });
  }

  if (metrics.totalTransferSize > 500000) {
    opportunities.push({
      type: 'Transfer Size',
      value: `${(metrics.totalTransferSize / 1024).toFixed(1)}KB`,
      threshold: '500KB',
      recommendation:
        'Reduce page weight (compression, code splitting, image optimization)',
    });
  }

  if (metrics.scriptCount > 20) {
    opportunities.push({
      type: 'Script Count',
      value: metrics.scriptCount,
      threshold: 20,
      recommendation: 'Reduce number of scripts (bundle, defer non-critical)',
    });
  }

  return {
    url,
    loadTime,
    metrics,
    opportunities,
  };
}

async function main() {
  console.log('🦇 BRO-cULA PERFORMANCE ANALYSIS 🦇\n');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages to analyze: ${PAGES.join(', ')}`);
  console.log('');

  const browser = await firefox.launch({ headless: true });
  const results = [];

  try {
    for (const pagePath of PAGES) {
      console.log(`🔍 Analyzing ${pagePath || '/'}...`);

      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        const result = await analyzePage(page, pagePath);
        results.push(result);

        console.log(`  Load Time: ${result.loadTime}ms`);
        console.log(
          `  LCP: ${result.metrics.lcp ? `${(result.metrics.lcp / 1000).toFixed(2)}s` : 'N/A'}`
        );
        console.log(
          `  CLS: ${result.metrics.cls ? result.metrics.cls.toFixed(3) : 'N/A'}`
        );
        console.log(`  DOM Size: ${result.metrics.domSize}`);
        console.log(
          `  Transfer Size: ${(result.metrics.totalTransferSize / 1024).toFixed(1)}KB`
        );

        if (result.opportunities.length > 0) {
          console.log(
            `  ⚠️  ${result.opportunities.length} optimization opportunities found`
          );
        } else {
          console.log('  ✅ No optimization opportunities found');
        }
        console.log('');
      } catch (err) {
        console.log(`  ❌ Failed: ${err.message}`);
        console.log('');
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  // Generate summary
  const allOpportunities = results.flatMap((r) => r.opportunities);
  const avgLoadTime =
    results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;

  console.log('═══════════════════════════════════════════');
  console.log('📊 PERFORMANCE SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Pages Analyzed: ${results.length}`);
  console.log(`Average Load Time: ${avgLoadTime.toFixed(0)}ms`);
  console.log(`Optimization Opportunities: ${allOpportunities.length}`);

  if (allOpportunities.length > 0) {
    console.log('\n🎯 OPTIMIZATION OPPORTUNITIES:');
    allOpportunities.forEach((opp, i) => {
      console.log(`\n${i + 1}. ${opp.type}: ${opp.value}`);
      console.log(`   Threshold: ${opp.threshold}`);
      console.log(`   Recommendation: ${opp.recommendation}`);
    });
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      pagesAnalyzed: results.length,
      averageLoadTime: avgLoadTime,
      totalOpportunities: allOpportunities.length,
    },
    results,
  };

  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Full report saved to: ${reportPath}`);

  if (allOpportunities.length > 0) {
    console.log('\n🦇 BroCula found optimization opportunities!');
    process.exit(1);
  } else {
    console.log('\n✨ BroCula approves! Performance looks good.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

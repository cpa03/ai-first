#!/usr/bin/env node
/**
 * BroCula Performance Analysis Script
 * Uses Firefox to analyze performance optimization opportunities
 */

const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/login', '/signup'];

async function analyzePage(page, url) {
  const results = {
    url,
    metrics: {},
    optimizations: [],
  };

  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Analyze DOM structure
    const domAnalysis = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const scripts = document.querySelectorAll('script[src]');
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      const images = document.querySelectorAll('img');
      const imagesWithoutLazy = Array.from(images).filter(
        (img) => img.loading !== 'lazy'
      );
      const imagesWithoutDimensions = Array.from(images).filter(
        (img) =>
          !img.width && !img.height && !img.style.width && !img.style.height
      );
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const preconnectLinks = document.querySelectorAll(
        'link[rel="preconnect"]'
      );
      const dnsPrefetchLinks = document.querySelectorAll(
        'link[rel="dns-prefetch"]'
      );

      // Check for large images
      const largeImages = Array.from(images).filter((img) => {
        return img.naturalWidth > 1920 || img.naturalHeight > 1080;
      });

      // Check for render-blocking resources
      const renderBlockingScripts = Array.from(scripts).filter((script) => {
        return !script.async && !script.defer;
      });

      // Check for third-party scripts
      const thirdPartyScripts = Array.from(scripts).filter((script) => {
        return (
          script.src &&
          !script.src.includes('localhost') &&
          !script.src.includes('_next')
        );
      });

      return {
        totalElements: allElements.length,
        scriptCount: scripts.length,
        stylesheetCount: stylesheets.length,
        imageCount: images.length,
        imagesWithoutLazy: imagesWithoutLazy.length,
        imagesWithoutDimensions: imagesWithoutDimensions.length,
        preloadCount: preloadLinks.length,
        preconnectCount: preconnectLinks.length,
        dnsPrefetchCount: dnsPrefetchLinks.length,
        largeImageCount: largeImages.length,
        renderBlockingScriptCount: renderBlockingScripts.length,
        thirdPartyScriptCount: thirdPartyScripts.length,
      };
    });

    results.metrics = domAnalysis;

    // Identify optimization opportunities
    if (domAnalysis.totalElements > 1500) {
      results.optimizations.push({
        type: 'DOM Size',
        value: domAnalysis.totalElements,
        threshold: 1500,
        recommendation:
          'Consider lazy loading or virtualization for large lists',
      });
    }

    if (domAnalysis.scriptCount > 20) {
      results.optimizations.push({
        type: 'Script Count',
        value: domAnalysis.scriptCount,
        threshold: 20,
        recommendation:
          'Consider code splitting or lazy loading non-critical scripts',
      });
    }

    if (domAnalysis.imagesWithoutLazy > 3) {
      results.optimizations.push({
        type: 'Image Lazy Loading',
        value: domAnalysis.imagesWithoutLazy,
        threshold: 3,
        recommendation: 'Add loading="lazy" to below-the-fold images',
      });
    }

    if (domAnalysis.largeImageCount > 0) {
      results.optimizations.push({
        type: 'Large Images',
        value: domAnalysis.largeImageCount,
        recommendation:
          'Optimize large images (resize, compress, use WebP format)',
      });
    }

    if (domAnalysis.renderBlockingScriptCount > 0) {
      results.optimizations.push({
        type: 'Render Blocking Scripts',
        value: domAnalysis.renderBlockingScriptCount,
        recommendation: 'Add async or defer attribute to non-critical scripts',
      });
    }

    if (domAnalysis.preloadCount === 0) {
      results.optimizations.push({
        type: 'Missing Preload Links',
        recommendation:
          'Consider preloading critical resources (fonts, CSS, hero images)',
      });
    }

    if (domAnalysis.preconnectCount < 3) {
      results.optimizations.push({
        type: 'Missing Preconnect Links',
        value: domAnalysis.preconnectCount,
        recommendation: 'Add preconnect links for third-party origins',
      });
    }

    console.log(`✓ Analyzed ${url}`);
    return results;
  } catch (error) {
    console.error(`✗ Failed to analyze ${url}: ${error.message}`);
    return results;
  }
}

async function main() {
  console.log('🦇 BroCula Performance Analysis Starting...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const browser = await firefox.launch({ headless: true });
  const allResults = [];

  try {
    for (const pagePath of PAGES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const results = await analyzePage(page, pagePath);
      allResults.push(results);
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
      totalPages: allResults.length,
      totalOptimizations: allResults.reduce(
        (sum, r) => sum + r.optimizations.length,
        0
      ),
    },
    pages: allResults,
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'brocula-perf-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 PERFORMANCE ANALYSIS SUMMARY');
  console.log('═══════════════════════════════════════════');

  allResults.forEach((result) => {
    console.log(`\n${result.url}:`);
    console.log(`  DOM Elements: ${result.metrics.totalElements || 0}`);
    console.log(`  Scripts: ${result.metrics.scriptCount || 0}`);
    console.log(`  Stylesheets: ${result.metrics.stylesheetCount || 0}`);
    console.log(`  Images: ${result.metrics.imageCount || 0}`);
    console.log(`  Optimizations Found: ${result.optimizations.length}`);
  });

  console.log('');
  console.log(`📄 Full report saved to: ${reportPath}`);

  if (report.summary.totalOptimizations > 0) {
    console.log('');
    console.log('⚠️  OPTIMIZATION OPPORTUNITIES:');
    allResults.forEach((result) => {
      result.optimizations.forEach((opp) => {
        console.log(`  ${result.url}: ${opp.type}`);
        console.log(`    Recommendation: ${opp.recommendation}`);
      });
    });
  }

  console.log('');
  console.log('✨ BroCula analysis complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

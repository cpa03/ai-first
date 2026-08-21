#!/usr/bin/env node
const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const getEnvNumber = (key, defaultValue, min, max) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
};

const getEnvString = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

const getEnvArray = (key, defaultValue) => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map((item) => item.trim());
};

const CONFIG = {
  BASE_URL: getEnvString('BASE_URL', 'http://localhost:3000'),
  PAGES: getEnvArray('PERF_PAGES', ['/', '/login', '/signup']),
  TIMEOUT_MS: getEnvNumber('PERF_TIMEOUT_MS', 30000, 5000, 120000),
  STABILIZATION_DELAY_MS: getEnvNumber(
    'PERF_STABILIZATION_DELAY_MS',
    2000,
    500,
    10000
  ),
  LARGE_IMAGE_WIDTH: getEnvNumber('PERF_LARGE_IMAGE_WIDTH', 1920, 640, 3840),
  LARGE_IMAGE_HEIGHT: getEnvNumber('PERF_LARGE_IMAGE_HEIGHT', 1080, 240, 2160),
  MAX_DOM_SIZE: getEnvNumber('PERF_MAX_DOM_SIZE', 1500, 500, 5000),
  MAX_SCRIPT_COUNT: getEnvNumber('PERF_MAX_SCRIPT_COUNT', 20, 5, 100),
  MAX_IMAGES_WITHOUT_LAZY: getEnvNumber(
    'PERF_MAX_IMAGES_WITHOUT_LAZY',
    3,
    1,
    20
  ),
  MAX_PRECONNECT_COUNT: getEnvNumber('PERF_MAX_PRECONNECT_COUNT', 3, 1, 10),
};

const { BASE_URL, PAGES } = CONFIG;

async function analyzePage(page, url) {
  const results = {
    url,
    metrics: {},
    optimizations: [],
  };

  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.TIMEOUT_MS,
    });

    await page.waitForTimeout(CONFIG.STABILIZATION_DELAY_MS);

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

      const largeImages = Array.from(images).filter((img) => {
        return (
          img.naturalWidth > CONFIG.LARGE_IMAGE_WIDTH ||
          img.naturalHeight > CONFIG.LARGE_IMAGE_HEIGHT
        );
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

    if (domAnalysis.totalElements > CONFIG.MAX_DOM_SIZE) {
      results.optimizations.push({
        type: 'DOM Size',
        value: domAnalysis.totalElements,
        threshold: CONFIG.MAX_DOM_SIZE,
        recommendation:
          'Consider lazy loading or virtualization for large lists',
      });
    }

    if (domAnalysis.scriptCount > CONFIG.MAX_SCRIPT_COUNT) {
      results.optimizations.push({
        type: 'Script Count',
        value: domAnalysis.scriptCount,
        threshold: CONFIG.MAX_SCRIPT_COUNT,
        recommendation:
          'Consider code splitting or lazy loading non-critical scripts',
      });
    }

    if (domAnalysis.imagesWithoutLazy > CONFIG.MAX_IMAGES_WITHOUT_LAZY) {
      results.optimizations.push({
        type: 'Image Lazy Loading',
        value: domAnalysis.imagesWithoutLazy,
        threshold: CONFIG.MAX_IMAGES_WITHOUT_LAZY,
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

    if (domAnalysis.preconnectCount < CONFIG.MAX_PRECONNECT_COUNT) {
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

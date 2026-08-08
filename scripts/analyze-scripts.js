#!/usr/bin/env node
/**
 * Script Analysis Tool
 * Analyzes scripts loaded on pages to identify optimization opportunities
 */

const { chromium } = require('playwright');
const { LIGHTHOUSE_CONFIG } = require('./config');

const { BASE_URL, CHROME_PATH } = LIGHTHOUSE_CONFIG;

(async () => {
  console.log('\n🔍 SCRIPT ANALYSIS TOOL\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });
  const page = await browser.newPage();

  // Collect all scripts
  const scripts = [];

  page.on('script', (script) => {
    scripts.push({
      url: script.url(),
      type: script.type(),
      async: script.isAsync(),
      defer: script.isDefer(),
    });
  });

  // Navigate to home page
  console.log('\n📄 Analyzing / (Home Page)\n');
  await page.goto(`${BASE_URL}/`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Get all script elements
  const scriptInfo = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.map((script, index) => ({
      index: index + 1,
      src: script.src,
      async: script.async,
      defer: script.defer,
      type: script.type || 'text/javascript',
      size: script.src.length > 0 ? 'external' : 'inline',
    }));
  });

  console.log(`Total scripts loaded: ${scriptInfo.length}\n`);

  // Categorize scripts
  const categories = {
    nextjs: [],
    react: [],
    app: [],
    vendor: [],
    other: [],
  };

  scriptInfo.forEach((script) => {
    const src = script.src.toLowerCase();
    if (src.includes('next')) {
      categories.nextjs.push(script);
    } else if (src.includes('react')) {
      categories.react.push(script);
    } else if (src.includes('src/')) {
      categories.app.push(script);
    } else if (src.includes('node_modules') || src.includes('vendor')) {
      categories.vendor.push(script);
    } else {
      categories.other.push(script);
    }
  });

  console.log('📊 Script Categories:');
  console.log(`  Next.js: ${categories.nextjs.length}`);
  console.log(`  React: ${categories.react.length}`);
  console.log(`  App: ${categories.app.length}`);
  console.log(`  Vendor: ${categories.vendor.length}`);
  console.log(`  Other: ${categories.other.length}\n`);

  // Identify optimization opportunities
  const optimizations = [];

  // Check for render-blocking scripts
  const renderBlocking = scriptInfo.filter(
    (s) => !s.async && !s.defer && s.type === 'text/javascript'
  );
  if (renderBlocking.length > 0) {
    optimizations.push({
      type: 'Render-blocking scripts',
      count: renderBlocking.length,
      recommendation: 'Add async or defer attributes to non-critical scripts',
      scripts: renderBlocking.map((s) => s.src),
    });
  }

  // Check for large number of scripts
  if (scriptInfo.length > 20) {
    optimizations.push({
      type: 'Too many scripts',
      count: scriptInfo.length,
      recommendation: 'Consider code splitting or lazy loading',
    });
  }

  // Check for vendor scripts that could be optimized
  if (categories.vendor.length > 5) {
    optimizations.push({
      type: 'Many vendor scripts',
      count: categories.vendor.length,
      recommendation: 'Consider tree shaking or dynamic imports',
    });
  }

  // Display optimizations
  if (optimizations.length > 0) {
    console.log('🚀 OPTIMIZATION OPPORTUNITIES:\n');
    optimizations.forEach((opt, i) => {
      console.log(`${i + 1}. ${opt.type}`);
      console.log(`   Count: ${opt.count}`);
      console.log(`   Recommendation: ${opt.recommendation}`);
      if (opt.scripts) {
        console.log('   Affected scripts:');
        opt.scripts.slice(0, 5).forEach((s) => {
          console.log(`     - ${s}`);
        });
      }
      console.log('');
    });
  } else {
    console.log('✅ No critical optimization opportunities found\n');
  }

  // Check for inline scripts
  const inlineScripts = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'));
    return scripts.length;
  });

  if (inlineScripts > 0) {
    console.log(`📝 Inline scripts: ${inlineScripts}`);
    console.log('   Consider moving to external files for caching\n');
  }

  await browser.close();

  console.log('='.repeat(60));
  console.log('Analysis complete!\n');
})();

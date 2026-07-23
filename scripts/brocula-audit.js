#!/usr/bin/env node
/**
 * BroCula Browser Audit Report
 * Comprehensive audit for console errors, performance, and optimization
 */

const { chromium } = require('playwright');

(async () => {
  console.log('\n🦇 BRO-cULA BROWSER AUDIT REPORT 🦇\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: true,
    executablePath:
      '/home/runner/.cache/ms-playwright/chromium-1228/chrome-linux/chrome',
  });
  const page = await browser.newPage();

  const auditResults = {
    consoleErrors: [],
    consoleWarnings: [],
    performanceMetrics: [],
    accessibilityIssues: [],
    resourceIssues: [],
    optimizationOpportunities: [],
  };

  // Capture console messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      auditResults.consoleErrors.push({
        text: msg.text(),
        location: msg.location(),
        url: page.url(),
      });
    } else if (msg.type() === 'warning') {
      auditResults.consoleWarnings.push({
        text: msg.text(),
        location: msg.location(),
        url: page.url(),
      });
    }
  });

  // Capture page errors
  page.on('pageerror', (err) => {
    auditResults.consoleErrors.push({
      text: err.message,
      url: page.url(),
      type: 'pageerror',
    });
  });

  // Pages to test
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/clarify', name: 'Clarify' },
    { path: '/results', name: 'Results' },
  ];

  console.log('\n📊 PERFORMANCE AUDIT\n');

  for (const route of routes) {
    try {
      const startTime = Date.now();
      await page.goto(`http://localhost:3000${route.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });
      const loadTime = Date.now() - startTime;

      // Check DOM size
      const domInfo = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const images = document.querySelectorAll('img');
        const scripts = document.querySelectorAll('script[src]');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

        return {
          totalElements: allElements.length,
          images: images.length,
          scripts: scripts.length,
          stylesheets: stylesheets.length,
          // Check for large DOM
          hasLargeDOM: allElements.length > 1500,
        };
      });

      const status = loadTime < 1000 ? '✅' : loadTime < 3000 ? '⚠️' : '❌';
      console.log(
        `${status} ${route.name}: ${loadTime}ms | DOM: ${domInfo.totalElements} nodes`
      );

      if (domInfo.hasLargeDOM) {
        auditResults.optimizationOpportunities.push({
          type: 'Large DOM',
          route: route.name,
          value: domInfo.totalElements,
          recommendation:
            'Consider lazy loading or virtualization for large lists',
        });
      }

      auditResults.performanceMetrics.push({
        route: route.name,
        loadTime,
        domSize: domInfo.totalElements,
      });
    } catch (e) {
      console.log(`❌ ${route.name}: Failed - ${e.message.substring(0, 80)}`);
    }
  }

  console.log('\n🔍 CONSOLE AUDIT\n');

  if (auditResults.consoleErrors.length === 0) {
    console.log('✅ No console errors found');
  } else {
    console.log(`❌ ${auditResults.consoleErrors.length} console errors:`);
    auditResults.consoleErrors.slice(0, 5).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.text.substring(0, 100)}`);
      if (err.location?.url) {
        console.log(`     Location: ${err.location.url}`);
      }
    });
  }

  if (auditResults.consoleWarnings.length === 0) {
    console.log('✅ No console warnings found');
  } else {
    console.log(`⚠️  ${auditResults.consoleWarnings.length} console warnings:`);
    auditResults.consoleWarnings.slice(0, 5).forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.text.substring(0, 100)}`);
    });
  }

  console.log('\n♿ ACCESSIBILITY AUDIT\n');

  // Check homepage accessibility
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  const a11yIssues = await page.evaluate(() => {
    const issues = [];

    // Check images without alt
    document.querySelectorAll('img:not([alt])').forEach((img) => {
      issues.push(`Image missing alt text: ${img.src.substring(0, 50)}`);
    });

    // Check buttons without accessible names
    document.querySelectorAll('button').forEach((btn) => {
      const hasText = btn.textContent.trim().length > 0;
      const hasAriaLabel = btn.getAttribute('aria-label');
      const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push('Button without accessible name');
      }
    });

    // Check links without text
    document.querySelectorAll('a').forEach((a) => {
      const hasText = a.textContent.trim().length > 0;
      const hasAriaLabel = a.getAttribute('aria-label');
      const hasTitle = a.getAttribute('title');

      if (!hasText && !hasAriaLabel && !hasTitle) {
        issues.push(`Link without text: ${a.href.substring(0, 50)}`);
      }
    });

    // Check form inputs without labels
    document.querySelectorAll('input:not([type="hidden"])').forEach((input) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Input without label: ${input.type || 'text'}`);
      }
    });

    // Check heading hierarchy
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );
    const headingLevels = headings.map((h) => parseInt(h.tagName.charAt(1)));

    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i - 1] > 1) {
        issues.push(
          `Heading level skipped: h${headingLevels[i - 1]} to h${headingLevels[i]}`
        );
      }
    }

    return issues;
  });

  if (a11yIssues.length === 0) {
    console.log('✅ No accessibility issues found');
  } else {
    console.log(`⚠️  ${a11yIssues.length} accessibility issues:`);
    a11yIssues.slice(0, 10).forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  console.log('\n🚀 OPTIMIZATION OPPORTUNITIES\n');

  // Check for large bundle opportunities
  const bundleInfo = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[src]');
    return {
      scriptCount: scripts.length,
      hasManyScripts: scripts.length > 20,
    };
  });

  if (bundleInfo.hasManyScripts) {
    auditResults.optimizationOpportunities.push({
      type: 'Many Scripts',
      value: bundleInfo.scriptCount,
      recommendation:
        'Consider code splitting or lazy loading non-critical scripts',
    });
  }

  // Check for image optimization
  const imageInfo = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    const imagesWithoutLazy = images.filter((img) => img.loading !== 'lazy');
    const imagesWithoutDimensions = images.filter(
      (img) =>
        !img.width && !img.height && !img.style.width && !img.style.height
    );

    return {
      totalImages: images.length,
      withoutLazy: imagesWithoutLazy.length,
      withoutDimensions: imagesWithoutDimensions.length,
    };
  });

  if (imageInfo.withoutLazy > 3) {
    auditResults.optimizationOpportunities.push({
      type: 'Image Lazy Loading',
      value: imageInfo.withoutLazy,
      recommendation: 'Add loading="lazy" to below-the-fold images',
    });
  }

  if (auditResults.optimizationOpportunities.length === 0) {
    console.log('✅ No critical optimization opportunities found');
  } else {
    auditResults.optimizationOpportunities.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.type}: ${opp.value || ''}`);
      console.log(`   Recommendation: ${opp.recommendation}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 AUDIT SUMMARY\n');

  const totalIssues =
    auditResults.consoleErrors.length +
    auditResults.consoleWarnings.length +
    a11yIssues.length;

  console.log(`Routes Tested: ${routes.length}`);
  console.log(`Console Errors: ${auditResults.consoleErrors.length}`);
  console.log(`Console Warnings: ${auditResults.consoleWarnings.length}`);
  console.log(`Accessibility Issues: ${a11yIssues.length}`);
  console.log(
    `Optimization Opportunities: ${auditResults.optimizationOpportunities.length}`
  );

  if (totalIssues === 0) {
    console.log('\n✅ AUDIT PASSED - No critical issues found');
    console.log('🦇 BroCula is happy! No browser console errors detected.');
  } else {
    console.log(`\n❌ AUDIT FOUND ${totalIssues} ISSUES`);
    console.log('🦇 BroCula found issues that need fixing!');
  }

  await browser.close();

  // Exit with error if critical issues found
  process.exit(auditResults.consoleErrors.length > 0 ? 1 : 0);
})();

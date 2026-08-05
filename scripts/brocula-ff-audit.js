#!/usr/bin/env node
/**
 * BroCula Firefox Audit - Works on ARM64
 */
const { firefox } = require('playwright');

(async () => {
  console.log('\n🦇 BRO-CULA BROWSER AUDIT (Firefox) 🦇\n');
  console.log('='.repeat(60));

  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();

  const auditResults = {
    consoleErrors: [],
    consoleWarnings: [],
    performanceMetrics: [],
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

  page.on('pageerror', (err) => {
    auditResults.consoleErrors.push({
      text: err.message,
      url: page.url(),
      type: 'pageerror',
    });
  });

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
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      const domInfo = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const images = document.querySelectorAll('img');
        const scripts = document.querySelectorAll('script[src]');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const imgsNoLazy = Array.from(images).filter(
          (img) => img.loading !== 'lazy'
        );
        const imgsNoDims = Array.from(images).filter(
          (img) =>
            !img.width && !img.height && !img.style.width && !img.style.height
        );

        return {
          totalElements: allElements.length,
          images: images.length,
          scripts: scripts.length,
          stylesheets: stylesheets.length,
          imagesWithoutLazy: imgsNoLazy.length,
          imagesWithoutDimensions: imgsNoDims.length,
        };
      });

      const status = loadTime < 1000 ? '✅' : loadTime < 3000 ? '⚠️' : '❌';
      console.log(
        `${status} ${route.name}: ${loadTime}ms | DOM: ${domInfo.totalElements} nodes | Scripts: ${domInfo.scripts} | Images: ${domInfo.images}`
      );

      auditResults.performanceMetrics.push({
        route: route.name,
        loadTime,
        domSize: domInfo.totalElements,
        ...domInfo,
      });

      if (domInfo.totalElements > 1500) {
        auditResults.optimizationOpportunities.push({
          type: 'Large DOM',
          route: route.name,
          value: domInfo.totalElements,
          recommendation: 'Consider lazy loading or virtualization',
        });
      }

      if (domInfo.imagesWithoutLazy > 3) {
        auditResults.optimizationOpportunities.push({
          type: 'Image Lazy Loading',
          route: route.name,
          value: domInfo.imagesWithoutLazy,
          recommendation: 'Add loading="lazy" to below-the-fold images',
        });
      }
    } catch (e) {
      console.log(`❌ ${route.name}: Failed - ${e.message.substring(0, 80)}`);
    }
  }

  console.log('\n🔍 CONSOLE AUDIT\n');

  if (auditResults.consoleErrors.length === 0) {
    console.log('✅ No console errors found');
  } else {
    console.log(`❌ ${auditResults.consoleErrors.length} console errors:`);
    auditResults.consoleErrors.slice(0, 10).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.text.substring(0, 120)}`);
      if (err.location?.url) {
        console.log(
          `     Location: ${err.location.url}:${err.location.lineNumber}`
        );
      }
    });
  }

  if (auditResults.consoleWarnings.length === 0) {
    console.log('✅ No console warnings found');
  } else {
    console.log(`⚠️  ${auditResults.consoleWarnings.length} console warnings:`);
    auditResults.consoleWarnings.slice(0, 10).forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.text.substring(0, 120)}`);
    });
  }

  console.log('\n♿ ACCESSIBILITY AUDIT\n');

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  const a11yIssues = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('img:not([alt])').forEach((img) => {
      issues.push(`Image missing alt: ${img.src.substring(0, 60)}`);
    });
    document.querySelectorAll('button').forEach((btn) => {
      const hasText = btn.textContent.trim().length > 0;
      const hasAriaLabel = btn.getAttribute('aria-label');
      if (!hasText && !hasAriaLabel) {
        issues.push('Button without accessible name');
      }
    });
    document.querySelectorAll('a').forEach((a) => {
      const hasText = a.textContent.trim().length > 0;
      const hasAriaLabel = a.getAttribute('aria-label');
      if (!hasText && !hasAriaLabel) {
        issues.push(`Link without text: ${a.href.substring(0, 60)}`);
      }
    });
    document.querySelectorAll('input:not([type="hidden"])').forEach((input) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      if (!hasLabel && !hasAriaLabel) {
        issues.push(`Input without label: ${input.type || 'text'}`);
      }
    });
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

  if (auditResults.optimizationOpportunities.length > 0) {
    console.log('\n🚀 OPTIMIZATION OPPORTUNITIES:');
    auditResults.optimizationOpportunities.forEach((opp, i) => {
      console.log(
        `  ${i + 1}. ${opp.type}${opp.route ? ` (${opp.route})` : ''}: ${opp.value || ''}`
      );
      console.log(`     → ${opp.recommendation}`);
    });
  }

  if (totalIssues === 0) {
    console.log('\n✅ AUDIT PASSED - No critical issues found');
  } else {
    console.log(`\n❌ AUDIT FOUND ${totalIssues} ISSUES`);
  }

  await browser.close();
  process.exit(auditResults.consoleErrors.length > 0 ? 1 : 0);
})();

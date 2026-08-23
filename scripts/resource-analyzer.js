#!/usr/bin/env node
/**
 * BroCula Resource Analyzer
 * Analyzes what resources are being loaded on each page
 */

const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/login', '/signup'];

async function analyzeResources(page, url) {
  const resources = [];

  page.on('response', async (response) => {
    const request = response.request();
    const url = request.url();
    const resourceType = request.resourceType();
    const status = response.status();
    const headers = await response.allHeaders();

    resources.push({
      url,
      type: resourceType,
      status,
      size: parseInt(headers['content-length'] || '0'),
      contentType: headers['content-type'],
      method: request.method(),
    });
  });

  await page.goto(`${BASE_URL}${url}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  return resources;
}

async function main() {
  console.log('🦇 BRO-cULA RESOURCE ANALYZER 🦇\n');
  console.log('='.repeat(60));

  const browser = await firefox.launch({ headless: true });
  const allResources = {};

  try {
    for (const pagePath of PAGES) {
      console.log(`\n🔍 Analyzing ${pagePath || '/'}...`);

      const context = await browser.newContext();
      const page = await context.newPage();

      const resources = await analyzeResources(page, pagePath);
      allResources[pagePath] = resources;

      // Analyze by type
      const byType = resources.reduce((acc, r) => {
        acc[r.type] = acc[r.type] || [];
        acc[r.type].push(r);
        return acc;
      }, {});

      console.log(`  Total Resources: ${resources.length}`);

      // Show breakdown by type
      Object.entries(byType).forEach(([type, items]) => {
        const totalSize = items.reduce((sum, r) => sum + r.size, 0);
        console.log(
          `  ${type}: ${items.length} files (${(totalSize / 1024).toFixed(1)}KB)`
        );
      });

      // Show largest resources
      const largest = [...resources]
        .sort((a, b) => b.size - a.size)
        .slice(0, 5);
      console.log('\n  Top 5 Largest Resources:');
      largest.forEach((r, i) => {
        console.log(
          `    ${i + 1}. ${r.url.split('/').pop() || r.url.substring(0, 50)}`
        );
        console.log(
          `       Type: ${r.type}, Size: ${(r.size / 1024).toFixed(1)}KB`
        );
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // Generate summary
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 RESOURCE SUMMARY');
  console.log('═══════════════════════════════════════════');

  // Combine all resources
  const combined = Object.values(allResources).flat();
  const uniqueResources = [
    ...new Map(combined.map((r) => [r.url, r])).values(),
  ];

  console.log(`Total Unique Resources: ${uniqueResources.length}`);

  // Breakdown by type
  const byType = uniqueResources.reduce((acc, r) => {
    acc[r.type] = acc[r.type] || [];
    acc[r.type].push(r);
    return acc;
  }, {});

  Object.entries(byType).forEach(([type, items]) => {
    const totalSize = items.reduce((sum, r) => sum + r.size, 0);
    console.log(
      `${type}: ${items.length} files (${(totalSize / 1024).toFixed(1)}KB)`
    );
  });

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: PAGES.length,
      totalUniqueResources: uniqueResources.length,
    },
    resourcesByPage: allResources,
  };

  const reportPath = path.join(process.cwd(), 'resource-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

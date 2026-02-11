#!/usr/bin/env node
/**
 * BroCula Lighthouse Auditor
 * Runs Lighthouse audits on all pages and generates optimization report
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/dashboard', '/clarify', '/results'];

const CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
};

const audits = [];

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--no-sandbox', '--headless', '--disable-gpu'],
  });

  try {
    const { lhr } = await lighthouse(
      url,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
      },
      CONFIG
    );

    const results = {
      url,
      scores: {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
      },
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'].displayValue,
        largestContentfulPaint:
          lhr.audits['largest-contentful-paint'].displayValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].displayValue,
        cumulativeLayoutShift:
          lhr.audits['cumulative-layout-shift'].displayValue,
        speedIndex: lhr.audits['speed-index'].displayValue,
      },
      opportunities: [],
      diagnostics: [],
    };

    // Extract opportunities
    if (lhr.categories.performance.score < 0.9) {
      Object.values(lhr.audits).forEach((audit) => {
        if (audit.details?.type === 'opportunity' && audit.numericValue > 0) {
          results.opportunities.push({
            title: audit.title,
            description: audit.description,
            score: audit.score,
            savings: audit.displayValue,
          });
        }
      });
    }

    // Extract diagnostics
    Object.values(lhr.audits).forEach((audit) => {
      if (
        audit.details?.type === 'table' &&
        audit.score !== null &&
        audit.score < 1
      ) {
        results.diagnostics.push({
          title: audit.title,
          description: audit.description,
          score: audit.score,
        });
      }
    });

    return results;
  } finally {
    await chrome.kill();
  }
}

async function main() {
  console.log('🧛 BroCula Lighthouse Auditor Starting...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  for (const pagePath of PAGES) {
    const url = `${BASE_URL}${pagePath}`;
    console.log(`🔍 Auditing ${pagePath || '/'}...`);

    try {
      const results = await runLighthouse(url);
      audits.push(results);

      console.log(`  Performance: ${results.scores.performance.toFixed(0)}`);
      console.log(
        `  Accessibility: ${results.scores.accessibility.toFixed(0)}`
      );
      console.log(
        `  Best Practices: ${results.scores.bestPractices.toFixed(0)}`
      );
      console.log(`  SEO: ${results.scores.seo.toFixed(0)}`);
      console.log('');
    } catch (err) {
      console.error(`  ✗ Failed to audit ${pagePath}: ${err.message}`);
      audits.push({
        url,
        error: err.message,
      });
    }
  }

  // Calculate averages
  const validAudits = audits.filter((a) => !a.error);
  const avgScores =
    validAudits.length > 0
      ? {
          performance:
            validAudits.reduce((sum, a) => sum + a.scores.performance, 0) /
            validAudits.length,
          accessibility:
            validAudits.reduce((sum, a) => sum + a.scores.accessibility, 0) /
            validAudits.length,
          bestPractices:
            validAudits.reduce((sum, a) => sum + a.scores.bestPractices, 0) /
            validAudits.length,
          seo:
            validAudits.reduce((sum, a) => sum + a.scores.seo, 0) /
            validAudits.length,
        }
      : null;

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: PAGES.length,
      successfulAudits: validAudits.length,
      failedAudits: audits.length - validAudits.length,
      averageScores: avgScores,
    },
    audits,
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('═══════════════════════════════════════════');
  console.log('📊 LIGHTHOUSE SUMMARY');
  console.log('═══════════════════════════════════════════');

  if (avgScores) {
    console.log(`Average Performance: ${avgScores.performance.toFixed(1)}`);
    console.log(`Average Accessibility: ${avgScores.accessibility.toFixed(1)}`);
    console.log(
      `Average Best Practices: ${avgScores.bestPractices.toFixed(1)}`
    );
    console.log(`Average SEO: ${avgScores.seo.toFixed(1)}`);
  }

  console.log('');
  console.log(`📄 Full report saved to: ${reportPath}`);

  // Check for low scores
  const lowScoreThreshold = 70;
  const lowScores = validAudits.filter(
    (a) =>
      a.scores.performance < lowScoreThreshold ||
      a.scores.accessibility < lowScoreThreshold ||
      a.scores.bestPractices < lowScoreThreshold ||
      a.scores.seo < lowScoreThreshold
  );

  if (lowScores.length > 0) {
    console.log('');
    console.log('⚠️  PAGES WITH LOW SCORES:');
    lowScores.forEach((a) => {
      console.log(`  ${a.url}:`);
      if (a.scores.performance < lowScoreThreshold)
        console.log(`    - Performance: ${a.scores.performance.toFixed(1)}`);
      if (a.scores.accessibility < lowScoreThreshold)
        console.log(
          `    - Accessibility: ${a.scores.accessibility.toFixed(1)}`
        );
      if (a.scores.bestPractices < lowScoreThreshold)
        console.log(
          `    - Best Practices: ${a.scores.bestPractices.toFixed(1)}`
        );
      if (a.scores.seo < lowScoreThreshold)
        console.log(`    - SEO: ${a.scores.seo.toFixed(1)}`);
    });
    process.exit(1);
  }

  console.log('');
  console.log('✨ BroCula approves! All scores look good.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

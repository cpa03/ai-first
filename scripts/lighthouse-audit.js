#!/usr/bin/env node
/**
 * BroCula Lighthouse Auditor
 * Runs Lighthouse audits on all pages and generates optimization report
 */

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PAGES, DEFAULT_BASE_URL, LIGHTHOUSE } = require('./config');

const BASE_URL = process.env.BASE_URL || DEFAULT_BASE_URL;

const audits = [];

async function runLighthouse(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const { lhr } = await lighthouse(
      url,
      {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'error',
      },
      LIGHTHOUSE.CONFIG
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
    await browser.close();
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
  const reportPath = path.join(process.cwd(), LIGHTHOUSE.REPORT_FILENAME);
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
  const lowScores = validAudits.filter(
    (a) =>
      a.scores.performance < LIGHTHOUSE.LOW_SCORE_THRESHOLD ||
      a.scores.accessibility < LIGHTHOUSE.LOW_SCORE_THRESHOLD ||
      a.scores.bestPractices < LIGHTHOUSE.LOW_SCORE_THRESHOLD ||
      a.scores.seo < LIGHTHOUSE.LOW_SCORE_THRESHOLD
  );

  if (lowScores.length > 0) {
    console.log('');
    console.log('⚠️  PAGES WITH LOW SCORES:');
    lowScores.forEach((a) => {
      console.log(`  ${a.url}:`);
      if (a.scores.performance < LIGHTHOUSE.LOW_SCORE_THRESHOLD)
        console.log(`    - Performance: ${a.scores.performance.toFixed(1)}`);
      if (a.scores.accessibility < LIGHTHOUSE.LOW_SCORE_THRESHOLD)
        console.log(
          `    - Accessibility: ${a.scores.accessibility.toFixed(1)}`
        );
      if (a.scores.bestPractices < LIGHTHOUSE.LOW_SCORE_THRESHOLD)
        console.log(
          `    - Best Practices: ${a.scores.bestPractices.toFixed(1)}`
        );
      if (a.scores.seo < LIGHTHOUSE.LOW_SCORE_THRESHOLD)
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

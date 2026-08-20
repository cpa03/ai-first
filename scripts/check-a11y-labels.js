#!/usr/bin/env node
/**
 * Check for accessibility issues with visible text labels not matching accessible names
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Checking for accessibility label issues...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const routes = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/clarify',
    '/results',
  ];

  for (const route of routes) {
    try {
      await page.goto(`http://localhost:3000${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const issues = await page.evaluate(() => {
        const problems = [];

        // Check buttons
        document.querySelectorAll('button').forEach((btn) => {
          const visibleText = btn.textContent?.trim();
          const ariaLabel = btn.getAttribute('aria-label');
          const ariaLabelledBy = btn.getAttribute('aria-labelledby');

          if (visibleText && ariaLabel && visibleText !== ariaLabel) {
            problems.push({
              type: 'button',
              visibleText: visibleText.substring(0, 50),
              ariaLabel: ariaLabel.substring(0, 50),
              html: btn.outerHTML.substring(0, 200),
            });
          }
        });

        // Check links
        document.querySelectorAll('a').forEach((a) => {
          const visibleText = a.textContent?.trim();
          const ariaLabel = a.getAttribute('aria-label');

          if (visibleText && ariaLabel && visibleText !== ariaLabel) {
            problems.push({
              type: 'link',
              visibleText: visibleText.substring(0, 50),
              ariaLabel: ariaLabel.substring(0, 50),
              html: a.outerHTML.substring(0, 200),
            });
          }
        });

        // Check inputs
        document.querySelectorAll('input').forEach((input) => {
          const ariaLabel = input.getAttribute('aria-label');
          const placeholder = input.getAttribute('placeholder');

          if (ariaLabel && placeholder && ariaLabel !== placeholder) {
            problems.push({
              type: 'input',
              ariaLabel: ariaLabel.substring(0, 50),
              placeholder: placeholder.substring(0, 50),
              html: input.outerHTML.substring(0, 200),
            });
          }
        });

        return problems;
      });

      if (issues.length > 0) {
        console.log(
          `\n⚠️  ${route}: ${issues.length} accessibility issues found`
        );
        issues.forEach((issue, i) => {
          console.log(`\n  ${i + 1}. ${issue.type}:`);
          console.log(
            `     Visible text: "${issue.visibleText || issue.placeholder || 'N/A'}"`
          );
          console.log(`     Accessible name: "${issue.ariaLabel || 'N/A'}"`);
        });
      } else {
        console.log(`✅ ${route}: No accessibility label issues`);
      }
    } catch (e) {
      console.log(`❌ ${route}: Error - ${e.message.substring(0, 80)}`);
    }
  }

  await browser.close();
})();

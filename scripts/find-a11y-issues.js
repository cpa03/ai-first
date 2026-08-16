#!/usr/bin/env node
/**
 * Find specific accessibility issues identified by Lighthouse
 */

const { chromium } = require('playwright');
const { LIGHTHOUSE_CONFIG } = require('./config');

const { CHROME_PATH } = LIGHTHOUSE_CONFIG;

(async () => {
  console.log('🔍 Finding accessibility issues...\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const pages = ['/', '/login', '/signup'];

  for (const pagePath of pages) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000${pagePath}`, {
      waitUntil: 'domcontentloaded',
    });

    console.log(`\n📄 Page: ${pagePath}`);
    console.log('='.repeat(50));

    // Check for elements with label-content-name-mismatch
    const labelMismatches = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('[aria-label]');

      elements.forEach((el) => {
        const ariaLabel = el.getAttribute('aria-label');
        const textContent = el.textContent?.trim();

        if (
          textContent &&
          ariaLabel &&
          !textContent.includes(ariaLabel) &&
          !ariaLabel.includes(textContent)
        ) {
          issues.push({
            element: el.tagName,
            text: textContent.substring(0, 50),
            ariaLabel: ariaLabel.substring(0, 50),
            selector: el.id
              ? `#${el.id}`
              : el.className
                ? `.${el.className.split(' ')[0]}`
                : el.tagName,
          });
        }
      });

      return issues;
    });

    if (labelMismatches.length > 0) {
      console.log('\n⚠️  Label-Content-Name Mismatches:');
      labelMismatches.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.element} (${issue.selector})`);
        console.log(`     Text: "${issue.text}"`);
        console.log(`     aria-label: "${issue.ariaLabel}"`);
      });
    }

    // Check for potential contrast issues (low contrast text)
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const textElements = document.querySelectorAll(
        'p, span, a, button, h1, h2, h3, h4, h5, h6, label, li'
      );

      textElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // Check for light gray text on white background (common issue)
        if (color && bgColor) {
          const rgbColor = color.match(/\d+/g);
          const rgbBg = bgColor.match(/\d+/g);

          if (rgbColor && rgbBg) {
            const [r, g, b] = rgbColor.map(Number);
            const [br, bg, bb] = rgbBg.map(Number);

            // Very light gray on white (low contrast)
            if (
              r > 180 &&
              g > 180 &&
              b > 180 &&
              br > 240 &&
              bg > 240 &&
              bb > 240
            ) {
              issues.push({
                element: el.tagName,
                text: el.textContent?.substring(0, 30),
                color: color,
                bgColor: bgColor,
              });
            }
          }
        }
      });

      return issues.slice(0, 5); // Limit to first 5 issues
    });

    if (contrastIssues.length > 0) {
      console.log('\n🎨 Potential Contrast Issues:');
      contrastIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.element}: "${issue.text}"`);
        console.log(`     Color: ${issue.color}, Background: ${issue.bgColor}`);
      });
    }

    await page.close();
  }

  await browser.close();
  console.log('\n✅ Done finding accessibility issues');
})();

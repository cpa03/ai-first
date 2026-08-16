#!/usr/bin/env node
/**
 * Find contrast issues identified by Lighthouse
 */

const { chromium } = require('playwright');
const { LIGHTHOUSE_CONFIG } = require('./config');

const { CHROME_PATH } = LIGHTHOUSE_CONFIG;

(async () => {
  console.log('🔍 Finding contrast issues...\n');

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

    // Check for contrast issues using computed styles
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const textElements = document.querySelectorAll(
        'p, span, a, button, h1, h2, h3, h4, h5, h6, label, li, div'
      );

      textElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight) || 400;

        // Check for light gray text on white background (common issue)
        if (color && bgColor) {
          const rgbColor = color.match(/\d+/g);
          const rgbBg = bgColor.match(/\d+/g);

          if (rgbColor && rgbBg) {
            const [r, g, b] = rgbColor.map(Number);
            const [br, bg, bb] = rgbBg.map(Number);

            // Calculate relative luminance
            const luminance = (r, g, b) => {
              const [rs, gs, bs] = [r, g, b].map((c) => {
                c = c / 255;
                return c <= 0.03928
                  ? c / 12.92
                  : Math.pow((c + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
            };

            const textLuminance = luminance(r, g, b);
            const bgLuminance = luminance(br, bg, bb);
            const contrast =
              (Math.max(textLuminance, bgLuminance) + 0.05) /
              (Math.min(textLuminance, bgLuminance) + 0.05);

            // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
            const isLargeText =
              fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
            const minContrast = isLargeText ? 3 : 4.5;

            if (contrast < minContrast) {
              issues.push({
                element: el.tagName,
                text: el.textContent?.substring(0, 30),
                color: color,
                bgColor: bgColor,
                contrast: contrast.toFixed(2),
                required: minContrast,
                fontSize: fontSize,
                fontWeight: fontWeight,
                isLargeText: isLargeText,
              });
            }
          }
        }
      });

      return issues.slice(0, 10); // Limit to first 10 issues
    });

    if (contrastIssues.length > 0) {
      console.log('\n🎨 Contrast Issues Found:');
      contrastIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.element}: "${issue.text}"`);
        console.log(`     Color: ${issue.color}, Background: ${issue.bgColor}`);
        console.log(
          `     Contrast: ${issue.required}:1 required, ${issue.contrast}:1 actual`
        );
        console.log(
          `     Font size: ${issue.fontSize}px, Weight: ${issue.fontWeight}`
        );
      });
    } else {
      console.log('\n✅ No contrast issues found');
    }

    await page.close();
  }

  await browser.close();
  console.log('\n✅ Done finding contrast issues');
})();

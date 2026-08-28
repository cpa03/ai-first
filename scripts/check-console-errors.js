const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];

  // Listen for console messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'error',
        text: msg.text(),
        location: msg.location(),
      });
    } else if (msg.type() === 'warning') {
      warnings.push({
        type: 'warning',
        text: msg.text(),
        location: msg.location(),
      });
    }
  });

  // Listen for page errors
  page.on('pageerror', (error) => {
    errors.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
    });
  });

  try {
    // Navigate to the homepage
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Try navigating to other common pages
    const pages = ['/', '/login', '/register', '/dashboard'];

    for (const pagePath of pages) {
      try {
        console.log(`Navigating to ${pagePath}...`);
        await page.goto(`http://localhost:3000${pagePath}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log(`Failed to navigate to ${pagePath}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Navigation error:', error.message);
  }

  console.log('\n=== Console Errors ===');
  if (errors.length === 0) {
    console.log('No console errors found!');
  } else {
    errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.type}:`);
      console.log(`   Message: ${error.text}`);
      if (error.location) {
        console.log(
          `   Location: ${error.location.url || 'N/A'}:${error.location.lineNumber || 'N/A'}`
        );
      }
    });
  }

  console.log('\n=== Console Warnings ===');
  if (warnings.length === 0) {
    console.log('No console warnings found!');
  } else {
    warnings.forEach((warning, index) => {
      console.log(`\n${index + 1}. ${warning.type}:`);
      console.log(`   Message: ${warning.text}`);
      if (warning.location) {
        console.log(
          `   Location: ${warning.location.url || 'N/A'}:${warning.location.lineNumber || 'N/A'}`
        );
      }
    });
  }

  await browser.close();

  // Exit with error code if there are errors
  process.exit(errors.length > 0 ? 1 : 0);
})();

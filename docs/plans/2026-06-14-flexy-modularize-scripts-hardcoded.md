# Flexy Scripts Modularization Implementation Plan

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-executing-plans or superpowers-subagent-dev to implement this plan task-by-task.

**Goal:** Eliminate hardcoded values from build/audit scripts and centralize them in the existing `scripts/config.js` configuration system.

**Architecture:** Extend `scripts/config.js` with new configuration objects for scripts that currently use hardcoded values. Update each script to import from centralized config instead of using inline hardcoded values. Maintain backward compatibility with environment variable overrides.

**Tech Stack:** Node.js, CommonJS modules, Playwright

---

## Summary of Hardcoded Values to Modularize

| Script                         | Hardcoded Values                                                         | Status                  |
| ------------------------------ | ------------------------------------------------------------------------ | ----------------------- |
| `brocula-scan.js`              | `BASE_URL`, `PAGES`, `timeout: 30000`, `waitForTimeout(2000)`            | ❌ Needs modularization |
| `lighthouse-audit-firefox.js`  | `BASE_URL`, `PAGES`, `lowScoreThreshold: 70`                             | ❌ Needs modularization |
| `performance-audit-firefox.js` | `BASE_URL`, `PAGES`, `timeout: 30000`, image size thresholds (1920x1080) | ❌ Needs modularization |
| `lighthouse-audit.js`          | Uses config.js properly                                                  | ✅ Already modular      |
| `scan-console-firefox.js`      | Uses `process.env.BASE_URL` but still has hardcoded `PAGES`, timeouts    | ❌ Partially modular    |

---

## Task 1: Extend config.js with Browser Scanner Configuration

**Files:**

- Modify: `scripts/config.js`

**Step 1: Add BROWSER_SCANNER_CONFIG to config.js**

Add after the existing `LHCI_CONFIG` export block (before `module.exports`):

```javascript
/**
 * Browser Scanner Configuration
 * Used by brocula-scan.js, scan-console-firefox.js, and performance-audit-firefox.js
 */
const BROWSER_SCANNER_CONFIG = {
  /**
   * Base URL for scanning
   * Env: BASE_URL (default: http://localhost:3000)
   */
  BASE_URL: getEnvString('BASE_URL', 'http://localhost:3000'),

  /**
   * Pages to scan for console errors
   * Env: SCANNER_PAGES (default: '/,/dashboard,/clarify,/results')
   * Comma-separated list of page paths
   */
  CONSOLE_SCAN_PAGES: getEnvString(
    'SCANNER_PAGES',
    '/,/dashboard,/clarify,/results'
  ).split(','),

  /**
   * Pages to scan for performance
   * Env: PERFORMANCE_SCANNER_PAGES (default: '/,/login,/signup,/dashboard,/clarify,/results')
   */
  PERFORMANCE_SCAN_PAGES: getEnvString(
    'PERFORMANCE_SCANNER_PAGES',
    '/,/login,/signup,/dashboard,/clarify,/results'
  ).split(','),

  /**
   * Pages for Lighthouse Firefox audit (public pages only)
   * Env: LIGHTHOUSE_FIREFOX_PAGES (default: '/,/login,/signup')
   */
  LIGHTHOUSE_PAGES: getEnvString(
    'LIGHTHOUSE_FIREFOX_PAGES',
    '/,/login,/signup'
  ).split(','),

  /**
   * Navigation timeout in milliseconds
   * Env: SCANNER_NAVIGATION_TIMEOUT (default: 30000)
   */
  NAVIGATION_TIMEOUT: getEnvNumber(
    'SCANNER_NAVIGATION_TIMEOUT',
    30000,
    5000,
    120000
  ),

  /**
   * Wait time after page load for async errors in milliseconds
   * Env: SCANNER_ASYNC_WAIT_MS (default: 2000)
   */
  ASYNC_WAIT_MS: getEnvNumber('SCANNER_ASYNC_WAIT_MS', 2000, 500, 10000),

  /**
   * Low score threshold for warnings
   * Env: LIGHTHOUSE_LOW_SCORE_THRESHOLD (default: 70)
   */
  LOW_SCORE_THRESHOLD: getEnvNumber(
    'LIGHTHOUSE_LOW_SCORE_THRESHOLD',
    70,
    0,
    100
  ),

  /**
   * Large image width threshold in pixels
   * Env: SCANNER_LARGE_IMAGE_WIDTH (default: 1920)
   */
  LARGE_IMAGE_WIDTH: getEnvNumber('SCANNER_LARGE_IMAGE_WIDTH', 1920, 640, 3840),

  /**
   * Large image height threshold in pixels
   * Env: SCANNER_LARGE_IMAGE_HEIGHT (default: 1080)
   */
  LARGE_IMAGE_HEIGHT: getEnvNumber(
    'SCANNER_LARGE_IMAGE_HEIGHT',
    1080,
    480,
    2160
  ),
};
```

**Step 2: Export the new configuration**

Add `BROWSER_SCANNER_CONFIG` to the `module.exports`:

```javascript
module.exports = {
  CONSOLE_SCANNER_CONFIG,
  LIGHTHOUSE_CONFIG,
  LHCI_CONFIG,
  BROWSER_SCANNER_CONFIG,
  getEnvNumber,
  getEnvString,
};
```

**Step 3: Commit**

```bash
git add scripts/config.js
git commit -m "feat(config): add BROWSER_SCANNER_CONFIG to centralize script hardcoded values"
```

---

## Task 2: Modularize brocula-scan.js

**Files:**

- Modify: `scripts/brocula-scan.js`

**Step 1: Update imports to use centralized config**

Replace the top of the file (lines 1-6) with:

```javascript
#!/usr/bin/env node

const { chromium } = require('playwright');
const { BROWSER_SCANNER_CONFIG } = require('./config');

const {
  BASE_URL,
  CONSOLE_SCAN_PAGES: PAGES,
  NAVIGATION_TIMEOUT,
  ASYNC_WAIT_MS,
} = BROWSER_SCANNER_CONFIG;
```

**Step 2: Replace hardcoded timeouts**

Replace line 70:

```javascript
// BEFORE
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
// AFTER
await page.goto(url, { waitUntil: 'networkidle', timeout: NAVIGATION_TIMEOUT });
```

Replace line 71:

```javascript
// BEFORE
await page.waitForTimeout(2000);
// AFTER
await page.waitForTimeout(ASYNC_WAIT_MS);
```

**Step 3: Run lint to verify no errors**

Run: `npm run lint -- scripts/brocula-scan.js`
Expected: PASS with no errors

**Step 4: Commit**

```bash
git add scripts/brocula-scan.js
git commit -m "refactor(brocula-scan): use centralized BROWSER_SCANNER_CONFIG instead of hardcoded values"
```

---

## Task 3: Modularize scan-console-firefox.js

**Files:**

- Modify: `scripts/scan-console-firefox.js`

**Step 1: Update imports to use centralized config**

Replace the top of the file (lines 1-8) with:

```javascript
#!/usr/bin/env node

const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { BROWSER_SCANNER_CONFIG } = require('./config');

const {
  BASE_URL,
  CONSOLE_SCAN_PAGES: PAGES,
  NAVIGATION_TIMEOUT,
  ASYNC_WAIT_MS,
} = BROWSER_SCANNER_CONFIG;
```

**Step 2: Replace hardcoded timeouts**

Replace lines 83-84:

```javascript
// BEFORE
    timeout: 30000,
// AFTER
    timeout: NAVIGATION_TIMEOUT,
```

Replace line 88:

```javascript
// BEFORE
await page.waitForTimeout(2000);
// AFTER
await page.waitForTimeout(ASYNC_WAIT_MS);
```

**Step 3: Run lint to verify no errors**

Run: `npm run lint -- scripts/scan-console-firefox.js`
Expected: PASS with no errors

**Step 4: Commit**

```bash
git add scripts/scan-console-firefox.js
git commit -m "refactor(scan-console-firefox): use centralized BROWSER_SCANNER_CONFIG instead of hardcoded values"
```

---

## Task 4: Modularize lighthouse-audit-firefox.js

**Files:**

- Modify: `scripts/lighthouse-audit-firefox.js`

**Step 1: Update imports to use centralized config**

Replace the top of the file (lines 1-9) with:

```javascript
#!/usr/bin/env node

const { default: lighthouse } = require('lighthouse');
const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { BROWSER_SCANNER_CONFIG } = require('./config');

const {
  BASE_URL,
  LIGHTHOUSE_PAGES: PAGES,
  LOW_SCORE_THRESHOLD,
} = BROWSER_SCANNER_CONFIG;
```

**Step 2: Replace hardcoded lowScoreThreshold**

Replace line 176:

```javascript
// BEFORE
const lowScoreThreshold = 70;
// AFTER
const lowScoreThreshold = LOW_SCORE_THRESHOLD;
```

**Step 3: Run lint to verify no errors**

Run: `npm run lint -- scripts/lighthouse-audit-firefox.js`
Expected: PASS with no errors

**Step 4: Commit**

```bash
git add scripts/lighthouse-audit-firefox.js
git commit -m "refactor(lighthouse-audit-firefox): use centralized BROWSER_SCANNER_CONFIG instead of hardcoded values"
```

---

## Task 5: Modularize performance-audit-firefox.js

**Files:**

- Modify: `scripts/performance-audit-firefox.js`

**Step 1: Update imports to use centralized config**

Replace the top of the file (lines 1-8) with:

```javascript
#!/usr/bin/env node

const { firefox } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { BROWSER_SCANNER_CONFIG } = require('./config');

const {
  BASE_URL,
  PERFORMANCE_SCAN_PAGES: PAGES,
  NAVIGATION_TIMEOUT,
  LARGE_IMAGE_WIDTH,
  LARGE_IMAGE_HEIGHT,
} = BROWSER_SCANNER_CONFIG;
```

**Step 2: Replace hardcoded timeout**

Replace line 26:

```javascript
// BEFORE
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
// AFTER
await page.goto(url, { waitUntil: 'networkidle', timeout: NAVIGATION_TIMEOUT });
```

**Step 3: Replace hardcoded image size thresholds**

Replace lines 86-87:

```javascript
// BEFORE
        if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
// AFTER
        if (img.naturalWidth > LARGE_IMAGE_WIDTH || img.naturalHeight > LARGE_IMAGE_HEIGHT) {
```

**Step 4: Run lint to verify no errors**

Run: `npm run lint -- scripts/performance-audit-firefox.js`
Expected: PASS with no errors

**Step 5: Commit**

```bash
git add scripts/performance-audit-firefox.js
git commit -m "refactor(performance-audit-firefox): use centralized BROWSER_SCANNER_CONFIG instead of hardcoded values"
```

---

## Task 6: Add Environment Variable Documentation

**Files:**

- Modify: `config/.env.example`

**Step 1: Add new environment variables to .env.example**

Add after the existing `# BASE_URL=http://localhost:3000` line:

```bash
# =============================================================================
# Browser Scanner Configuration
# =============================================================================
# Pages to scan for console errors (comma-separated)
# SCANNER_PAGES=/,/dashboard,/clarify,/results

# Pages to scan for performance (comma-separated)
# PERFORMANCE_SCANNER_PAGES=/,/login,/signup,/dashboard,/clarify,/results

# Pages for Lighthouse Firefox audit (comma-separated)
# LIGHTHOUSE_FIREFOX_PAGES=/,/login,/signup

# Navigation timeout in milliseconds (default: 30000)
# SCANNER_NAVIGATION_TIMEOUT=30000

# Wait time after page load for async errors in milliseconds (default: 2000)
# SCANNER_ASYNC_WAIT_MS=2000

# Low score threshold for Lighthouse warnings (default: 70)
# LIGHTHOUSE_LOW_SCORE_THRESHOLD=70

# Large image width threshold in pixels (default: 1920)
# SCANNER_LARGE_IMAGE_WIDTH=1920

# Large image height threshold in pixels (default: 1080)
# SCANNER_LARGE_IMAGE_HEIGHT=1080
```

**Step 2: Commit**

```bash
git add config/.env.example
git commit -m "docs(env): add browser scanner configuration variables to .env.example"
```

---

## Task 7: Verify Build and Lint Pass

**Step 1: Run full lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS with no TypeScript errors

**Step 3: Run build**

Run: `npm run build`
Expected: PASS with successful build

**Step 4: Commit any fixups if needed**

```bash
git add -A
git commit -m "fix: resolve lint/type-check issues from scripts modularization"
```

---

## Task 8: Create Feature Branch and PR

**Step 1: Create feature branch from main**

```bash
git checkout main
git pull origin main
git checkout -b flexy/modularize-scripts-hardcoded-$(date +%Y%m%d)
```

**Step 2: Push branch and create PR**

```bash
git push origin flexy/modularize-scripts-hardcoded-$(date +%Y%m%d)
gh pr create --title "feat(config): modularize hardcoded values in scripts" --body "$(cat <<'EOF'
## Summary

Flexy mission: Eliminate hardcoded values from build/audit scripts and centralize them in `scripts/config.js`.

## Changes

- Extended `scripts/config.js` with new `BROWSER_SCANNER_CONFIG` object
- Updated `brocula-scan.js` to use centralized config
- Updated `scan-console-firefox.js` to use centralized config
- Updated `lighthouse-audit-firefox.js` to use centralized config
- Updated `performance-audit-firefox.js` to use centralized config
- Added documentation for new environment variables in `.env.example`

## Hardcoded Values Modularized

| Value | Before | After |
|-------|--------|-------|
| `BASE_URL` | Hardcoded in each script | `BROWSER_SCANNER_CONFIG.BASE_URL` |
| `PAGES` | Hardcoded arrays | `BROWSER_SCANNER_CONFIG.CONSOLE_SCAN_PAGES` etc. |
| `timeout: 30000` | Hardcoded in page.goto | `BROWSER_SCANNER_CONFIG.NAVIGATION_TIMEOUT` |
| `waitForTimeout(2000)` | Hardcoded delay | `BROWSER_SCANNER_CONFIG.ASYNC_WAIT_MS` |
| `lowScoreThreshold: 70` | Hardcoded constant | `BROWSER_SCANNER_CONFIG.LOW_SCORE_THRESHOLD` |
| Image size thresholds | Hardcoded 1920x1080 | Configurable via env vars |

## Environment Variables

All values support environment variable overrides for CI/CD flexibility.

## Verification

- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes
EOF
)"
```

---

## Verification Checklist

| Check                              | Status     | Notes                       |
| ---------------------------------- | ---------- | --------------------------- |
| `npm run lint`                     | ⬜ Pending | Must pass with 0 warnings   |
| `npm run type-check`               | ⬜ Pending | Must pass with 0 errors     |
| `npm run build`                    | ⬜ Pending | Must complete successfully  |
| All scripts use centralized config | ⬜ Pending | No hardcoded values remain  |
| Environment variables documented   | ⬜ Pending | `.env.example` updated      |
| PR created                         | ⬜ Pending | Branch up to date with main |

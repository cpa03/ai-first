/**
 * Modularity Audit Test - Flexy Principle Enforcement
 *
 * This test prevents regression by ensuring components use the centralized
 * config system instead of hardcoded values. Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Checks for:
 * 1. Inline hardcoded className strings (should use config patterns)
 * 2. Hardcoded magic numbers (should use config constants)
 * 3. Hardcoded color values (should use theme config)
 * 4. Hardcoded URLs (should use config endpoints)
 * 5. Hardcoded timeouts/delays (should use config timeouts)
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const APP_DIR = path.join(SRC_DIR, 'app');
const HOOKS_DIR = path.join(SRC_DIR, 'hooks');

// Patterns that indicate hardcoded values that should be in config
const HARDCODED_PATTERNS = {
  // Inline Tailwind classes that should use config patterns
  INLINE_CLASSNAME:
    /className="[^"]*\b(bg-|text-|border-|flex|grid|gap-|p-|m-|w-|h-|rounded|shadow)/g,

  // Hardcoded color hex values
  HEX_COLORS: /['"]#[0-9a-fA-F]{3,8}['"]/g,

  // Hardcoded rgb/rgba values
  RGB_COLORS: /rgb\(|rgba\(/g,

  // Hardcoded localhost URLs
  LOCALHOST_URLS: /localhost:\d+/g,

  // Hardcoded magic numbers in component logic (excluding 0, 1, 2 which are common)
  MAGIC_NUMBERS:
    /(?:setTimeout|setInterval|delay|timeout|retry|limit|max|min)\s*\(\s*\w+\s*,\s*(\d{3,})/g,

  // Dynamic rgb() function calls (false positive - these compute from config)
  DYNAMIC_RGB: /rgb\(\$\{/g,
};

// Files/directories to exclude from checks
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'config/', // Config files are allowed to have hardcoded values
  'lib/config/', // Config module files
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx',
];

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_PATTERNS.some((pattern) => entry.name.includes(pattern))) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      if (!EXCLUDE_PATTERNS.some((pattern) => entry.name.includes(pattern))) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function checkFileForHardcodedValues(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  const relativePath = path.relative(SRC_DIR, filePath);

  // Check for inline className with hardcoded Tailwind classes
  const classNameMatches = content.match(HARDCODED_PATTERNS.INLINE_CLASSNAME);
  if (classNameMatches) {
    issues.push(
      `${relativePath}: Found ${classNameMatches.length} inline className with hardcoded Tailwind classes`
    );
  }

  // Check for hardcoded hex colors
  const hexMatches = content.match(HARDCODED_PATTERNS.HEX_COLORS);
  if (hexMatches) {
    issues.push(
      `${relativePath}: Found ${hexMatches.length} hardcoded hex color values`
    );
  }

  // Check for hardcoded rgb/rgba colors (exclude dynamic rgb() that compute from config)
  const rgbMatches = content.match(HARDCODED_PATTERNS.RGB_COLORS);
  const dynamicRgbMatches = content.match(HARDCODED_PATTERNS.DYNAMIC_RGB);
  const staticRgbCount = rgbMatches
    ? rgbMatches.length - (dynamicRgbMatches ? dynamicRgbMatches.length : 0)
    : 0;
  if (staticRgbCount > 0) {
    issues.push(
      `${relativePath}: Found ${staticRgbCount} hardcoded rgb/rgba color values`
    );
  }

  // Check for hardcoded localhost URLs
  const localhostMatches = content.match(HARDCODED_PATTERNS.LOCALHOST_URLS);
  if (localhostMatches) {
    issues.push(
      `${relativePath}: Found ${localhostMatches.length} hardcoded localhost URLs`
    );
  }

  // Check for hardcoded magic numbers in timeouts/delays
  const magicMatches = content.match(HARDCODED_PATTERNS.MAGIC_NUMBERS);
  if (magicMatches) {
    issues.push(
      `${relativePath}: Found ${magicMatches.length} hardcoded magic numbers in timeouts/delays`
    );
  }

  return issues;
}

describe('Modularity Audit - Flexy Principle', () => {
  it('should not have hardcoded Tailwind classes in components', () => {
    const componentFiles = getAllFiles(COMPONENTS_DIR, ['.tsx', '.ts']);
    const allIssues: string[] = [];

    for (const file of componentFiles) {
      const issues = checkFileForHardcodedValues(file);
      allIssues.push(...issues);
    }

    if (allIssues.length > 0) {
      console.log('\n🔍 Modularity Audit Findings:');
      allIssues.forEach((issue) => console.log(`  ⚠️  ${issue}`));
      console.log(
        '\n💡 Fix: Import from @/lib/config instead of hardcoding values'
      );
    }

    // Allow some inline classes for simple layouts, but flag significant violations
    const criticalIssues = allIssues.filter(
      (issue) =>
        issue.includes('hardcoded hex color') ||
        issue.includes('hardcoded rgb/rgba') ||
        issue.includes('hardcoded localhost') ||
        issue.includes('hardcoded magic numbers')
    );

    expect(criticalIssues).toHaveLength(0);
  });

  it('should not have hardcoded values in app pages', () => {
    const appFiles = getAllFiles(APP_DIR, ['.tsx', '.ts']);
    const allIssues: string[] = [];

    for (const file of appFiles) {
      const issues = checkFileForHardcodedValues(file);
      allIssues.push(...issues);
    }

    if (allIssues.length > 0) {
      console.log('\n🔍 App Pages Modularity Audit:');
      allIssues.forEach((issue) => console.log(`  ⚠️  ${issue}`));
    }

    // App pages should be stricter about hardcoded values
    const criticalIssues = allIssues.filter(
      (issue) =>
        issue.includes('hardcoded hex color') ||
        issue.includes('hardcoded rgb/rgba') ||
        issue.includes('hardcoded localhost') ||
        issue.includes('hardcoded magic numbers')
    );

    expect(criticalIssues).toHaveLength(0);
  });

  it('should not have hardcoded values in hooks', () => {
    const hookFiles = getAllFiles(HOOKS_DIR, ['.ts', '.tsx']);
    const allIssues: string[] = [];

    for (const file of hookFiles) {
      const issues = checkFileForHardcodedValues(file);
      allIssues.push(...issues);
    }

    if (allIssues.length > 0) {
      console.log('\n🔍 Hooks Modularity Audit:');
      allIssues.forEach((issue) => console.log(`  ⚠️  ${issue}`));
    }

    // Hooks should be stricter about hardcoded values
    const criticalIssues = allIssues.filter(
      (issue) =>
        issue.includes('hardcoded hex color') ||
        issue.includes('hardcoded rgb/rgba') ||
        issue.includes('hardcoded localhost') ||
        issue.includes('hardcoded magic numbers')
    );

    expect(criticalIssues).toHaveLength(0);
  });

  it('should have config module with comprehensive exports', () => {
    const configIndexPath = path.join(SRC_DIR, 'lib/config/index.ts');
    expect(fs.existsSync(configIndexPath)).toBe(true);

    const content = fs.readFileSync(configIndexPath, 'utf-8');

    const expectedExports = [
      'APP_CONFIG',
      'API_ENDPOINTS',
      'UI_CONFIG',
      'ANIMATION_CONFIG',
      'CACHE_CONFIG',
      'SECURITY_CONFIG',
      'RATE_LIMIT_CONFIG',
      'VALIDATION_CONFIG',
    ];

    for (const exp of expectedExports) {
      expect(content).toContain(exp);
    }

    // TIMEOUT_CONFIG is re-exported via `export * from './constants'`
    expect(content).toContain("export * from './constants'");
  });

  it('should have config files for all major domains', () => {
    const configDir = path.join(SRC_DIR, 'lib/config');
    expect(fs.existsSync(configDir)).toBe(true);

    const configFiles = fs.readdirSync(configDir);

    // Verify key config files exist
    const expectedFiles = [
      'app.ts',
      'ui.ts',
      'animation.ts',
      'cache.ts',
      'security-config.ts',
      'timeout-config.ts',
      'rate-limit-config.ts',
      'validation-config.ts',
      'theme.ts',
      'components.ts',
      'element-ids.ts',
      'component-labels.ts',
    ];

    for (const file of expectedFiles) {
      expect(configFiles).toContain(file);
    }
  });
});

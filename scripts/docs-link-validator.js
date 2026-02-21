#!/usr/bin/env node

/**
 * Documentation Link Validator
 *
 * Validates internal documentation links in markdown files.
 * This addresses GitHub Issue #1169 - Documentation Quality
 *
 * Usage:
 *   npm run docs:check-links
 *   node scripts/docs-link-validator.js
 *   node scripts/docs-link-validator.js --fix-suggestions
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const ROOT_DIR = path.join(__dirname, '..');

// Track results
const results = {
  filesChecked: 0,
  totalLinks: 0,
  validLinks: 0,
  brokenLinks: [],
  warnings: [],
};

/**
 * Extract markdown links from content
 * Matches: [text](./path) or [text](path) or [text](../path)
 * Skips links inside code blocks (```...```)
 */
function extractMarkdownLinks(content, filePath) {
  const links = [];

  const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
  const contentWithoutCodeBlocks = content.replace(CODE_BLOCK_PATTERN, '');

  const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while (
    (match = MARKDOWN_LINK_PATTERN.exec(contentWithoutCodeBlocks)) !== null
  ) {
    const [fullMatch, text, url] = match;

    // Skip external URLs, anchors, and images
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('#') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:')
    ) {
      continue;
    }

    // Only process relative links (starting with ./ or ../ or just a path)
    if (
      url.startsWith('./') ||
      url.startsWith('../') ||
      /^[a-zA-Z]/.test(url)
    ) {
      links.push({
        text,
        url,
        fullMatch,
        sourceFile: filePath,
      });
    }
  }

  return links;
}

/**
 * Resolve link path relative to source file
 */
function resolveLinkPath(linkUrl, sourceFilePath) {
  // Handle anchor links (file.md#section)
  const [urlPath] = linkUrl.split('#');

  if (!urlPath) {
    return null;
  }

  const sourceDir = path.dirname(sourceFilePath);
  return path.resolve(sourceDir, urlPath);
}

/**
 * Check if a file exists
 */
function checkFileExists(targetPath) {
  // Check exact path
  if (fs.existsSync(targetPath)) {
    return { exists: true, path: targetPath };
  }

  // Check with .md extension if not already present
  if (!targetPath.endsWith('.md')) {
    const mdPath = `${targetPath}.md`;
    if (fs.existsSync(mdPath)) {
      return { exists: true, path: mdPath };
    }
  }

  // Check as directory with README.md
  const readmePath = path.join(targetPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    return { exists: true, path: readmePath, isDirectory: true };
  }

  return { exists: false, path: targetPath };
}

/**
 * Validate all links in a single markdown file
 */
function validateFileLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const links = extractMarkdownLinks(content, filePath);
  const fileResult = {
    file: path.relative(ROOT_DIR, filePath),
    links: [],
    brokenCount: 0,
  };

  for (const link of links) {
    results.totalLinks++;
    const targetPath = resolveLinkPath(link.url, filePath);

    if (!targetPath) {
      continue; // Skip anchor-only links
    }

    const check = checkFileExists(targetPath);

    if (check.exists) {
      results.validLinks++;
      fileResult.links.push({
        text: link.text,
        url: link.url,
        status: 'valid',
        resolvedPath: path.relative(ROOT_DIR, check.path),
      });
    } else {
      results.brokenLinks.push({
        sourceFile: path.relative(ROOT_DIR, filePath),
        linkText: link.text,
        linkUrl: link.url,
        targetPath: path.relative(ROOT_DIR, check.path),
      });
      fileResult.brokenCount++;
      fileResult.links.push({
        text: link.text,
        url: link.url,
        status: 'broken',
        targetPath: path.relative(ROOT_DIR, check.path),
      });
    }
  }

  return fileResult;
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...findMarkdownFiles(fullPath));
      }
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Print summary report
 */
function printReport() {
  console.log();
  log('cyan', '========================================');
  log('cyan', 'Documentation Link Validation Report');
  log('cyan', '========================================');
  console.log();

  log('blue', `Files checked:    ${results.filesChecked}`);
  log('blue', `Total links:      ${results.totalLinks}`);
  log('green', `Valid links:      ${results.validLinks}`);

  if (results.brokenLinks.length > 0) {
    log('red', `Broken links:     ${results.brokenLinks.length}`);
    console.log();
    log('red', '--- Broken Links ---');
    console.log();

    for (const broken of results.brokenLinks) {
      log('yellow', `  Source: ${broken.sourceFile}`);
      log('red', `    Link: [${broken.linkText}](${broken.linkUrl})`);
      log('red', `    Target not found: ${broken.targetPath}`);
      console.log();
    }
  }

  if (results.warnings.length > 0) {
    log('yellow', `Warnings:         ${results.warnings.length}`);
    for (const warning of results.warnings) {
      log('yellow', `  ⚠ ${warning}`);
    }
    console.log();
  }

  console.log();
  log('cyan', '========================================');

  if (results.brokenLinks.length === 0) {
    log('green', '✅ All documentation links are valid!');
    return 0;
  } else {
    log('red', `❌ Found ${results.brokenLinks.length} broken link(s)`);
    console.log();
    log('cyan', 'Suggestions:');
    log('blue', '  1. Check if the target file exists');
    log('blue', '  2. Verify the relative path is correct');
    log('blue', '  3. Update the link or create the missing file');
    return 1;
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const showFixSuggestions = args.includes('--fix-suggestions');

  console.log();
  log('cyan', '🔍 Scanning documentation for broken links...');
  console.log();

  // Find all markdown files
  const docsFiles = findMarkdownFiles(DOCS_DIR);

  // Also check README.md and CONTRIBUTING.md in root
  const rootFiles = ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md']
    .map((f) => path.join(ROOT_DIR, f))
    .filter((f) => fs.existsSync(f));

  const allFiles = [...docsFiles, ...rootFiles];
  results.filesChecked = allFiles.length;

  // Validate each file
  for (const file of allFiles) {
    const fileResult = validateFileLinks(file);

    if (fileResult.brokenCount > 0) {
      log('yellow', `⚠ ${fileResult.file} (${fileResult.brokenCount} broken)`);
    } else if (fileResult.links.length > 0) {
      log('green', `✓ ${fileResult.file} (${fileResult.links.length} links)`);
    }
  }

  // Print report
  const exitCode = printReport();

  process.exit(exitCode);
}

main();

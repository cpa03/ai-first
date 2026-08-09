#!/usr/bin/env node
/**
 * Patches @opennextjs/aws to handle missing CSS directory
 *
 * Issue: OpenNext Cloudflare adapter assumes .next/standalone/.next/static/css
 * always exists, but Next.js App Router without explicit CSS files doesn't create it.
 *
 * This script adds an existsSync check before copying the CSS directory.
 * Run automatically via postinstall hook.
 *
 * @see https://github.com/opennextjs/opennextjs-aws/issues/xxx
 */

const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(
  __dirname,
  '..',
  'node_modules',
  '@opennextjs',
  'aws',
  'dist',
  'build',
  'copyTracedFiles.js'
);

const OLD_CODE =
  'cpSync(path.join(standaloneNextDir, "static", "css"), path.join(outputNextDir, "static", "css"), { recursive: true });';

const NEW_CODE =
  'if (existsSync(path.join(standaloneNextDir, "static", "css"))) { cpSync(path.join(standaloneNextDir, "static", "css"), path.join(outputNextDir, "static", "css"), { recursive: true }); }';

function patchFile() {
  if (!fs.existsSync(TARGET_FILE)) {
    // File doesn't exist yet (fresh install), skip silently
    return;
  }

  const content = fs.readFileSync(TARGET_FILE, 'utf8');

  if (
    content.includes('existsSync(path.join(standaloneNextDir, "static", "css")')
  ) {
    // Already patched
    return;
  }

  if (content.includes(OLD_CODE)) {
    const patched = content.replace(OLD_CODE, NEW_CODE);
    fs.writeFileSync(TARGET_FILE, patched, 'utf8');
    console.log('✅ Patched @opennextjs/aws for missing CSS directory');
  }
}

patchFile();

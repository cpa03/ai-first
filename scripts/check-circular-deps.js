#!/usr/bin/env node

/**
 * Circular Dependency Checker
 *
 * This script uses madge to detect circular dependencies in the codebase.
 * It addresses Issue #821: Missing static analysis for circular dependencies.
 *
 * Usage:
 *   node scripts/check-circular-deps.js
 *   npm run check:circular
 *
 * Exit codes:
 *   0 - No circular dependencies found
 *   1 - Circular dependencies detected
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('🔍 Checking for circular dependencies...\n');

try {
  // Run madge with circular dependency detection
  // --circular: detect circular dependencies
  // --extensions ts,tsx: TypeScript files
  // --warning: show warnings for potential issues
  const result = execSync(
    `npx madge --circular --extensions ts,tsx "${SRC_DIR}"`,
    {
      encoding: 'utf-8',
      cwd: ROOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  );

  // If we get here with output, check if it contains circular deps
  const output = result.trim();

  if (output === '' || output.includes('No circular dependencies found')) {
    console.log('✅ No circular dependencies found!\n');
    process.exit(0);
  }

  // Output contains circular dependencies
  console.log('❌ Circular dependencies detected:\n');
  console.log(output);
  console.log('\n💡 Tips to resolve circular dependencies:');
  console.log('   1. Use dynamic imports: await import("@/lib/module")');
  console.log('   2. Extract shared types to a separate file');
  console.log('   3. Use dependency injection patterns');
  console.log('   4. Reorganize module structure\n');

  process.exit(1);
} catch (error) {
  // madge exits with code 1 when circular deps are found
  const output = error.stdout?.trim() || '';

  if (output && !output.includes('No circular dependencies found')) {
    console.log('❌ Circular dependencies detected:\n');
    console.log(output);
    console.log('\n💡 Tips to resolve circular dependencies:');
    console.log('   1. Use dynamic imports: await import("@/lib/module")');
    console.log('   2. Extract shared types to a separate file');
    console.log('   3. Use dependency injection patterns');
    console.log('   4. Reorganize module structure\n');
    process.exit(1);
  }

  // Check if it's a real error
  if (error.stderr?.includes('Error') && !error.stderr.includes('circular')) {
    console.error('❌ Error running madge:', error.stderr);
    process.exit(1);
  }

  // No circular deps but madge exited with 1 for some other reason
  console.log('✅ No circular dependencies found!\n');
  process.exit(0);
}

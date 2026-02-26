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
  // --ts-config: use TypeScript config to resolve path aliases (@/...)
  const result = execSync(
    `npx madge --circular --extensions ts,tsx --ts-config tsconfig.json "${SRC_DIR}"`,
    {
      encoding: 'utf-8',
      cwd: ROOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  );

  // If we get here with output, check if it contains circular deps
  const output = result.trim();

  // Check for actual circular dependencies in the output
  // The output "No circular dependency found!" or empty means success
  if (
    output === '' ||
    output.includes('No circular dependency found') ||
    output.includes('No circular dependencies found')
  ) {
    console.log('✅ No circular dependencies found!\n');
    process.exit(0);
  }

  // Check if the output actually contains circular dependency chains
  // Circular deps are shown with arrows (>) or "Circular dependency found" message
  const hasCircularDeps =
    output.includes('>') || output.includes('Circular dependency found');

  if (!hasCircularDeps) {
    // No actual circular deps - just warnings or other output
    console.log('✅ No circular dependencies found!');

    // Extract and show warnings if any
    const warningMatch = output.match(/\((\d+) warnings?\)/);
    if (warningMatch) {
      console.log(
        `\n⚠️  ${warningMatch[1]} parse warnings detected (not errors)`
      );
      console.log(
        '   These are from external packages (react, next, openai, etc.) and are expected'
      );
    }
    console.log('');
    process.exit(0);
  }

  // Output contains actual circular dependencies
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
  const stderr = error.stderr?.trim() || '';

  // Check if there are actual circular dependencies
  const hasCircularDeps =
    output.includes('>') || output.includes('Circular dependency found');

  if (hasCircularDeps) {
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
  if (stderr.includes('Error') && !stderr.includes('circular')) {
    console.error('❌ Error running madge:', stderr);
    process.exit(1);
  }

  // No circular deps - just warnings or other output
  console.log('✅ No circular dependencies found!');

  // Extract and show warnings if any
  const warningMatch = output.match(/\((\d+) warnings?\)/);
  if (warningMatch) {
    console.log(
      `\n⚠️  ${warningMatch[1]} parse warnings detected (not errors)`
    );
    console.log(
      '   These are from external packages (react, next, openai, etc.) and are expected'
    );
  }
  console.log('');
  process.exit(0);
}

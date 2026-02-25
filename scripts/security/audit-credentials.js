#!/usr/bin/env node

/**
 * Security Audit Script
 *
 * Detects potential exposure of sensitive credentials including:
 * - SUPABASE_SERVICE_ROLE_KEY in client bundles
 * - NEXT_PUBLIC_ prefix on sensitive keys
 * - .env files committed to git
 * - Hardcoded credentials in source code
 *
 * Exit codes:
 * 0 = No issues found
 * 1 = Critical security issues detected
 * 2 = Warnings found (non-critical)
 *
 * @module scripts/security/audit-credentials
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Sensitive keys that must NEVER be public
  SENSITIVE_KEYS: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'NOTION_API_KEY',
    'TRELLO_API_KEY',
    'TRELLO_TOKEN',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_TOKEN',
  ],

  // Keys that should NEVER have NEXT_PUBLIC_ prefix
  MUST_BE_PRIVATE: ['SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_API_KEY'],

  // Directories to scan
  SCAN_DIRS: ['src', 'app', 'components', 'lib', 'hooks'],

  // File extensions to check
  EXTENSIONS: [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.env',
    '.env.local',
    '.env.production',
  ],

  // Build output directories to check for key exposure
  BUILD_DIRS: ['.next', 'dist', 'build'],
};

// ANSI color codes
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

// Results tracking
const results = {
  critical: [],
  warnings: [],
  info: [],
};

/**
 * Log a message with color
 */
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

/**
 * Add a critical issue
 */
function addCritical(message, file = null, line = null) {
  const location = file ? `${file}${line ? `:${line}` : ''}` : '';
  results.critical.push({ message, location, severity: 'CRITICAL' });
  log(`❌ CRITICAL: ${message}${location ? ` at ${location}` : ''}`, 'red');
}

/**
 * Add a warning
 */
function addWarning(message, file = null, line = null) {
  const location = file ? `${file}${line ? `:${line}` : ''}` : '';
  results.warnings.push({ message, location, severity: 'WARNING' });
  log(`⚠️  WARNING: ${message}${location ? ` at ${location}` : ''}`, 'yellow');
}

/**
 * Add info message
 */
function addInfo(message) {
  results.info.push({ message, severity: 'INFO' });
  log(`ℹ️  INFO: ${message}`, 'blue');
}

/**
 * Check if .env files are in git
 */
function checkEnvFilesInGit() {
  try {
    const output = execSync('git ls-files | grep -E "^\\.env" || true', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    if (output.trim()) {
      const files = output
        .trim()
        .split('\n')
        .filter((f) => f);
      addCritical(
        `.env files detected in git repository: ${files.join(', ')}. ` +
          `Environment files must NEVER be committed to version control.`
      );
    } else {
      addInfo('No .env files found in git - good!');
    }
  } catch (error) {
    addWarning('Could not check for .env files in git');
  }
}

/**
 * Check for hardcoded credentials in source files
 */
function checkHardcodedCredentials() {
  const sensitivePatterns = [
    {
      pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']{10,}["']/g,
      key: 'SUPABASE_SERVICE_ROLE_KEY',
    },
    { pattern: /sk-[a-zA-Z0-9]{20,}/g, key: 'OpenAI API Key' },
    { pattern: /sk-ant-[a-zA-Z0-9]{20,}/g, key: 'Anthropic API Key' },
    {
      pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
      key: 'JWT Token',
    },
  ];

  let filesChecked = 0;

  CONFIG.SCAN_DIRS.forEach((dir) => {
    const dirPath = path.join(process.cwd(), 'src', dir);
    if (!fs.existsSync(dirPath)) return;

    const files = getAllFiles(dirPath, CONFIG.EXTENSIONS);

    files.forEach((file) => {
      filesChecked++;
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(process.cwd(), file);

      sensitivePatterns.forEach(({ pattern, key }) => {
        const matches = content.match(pattern);
        if (matches) {
          // Skip test files with mock keys
          if (
            file.includes('.test.') ||
            file.includes('.spec.') ||
            file.includes('__tests__')
          ) {
            if (matches[0].includes('test') || matches[0].includes('mock')) {
              return;
            }
          }

          // Skip example/template files
          if (file.includes('.example') || file.includes('template')) {
            return;
          }

          addCritical(`Potential hardcoded ${key} detected`, relativePath);
        }
      });
    });
  });

  addInfo(`Checked ${filesChecked} source files for hardcoded credentials`);
}

/**
 * Check environment configuration files
 */
function checkEnvConfiguration() {
  const envExamplePath = path.join(process.cwd(), 'config', '.env.example');

  if (!fs.existsSync(envExamplePath)) {
    addWarning('config/.env.example not found');
    return;
  }

  const content = fs.readFileSync(envExamplePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for NEXT_PUBLIC_ prefix on sensitive keys
    CONFIG.MUST_BE_PRIVATE.forEach((key) => {
      if (line.includes(`NEXT_PUBLIC_${key}`)) {
        addCritical(
          `${key} must NOT have NEXT_PUBLIC_ prefix - this would expose it to client bundles`,
          'config/.env.example',
          index + 1
        );
      }
    });
  });

  // Verify all sensitive keys are documented
  CONFIG.SENSITIVE_KEYS.forEach((key) => {
    if (!content.includes(key)) {
      addWarning(`${key} not documented in config/.env.example`);
    }
  });

  addInfo('Environment configuration validation complete');
}

/**
 * Check build output for credential exposure
 */
function checkBuildOutput() {
  let buildDir = null;

  for (const dir of CONFIG.BUILD_DIRS) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      buildDir = dirPath;
      break;
    }
  }

  if (!buildDir) {
    addInfo('No build output found - skipping bundle analysis');
    return;
  }

  addInfo(`Analyzing build output in ${path.basename(buildDir)}...`);

  // Get all JS files in build output
  const jsFiles = getAllFiles(buildDir, ['.js', '.js.map']);
  let filesChecked = 0;

  jsFiles.forEach((file) => {
    filesChecked++;
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(process.cwd(), file);

    // Check for service role key patterns in bundles
    CONFIG.MUST_BE_PRIVATE.forEach((key) => {
      // Look for the key name in the bundle
      if (content.includes(key)) {
        addCritical(
          `Sensitive key "${key}" found in build output - may be exposed to client`,
          relativePath
        );
      }

      // Look for the key value pattern (heuristic)
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        // Check for service role key format (eyJ... JWT pattern)
        const jwtPattern = /eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}/g;
        if (jwtPattern.test(content)) {
          addCritical(
            'Potential JWT token (possibly Supabase service key) found in build output',
            relativePath
          );
        }
      }
    });
  });

  addInfo(`Analyzed ${filesChecked} build output files`);
}

/**
 * Check source code for security best practices
 */
function checkSecurityPatterns() {
  const securityChecks = [
    {
      pattern: /process\.env\.SUPABASE_SERVICE_ROLE_KEY(?!\s*\|\|)/g,
      message: 'SUPABASE_SERVICE_ROLE_KEY should have fallback or validation',
      severity: 'warning',
    },
    {
      pattern: /typeof window[^}]*getSupabaseAdmin|getSupabase.*typeof window/g,
      message: 'Good: Runtime browser check detected for admin client',
      severity: 'info',
      positive: true,
    },
  ];

  let filesChecked = 0;

  CONFIG.SCAN_DIRS.forEach((dir) => {
    const dirPath = path.join(process.cwd(), 'src', dir);
    if (!fs.existsSync(dirPath)) return;

    const files = getAllFiles(dirPath, ['.ts', '.tsx']);

    files.forEach((file) => {
      filesChecked++;
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(process.cwd(), file);

      securityChecks.forEach(({ pattern, message, severity, positive }) => {
        if (pattern.test(content)) {
          if (positive) {
            addInfo(message);
          } else if (severity === 'critical') {
            addCritical(message, relativePath);
          } else {
            addWarning(message, relativePath);
          }
        }
      });
    });
  });

  addInfo(`Checked ${filesChecked} files for security patterns`);
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, extensions) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        item !== 'node_modules' &&
        !item.startsWith('.')
      ) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    });
  }

  traverse(dir);
  return files;
}

/**
 * Generate summary report
 */
function generateReport() {
  log('\n' + '='.repeat(70), 'bold');
  log('SECURITY AUDIT REPORT', 'bold');
  log('='.repeat(70), 'bold');

  log(
    `\n${COLORS.red}Critical Issues: ${results.critical.length}${COLORS.reset}`
  );
  if (results.critical.length > 0) {
    results.critical.forEach((issue) => {
      log(`  ❌ ${issue.message}`, 'red');
      if (issue.location) {
        log(`     Location: ${issue.location}`, 'red');
      }
    });
  } else {
    log('  ✅ No critical issues found', 'green');
  }

  log(`\n${COLORS.yellow}Warnings: ${results.warnings.length}${COLORS.reset}`);
  if (results.warnings.length > 0) {
    results.warnings.forEach((issue) => {
      log(`  ⚠️  ${issue.message}`, 'yellow');
      if (issue.location) {
        log(`     Location: ${issue.location}`, 'yellow');
      }
    });
  } else {
    log('  ✅ No warnings', 'green');
  }

  log(`\n${COLORS.blue}Info Messages: ${results.info.length}${COLORS.reset}`);
  results.info.forEach((issue) => {
    log(`  ℹ️  ${issue.message}`, 'blue');
  });

  log('\n' + '='.repeat(70), 'bold');

  // Determine exit code
  if (results.critical.length > 0) {
    log('\n❌ AUDIT FAILED: Critical security issues detected!', 'red');
    log('   Fix these issues immediately before deploying.', 'red');
    return 1;
  } else if (results.warnings.length > 0) {
    log('\n⚠️  AUDIT PASSED WITH WARNINGS', 'yellow');
    log('   Review warnings and address them when possible.', 'yellow');
    return 2;
  } else {
    log('\n✅ AUDIT PASSED: No security issues detected!', 'green');
    return 0;
  }
}

/**
 * Main execution
 */
function main() {
  log('\n🔒 Starting Security Audit...', 'bold');
  log(
    'Checking for credential exposure and security misconfigurations\n',
    'blue'
  );

  // Run all checks
  checkEnvFilesInGit();
  checkHardcodedCredentials();
  checkEnvConfiguration();
  checkBuildOutput();
  checkSecurityPatterns();

  // Generate report and exit
  const exitCode = generateReport();

  log('\n📚 For more information, see:', 'blue');
  log('   - SECURITY.md', 'blue');
  log('   - docs/security.md', 'blue');
  log('   - config/.env.example\n', 'blue');

  process.exit(exitCode);
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  checkEnvFilesInGit,
  checkHardcodedCredentials,
  checkEnvConfiguration,
  checkBuildOutput,
  checkSecurityPatterns,
  CONFIG,
};

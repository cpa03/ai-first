#!/usr/bin/env node

/**
 * Setup Script for IdeaFlow
 *
 * This script helps new developers set up their environment quickly.
 * It copies the .env.example file to .env.local and provides guidance.
 *
 * Usage: npm run setup
 */

const fs = require('fs');
const path = require('path');

const ENV_EXAMPLE = path.join(__dirname, '..', 'config', '.env.example');
const ENV_LOCAL = path.join(__dirname, '..', '.env.local');

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

function printNextSteps(existingConfig = false) {
  console.log();
  log('cyan', 'Next steps:');
  if (existingConfig) {
    log('green', '  1. Verify your .env.local configuration');
    log('green', '  2. Run: npm run env:check');
    log('green', '  3. Start developing: npm run dev');
  } else {
    log('green', '  1. Edit .env.local with your credentials:');
    log('blue', '     nano .env.local');
    console.log();
    log('green', '  2. Validate your configuration:');
    log('blue', '     npm run env:check');
    console.log();
    log('green', '  3. Start developing:');
    log('blue', '     npm run dev');
    console.log();
    log('cyan', '📚 Documentation:');
    log('blue', '   - Environment setup: docs/environment-setup.md');
    log('blue', '   - Contributing guide: CONTRIBUTING.md');
  }
  console.log();
}

function printRequiredConfig() {
  log('cyan', '📝 Required Configuration:');
  console.log();
  log('yellow', '   1. Supabase Configuration (REQUIRED):');
  log('blue', '      - NEXT_PUBLIC_SUPABASE_URL');
  log('blue', '      - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  log('blue', '      - SUPABASE_SERVICE_ROLE_KEY');
  console.log();
  log('yellow', '   2. AI Provider (at least one REQUIRED):');
  log('blue', '      - OPENAI_API_KEY');
  log('blue', '      - ANTHROPIC_API_KEY');
  console.log();
  log('yellow', '   3. Application Configuration (REQUIRED):');
  log('blue', '      - COST_LIMIT_DAILY');
  log('blue', '      - NEXT_PUBLIC_APP_URL');
  console.log();
}

function handleExistingConfig() {
  log('yellow', '⚠️  .env.local already exists');
  log('blue', '   Your existing configuration will be preserved.');
  printNextSteps(true);
}

function createEnvFile() {
  try {
    fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
    log('green', '✅ Created .env.local from config/.env.example');
    console.log();
    printRequiredConfig();
    printNextSteps(false);
  } catch (error) {
    log('red', `❌ Error creating .env.local: ${error.message}`);
    process.exit(1);
  }
}

function validateExampleExists() {
  if (!fs.existsSync(ENV_EXAMPLE)) {
    log('red', '❌ Error: config/.env.example not found');
    process.exit(1);
  }
}

function main() {
  console.log();
  log('cyan', '🚀 IdeaFlow Setup Script');
  log('cyan', '========================');
  console.log();

  validateExampleExists();

  if (fs.existsSync(ENV_LOCAL)) {
    handleExistingConfig();
    return;
  }

  createEnvFile();
}

main();

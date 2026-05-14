#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const NAMING_PATTERN = /^[0-9]{8}_[a-z0-9_]+\.sql$/;
const DOWN_MIGRATION_PATTERN = /\.down\.sql$/;

function validateMigrationNaming() {
  console.log('🔍 Validating migration naming conventions...\n');

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'));
  const errors = [];
  const warnings = [];
  const migrationsByDate = {};

  files.forEach((file) => {
    const isDownMigration = DOWN_MIGRATION_PATTERN.test(file);
    const baseName = isDownMigration ? file.replace('.down.sql', '.sql') : file;

    if (!NAMING_PATTERN.test(baseName)) {
      if (!/^[0-9]{3}_[a-z0-9_]+\.sql$/.test(baseName)) {
        errors.push(
          `Invalid naming format: ${file} (expected: YYYYMMDD_description.sql)`
        );
      }
    }

    const dateMatch = baseName.match(/^([0-9]{8})_/);
    if (dateMatch) {
      const date = dateMatch[1];
      if (!migrationsByDate[date]) {
        migrationsByDate[date] = [];
      }
      migrationsByDate[date].push(file);
    }
  });

  Object.entries(migrationsByDate).forEach(([date, dayFiles]) => {
    if (dayFiles.length > 3) {
      warnings.push(
        `${date}: ${dayFiles.length} migrations - consider consolidation (${dayFiles.join(', ')})`
      );
    }
  });

  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach((e) => console.log(`  - ${e}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (Consolidation Candidates):');
    warnings.forEach((w) => console.log(`  - ${w}`));
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All migrations follow naming conventions!');
  } else if (errors.length === 0) {
    console.log(`✅ Naming valid (${warnings.length} consolidation warnings)`);
  }

  console.log(`\n📊 Summary: ${files.length} migration files checked`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\n💡 Run with --fix to see consolidation suggestions');
    process.exit(0);
  }
}

if (require.main === module) {
  validateMigrationNaming();
}

module.exports = { validateMigrationNaming };

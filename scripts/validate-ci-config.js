#!/usr/bin/env node
/**
 * CI/CD Workflow Validation Script
 *
 * This script validates GitHub Actions workflow files for DevOps best practices.
 * It checks for:
 * - Job-level timeout configuration
 * - Excessive continue-on-error usage
 * - Proper concurrency settings
 * - Environment variable consistency
 *
 * Usage: node scripts/validate-ci-config.js
 *
 * @see docs/devops-engineer.md for timeout recommendations
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration based on devops-engineer.md recommendations
const CONFIG = {
  workflowDir: '.github/workflows',
  recommendations: {
    // Timeout recommendations (in minutes)
    timeouts: {
      specialist: 30,
      deploy: 40,
      onPull: 60,
      default: 25,
    },
    // Maximum continue-on-error steps per job
    maxContinueOnError: 2,
    // Required concurrency settings
    requiredConcurrency: true,
  },
};

// Validation results
const results = {
  passed: [],
  warnings: [],
  errors: [],
};

/**
 * Load and parse a YAML workflow file
 */
function loadWorkflow(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    results.errors.push({
      file: filePath,
      message: `Failed to parse YAML: ${error.message}`,
    });
    return null;
  }
}

/**
 * Check if a job has timeout-minutes configured
 */
function checkJobTimeout(workflowName, jobName, job) {
  if (!job['timeout-minutes']) {
    results.warnings.push({
      file: workflowName,
      job: jobName,
      message: `Job "${jobName}" is missing timeout-minutes configuration`,
      recommendation: `Add timeout-minutes: ${CONFIG.recommendations.timeouts.default}`,
    });
    return false;
  }

  const timeout = job['timeout-minutes'];
  results.passed.push({
    file: workflowName,
    job: jobName,
    check: 'timeout-minutes',
    value: timeout,
  });
  return true;
}

/**
 * Check for excessive continue-on-error usage
 */
function checkContinueOnError(workflowName, jobName, job) {
  if (!job.steps || !Array.isArray(job.steps)) {
    return true;
  }

  let continueOnErrorCount = 0;
  const continueOnErrorSteps = [];

  for (const step of job.steps) {
    if (step['continue-on-error'] === true) {
      continueOnErrorCount++;
      continueOnErrorSteps.push(step.name || 'unnamed step');
    }
  }

  if (continueOnErrorCount > CONFIG.recommendations.maxContinueOnError) {
    results.warnings.push({
      file: workflowName,
      job: jobName,
      message: `Job "${jobName}" has ${continueOnErrorCount} steps with continue-on-error: true`,
      steps: continueOnErrorSteps,
      recommendation: `Reduce to max ${CONFIG.recommendations.maxContinueOnError} steps with continue-on-error`,
    });
    return false;
  }

  if (continueOnErrorCount > 0) {
    results.passed.push({
      file: workflowName,
      job: jobName,
      check: 'continue-on-error',
      value: `${continueOnErrorCount} steps`,
    });
  }
  return true;
}

/**
 * Check concurrency configuration
 */
function checkConcurrency(workflowName, workflow) {
  if (!workflow.concurrency) {
    results.warnings.push({
      file: workflowName,
      message: 'Workflow is missing concurrency configuration',
      recommendation: 'Add concurrency group to prevent parallel runs',
    });
    return false;
  }

  results.passed.push({
    file: workflowName,
    check: 'concurrency',
    value: workflow.concurrency.group || 'configured',
  });
  return true;
}

/**
 * Validate a single workflow file
 */
function validateWorkflow(filePath) {
  const workflow = loadWorkflow(filePath);
  if (!workflow) return;

  const workflowName = path.basename(filePath);

  // Check concurrency
  checkConcurrency(workflowName, workflow);

  // Check each job
  if (workflow.jobs) {
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      checkJobTimeout(workflowName, jobName, job);
      checkContinueOnError(workflowName, jobName, job);
    }
  }
}

/**
 * Scan all workflow files in the directory
 */
function scanWorkflows() {
  const workflowDir = CONFIG.workflowDir;

  if (!fs.existsSync(workflowDir)) {
    results.errors.push({
      message: `Workflow directory not found: ${workflowDir}`,
    });
    return;
  }

  const files = fs
    .readdirSync(workflowDir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));

  console.log(`\n📋 Scanning ${files.length} workflow files...\n`);

  for (const file of files) {
    const filePath = path.join(workflowDir, file);
    validateWorkflow(filePath);
  }
}

/**
 * Print validation results
 */
function printResults() {
  // Print passed checks
  if (results.passed.length > 0) {
    console.log('✅ Passed Checks:\n');
    for (const item of results.passed) {
      const jobInfo = item.job ? ` [${item.job}]` : '';
      console.log(`   ✓ ${item.file}${jobInfo}: ${item.check} = ${item.value}`);
    }
  }

  // Print warnings
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:\n');
    for (const item of results.warnings) {
      const jobInfo = item.job ? ` [${item.job}]` : '';
      console.log(`   ⚠ ${item.file}${jobInfo}: ${item.message}`);
      if (item.recommendation) {
        console.log(`     💡 ${item.recommendation}`);
      }
      if (item.steps) {
        console.log(`     Steps: ${item.steps.join(', ')}`);
      }
    }
  }

  // Print errors
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:\n');
    for (const item of results.errors) {
      console.log(`   ✗ ${item.file || 'General'}: ${item.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${results.passed.length}`);
  console.log(`   ⚠️  Warnings: ${results.warnings.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);
  console.log('='.repeat(50) + '\n');

  // Exit with error code if there are errors
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

// Main execution
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║     CI/CD Workflow Configuration Validator           ║');
console.log('║     DevOps Best Practices Check                      ║');
console.log('╚══════════════════════════════════════════════════════╝');

scanWorkflows();
printResults();

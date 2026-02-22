#!/usr/bin/env node

/**
 * User Story Validation Script
 *
 * Validates user story markdown files against the User Story Engineer best practices.
 * Checks for required sections, format compliance, and INVEST criteria hints.
 *
 * Usage: npm run user-stories:validate
 *
 * @see docs/user-story-engineer.md for best practices
 * @see docs/templates/user-story_template.md for template reference
 */

const fs = require('fs');
const path = require('path');


const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};


const REQUIRED_SECTIONS = [
  { name: 'Story Metadata', pattern: /^##\s+Story\s+Metadata/im },
  { name: 'User Story', pattern: /^##\s+User\s+Story$/im },
  { name: 'Acceptance Criteria', pattern: /^##\s+Acceptance\s+Criteria/im },
  {
    name: 'Technical Requirements',
    pattern: /^##\s+Technical\s+Requirements/im,
  },
  { name: 'Dependencies', pattern: /^##\s+Dependencies/im },
  { name: 'Definition of Done', pattern: /^##\s+Definition\s+of\s+Done/im },
];


const RECOMMENDED_SECTIONS = [
  { name: 'Resources', pattern: /^##\s+Resources$/im },
  { name: 'Implementation Notes', pattern: /^##\s+Implementation\s+Notes/im },
  { name: 'History', pattern: /^##\s+History$/im },
];


const USER_STORY_FORMAT =
  /^```\s*\nAs\s+(?:an?\s+)?(.+?),?\s*I\s+want\s+(.+?),?\s*(?:So\s+that|In\s+order\s+to)\s+(.+)\n```$/im;


const PRIORITY_PATTERN = /\*\*Priority\*\*:\s*(P[0-3])/i;


const STORY_POINTS_PATTERN = /\*\*Story\s+Points\*\*:\s*(\d+|\?)/i;


const STORY_ID_PATTERN = /\*\*Story\s+ID\*\*:\s*(US-[A-Z]+-\d+)/i;

/**
 * Validates a single user story file
 * @param {string} filePath - Path to the user story markdown file
 * @returns {Object} Validation result with errors and warnings
 */
function validateUserStory(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = {
    file: path.relative(process.cwd(), filePath),
    errors: [],
    warnings: [],
    info: [],
    hasUserStoryFormat: false,
    extractedData: {},
  };


  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(content)) {
      result.errors.push(`Missing required section: ${section.name}`);
    }
  }


  for (const section of RECOMMENDED_SECTIONS) {
    if (!section.pattern.test(content)) {
      result.warnings.push(`Missing recommended section: ${section.name}`);
    }
  }


  const storyMatch = content.match(USER_STORY_FORMAT);
  if (storyMatch) {
    result.hasUserStoryFormat = true;
    result.extractedData.persona = storyMatch[1].trim();
    result.extractedData.goal = storyMatch[2].trim();
    result.extractedData.benefit = storyMatch[3].trim();


    const persona = result.extractedData.persona.toLowerCase();
    if (persona === 'user' || persona === 'a user') {
      result.warnings.push(
        'Using generic "user" persona. Consider using a specific persona (e.g., "startup founder", "developer")'
      );
    }
  } else {
    result.errors.push(
      'User story does not follow standard format: "As a [persona], I want [goal], So that [benefit]"'
    );
  }


  const priorityMatch = content.match(PRIORITY_PATTERN);
  if (priorityMatch) {
    result.extractedData.priority = priorityMatch[1];
  } else {
    result.warnings.push('Missing priority label (P0/P1/P2/P3)');
  }

  const pointsMatch = content.match(STORY_POINTS_PATTERN);
  if (pointsMatch) {
    result.extractedData.storyPoints = pointsMatch[1];
  } else {
    result.warnings.push('Missing story points estimate');
  }

  const idMatch = content.match(STORY_ID_PATTERN);
  if (idMatch) {
    result.extractedData.storyId = idMatch[1];
  } else {
    result.warnings.push('Missing story ID (e.g., US-AUTH-001)');
  }


  if (
    result.extractedData.storyPoints &&
    parseInt(result.extractedData.storyPoints) > 8
  ) {
    result.info.push(
      'Story points > 8 suggests this may need decomposition (INVEST: Small)'
    );
  }

  return result;
}

/**
 * Recursively finds all user story markdown files
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function findUserStoryFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.match(/^us-[a-z]+-\d+-[a-z-]+\.md$/i)
      ) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.cyan}🔍 Validating user stories...${colors.reset}\n`);

  const storiesDir = path.join(process.cwd(), 'docs', 'user-stories');

  if (!fs.existsSync(storiesDir)) {
    console.error(
      `${colors.red}Error: User stories directory not found: ${storiesDir}${colors.reset}`
    );
    process.exit(1);
  }

  const storyFiles = findUserStoryFiles(storiesDir);

  if (storyFiles.length === 0) {
    console.log(`${colors.yellow}No user story files found.${colors.reset}`);
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const file of storyFiles) {
    const result = validateUserStory(file);
    results.push(result);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }


  for (const result of results) {
    const status =
      result.errors.length === 0
        ? `${colors.green}✓${colors.reset}`
        : `${colors.red}✗${colors.reset}`;

    console.log(`${status} ${colors.dim}${result.file}${colors.reset}`);

    if (result.extractedData.storyId) {
      console.log(
        `  ${colors.blue}ID:${colors.reset} ${result.extractedData.storyId} ${colors.blue}Priority:${colors.reset} ${result.extractedData.priority || 'N/A'} ${colors.blue}Points:${colors.reset} ${result.extractedData.storyPoints || 'N/A'}`
      );
    }

    for (const error of result.errors) {
      console.log(`  ${colors.red}✗ Error: ${error}${colors.reset}`);
    }

    for (const warning of result.warnings) {
      console.log(`  ${colors.yellow}⚠ Warning: ${warning}${colors.reset}`);
    }

    for (const info of result.info) {
      console.log(`  ${colors.blue}ℹ Info: ${info}${colors.reset}`);
    }

    console.log('');
  }


  console.log(
    `${colors.cyan}========================================${colors.reset}`
  );
  console.log(`${colors.cyan}User Story Validation Report${colors.reset}`);
  console.log(
    `${colors.cyan}========================================${colors.reset}\n`
  );

  console.log(
    `${colors.blue}Files checked:${colors.reset}    ${storyFiles.length}`
  );
  console.log(
    `${colors.green}Valid stories:${colors.reset}    ${results.filter((r) => r.errors.length === 0).length}`
  );
  console.log(`${colors.red}Errors:${colors.reset}           ${totalErrors}`);
  console.log(
    `${colors.yellow}Warnings:${colors.reset}         ${totalWarnings}`
  );

  console.log(
    `\n${colors.cyan}========================================${colors.reset}`
  );

  if (totalErrors > 0) {
    console.log(
      `${colors.red}❌ User story validation failed with ${totalErrors} error(s)${colors.reset}`
    );
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(
      `${colors.yellow}✅ User stories valid with ${totalWarnings} warning(s)${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ All user stories are valid!${colors.reset}`);
    process.exit(0);
  }
}

main();

#!/usr/bin/env node

/**
 * Agent Configuration Loader
 * Reads agents.yml and outputs configuration in a format usable by GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Path to agents.yml
const configPath = path.join(__dirname, '..', 'config', 'agents.yml');

// Read and parse the YAML file
const configFile = fs.readFileSync(configPath, 'utf8');
const config = yaml.load(configFile);

// Get agent name from command line argument
const agentName = process.argv[2];

if (!agentName) {
  // Output default settings if no agent specified
  console.log(JSON.stringify(config.defaults));
  process.exit(0);
}

// Find the agent configuration
const agent = config.agents[agentName];

if (!agent) {
  console.error(`Agent '${agentName}' not found in configuration`);
  process.exit(1);
}

// Merge agent settings with defaults
const mergedConfig = {
  ...config.defaults,
  ...agent,
  // Ensure model is always set
  model: agent.model || config.defaults.model,
  // Ensure share is always set
  share: agent.share !== undefined ? agent.share : config.defaults.share,
};

// Output as JSON for GitHub Actions
console.log(JSON.stringify(mergedConfig));

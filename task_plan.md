# Task Plan: OpenCode CLI Automation Setup

## Goal

Set up comprehensive OpenCode CLI automation with agent skills, configuration, and integration from multiple repositories.

## Current State Analysis

- Workspace: /home/runner/work/ai-first/ai-first
- Has existing `.opencode/` directory with some skills
- Has `opencode.json` (396 bytes)
- Has `.github/` directory
- Project appears to be a Next.js application

## Phase 1: Configuration Setup

- [x] 1.1 Analyze oh-my-opencode repository structure
- [x] 1.2 Fetch and analyze other repositories
  - [x] https://github.com/obra/superpowers.git - Already integrated (superpowers-\* skills exist)
  - [x] https://github.com/asgeirtj/system_prompts_leaks.git - Informational only
  - [x] https://github.com/sulhi-sabil/agent-skill/ - Already integrated (github-workflow-automation skill exists)
- [x] 1.3 Create/Update opencode.json with model configurations - EXISTING (using free-tier models)
- [x] 1.4 Create/Update .opencode/oh-my-opencode.json - EXISTING (comprehensive configuration)
- [x] 1.5 Integrate useful components from repositories - ALREADY INTEGRATED
- [x] 1.6 Setup agent skills - EXISTING (33 skills installed)
- [x] 1.7 Create missing AGENTS.md file - EXISTING (comprehensive documentation)
- [x] 1.8 Cleanup unused files - COMPLETED (removed tsconfig.tsbuildinfo)
- [x] 1.9 Self-review and optimization - COMPLETED (all configurations verified)
- [x] 1.10 Verification - PASSED (all components working)

## Phase 2: Git Operations

- [x] 2.1 Commit changes - COMPLETED (removed tsconfig.tsbuildinfo)
- [ ] 2.2 Push to agent-workspace branch
- [ ] 2.3 Create PR to main
- [ ] 2.4 Monitor checks
- [ ] 2.5 Merge on success

## Key Configuration Requirements

- Models: opencode/glm-4.7-free, opencode/kimi-k2.5-free, opencode/minimax-m2.1-free
- Agents: Sisyphus (main), Oracle, Librarian, Explore, Hephaestus
- Skills: 35 skills installed in .opencode/skills/
- No conflicts or redundancy with existing setup

## Decisions Made

- Keep existing `.opencode/skills/` if already present
- Merge configurations rather than overwrite
- Use free-tier models as specified
- tsconfig.tsbuildinfo removed (temporary build file)

## Status

**Currently in Phase 2** - Git operations and PR creation

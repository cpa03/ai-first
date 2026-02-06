# CMZ Agent External Repository Integrations

This document tracks the external repositories integrated with the CMZ (Cognitive Meta-Z) agent to maximize its potential through self-heal, self-learning, and self-evolution behaviors.

## Integrated Frameworks

### 1. oh-my-opencode

**Repository:** https://github.com/code-yeongyu/oh-my-opencode.git
**Status:** ✅ Fully Integrated
**Integration Points:**

- Sisyphus orchestration with todo continuation enforcement
- Hephaestus autonomous deep worker for goal-oriented execution
- Oracle for design and debugging tasks
- Librarian for documentation and codebase exploration
- Frontend UI/UX Engineer for visual engineering
- Explore agent for fast codebase grep
- Background tasks and parallel agent execution
- MCPs: Exa websearch, Context7 docs, GitHub grep.app
- LSP/AST support for refactoring
- Configured models: opencode/kimi-k2.5-free, opencode/glm-4.7-free, opencode/minimax-m2.1-free

### 2. Superpowers

**Repository:** https://github.com/obra/superpowers.git
**Status:** ✅ Fully Integrated
**Integration Points:**

- Systematic debugging methodology (4-phase root cause process)
- Test-driven development (RED-GREEN-REFACTOR cycle)
- Brainstorming skill for Socratic design refinement
- Writing and executing plans with detailed implementation
- Subagent-driven development with two-stage review
- Code review processes (requesting and receiving)
- Git worktrees for parallel development
- Verification before completion

### 3. AI-Agents-Public Frameworks

**Repository:** https://github.com/vasilyu1983/AI-Agents-public.git
**Status:** ✅ Integrated via Skills
**Integration Points:**

- Git commit message automation
- Shared skills for agent collaboration
- Framework-agnostic skill patterns

### 4. UltraRAG

**Repository:** https://github.com/OpenBMB/UltraRAG.git
**Status:** ✅ Referenced in CMZ Configuration
**Integration Points:**

- MCP servers integration enabled
- Knowledge retrieval capabilities
- Context enhancement for complex queries

## Supplementary Repositories

### 5. opencode-antigravity-auth

**Repository:** https://github.com/NoeFabris/opencode-antigravity-auth.git
**Status:** 📋 Available for Integration
**Purpose:** Authentication patterns for OpenCode agents

### 6. system_prompts_leaks

**Repository:** https://github.com/asgeirtj/system_prompts_leaks.git
**Status:** 📋 Reference Material
**Purpose:** Insights into system prompt engineering

## Skills Directory

The CMZ agent has access to 15+ skills from these repositories:

| Skill                         | Source                       | Purpose                     |
| ----------------------------- | ---------------------------- | --------------------------- |
| skill-builder                 | proffesor-testing-qe         | Agentic quality engineering |
| codepro-backend-standards     | claude-codepro-backend       | Backend model standards     |
| systematic-debugging          | obra/superpowers             | Structured debugging        |
| superpowers-debugging         | obra/superpowers             | Advanced debugging patterns |
| moai-adk-tool / adk-moai-tool | modu-ai                      | Tool orchestration          |
| context-memory-systems        | muratcankoylan               | Context management          |
| context-engineering-memory    | muratcankoylan               | Memory systems              |
| claude-code-debugging         | madappgang                   | Debugging strategies        |
| debugging-strategies          | madappgang                   | Advanced debugging          |
| git-commit-message            | vasilyu1983/ai-agents-public | Automated commits           |
| ai-agents-git-commit          | vasilyu1983/ai-agents-public | Git automation              |
| git-master                    | modu-ai                      | Git operations              |
| proffesor-testing-qe          | proffesor-testing-qe         | Testing standards           |

## Configuration Files

- `.opencode/agents/CMZ.json` - CMZ agent configuration with self-heal/learn/evolve
- `.opencode/oh-my-opencode.json` - oh-my-opencode orchestration config
- `.opencode/opencode.json` - Main OpenCode CLI configuration
- `.opencode/skills/` - Skill definitions directory

## Behavior Configuration

CMZ is configured with three core behavioral pillars:

### Self-Heal

- Automatic error detection and monitoring
- Root cause analysis using systematic debugging
- Recovery actions without human intervention
- Pattern learning from past failures

### Self-Learn

- Feedback integration from interactions
- Outcome analysis for continuous improvement
- Pattern recognition and replication
- Knowledge accumulation over time

### Self-Evolve

- Capability expansion through new skills
- Performance optimization (speed, accuracy, efficiency)
- Adaptation to new contexts and requirements
- Meta-improvement of the improvement process

## Delegation Rules

CMZ intelligently delegates tasks based on category:

| Task Type      | Category/Skill                              | Model                      |
| -------------- | ------------------------------------------- | -------------------------- |
| UI/Frontend    | visual-engineering, frontend-ui-ux          | opencode/glm-4.7-free      |
| Complex Logic  | ultrabrain                                  | opencode/kimi-k2.5-free    |
| Quick Tasks    | quick                                       | opencode/minimax-m2.1-free |
| Git Operations | git-master                                  | opencode/minimax-m2.1-free |
| Exploration    | codebase-explore                            | opencode/glm-4.7-free      |
| Debugging      | systematic-debugging, claude-code-debugging | opencode/kimi-k2.5-free    |
| Architecture   | ultrabrain                                  | opencode/kimi-k2.5-free    |
| Documentation  | quick                                       | opencode/minimax-m2.1-free |

## Anti-Patterns (Never Violate)

- ❌ Circular dependencies
- ❌ God classes
- ❌ Mix presentation with business logic
- ❌ Break existing functionality
- ❌ Over-engineer

## Version

CMZ v2.1.0 - Enhanced with external framework integration
Last Updated: 2026-02-06

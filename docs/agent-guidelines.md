# Agent Guidelines

This document contains the strict rules and guidelines that all AI agents must follow when operating in this repository.

## Agent Basic Rules

1. **No direct pushes to `main`** — all agent changes go through feature branch + PR. PR must include a machine-readable PR template with `agent: <name>` and `reason`.

2. **Change logging** — every commit by an agent must include `AGENT=<agent-name>` in commit message header and a short justification.

3. **Human-in-the-loop policy** — for destructive ops (removing DB columns, deleting data, changing billing), agent must create PR and label `requires-human` and not merge.

4. **Rate-limits / cost guardrails** — agents must consult `config/cost_limits.yml` before invoking paid model endpoints.

5. **Secrets** — agents cannot write secrets to logs or files. Use GitHub secrets.

6. **Testing** — every code change must run tests (unit + lint) in CI before merge.

7. **Rollback** — All deployable changes must include a rollback plan file if they alter DB schema or critical workflows.

## Agent Behavior Policy

- Agents must never deviate from these guidelines
- Agents must read `blueprint.md` before any action
- Agents must use canonical prompts from `ai/prompts/`
- Agents must create feature branches in format `agent/<agent>-YYYYMMDD-HHMM`
- Agents must open PRs with `AGENT=<agent>` in PR title
- Agents must fill machine-readable fields in PRs:
  - `agent_name:`
  - `task_id:`
  - `confidence_score:`
  - `human_review_required: true/false`
- Agents must attach changelog JSON to PR body
- Agents must run `ci.yml` automatically

## Agent Reporting Requirements

All agents must report their work, findings, and recommendations to `agent-report.md` using the specified format:

```markdown
### [AGENT NAME] Report

**Date:** YYYY-MM-DD HH:MM UTC
**Issue:** #[issue_number] - [issue_title]

#### Work Completed

- [ ] Task 1 description
- [ ] Task 2 description
- [ ] Task 3 description

#### Findings

- **Issues/Bugs Found:**
  - Description of issue 1
  - Description of issue 2
- **Optimization Opportunities:**
  - Description of opportunity 1
  - Description of opportunity 2

#### Recommendations

1. Recommendation 1
2. Recommendation 2
3. Recommendation 3

#### Next Actions

- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---
```

## Security & Safety

- Never log or store PII
- Never expose API keys or secrets
- Always validate inputs before processing
- Follow all security best practices
- Redact sensitive information in logs

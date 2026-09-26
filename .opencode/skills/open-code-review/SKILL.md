---
name: open-code-review
description: Use when running AI-powered code review, static analysis, or whole-file scanning via the OpenCodeReview (ocr) CLI. Covers diff review (workspace and git refs) and full file scan.
---

# OpenCodeReview (OCR) Integration Skill

This skill guides sub-agents in invoking the `ocr` CLI accurately for code reviews and scans.

## Preflight Assumption

> **DO NOT** re-check or verify `ocr` installation or LLM connectivity. The orchestrator kernel already passed the preflight checks before spawning this agent.

## Core Commands

### 1. Evaluator / Baseline Scan (Clean Branch)

Scan entire target files without needing a diff:

```bash
ocr scan \
  --audience agent \
  --path "<target_files>" \
  --timeout 10 \
  --exclude "<exclude_patterns>" \
  --output "<output_file>"
```

### 2. Remediator Self-Check (Workspace Diff)

Verify unstaged/staged changes made during a fix:

```bash
ocr review \
  --audience agent \
  -b "<issue_context>" \
  --timeout 10 \
  --exclude "<exclude_patterns>" \
  --output "<output_file>"
```

> **Requirement:** Ensure zero critical or high severity comments before reporting status `OK`.

### 3. PR Reviewer (Branch Diff)

Adversarial check comparing topic branch against base branch:

```bash
ocr review \
  --audience agent \
  -b "<issue_context>" \
  --from "<target_branch>" \
  --to HEAD \
  --timeout 10 \
  --exclude "<exclude_patterns>" \
  --output "<output_file>"
```

## Parsing Findings

- Severity levels: `critical` -> `CRITICAL`, `high` -> `HIGH`, `medium` -> `MEDIUM` (discard `low`).
- Categories map to domain prefixes:
  - `security` -> `SECURITY_*`
  - `bug` -> `BUG_*`
  - `performance` -> `PERF_*`
  - Other -> `QUALITY_*`

## Troubleshooting

- If `ocr` reports an LLM connectivity error, abort immediately and notify orchestrator:
  `ABORT: LLM provider unreachable (run ocr config provider)`

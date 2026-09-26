---
name: aok-gh
description: Use when the user asks to autonomously audit, evaluate, and auto-fix a GitHub repository end-to-end (AOK-GH orchestrator). Triggers include "aok", "AOK-GH", "orchestrator kernel", "autonomic orchestrator", "auto-fix repo", "audit and fix all issues", "run aok", "start aok-gh", or when asked to evaluate a codebase by weighted indicators, dispatch GitHub issues from code findings, and open remediation PRs through an iterative review loop.
---

# AOK-GH — Autonomic Orchestrator Kernel (GitHub)

Deterministic routing engine that drives a full autonomous loop: **profile → evaluate → file issues → fix on topic branches → open PRs → adversarial review → merge or freeze → hand off**.

## Division of Labor (NON-NEGOTIABLE)

| Actor                        | Writes                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **You (the kernel)**         | Orchestration text only: issue/PR titles & bodies, reviews, final report, Gherkin stories. Plus `.agent_memory/**`. |
| **You (as Repo Maintainer)** | Only the exact `git`/`gh` command set in `git-gh-laws.md`.                                                          |
| **Sub-agents**               | ALL application code changes. You never edit app code yourself.                                                     |

**Never**: `git commit`/`git push`/`gh pr create` outside the Repo Maintainer steps. **Never** force-push or commit to `{TARGET_BRANCH}`.

## The Iron Rules

1. **Preflight first.** Nothing runs before `preflight.md` passes. A failed check = exit 1 + report, zero side effects.
2. **Payload axiom.** Sub-agent stdout is NEVER scraped. Every sub-agent WRITES `.agent_memory/payloads/{agent_id}.json`. You read and validate that file.
3. **GitHub first.** Every qualifying finding becomes a GitHub issue. Every fix runs on `fix/aok-{domain}-{issue_hash}` from a freshly synced `{TARGET_BRANCH}` and is submitted as a PR.
4. **No fabricated metrics.** No stored indicator may receive a score. `N = min(7, discovered components)`; if fewer than 3 components exist, N = discovered count. Never invent indicators to hit a floor.
5. **Trust numbers, not decision strings.** If a reviewer's `decision` contradicts its own payload, trust the payload.

## Execution Workflow

Read the reference file for each phase **before** performing it. Do not work from memory.

| State   | Phase                          | Read first                   |
| ------- | ------------------------------ | ---------------------------- |
| **1.5** | Preflight Gate (10 checks)     | `reference/preflight.md`     |
| **0**   | Git Sync & Init                | `reference/fsm.md` § STATE 0 |
| **1**   | Profiling → indicators         | `reference/fsm.md` § STATE 1 |
| **2**   | Evaluation + Issue dispatch    | `reference/fsm.md` § STATE 2 |
| **3**   | Remediation / PR / review loop | `reference/fsm.md` § STATE 3 |
| **4**   | Synthesis & handoff            | `reference/fsm.md` § STATE 4 |

Supporting references (load on demand, not all at once):

- `reference/preflight.md` — the 10 preflight checks, exact commands, abort messages
- `reference/fsm.md` — the full finite state machine, including every STATE 3 branch rule (a–e)
- `reference/git-gh-laws.md` — Repo Maintainer command set: sync, branch, PR, merge gate, reclaim
- `reference/sub-agents.md` — dynamic synthesis protocol, the 4 role templates, spawn commands, failure semantics
- `reference/data-contracts.md` — strict payload schemas + a validation checklist
- `reference/indicator-domains.md` — the 7 weighted indicators, their target files, and domain taxonomy
- `reference/report-template.md` — the mandatory Markdown report shape

## Parameters (tweak per run, default shown)

```yaml
TARGET_BRANCH: main # overwritten from `gh repo view` in STATE 0
MAX_ITERATIONS: 3 # fix attempts per finding before freezing as debt
TARGET_SCORE_THRESHOLD: 90 # weighted score 0-100 an indicator must hit
MIN_INDICATORS: 7 # N = min(7, discovered components)
SERIAL_WORKERS: 1 # one active branch at a time
MAX_OPEN_ISSUES: 20 # circuit breaker (CRITICAL/HIGH exempt)
STATE_PATH: .agent_memory/orchestrator_state.json # LOCAL ONLY, never committed
PAYLOAD_DIR: .agent_memory/payloads/
EXCLUDE_FROM_SCAN: .agent_memory/**,node_modules/**,dist/**,**/*.lock,**/.git/**
GITHUB_LABELS: aok-auto-issue, aok-remediation-pr, technical-debt
```

**TTL per role** (enforce with `timeout(1)`): EVALUATE 1800s, REMEDIATE 900s, REVIEW 1800s.

## Sub-Agent Spawning (the only way work gets done)

You synthesize a purpose-built `DynamicAgentSpec` per finding — there are no pre-baked remediators. Then:

```bash
timeout {TTL} opencode run --auto "$(cat {spec_prompt})"
```

Pass target paths in `{spec_prompt}` directly — do not use `-f` for globs or comma lists (which fail with `File not found`). Sub-agents have full `read`/`glob`/`grep` tool access.

Roles: `evaluator-{domain}`, `remediator-{domain}-{hash}`, `pr-reviewer-{domain}-{hash}`, `arch-analyzer-core`.

Sub-agents that review code MUST load the `open-code-review` skill as STEP 0 and MUST NOT re-run preflight (the kernel already did it). Full templates: `reference/sub-agents.md`.

## Common Mistakes

| Mistake                                                        | Consequence                                           | Do instead                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| Scraping sub-agent stdout for the result                       | Lost result on timeout; unvalidated data enters state | Read the payload JSON file                                        |
| Committing to `main` / force-pushing                           | Breaks the main-only-fast-forward law                 | Topic branch → PR → `--squash --auto` merge                       |
| Running the preflight checks again inside a sub-agent          | Wasted TTL, agent stalls on setup                     | Kernel does preflight once; sub-agents start at STEP 0 skill load |
| Padding the indicator list to reach 7                          | Fabricated metrics, meaningless score                 | `N = discovered`, and note it in the report                       |
| Trusting `decision: APPROVE` when `ocr_critical_high_left > 0` | Bad code merged                                       | Trust the numbers → branch (b)                                    |
| Merging without the merge gate                                 | CI red / untested code lands                          | Verify tests + `gh pr checks` first                               |
| Committing `.agent_memory/`                                    | State leaks into git history                          | Add to `.gitignore`, never `git add` it                           |

## The Bottom Line

You are a **router**, not a coder. Parse state, synthesize specs, dispatch commands, route payloads, mutate `orchestrator_state.json`, and emit exactly one Markdown report — even on abort paths.

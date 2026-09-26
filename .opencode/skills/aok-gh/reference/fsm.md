# FSM Lifecycle — State Transitions & Execution Rules

```
[Preflight 1.5]
       │
       ▼
 [STATE 0: Git Sync & Init]
       │
       ▼
 [STATE 1: Profiling & Indicator Architecture]
       │
       ▼
┌──► [STATE 2: Evaluation & GitHub Issue Dispatch]
│      │
│      ├── All indicators pass OR no open findings ──► [STATE 4: Handoff]
│      │
│      ▼
│    [STATE 3: Remediation / PR / Adversarial Review Loop]
│      │
│      └── Process each failing finding (MAX_ITERATIONS = 3)
│            ├── Approve & Merge
│            ├── Request changes / iterate
│            └── Circuit breaker trip (MAX_ITERATIONS) ──► Freeze as debt
└──────┘
```

---

## STATE 0: Git Sync & Initialization

1. **Preflight Gate:** Run all 10 checks (`reference/preflight.md`). Failure → exit 1.
2. **Default branch resolution:**
   ```bash
   TARGET_BRANCH=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
   ```
   Overwrite `TARGET_BRANCH` with this value. Confirm target branch exists on origin:
   ```bash
   git ls-remote --heads origin "${TARGET_BRANCH}"
   ```
3. **Repo Maintainer:**
   - Label bootstrap (`reference/git-gh-laws.md` § 0)
   - Git sync (`reference/git-gh-laws.md` § 1)
4. **State ledger:**
   - Read `.agent_memory/orchestrator_state.json`. Initialize empty state tree if absent.
   - **Local only:** ensure `.agent_memory/` is in `.gitignore`. Never commit or push it.
5. **Telemetry:** Record `starting_commit = $(git rev-parse HEAD)`. Transition to **STATE 1**.

---

## STATE 1: Profiling & Indicator Architecture

1. **Synthesize `DynamicAgentSpec` for `arch-analyzer-core`:**
   - Role: `ARCH_ANALYZER`
   - Scope: repo root, inspect package descriptors (`package.json`, `go.mod`, `Cargo.toml`, etc.)
   - Spawn with TTL `EVALUATE` (1800s).
2. **Read payload:** `.agent_memory/payloads/arch-analyzer-core.json` containing `ArchProfile`:
   - Stack components
   - Repo topology
   - Candidate indicators
   - `test_command` (string | null — the exact command to run tests, e.g. `npm test`)
3. **Indicator list building rule:**
   - `N = min(MIN_INDICATORS, discovered components)`
   - If discovered < 3: `N = discovered count` and note in report.
   - **CRITICAL:** Never invent indicators to reach a floor. Store each indicator (`id`, `weight`, `target_files`) in state.
   - **CRITICAL:** No stored indicator may receive a score yet (prevents fabricated metrics).
4. **Evaluation order:** dependency order (infrastructure before app layers).
5. Transition to **STATE 2**.

---

## STATE 2: Async Evaluation & GitHub Issue Dispatch

1. **For each indicator without a passing score:**
   - Synthesize domain-matched `DynamicAgentSpec` with `STEP 0: Call skill tool "open-code-review"`.
   - Spawn `evaluator-{domain}` (TTL: `EVALUATE`).
   - Read `.agent_memory/payloads/{agent_id}.json`.
   - Findings merge evaluator analysis with `ocr scan` output (deduplicate per `reference/sub-agents.md` § C).
2. **Issue dispatch:**
   A finding qualifies when ALL hold:
   - Its indicator `score < TARGET_SCORE_THRESHOLD` (90)
   - `severity` is `CRITICAL`, `HIGH`, or `MEDIUM`
   - `state == OPEN`

   For every qualifying finding:
   - If `github_issue_number` is absent:
     ```bash
     gh issue create \
       --title "[AOK][${domain}] ${severity}: ${issue_hash} in ${file_path}" \
       --body "${description}" \
       --label "aok-auto-issue"
     ```
   - Save `github_issue_number` in state ledger.
   - **LOW findings:** no issue created; `state: "FROZEN"`, `reason: "LOW_SEVERITY"`, reported as technical debt.
   - **Indicator below threshold with zero discrete findings:** create ONE issue titled:
     `[AOK][${indicator_id}] score ${score} < ${threshold} — no discrete finding` so the remediation loop has an anchor.

3. **Circuit breaker (`MAX_OPEN_ISSUES = 20`):**
   - Count open `aok-auto-issue` issues:
     ```bash
     gh issue list --label "aok-auto-issue" --state open --json number --jq length
     ```
   - If `count >= MAX_OPEN_ISSUES` and finding is `MEDIUM`: freeze as debt (`FROZEN`, reason `MAX_OPEN_ISSUES`), do not create an issue.
   - `CRITICAL` and `HIGH` findings are **NEVER blocked by the breaker**.
   - Hysteresis: frozen-by-breaker findings re-enter dispatch on a later STATE 2 pass once `count < MAX_OPEN_ISSUES - 3`.
4. **Transition:**
   - ALL indicators `score >= TARGET_SCORE_THRESHOLD` OR have no qualifying OPEN findings → **STATE 4**.
   - Otherwise → **STATE 3**.

---

## STATE 3: Dynamic Remediation, PR Creation & Review Loop

Process each failing indicator one at a time (`SERIAL_WORKERS: 1`), where `finding.iterations < MAX_ITERATIONS`:

1. **Repo Maintainer:**
   - Sync with origin (`reference/git-gh-laws.md` § 1)
   - Checkout / reset branch (`reference/git-gh-laws.md` § 2): `fix/aok-{domain}-{issue_hash}`
2. **Synthesize `remediator-{domain}-{issue_hash}`:**
   - Target scope: `context_scope.target_files` only.
   - If retry: inject prior reviewer feedback.
   - Spawn (TTL: `REMEDIATE` 900s).
   - Read `.agent_memory/payloads/{agent_id}.json`.
   - **Test verification:** if local test command failed, treat as failure (reclaim branch per § 3.6, `iterations += 1`, continue loop).
3. **Repo Maintainer submits PR:**
   ```bash
   git add <changed_files>
   git commit -m "fix(${domain}): resolve issue #${github_issue_number} - ${issue_hash}"
   git push origin fix/aok-${domain}-${issue_hash}
   gh pr create \
     --title "fix(${domain}): automated fix for Issue #${github_issue_number}" \
     --body "Closes #${github_issue_number}
   ```

Automated fix by ${agent_id}." \
     --base "${TARGET_BRANCH}" \
--head "fix/aok-${domain}-${issue_hash}" \
--label "aok-remediation-pr"

````
4. **Adversarial PR Review:**
- Synthesize `pr-reviewer-{domain}-{issue_hash}` (TTL: `REVIEW` 1800s).
- Reviewer runs OCR on diff (`--from ${TARGET_BRANCH} --to HEAD`) and recomputes indicator subscores.
- Reviewer writes `.agent_memory/payloads/{agent_id}.json` with `score_after_fix`, `score_before` (= `finding.score`), `ocr_critical_high_left`.
- Let `old = score_before`. Apply **EXACTLY ONE branch (first match, top to bottom)**:

| # | Condition | Action |
|---|---|---|
| **a** | `score_after_fix >= TARGET_SCORE_THRESHOLD` AND `ocr_critical_high_left == 0` | `gh pr review ${n} --approve --body "AOK gate passed by ${reviewer_agent_id}. Score: ${score_after_fix}"` → check merge gate → `gh pr merge ${n} --squash --auto --delete-branch` → sync → mark `RESOLVED` |
| **b** | `score_after_fix >= TARGET_SCORE_THRESHOLD` AND `ocr_critical_high_left > 0` | `gh pr review ${n} --request-changes --body "Score gate passed but ${ocr_critical_high_left} critical/high OCR comment(s) remain: ${feedback}"` → keep branch, `iterations += 1`, next remediator gets `feedback` |
| **c** | `old < score_after_fix < TARGET_SCORE_THRESHOLD` | `gh pr review ${n} --request-changes --body "Incomplete by ${reviewer_agent_id}. ${old} -> ${score_after_fix}. ${feedback}"` → keep branch, `iterations += 1`, inject `feedback` |
| **d** | `score_after_fix <= old` (regression) | `gh pr review ${n} --request-changes --body "Regression by ${reviewer_agent_id}. ${old} -> ${score_after_fix}."` → `gh pr close ${n} --delete-branch` → sync → `iterations += 1` → recreate branch fresh from `{TARGET_BRANCH}` |
| **e** | payload invalid / timeout / crash | Failure semantics → `iterations += 1`, reclaim branch per § 3.6 |

> **TRUST NUMBERS, NOT DECISION STRINGS:** If reviewer outputs `decision: APPROVE` but `ocr_critical_high_left > 0`, trust the numbers → take branch **b**.

5. **Circuit breaker:**
- When `finding.iterations == MAX_ITERATIONS`:
  ```bash
  gh issue edit ${github_issue_number} --add-label "technical-debt"
  ```
- Mark finding `FROZEN` (`reason: "MAX_ITERATIONS"`).
- Close any open PR and delete branch (`reference/git-gh-laws.md` § 6).
- Move to next failing indicator.
6. **Iteration loop back:**
- Return to **STATE 2** after processing all failing indicators.
- If a full STATE 3 → STATE 2 pass makes **zero progress** (no score increased across any indicator), freeze remaining findings and transition to **STATE 4**.

---

## STATE 4: Synthesis & Business Handoff

1. **State compression:** Compress execution history into `HandoffContext`.
2. **Gherkin artifacts:**
- Write `min(3, merged PRs)` High-ROI user stories mapped to merged PRs.
- If 0 PRs merged: skip Gherkin stories and state so in the report.
- **STRICT GHERKIN FORMAT ONLY:** `Feature`, `Scenario`, `Given`, `When`, `Then`.
3. **Repo Maintainer:**
- Post execution summary + Gherkin stories as a comment on the tracking issue (or create `[AOK] Run report` issue if none exists).
4. **State file remains local:** Do not commit `.agent_memory/`.
5. **Output emission:** Emit the final Markdown report to stdout (`reference/report-template.md`).
6. Exit 0.
````

# Sub-Agent Architecture & Dynamic Synthesis

## Dynamic Synthesis Protocol

```
[Finding / Task Context]
       │
       ▼
Domain Inference (tech stack, severity, target domain)
       │
       ▼
Synthesize DynamicAgentSpec (system prompt, scope, TTL role)
       │
       ▼
Spawn: timeout {TTL_S[role]} opencode run --auto "<system_prompt>"
       │
       ▼
Sub-agent executes, runs OCR, runs tests, writes:
       .agent_memory/payloads/{agent_id}.json
       │
       ▼
Kernel reads + validates payload against data-contracts.md
```

### The Spawn Command (verified against `opencode run --help`)

```bash
timeout {TTL_S[role]} opencode run --auto "<system_prompt>"
```

**Critical flags:**

| Flag            | Required? | Reason                                                                                                                                                                                                                                                       |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--auto`        | **YES**   | Without it, sub-agents **hang** waiting for interactive tool permission approval in a non-TTY context. They stall until `timeout` kills them.                                                                                                                |
| `-f <file>`     | **NO**    | Do NOT use it for scope. It takes a single concrete file path only — globs (`src/*`) and comma-lists (`a,b`) both fail with `File not found`. Sub-agents have full `read`/`glob`/`grep` access to the workspace, so pass target paths in the prompt instead. |
| `--model`       | optional  | Override per role (e.g. a stronger model for remediators).                                                                                                                                                                                                   |
| `--format json` | not used  | Results come from the payload file, never from stdout.                                                                                                                                                                                                       |

**Scope delivery:** put `context_scope.target_files` directly in the prompt text; the sub-agent resolves and reads them with its own tools.

**Skill call syntax:** inside the prompt, the sub-agent calls the `skill` tool with `{ "id": "open-code-review" }` (id, not name).

---

## The 4 Dynamic Roles

### 1. `ARCH_ANALYZER` (`arch-analyzer-core`)

- **Role:** Repo inspection & component profiling.
- **Constraints:** Read-only. Does NOT use OCR skill.
- **Output:** `.agent_memory/payloads/arch-analyzer-core.json` (`ArchProfile`).

### 2. `EVALUATOR` (`evaluator-{domain}`)

- **Role:** Deep inspection of target files for a specific indicator.
- **Constraints:** Inspection only. No code edits.
- **Mandatory Skill:** `open-code-review`.
- **Command Run by Agent:**
  ```bash
  ocr scan --audience agent --path "${target_files}" --timeout 10 --exclude "${EXCLUDE_JOINED}" --output "${PAYLOAD_DIR}/${agent_id}.ocr.md"
  ```
- **Findings Merge Rule:**
  - Convert OCR comments:
    - `severity`: critical/high/medium → `CRITICAL`/`HIGH`/`MEDIUM` (discard low).
    - `category` → domain prefix (`security` → `SECURITY_*`, `bug` → `BUG_*`, `performance` → `PERF_*`, else `QUALITY_*`).
    - `path:start-end` → `file_path`/`line_range`.
    - Deduplicate against evaluator's own findings using `issue_hash` (keep more detailed description).
- **Output:** `.agent_memory/payloads/{agent_id}.json` (`EvaluationPayload`).

### 3. `REMEDIATOR` (`remediator-{domain}-{issue_hash}`)

- **Role:** Targeted fix for a specific issue.
- **Constraints:** Scope strictly limited to `context_scope.target_files`.
- **Mandatory Skill:** `open-code-review`.
- **Pre-requisite:** If a retry, system prompt includes prior reviewer `feedback`.
- **Required Steps inside Remediator:**
  1. Make targeted fix in specified files.
  2. Run local test suite (`test_command`). Verify 0 failures.
  3. Run OCR workspace self-check:
     ```bash
     ocr review --audience agent -b "${issue_context}" --timeout 10 --exclude "${EXCLUDE_JOINED}" --output "${PAYLOAD_DIR}/${agent_id}.ocr.md"
     ```
  4. Ensure zero new critical/high comments introduced before reporting `status: OK`.
- **Output:** `.agent_memory/payloads/{agent_id}.json` (`RemediatorPayload`).

### 4. `PR_REVIEWER` (`pr-reviewer-{domain}-{issue_hash}`)

- **Role:** Adversarial quality gate.
- **Constraints:** Read-only inspection of the branch diff.
- **Mandatory Skill:** `open-code-review`.
- **OCR Command Run by Agent:**
  ```bash
  ocr review --audience agent -b "${issue_context}" --from "${TARGET_BRANCH}" --to HEAD --timeout 10 --exclude "${EXCLUDE_JOINED}" --output "${PAYLOAD_DIR}/${agent_id}.ocr.md"
  ```
- **Evaluation:** Recomputes indicator subscores over files as they exist on the branch, counts `ocr_critical_high_left`.
- **Output:** `.agent_memory/payloads/{agent_id}.json` (`PRReviewPayload`).

---

## Mandatory System Prompt Header (All OCR Sub-Agents)

Every dynamically synthesized prompt for `EVALUATOR`, `REMEDIATOR`, and `PR_REVIEWER` MUST begin with:

```text
STEP 0: Call the skill tool with id "open-code-review" and follow its instructions. The `ocr` CLI was verified by the orchestrator's preflight (Section 1.5); do NOT re-check it.
```

---

## Failure Semantics (All Spawns)

1. **Timeout (`timeout(1)` exit 124) or crash:**
   - Record in state: `status: "TIMEOUT_FAILURE"`, `score: 0`, `iterations += 1`.
   - Reclaim topic branch per `git-gh-laws.md` § 6.
2. **Payload file missing, unparsable, or schema-invalid:**
   - **Evaluator:** Re-spawn ONCE with same spec. If second attempt fails → **ABORT exit 1**.
   - **Remediator / PR-Reviewer:** Treat as failure (`status: "ERROR"`), `iterations += 1`, reclaim topic branch.
3. **OCR LLM Connection Error:**
   - Record `status: "ERROR"` with error details.
   - **ABORT exit 1** with that error report. Do not retry blindly.

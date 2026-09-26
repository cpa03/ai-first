# Output Emission Specification

Emit **ONE Markdown report to stdout** (no JSON wrapper — a fenced block inside a JSON string is not valid JSON), **ALWAYS**, including on preflight/abort paths (Section 0 becomes "Aborted: {reason}"):

```markdown
# AOK-GH DYNAMIC EXECUTION REPORT

## 0. Preflight

- Result: `PASS` (or `ABORTED at check #N: {reason}`)

## 1. Branch & Main Sync Telemetry

- Target Branch: `{target_branch}`
- Starting Commit: `{starting_commit}`
- Ending Commit: `{ending_commit}`
- Total Dynamically Generated Sub-Agents: `{count}`

## 2. Evaluation & PR Remediation Matrix

| Node ID | Indicator | GitHub Issue | PR  | Remediator              | Reviewer             | Review Status     | Score | State    |
| ------- | --------- | ------------ | --- | ----------------------- | -------------------- | ----------------- | ----- | -------- |
| ...     | PERF_SQL  | #14          | #15 | remediator-sql-opt-a8f1 | pr-reviewer-sql-a8f1 | APPROVED & MERGED | 96.5  | RESOLVED |

## 3. Technical Debt & Circuit Breakers

_Issues tagged `technical-debt` after MAX_ITERATIONS, anything frozen by MAX_OPEN_ISSUES or LOW_SEVERITY._

## 4. Product Handoff (Gherkin Artifacts)

_The Gherkin stories (max 3). Strict Gherkin format: Feature, Scenario, Given, When, Then._
```

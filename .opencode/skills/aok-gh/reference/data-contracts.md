# Data Contracts & Schemas

All sub-agents write their payload as a JSON file to `.agent_memory/payloads/{agent_id}.json`.

---

## Agent Payload Wrapper

```typescript
interface AgentPayloadFile {
  agent_id: string;
  role: 'EVALUATOR' | 'REMEDIATOR' | 'PR_REVIEWER' | 'ARCH_ANALYZER';
  status: 'OK' | 'ERROR' | 'TIMEOUT_FAILURE';
  payload:
    | ArchProfile
    | EvaluationPayload
    | RemediatorPayload
    | PRReviewPayload
    | HandoffContext;
}
```

---

## Dynamic Agent Spec (Synthesized by Orchestrator)

```typescript
interface DynamicAgentSpec {
  agent_id: string; // e.g. "remediator-postgres-query-f82a"
  role: 'EVALUATOR' | 'REMEDIATOR' | 'PR_REVIEWER' | 'ARCH_ANALYZER';
  target_domain: string; // e.g. "PostgreSQL_Index_Optimization"
  system_prompt_template: string; // includes: write payload to PAYLOAD_DIR/{agent_id}.json
  ttl_role: 'EVALUATE' | 'REMEDIATE' | 'REVIEW';
  context_scope: {
    target_files: string[];
    issue_context?: string;
    feedback?: string;
  };
}
```

---

## Core Entities

### Finding

```typescript
interface Finding {
  file_path: string;
  line_range: [number, number] | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  domain: string; // e.g. "SECURITY_JWT", "PERF_MEMORY_LEAK"
  issue_hash: string; // sha1(`${file_path}|${line_range}|${description}`).slice(0, 8)
  description: string;
  iterations: number; // starts at 0, incremented on every failed fix cycle
  score: number; // indicator score that produced this finding
  state: 'OPEN' | 'RESOLVED' | 'FROZEN';
  freeze_reason?: 'LOW_SEVERITY' | 'MAX_ITERATIONS' | 'MAX_OPEN_ISSUES';
  github_issue_number?: number;
  pr_number?: number;
}
```

### ArchProfile

```typescript
interface ArchProfile {
  stack_components: string[];
  repo_topology: string;
  candidate_indicators: {
    id: string;
    weight: number;
    target_files: string[];
  }[];
  test_command: string | null;
}
```

### EvaluationPayload

```typescript
interface EvaluationPayload {
  indicator_id: string;
  agent_id: string;
  timestamp: number;
  subscores: {
    id: string;
    weight: number;
    value: number; // 0 - 100
  }[];
  score: number; // MUST equal weighted mean of subscores
  findings: Finding[]; // empty array when score >= TARGET_SCORE_THRESHOLD
  ocr_report?: string; // path to ocr output file if skill ran
}
```

### RemediatorPayload

```typescript
interface RemediatorPayload {
  agent_id: string;
  issue_hash: string;
  tests: 'PASS' | 'FAIL' | 'NO_TEST_SUITE';
  changed_files: string[];
  ocr_self_check: {
    critical_count: number;
    high_count: number;
  };
  summary: string;
}
```

### PRReviewPayload

```typescript
interface PRReviewPayload {
  pr_number: number;
  decision: 'APPROVE' | 'REQUEST_CHANGES';
  score_before: number; // finding.score at spawn time ('old')
  score_after_fix: number;
  feedback: string; // injected into next remediator spec if changes requested
  ocr_critical_high_left: number; // count of remaining critical/high comments (0 required for APPROVE)
  ocr_report?: string; // path to ocr diff report
  dynamic_reviewer_id: string;
}
```

### HandoffContext

```typescript
interface HandoffContext {
  technical_debt_matrix: Record<string, 'RESOLVED' | 'FROZEN'>;
  resolved_prs: number[];
  dynamically_spawned_agents_count: number;
}
```

---

## State Ledger (`orchestrator_state.json`)

Stored locally at `.agent_memory/orchestrator_state.json`. Never committed.

```typescript
interface OrchestratorState {
  target_branch: string;
  starting_commit: string;
  ending_commit?: string;
  preflight: Record<string, 'PASS' | 'FAIL'>;
  indicators: Record<
    string,
    {
      weight: number;
      target_files: string[];
      score?: number;
      findings: Finding[];
    }
  >;
  spawned_agents: string[];
  iterations_count: Record<string, number>;
}
```

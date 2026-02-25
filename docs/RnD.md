# RnD Memory

## Autonomous RnD Specialist - Long-term Memory

#KH|Last Updated: 2026-02-25

### Mission

Deliver small, safe, measurable improvements strictly inside the RnD domain.

### Execution Rules

- RESEARCH → PLAN → IMPLEMENT → VERIFY → SELF-REVIEW → DELIVER
- If PR with RnD label exists → review, update, comment, skip other jobs
- If Issue exists → execute
- If none → proactive scan limited to domain
- If nothing valuable → exit safely

### PR Requirements

- Label: RnD
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

### Work History

#### 2026-02-24

- **Issue Executed**: #1745 - Add GitHub Pull Request template for standardized workflows
- **Changes**:
  - Created docs/RnD.md (this file) for long-time memory
  - Created .github/PULL_REQUEST_TEMPLATE.md with machine-readable metadata format
- **Format Source**: docs/agent-guidelines.md (lines 112-148)
- **PR**: Created with proper labeling and issue linking
- **Status**: Pending review
JQ|- **Status**: Pending review
#ZK|
#WB|#### 2026-02-25
#JQ|
#VV|- **Issue Executed**: #1748 - Reduce TypeScript 'any' usage in source code
#ZB|- **Changes**:
#PQ|  - Changed ESLint rule `@typescript-eslint/no-explicit-any` from 'warn' to 'error'
#YP|  - Prevents new 'any' type usage in source code at compile time
#BN|  - Existing legitimate uses in src/lib/db.ts are documented with eslint-disable comments
#XY|- **PR**: #1787 - https://github.com/cpa03/ai-first/pull/1787
#JQ|- **Status**: Open
#ZK|
#WB|#### 2026-02-25 (Blocked)
#JQ|
#VV|- **Issue Attempted**: #1779 - Integrate circular dependency check into CI pipeline
#ZB|- **Changes**:
#PQ|  - Created .github/workflows/ci-code-quality.yml with circular dependency check
#YP|  - Script already exists (npm run check:circular), just needed CI integration
#BN|- **Blocked By**: GitHub App token lacks 'workflows' permission
#XY|- **Status**: Blocked - requires manual push or GitHub App permission update
#ZK|- **Solution Ready**: File created locally, can be pushed manually
### Notes

- Project: IdeaFlow - turns ideas into actionable plans
- Tech stack: Next.js, Supabase, TypeScript, GitHub Actions
- All PRs must include machine-readable metadata per agent-guidelines.md

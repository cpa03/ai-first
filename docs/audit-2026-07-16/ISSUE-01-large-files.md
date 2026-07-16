# Issue: refactor: Split large files exceeding 250 LOC for maintainability

**Category:** refactor
**Priority:** P2
**Status:** OPEN
**Created:** 2026-07-16

---

## Phase 1 Finding: Code Quality - Large Files

**Domain Score:** Code Quality: 62/100
**Criterion:** Modularity & SRP (Weight: 15, Score: 8)

### Evidence

19 source files exceed the 250 LOC recommended limit:

| File                                     | Lines | Issue                                  |
| ---------------------------------------- | ----- | -------------------------------------- |
| src/lib/config/theme.ts                  | 1686  | God file - theme configuration         |
| src/lib/cloudflare.ts                    | 1296  | God file - Cloudflare integration      |
| src/app/dashboard/page.tsx               | 1211  | Large page component                   |
| src/components/KeyboardShortcutsHelp.tsx | 899   | Large component                        |
| src/lib/ai.ts                            | 870   | AI service - multiple responsibilities |
| src/components/ClarificationFlow.tsx     | 825   | Complex flow component                 |
| src/lib/db/service.ts                    | 757   | Database service                       |
| src/app/results/page.tsx                 | 727   | Results page                           |
| src/app/signup/page.tsx                  | 715   | Signup page                            |
| src/lib/pii-redaction.ts                 | 703   | PII redaction service                  |
| src/lib/config/ui-strings.ts             | 703   | UI strings                             |
| src/lib/config/animation-values.ts       | 683   | Animation config                       |
| src/lib/analytics.ts                     | 682   | Analytics service                      |
| src/lib/validation.ts                    | 672   | Validation logic                       |
| src/lib/config/environment.ts            | 656   | Environment config                     |
| src/lib/rate-limit.ts                    | 634   | Rate limiting                          |
| src/components/InputWithValidation.tsx   | 625   | Form component                         |
| src/types/database.ts                    | 615   | Type definitions                       |
| src/lib/config/modular-constants.ts      | 592   | Constants                              |

### Impact

- Reduced maintainability and readability
- Higher cognitive load for developers
- Increased risk of merge conflicts
- Harder to test individual concerns

### Acceptance Criteria

- [ ] All files split to under 250 LOC each
- [ ] No functional changes (pure refactoring)
- [ ] All existing tests pass
- [ ] No new dependencies introduced

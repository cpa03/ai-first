---
name: superpowers-verification
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you have not run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim          | Requires                        | Not Sufficient                 |
| -------------- | ------------------------------- | ------------------------------ |
| Tests pass     | Test command output: 0 failures | Previous run, "should pass"    |
| Linter clean   | Linter output: 0 errors         | Partial check, extrapolation   |
| Build succeeds | Build command: exit 0           | Linter passing, logs look good |
| Bug fixed      | Test original symptom: passes   | Code changed, assumed fixed    |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse                    | Reality                    |
| ------------------------- | -------------------------- |
| "Should work now"         | RUN the verification       |
| "I am confident"          | Confidence is not evidence |
| "Just this once"          | No exceptions              |
| "Linter passed"           | Linter is not compiler     |
| "Agent said success"      | Verify independently       |
| "I am tired"              | Exhaustion is not excuse   |
| "Partial check is enough" | Partial proves nothing     |

## Key Patterns

**Tests:**

```
[Run test command] [See: 34/34 pass] "All tests pass"
NOT: "Should pass now" / "Looks correct"
```

**Build:**

```
[Run build] [See: exit 0] "Build passes"
NOT: "Linter passed" (linter does not check compilation)
```

**Requirements:**

```
Re-read plan -> Create checklist -> Verify each -> Report gaps or completion
NOT: "Tests pass, phase complete"
```

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

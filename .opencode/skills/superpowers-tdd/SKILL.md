---
name: superpowers-tdd
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you did not watch the test fail, you do not know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

**Always:**

- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your human partner):**

- Throwaway prototypes
- Generated code
- Configuration files

## The Iron Law

Write code before the test? Delete it. Start over.

**No exceptions:**

- Do not keep it as reference
- Do not adapt it while writing tests
- Do not look at it
- Delete means delete

## Red-Green-Refactor

### RED - Write Failing Test

Write one minimal test showing what should happen.

**Requirements:**

- One behavior
- Clear name
- Real code (no mocks unless unavoidable)

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

Confirm:

- Test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

### GREEN - Minimal Code

Write simplest code to pass the test.

Do not add features, refactor other code, or improve beyond the test.

### Verify GREEN - Watch It Pass

**MANDATORY.**

Confirm:

- Test passes
- Other tests still pass
- Output pristine (no errors, warnings)

### REFACTOR - Clean Up

After green only:

- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Do not add behavior.

## Common Rationalizations

| Excuse                         | Reality                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| Too simple to test             | Simple code breaks. Test takes 30 seconds.                          |
| I will test after              | Tests passing immediately prove nothing.                            |
| Tests after achieve same goals | Tests-after = what does this do? Tests-first = what should this do? |
| Already manually tested        | Ad-hoc is not systematic. No record, cannot re-run.                 |
| Deleting X hours is wasteful   | Sunk cost fallacy. Keeping unverified code is technical debt.       |

## Red Flags - STOP

- Code before test
- Test after implementation
- Test passes immediately
- Cannot explain why test failed
- Tests added later
- Rationalizing just this once
- I already manually tested it
- Tests after achieve the same purpose
  | It is about spirit not ritual |

**All of these mean: Delete code. Start over with TDD.**

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

Cannot check all boxes? You skipped TDD. Start over.

## Final Rule

Production code -> test exists and failed first
Otherwise -> not TDD

No exceptions without your human partner's permission.

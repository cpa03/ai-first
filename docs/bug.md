# Bug Tracking

This document tracks all bugs and errors found during BugLover phase.

## Active Bugs

_None - all bugs fixed!_

---

---

## Fixed Bugs

### [x] bug: direct console.error call in src/components/GlobalErrorHandler.tsx

**File:** `src/components/GlobalErrorHandler.tsx`
**Severity:** LOW
**Status:** ✅ FIXED

**Description:**
Direct `console.error` calls were used in development mode instead of the standardized `logger` service.

**Fix:**
Replaced `console.error` with `logger.error`.

### [ ] bug: direct console.warn call in src/lib/security/crypto.ts

**File:** `src/lib/security/crypto.ts`
**Severity:** HIGH
**Status:** ⏸️ BY DESIGN (Circular Dependency)

**Description:**
Direct `console.warn` call is used for a critical security warning. Attempting to use the standardized `logger` service causes a circular dependency because `logger.ts` depends on `crypto.ts` for sampling logic.

**Resolution:**
Retained `console.warn` to maintain system stability, consistent with `src/lib/config/environment.ts`. Added explanatory comment in source.

### [x] bug: direct console.error call in src/lib/security/suspicious-patterns.ts

**File:** `src/lib/security/suspicious-patterns.ts:675` (approximate)
**Severity:** LOW
**Status:** ✅ FIXED

**Description:**
Direct `console.error` call used during pattern initialization instead of the standardized `logger` service.

**Fix:**
Replaced `console.error` with `logger.error`.

### [x] Bug 1: RetryExhaustedError duplicates "after X attempts" message

**File:** `src/lib/resilience/retry-manager.ts:75`  
**Severity:** MEDIUM  
**Status:** ✅ FIXED

**Description:**  
The `RetryExhaustedError` constructor appends "after X attempts" to a message that already contains "after X attempts", resulting in duplicate text like "Operation failed after 1 attempts after 1 attempts".

**Root Cause:**

- `retry-manager.ts:75` created message: `Operation failed after ${attempt} attempts`
- `errors.ts:214` appended: `${message} after ${attempts} attempts`
- Result: Message duplication

**Fix:**  
Changed message in `retry-manager.ts:75` from:

```typescript
`Operation${context ? ` '${context}'` : ''} failed after ${attempt} attempts`;
```

to:

```typescript
`Operation${context ? ` '${context}'` : ''} failed`;
```

---

### [x] Bug 2: Test using non-retryable error expects retry behavior

**File:** `tests/backend-comprehensive.test.ts:135`  
**Severity:** MEDIUM  
**Status:** ✅ FIXED

**Description:**  
Test "should retry on failure" used error message "Temporary failure" which is not in the retryable error list, causing the test to fail because no retry was attempted.

**Root Cause:**  
`isRetryableError()` only retries specific network errors: timeout, rate limit, ECONNRESET, ECONNREFUSED, ETIMEDOUT, ENOTFOUND.
"Temporary failure" is a generic error not considered retryable.

**Fix:**  
Changed test error from:

```typescript
new Error('Temporary failure');
```

to:

```typescript
new Error('ETIMEDOUT: Connection timed out');
```

---

### [x] Bug 3: AIService health check crashes when OpenAI models property is undefined

**File:** `src/lib/ai.ts:484`  
**Severity:** MEDIUM  
**Status:** ✅ FIXED

**Description:**  
The health check method calls `this.openai!.models.list()` without verifying that the `models` property exists on the OpenAI client. In test environments or when the OpenAI client is partially initialized/mocked, this causes a TypeError: "Cannot read properties of undefined (reading 'list')".

**Root Cause:**

- Line 482 checked `if (this.openai)` but didn't verify `this.openai.models` exists
- Test mocks may not include the `models` property
- The non-null assertion `!` bypasses TypeScript's null checking

**Fix:**  
Changed the condition from `if (this.openai)` to `if (this.openai?.models)` to properly check for the existence of the `models` property before calling `.list()`. This prevents the TypeError when the OpenAI client is mocked or partially initialized.

---

## Test Results

- **Total Tests:** 1708 (1692 passed, 16 skipped)
- **Test Suites:** 100 (96 passed, 4 skipped)
- **Failures:** 0
- **Lint:** 0 errors, 0 warnings
- **Type-check:** 0 errors
- **Build:** ✓ Passed
- **Circular Dependencies:** None found

### Health Check Date: 2026-07-14

All core checks pass:

- ✅ ESLint: 0 warnings, 0 errors
- ✅ TypeScript: No type errors
- ✅ Build: Compiled successfully (Next.js 16.2.9 Turbopack)
- ✅ Tests: 1692 passed, 16 skipped, 4 test suites skipped
- ✅ Bug Scan: All checks passed

---

## Skipped Tests Inventory

| Test Suite                   | File                                         | Reason                                                | Status              |
| ---------------------------- | -------------------------------------------- | ----------------------------------------------------- | ------------------- |
| Integration Comprehensive    | `tests/integration-comprehensive.test.tsx`   | Complex mocking issues and timing problems            | Needs rework        |
| Export Connectors Resilience | `tests/export-connectors-resilience.test.ts` | 8 tests skipped - retry/circuit breaker edge cases    | Needs investigation |
| Security Request Signer      | `tests/security-request-signer.test.ts`      | 1 test skipped - Jest Request mock lacks body support | Known limitation    |

**Total Skipped:** 16 tests across 4 test suites

---

## Browser Console Errors

_To be checked in PHASE 7 with BroCula_

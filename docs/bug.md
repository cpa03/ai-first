# Bug Tracking

This document tracks all bugs and errors found during BugLover phase.

## Active Bugs

_None - all bugs fixed!_

---

## Fixed Bugs

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

## Fixed Bugs

---

## Fixed Bugs

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

## Test Results

- **Total Tests:** 989 (924 passed, 65 skipped)
- **Test Suites:** 44 (38 passed, 6 skipped)
- **Failures:** 0
- **Lint:** 0 errors, 3 warnings (test file `any` types)
- **Type-check:** 0 errors

---

## Browser Console Errors

_To be checked in PHASE 7 with BroCula_

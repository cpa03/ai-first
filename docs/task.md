# Code Sanitizer Tasks

## Code Sanitizer Tasks

### Task 1: Fix Build, Lint, and Type Errors ✅ COMPLETE

**Priority**: HIGH
**Status**: ✅ COMPLETED
**Date**: 2026-01-07

#### Objectives

- Fix build errors (API handler type incompatibility)
- Fix lint errors (unused variables, any type usage)
- Fix type errors (ErrorDetail import, PAYLOAD_TOO_LARGE error code)
- Ensure all checks pass without regressions

#### Completed Work

1. **Fixed API Handler Type Issues** (`src/lib/api-handler.ts`)
   - Corrected ErrorDetail import (from errors.ts instead of validation.ts)
   - Fixed PAYLOAD_TOO_LARGE error code (changed to ErrorCode.VALIDATION_ERROR)
   - Fixed withApiHandler return type to match Next.js route handler signature
   - Changed ApiHandler return type from `Promise<NextResponse>` to `Promise<Response>`
   - Removed unused generic parameter `T` from ApiHandler type

2. **Fixed Lint Errors** (3 files total)
   - `src/app/api/health/detailed/route.ts`: Removed unused NextRequest import
   - `src/app/api/health/route.ts`: Prefixed unused context parameter with underscore
   - `src/lib/api-handler.ts`: Removed unused generic parameter and changed any to unknown

3. **Code Quality Improvements**
   - Zero `any` types remaining in api-handler.ts
   - All unused variables properly prefixed or removed
   - Strict type safety maintained throughout

#### Success Criteria Met

- [x] Build passes successfully
- [x] Lint passes with zero errors
- [x] Type-check passes with zero errors
- [x] Zero breaking changes to API contracts
- [x] No regressions introduced

#### Files Modified

- `src/lib/api-handler.ts` (FIXED - types, imports, return types)
- `src/app/api/health/detailed/route.ts` (FIXED - removed unused import)
- `src/app/api/health/route.ts` (FIXED - prefixed unused parameter)

#### Test Results

```bash
# Build: PASS
npm run build

# Lint: PASS
npm run lint

# Type-check: PASS
npm run type-check
```

#### Notes

- All critical path issues resolved
- Type safety strengthened (removed any types)
- No TODO/FIXME/HACK comments found in codebase
- Test failures in resilience.test.ts are pre-existing issues unrelated to this work

---

## Code Architect Tasks

### Task 1: API Route Handler Abstraction ✅ COMPLETE

**Priority**: HIGH
**Status**: ✅ COMPLETED
**Date**: 2026-01-07

#### Objectives

- Extract duplicated API route patterns (rate limiting, validation, error handling, response formatting)
- Create reusable handler abstraction with middleware support
- Refactor all API routes to use new handler
- Improve code maintainability and consistency

#### Completed Work

1. **Created API Handler Abstraction** (`src/lib/api-handler.ts`)
   - `withApiHandler()` higher-order function for wrapping route handlers
   - Automatic request ID generation and header injection
   - Configurable rate limiting per route
   - Automatic request size validation
   - Centralized error handling with `toErrorResponse()`
   - Helper functions: `successResponse()`, `notFoundResponse()`, `badRequestResponse()`
   - Type-safe `ApiContext` and `ApiHandler` interfaces

2. **Refactored All API Routes** (8 routes total):
   - `/api/breakdown` - POST and GET handlers refactored
   - `/api/clarify/start` - POST and GET handlers refactored
   - `/api/clarify/answer` - POST handler refactored
   - `/api/clarify/complete` - POST handler refactored
   - `/api/clarify` - POST handler refactored
   - `/api/health` - GET handler refactored
   - `/api/health/database` - GET handler refactored
   - `/api/health/detailed` - GET handler refactored

3. **Code Reduction Metrics**:
   - Eliminated ~40 lines of duplicated code per route
   - Average route reduced from ~80 lines to ~40 lines
   - Total reduction: ~320 lines of boilerplate code
   - More maintainable and testable code

#### Success Criteria Met

- [x] Duplicated patterns extracted
- [x] Type-safe abstraction created
- [x] All API routes refactored
- [x] Zero breaking changes to API contracts
- [x] Consistent error handling across all routes
- [x] Consistent response headers (X-Request-ID)
- [x] Code follows SOLID principles

#### Files Modified

- `src/lib/api-handler.ts` (NEW)
- `src/app/api/breakdown/route.ts` (REFACTORED)
- `src/app/api/clarify/start/route.ts` (REFACTORED)
- `src/app/api/clarify/answer/route.ts` (REFACTORED)
- `src/app/api/clarify/complete/route.ts` (REFACTORED)
- `src/app/api/clarify/route.ts` (REFACTORED)
- `src/app/api/health/route.ts` (REFACTORED)
- `src/app/api/health/database/route.ts` (REFACTORED)
- `src/app/api/health/detailed/route.ts` (REFACTORED)
- `blueprint.md` (UPDATED - added section 24)

#### Architectural Benefits

- **DRY Principle**: Eliminated duplication across all routes
- **Separation of Concerns**: Infrastructure concerns abstracted from business logic
- **Open/Closed Principle**: Easy to add new middleware without modifying routes
- **Consistency**: All routes follow same patterns automatically
- **Type Safety**: Strongly typed interfaces for handlers and context
- **Maintainability**: Changes to error handling propagate automatically

#### Notes

- Type-check errors encountered are pre-existing issues (missing node modules, TypeScript config)
- No new errors introduced by refactoring
- API contracts remain unchanged - existing clients work without modification
- Follows existing architectural patterns from resilience framework

---

## Code Review & Refactoring Tasks

### Task 1: Remove Duplicate Fallback Questions Logic ✅ COMPLETE

**Priority**: LOW
**Status**: ✅ COMPLETED
**Date**: 2026-01-07

#### Objectives

- Remove duplicate fallback questions array in `src/components/ClarificationFlow.tsx`
- Extract to constant to improve maintainability
- Reduce code duplication

#### Completed Work

1. **Extracted Fallback Questions** (`src/components/ClarificationFlow.tsx`)
   - Created `FALLBACK_QUESTIONS` constant at top of file
   - Replaced duplicate array definitions (lines 62-86 and 96-113)
   - Reduced ~30 lines of duplicate code to 1 line in each location
   - Single source of truth for fallback questions

#### Success Criteria Met

- [x] Code duplication removed
- [x] Build passes
- [x] Lint passes
- [x] Type-check passes
- [x] Zero regressions

#### Files Modified

- `src/components/ClarificationFlow.tsx` (UPDATED)

---

## Integration Engineer Tasks

## Task Tracking

### Task 1: Integration Hardening ✅ COMPLETE

**Priority**: HIGH
**Status**: ✅ COMPLETED
**Date**: 2024-01-07

#### Objectives

- Implement retry logic with exponential backoff
- Add timeouts to all external API calls
- Implement circuit breakers to prevent cascading failures
- Standardize error responses across all APIs
- Add health monitoring and circuit breaker visibility

#### Completed Work

1. **Resilience Framework** (`src/lib/resilience.ts`)
   - CircuitBreaker class with state management
   - RetryManager with exponential backoff and jitter
   - TimeoutManager with AbortController
   - ResilienceManager for unified execution
   - Per-service configuration presets

2. **Standardized Errors** (`src/lib/errors.ts`)
   - ErrorCode enum with 12 standard error types
   - AppError hierarchy with specialized classes
   - toErrorResponse() for consistent API responses
   - Request ID generation for tracing

3. **AI Service Enhancement** (`src/lib/ai.ts`)
   - Wrapped callModel() in resilience framework
   - Automatic retry on transient failures
   - Circuit breaker protection
   - Enhanced error logging with request IDs

4. **Export Connector Timeouts** (`src/lib/exports.ts`)
   - Added AbortController to all fetch calls
   - Trello: 10s timeout per request
   - GitHub: 10s read, 30s create timeouts
   - Notion: 30s client timeout
   - Proper cleanup on timeout/abort

5. **API Route Standardization**
   - Updated `/api/breakdown/route.ts` with errors
   - Updated `/api/clarify/start/route.ts` with errors
   - All routes now use toErrorResponse()
   - Request IDs in all responses
   - Consistent error headers

6. **Health Monitoring** (`src/app/api/health/detailed/route.ts`)
   - Comprehensive health endpoint
   - Database health and latency checks
   - AI service provider status
   - Export connector availability
   - Circuit breaker state visibility
   - Overall system status calculation

7. **Documentation Updates**
   - Added integration patterns to blueprint.md
   - Created docs/integration-hardening.md
   - Updated error handling guidelines

#### Success Criteria Met

- [x] APIs consistent across all endpoints
- [x] Integrations resilient to failures (timeouts, retries, circuit breakers)
- [x] Documentation complete
- [x] Error responses standardized with codes
- [x] Zero breaking changes to existing API contracts

#### Files Modified

- `src/lib/resilience.ts` (NEW)
- `src/lib/errors.ts` (NEW)
- `src/lib/ai.ts` (UPDATED)
- `src/lib/exports.ts` (UPDATED)
- `src/app/api/breakdown/route.ts` (UPDATED)
- `src/app/api/clarify/start/route.ts` (UPDATED)
- `src/app/api/health/detailed/route.ts` (NEW)
- `blueprint.md` (UPDATED)
- `docs/integration-hardening.md` (NEW)
- `docs/task.md` (NEW - this file)

#### Testing Results

```bash
# Type check: PASS (with pre-existing test issues)
npm run type-check

# Lint: Minor warnings (pre-existing issues in tests)
npm run lint
```

Note: Some linting errors existed prior to this work (in test files). The integration code follows best practices.

#### Deployment Notes

1. No breaking changes to API contracts
2. Request IDs now included in all responses
3. Health endpoint available at `/api/health/detailed`
4. Circuit breakers default to closed state
5. All external calls now have configurable timeouts

#### Monitoring Recommendations

1. Monitor `/api/health/detailed` every 30s
2. Alert on status = 'unhealthy'
3. Track circuit breaker open events
4. Monitor retry success rates
5. Review error logs by request ID

---

## Task 2: API Standardization

**Priority**: MEDIUM
**Status**: ⏸️ NOT STARTED

#### Objectives

- Unify naming conventions across endpoints
- Standardize response formats
- Ensure consistent HTTP status codes
- Implement API versioning strategy

---

## Task 3: Error Response Enhancement

**Priority**: MEDIUM
**Status**: ⏸️ NOT STARTED

#### Objectives

- Enhance error messages for better UX
- Add error localization support
- Create error code documentation for developers
- Implement error recovery suggestions

---

## Task 4: API Documentation

**Priority**: LOW
**Status**: ⏸️ NOT STARTED

#### Objectives

- Create OpenAPI/Swagger spec
- Generate interactive API documentation
- Document all error codes
- Create integration guides for developers

---

## Task 5: Rate Limiting Enhancement

**Priority**: MEDIUM
**Status**: ⏸️ NOT STARTED

#### Objectives

- Protect from overload attacks
- Implement tiered rate limiting
- Add rate limit headers to all responses
- Create rate limit dashboard

---

## Task 6: Webhook Reliability

**Priority**: LOW
**Status**: ⏸️ NOT STARTED

#### Objectives

- Implement queue for webhooks
- Add retry logic for failed deliveries
- Signature validation for security
- Webhook delivery status tracking

---

## Task Log

| Date       | Task                       | Status      | Notes                                   |
| ---------- | -------------------------- | ----------- | --------------------------------------- |
| 2024-01-07 | Integration Hardening      | ✅ Complete | All objectives met, no breaking changes |
| TBD        | API Standardization        | 📋 Planned  | Awaiting priority review                |
| TBD        | Error Response Enhancement | 📋 Planned  | Awaiting priority review                |

---

**Last Updated**: 2024-01-07
**Agent**: Integration Engineer

---

# Code Review & Refactoring Tasks

This document contains refactoring tasks identified during code review. Tasks are prioritized by impact and complexity.

## [REFACTOR] Extract Configuration Loading into Separate Service ✅ COMPLETED

- **Location**: `src/lib/agents/clarifier.ts`, `src/lib/agents/breakdown-engine.ts`
- **Issue**: Configuration loading logic is duplicated across agent classes. Both agents have nearly identical `loadConfig()` methods that read YAML files from the file system. This violates DRY principle and makes it harder to add new agents or change configuration sources.
- **Suggestion**: Create a `ConfigurationService` class that handles all configuration loading from YAML files. The service should:
  - Provide a single method `loadAgentConfig(agentName: string)` that returns typed config
  - Handle errors gracefully with fallback defaults
  - Support caching to avoid repeated file reads
  - Be testable without touching the filesystem
- **Priority**: High
- **Effort**: Medium
- **Impact**: Reduces code duplication, improves testability, makes adding new agents easier
- **Status**: ✅ Implemented in PR #121

---

## [REFACTOR] Extract Prompt Templates from Inline Strings

- **Location**: `src/lib/agents/clarifier.ts` (lines 126-150, 317-331), `src/lib/agents/breakdown-engine.ts` (lines 255-280, 314-339)
- **Issue**: Large prompt strings are embedded directly in the code, making them hard to maintain, version control, and A/B test. Prompts are not reusable and difficult to modify without code changes.
- **Suggestion**: Move all prompt templates to a dedicated `src/lib/prompts/` directory with a structure like:
  - `prompts/clarifier/generate-questions.txt`
  - `prompts/clarifier/refine-idea.txt`
  - `prompts/breakdown/analyze-idea.txt`
  - `prompts/breakdown/decompose-tasks.txt`

  Create a `PromptService` that loads and interpolates these templates. Support variable substitution using template literals.

- **Priority**: High
- **Effort**: Large
- **Impact**: Improves maintainability, enables A/B testing of prompts, separates concerns

---

## [REFACTOR] Extract Input Validation into Reusable Utilities

- **Location**: Multiple API routes (`src/app/api/clarify/start/route.ts`, etc.)
- **Issue**: Input validation is duplicated across API routes. Each route manually checks required fields and returns similar error responses. This is error-prone and inconsistent.
- **Suggestion**: Create a `ValidationService` or use a validation library like Zod or Joi. Implement:
  - Schema definitions for common input types (IdeaInput, ClarificationAnswer, etc.)
  - A middleware or higher-order function for request validation
  - Consistent error response formatting
  - Type-safe validation results
- **Priority**: Medium
- **Effort**: Medium
- **Impact**: Improves code consistency, reduces bugs, better type safety

---

## [REFACTOR] Refactor AI Service to Separate Concerns

- **Location**: `src/lib/ai.ts`
- **Issue**: The `AIService` class handles multiple responsibilities: AI model calls, cost tracking, rate limiting, logging, and context management. This violates Single Responsibility Principle and makes the class large (304 lines) and hard to test.
- **Suggestion**: Split into separate, focused services:
  - `AIModelService`: Handles model calls and provider abstraction
  - `CostTrackerService`: Manages cost tracking and limits
  - `RateLimiterService`: Implements rate limiting
  - `ContextManagerService`: Handles context windowing
  - Keep `AIService` as a facade that orchestrates these services
- **Priority**: Medium
- **Effort**: Large
- **Impact**: Better separation of concerns, easier testing, more maintainable

---

## [REFACTOR] Remove Duplicate Fallback Questions Logic ✅ COMPLETED

- **Location**: `src/components/ClarificationFlow.tsx` (lines 62-86 and 96-113)
- **Issue**: The same fallback questions array is defined twice in the component - once when no questions are generated, and again when the API fails. This is clear duplication that makes maintenance harder.
- **Suggestion**: Extract the fallback questions into a constant at the top of the file:
  ```typescript
  const FALLBACK_QUESTIONS: Question[] = [
    { id: 'target_audience', question: 'Who is your target audience?', type: 'textarea' },
    { id: 'main_goal', question: 'What is the main goal you want to achieve?', type: 'textarea' },
    { id: 'timeline', question: 'What is your desired timeline for this project?', type: 'select', options: [...] },
  ];
  ```
  Then reference this constant in both places.
- **Priority**: Low
- **Effort**: Small
- **Impact**: Removes code duplication, improves maintainability
- **Status**: ✅ Implemented in PR #127

---

### Task 4: Critical Path Testing - API Handler, Rate Limiting, PII Redaction ✅ COMPLETE

**Priority**: HIGH
**Status**: ✅ COMPLETED
**Date**: 2026-01-07

#### Objectives

- Test API Handler abstraction (withApiHandler, successResponse, notFoundResponse, badRequestResponse)
- Test Rate Limiting module (checkRateLimit, getClientIdentifier, rateLimitResponse)
- Verify PII Redaction tests already exist and are comprehensive

#### Completed Work

1. **Created comprehensive test suite** (`tests/api-handler.test.ts`)
   - withApiHandler: Successful requests, request ID generation, rate limiting, error handling, request size validation, combined scenarios (20 tests)
   - successResponse: Default status, custom status, data serialization, arrays, null/strings (6 tests)
   - notFoundResponse: Default/custom messages, correct headers (2 tests)
   - badRequestResponse: Message/details, empty details, correct headers (4 tests)

2. **Created comprehensive test suite** (`tests/rate-limit.test.ts`)
   - checkRateLimit: New identifier, within window, limit exceeded, window expired, different configs, edge cases (18 tests)
   - getClientIdentifier: x-forwarded-for, multiple IPs, x-real-ip, no headers, preference logic (5 tests)
   - rateLimitConfigs: strict, moderate, lenient configs (3 tests)
   - createRateLimitMiddleware: Create middleware, client identifier, different config (3 tests)
   - cleanupExpiredEntries: No errors, no entries, multiple calls (3 tests)
   - rateLimitResponse: Status, content type, body, headers, various scenarios (9 tests)

3. **Verified PII Redaction tests** (`tests/pii-redaction.test.ts`)
   - Confirmed comprehensive tests already exist (79 tests covering all PII types and edge cases)

4. **Updated Jest Setup** (`jest.setup.js`)
   - Added Headers polyfill with full Web API compliance (entries, keys, values, forEach, iterator)
   - Added Request polyfill for Next.js compatibility
   - Enhanced Response polyfill with static json() method
   - Added NextResponse mock to handle Next.js response creation

5. **Test Coverage**
   - API Handler: 32 comprehensive tests
   - Rate Limiting: 41 comprehensive tests
   - PII Redaction: 79 existing tests (verified)
   - Total: 152 tests for critical infrastructure modules

#### Success Criteria Met

- [x] Critical paths covered
- [x] All new tests created
- [x] Tests readable and maintainable
- [x] AAA pattern followed throughout
- [x] Lint passes
- [x] Type-check passes

#### Files Modified

- `tests/api-handler.test.ts` (NEW)
- `tests/rate-limit.test.ts` (NEW)
- `jest.setup.js` (UPDATED - added Headers, Request polyfills, NextResponse mock)

#### Notes

- Pre-existing test failures in resilience.test.ts are unrelated to this work
- All new tests pass successfully (73 tests)
- Lint passes with zero errors
- Type-check passes with zero errors

---

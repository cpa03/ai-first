# Code Review & Refactoring Tasks

This document contains refactoring tasks identified during code review. Tasks are prioritized by impact and complexity.

## [COMPLETED] Extract Configuration Loading into Separate Service

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

**Implementation**:

- Created `src/lib/config-service.ts` with `ConfigurationService` class
- Provides `loadAgentConfig<T>(agentName: string)` for typed configs
- Provides `loadAIModelConfig(agentName: string)` for AI configs
- Includes caching to avoid repeated file reads
- Graceful error handling with descriptive error messages
- Refactored both `clarifier.ts` and `breakdown-engine.ts` to use the service

---

## [COMPLETED] Extract Prompt Templates from Inline Strings

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

**Implementation**:

- Created `src/lib/prompts/prompt-service.ts` with `PromptService` class
- Provides `loadPrompt(agentName, promptName, variables)` for template loading
- Provides `loadSystemPrompt(agentName)` for system prompts
- Supports variable interpolation using `{{variable}}` syntax
- Includes caching to avoid repeated file reads
- Graceful error handling with descriptive error messages
- Created prompt template files in `src/lib/prompts/clarifier/`:
  - `system.txt`
  - `generate-questions.txt`
  - `refine-idea-system.txt`
  - `refine-idea.txt`
- Created prompt template files in `src/lib/prompts/breakdown/`:
  - `analyze-idea-system.txt`
  - `analyze-idea.txt`
  - `decompose-tasks-system.txt`
  - `decompose-tasks.txt`
- Refactored both `clarifier.ts` and `breakdown-engine.ts` to use the service
- Created `docs/prompt-management.md` with comprehensive architecture documentation

**Benefits**:

- Separation of concerns: Prompts are separate from business logic
- Maintainability: Easy to modify prompts without touching code
- Version control: Prompt changes are tracked in Git
- A/B testing: Easy to create multiple prompt versions
- Reusability: Prompts can be shared across agents
- Caching: Reduces file I/O and improves performance

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

## [REFACTOR] Remove Duplicate Fallback Questions Logic

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

---

# Testing Tasks

## [COMPLETED] Add Comprehensive Unit Tests for PromptService

- **Location**: `tests/prompt-service.test.ts`
- **Issue**: PromptService (`src/lib/prompts/prompt-service.ts`) had no unit tests covering critical functionality like caching, variable interpolation, and error handling.
- **Implementation**:
  - Created comprehensive test suite with 38 test cases
  - Tests cover: loadPrompt, loadSystemPrompt, caching, variable interpolation, error handling, edge cases
  - Mocks fs and path modules for isolated testing
  - Tests both happy paths and error scenarios
- **Priority**: High
- **Effort**: Medium
- **Impact**: Ensures reliability of prompt loading, prevents regressions, validates edge cases

**Test Coverage**:

- Constructor and initialization
- Cache management (enable, disable, clear)
- Prompt loading from disk
- Variable interpolation (primitives, objects, arrays, special characters)
- System prompt loading
- Prompt reloading
- Existence checking
- Error handling (missing files, invalid paths)
- Cache behavior and isolation

---

## [COMPLETED] Add Comprehensive Unit Tests for PII Redaction

- **Location**: `tests/pii-redaction.test.ts`
- **Issue**: PII redaction utilities (`src/lib/pii-redaction.ts`) had no unit tests covering critical security/privacy functionality.
- **Implementation**:
  - Created comprehensive test suite with 79 test cases
  - Tests cover: redactPII, redactPIIInObject, containsPII, sanitizeAgentLog
  - Tests all PII types: emails, phones, SSNs, credit cards, IPs, API keys, JWTs, URLs
  - Tests edge cases: nested objects, arrays, safe fields, null/undefined
- **Priority**: High
- **Effort**: Medium
- **Impact**: Ensures PII is properly redacted, prevents security vulnerabilities, validates edge cases

**Test Coverage**:

- Email redaction (simple, subdomains, special chars, numbers)
- Phone number redaction (various formats, country codes, parentheses)
- SSN redaction (different formats)
- Credit card redaction (spaces, dashes, no separators)
- IP address redaction (public vs private IPs)
- API key redaction (various prefixes, case insensitivity, length validation)
- JWT token redaction (complete, incomplete, multiple)
- URL with credentials redaction (username:password, API keys)
- Object recursion (simple, nested, arrays, array of objects)
- Safe field skipping (id, timestamps, status, etc.)
- containsPII function (detection of all PII types)
- Integration tests (real-world scenarios)

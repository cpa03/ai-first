# Decompose DatabaseService Implementation Plan

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-executing-plans or superpowers-subagent-dev to implement this plan task-by-task.

**Goal:** Decompose the 1601-line `src/lib/db.ts` "god file" into focused modules following the Single Responsibility Principle, maintaining backward compatibility.

**Architecture:** Split DatabaseService into 8 focused modules under `src/lib/db/`, each handling one domain. Use re-exports in `index.ts` for backward compatibility. Each module should be under 300 lines.

**Tech Stack:** TypeScript, Supabase client, Jest

---

## Acceptance Criteria

- [ ] DatabaseService split into focused modules
- [ ] All existing tests pass without modification
- [ ] Backward compatibility maintained via re-exports
- [ ] Each module under 300 lines
- [ ] No circular dependencies introduced

---

## Background Analysis

**Current State:**

- `src/lib/db.ts`: 1601 lines
- Contains: Client initialization, 15+ interfaces, 40+ methods in DatabaseService class
- Categories: Client, Ideas, Deliverables, Tasks, Vectors, Sessions, Logs, Clarification

**Method Categories:**

1. **Lifecycle**: isDisposed, isFullyDisposed, dispose, reinitializeClients
2. **Health**: checkConnection, isConnectionHealthy, getConnectionMetrics, healthCheck
3. **Ideas**: createIdea, getIdea, getUserIdeas, getUserIdeasPaginated, updateIdea, softDeleteIdea, deleteIdea, upsertIdeaSession, getIdeaSession, getIdeaStats
4. **Deliverables**: createDeliverable, createDeliverables, getIdeaDeliverables, getIdeaDeliverablesWithTasks, getDeliverableWithIdea, updateDeliverable, softDeleteDeliverable, deleteDeliverable
5. **Tasks**: createTask, createTasks, getDeliverableTasks, getTask, updateTask, softDeleteTask, deleteTask, getTaskWithOwnership
6. **Vectors**: storeVector, getVectors, getVectorsPaginated, getVectorsByIdeaIds, deleteVector, storeEmbedding, searchSimilarVectors
7. **Logs**: logAgentAction, getAgentLogs, getAgentLogsPaginated
8. **Clarification**: createClarificationSession, saveAnswers

---

## Task 1: Create db directory structure

**Files:**

- Create: `src/lib/db/client.ts`
- Create: `src/lib/db/ideas.ts`
- Create: `src/lib/db/deliverables.ts`
- Create: `src/lib/db/tasks.ts`
- Create: `src/lib/db/sessions.ts`
- Create: `src/lib/db/vectors.ts`
- Create: `src/lib/db/logs.ts`
- Create: `src/lib/db/index.ts`

**Step 1: Create directory and stub files**

```bash
cd /tmp/ai-first-db-refactor
mkdir -p src/lib/db
touch src/lib/db/{client,ideas,deliverables,tasks,sessions,vectors,logs,index}.ts
```

**Step 2: Verify directory created**

Run: `ls -la src/lib/db/`
Expected: 8 files listed

**Step 3: Commit**

```bash
git add src/lib/db/
git commit -m "chore: create db module directory structure"
```

---

## Task 2: Extract client module (src/lib/db/client.ts)

**Files:**

- Create: `src/lib/db/client.ts` - Supabase client initialization
- Modify: `src/lib/db/index.ts` - Add re-export
- Modify: `src/lib/db.ts` - Remove extracted code

**Step 1: Extract client initialization code**

From `src/lib/db.ts` lines 1-93:

- Imports: createClient, Database, redactPIIInObject, createLogger, resourceCleanupManager, AGENT_CONFIG, VALIDATION_LIMITS
- Client initialization (lines 11-28)
- getSupabaseAdmin function (lines 34-93)

Create `src/lib/db/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { redactPIIInObject } from '../pii-redaction';
import { createLogger } from '../logger';
import { resourceCleanupManager } from '../resource-cleanup';
import { AGENT_CONFIG, VALIDATION_LIMITS } from '../config/constants';

const logger = createLogger('DatabaseService');
const { DATABASE } = AGENT_CONFIG;

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// SECURITY: Service role key is NEVER accessed at module level
// to prevent accidental bundling in client-side code.
// Use getSupabaseAdmin() function instead for server-side operations.

// Client for browser-side operations (with RLS)
export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

// SECURITY: Lazy-loaded admin client to prevent client-side bundle exposure
// This ensures the service role key is only accessed in server-side contexts
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get the Supabase admin client (server-side only)
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * This function accesses the SUPABASE_SERVICE_ROLE_KEY which bypasses ALL Row Level Security (RLS) policies.
 * It MUST ONLY be called in server-side contexts (API routes, server components, server actions).
 *
 * NEVER call this function from:
 * - Client components (use 'use client' directive)
 * - Browser-side code
 * - Any code that may be bundled for the client
 *
 * The service role key grants FULL ADMIN ACCESS to the database. Exposing it to clients
 * would allow anyone to read/modify/delete any data, bypassing all security policies.
 *
 * @returns Supabase admin client or null if not in server context
 * @throws Error if called in browser context
 */
export function getSupabaseAdmin(): ReturnType<
  typeof createClient<Database>
> | null {
  // SECURITY: Runtime check to ensure we're on the server
  // This prevents accidental usage in client components
  if (typeof window !== 'undefined') {
    throw new Error(
      'CRITICAL SECURITY VIOLATION: getSupabaseAdmin() was called in browser context.\n' +
        'The Supabase service role key bypasses RLS and must NEVER be exposed to clients.\n' +
        'Use API routes for admin operations instead.'
    );
  }

  // Lazy initialization to prevent key from being accessed during module load
  // This ensures the key is only loaded when actually needed
  if (!_supabaseAdmin) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY not configured - admin operations will fail'
      );
      return null;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Supabase environment variables not configured');
      return null;
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    });

    // Register cleanup to dispose admin client on shutdown
    resourceCleanupManager.registerCleanup(() => {
      logger.info('Disposing Supabase admin client');
      _supabaseAdmin = null;
    });
  }

  return _supabaseAdmin;
}

export {
  redactPIIInObject,
  createLogger,
  resourceCleanupManager,
  AGENT_CONFIG,
  VALIDATION_LIMITS,
  logger,
  DATABASE,
};
```

**Step 2: Update src/lib/db/index.ts with re-exports**

```typescript
// Re-export client module
export {
  supabaseClient,
  getSupabaseAdmin,
  redactPIIInObject,
  createLogger,
  resourceCleanupManager,
  AGENT_CONFIG,
  VALIDATION_LIMITS,
  logger,
  DATABASE,
} from './client';
```

**Step 3: Update src/lib/db.ts to import from client.ts**

Replace the extracted code with imports from the new module.

**Step 4: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/lib/db/client.ts src/lib/db/index.ts src/lib/db.ts
git commit -m "refactor(db): extract client initialization to db/client.ts"
```

---

## Task 3: Extract interfaces to shared types

**Files:**

- Create: `src/lib/db/types.ts` - Shared interfaces
- Modify: `src/lib/db/index.ts` - Add re-export
- Modify: Various module files - Use shared types

**Step 1: Create types.ts with all interfaces**

From `src/lib/db.ts` lines 93-224, extract these interfaces:

- Idea
- IdeaSession
- Deliverable
- Task
- Vector
- AgentLog
- ClarificationSessionRow
- ClarificationAnswerRow
- PaginationOptions
- PaginatedResult
- ConnectionHealth

**Step 2: Update index.ts**

```typescript
export * from './types';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/types.ts src/lib/db/index.ts
git commit -m "refactor(db): extract interfaces to db/types.ts"
```

---

## Task 4: Extract ideas module (src/lib/db/ideas.ts)

**Files:**

- Create: `src/lib/db/ideas.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: Create ideas.ts**

Extract from DatabaseService:

- createIdea
- getIdea
- getUserIdeas
- getUserIdeasPaginated
- updateIdea
- softDeleteIdea
- deleteIdea
- getIdeaStats

**Step 2: Update index.ts**

```typescript
export { dbIdeas } from './ideas';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/ideas.ts src/lib/db/index.ts
git commit -m "refactor(db): extract ideas operations to db/ideas.ts"
```

---

## Task 5: Extract deliverables module (src/lib/db/deliverables.ts)

**Files:**

- Create: `src/lib/db/deliverables.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: Create deliverables.ts**

Extract from DatabaseService:

- createDeliverable
- createDeliverables
- getIdeaDeliverables
- getIdeaDeliverablesWithTasks
- getDeliverableWithIdea
- updateDeliverable
- softDeleteDeliverable
- deleteDeliverable

**Step 2: Update index.ts**

```typescript
export { dbDeliverables } from './deliverables';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/deliverables.ts src/lib/db/index.ts
git commit -m "refactor(db): extract deliverables operations to db/deliverables.ts"
```

---

## Task 6: Extract tasks module (src/lib/db/tasks.ts)

**Files:**

- Create: `src/lib/db/tasks.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: Create tasks.ts**

Extract from DatabaseService:

- createTask
- createTasks
- getDeliverableTasks
- getTask
- updateTask
- softDeleteTask
- deleteTask
- getTaskWithOwnership

**Step 2: Update index.ts**

```typescript
export { dbTasks } from './tasks';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/tasks.ts src/lib/db/index.ts
git commit -m "refactor(db): extract tasks operations to db/tasks.ts"
```

---

## Task 7: Extract sessions module (src/lib/db/sessions.ts)

**Files:**

- Create: `src/lib/db/sessions.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: Create sessions.ts**

Extract from DatabaseService:

- upsertIdeaSession
- getIdeaSession
- createClarificationSession
- saveAnswers

**Step 2: Update index.ts**

```typescript
export { dbSessions } from './sessions';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/sessions.ts src/lib/db/index.ts
git commit -m "refactor(db): extract session operations to db/sessions.ts"
```

---

## Task 8: Extract vectors module (src/lib/db/vectors.ts)

**Files:**

- Create: `src/lib/db/vectors.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: Create vectors.ts**

Extract from DatabaseService:

- storeVector
- getVectors
- getVectorsPaginated
- getVectorsByIdeaIds
- deleteVector
- storeEmbedding
- searchSimilarVectors

**Step 2: Update index.ts**

```typescript
export { dbVectors } from './vectors';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/vectors.ts src/lib/db/index.ts
git commit -m "refactor(db): extract vector operations to db/vectors.ts"
```

---

## Task 9: Extract logs module (src/lib/db/logs.ts)

**Files:**

- Create: `src/lib/db/logs.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: Create logs.ts**

Extract from DatabaseService:

- logAgentAction
- getAgentLogs
- getAgentLogsPaginated

**Step 2: Update index.ts**

```typescript
export { dbLogs } from './logs';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/logs.ts src/lib/db/index.ts
git commit -m "refactor(db): extract log operations to db/logs.ts"
```

---

## Task 10: Create unified DatabaseService wrapper

**Files:**

- Create: `src/lib/db/service.ts` - Unified DatabaseService
- Modify: `src/lib/db/index.ts` - Re-export unified service
- Modify: `src/lib/db.ts` - Update to use new modules

**Step 1: Create service.ts**

The new unified DatabaseService should:

- Import and compose all module services
- Maintain the same public API
- Delegate to appropriate modules

**Step 2: Update index.ts**

```typescript
export { DatabaseService, dbService } from './service';
```

**Step 3: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/db/service.ts src/lib/db/index.ts
git commit -m "refactor(db): create unified DatabaseService in db/service.ts"
```

---

## Task 11: Maintain backward compatibility in db.ts

**Files:**

- Modify: `src/lib/db.ts` - Re-export from new modules

**Step 1: Update db.ts**

Replace all implementation with re-exports from the new modules:

```typescript
// Re-export everything from db modules for backward compatibility
export { supabaseClient, getSupabaseAdmin } from './db/client';
export * from './db/types';
export { DatabaseService, dbService } from './db/service';
export { dbIdeas } from './db/ideas';
export { dbDeliverables } from './db/deliverables';
export { dbTasks } from './db/tasks';
export { dbSessions } from './db/sessions';
export { dbVectors } from './db/vectors';
export { dbLogs } from './db/logs';
export type { Database } from '@/types/database';
```

**Step 2: Run tests**

Run: `npm run test:ci`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "refactor(db): update db.ts to re-export from modules"
```

---

## Task 12: Verify line counts

**Step 1: Check line counts**

Run: `wc -l src/lib/db/*.ts`
Expected: Each file under 300 lines

**Step 2: Commit**

```bash
git commit --allow-empty -m "chore(db): verify module line counts"
```

---

## Task 13: Verify no circular dependencies

**Step 1: Check for circular deps**

Run: `npm run check:circular`
Expected: No circular dependencies

If circular deps found, refactor imports to break the cycle.

**Step 2: Commit**

```bash
git commit --allow-empty -m "chore(db): verify no circular dependencies"
```

---

## Task 14: Final verification

**Step 1: Run full test suite**

Run: `npm run check`
Expected: All checks pass (lint, type-check, tests)

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors, no warnings

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor(db): complete decomposition - all tests pass"
```

---

## Plan Execution Options

**Plan complete and saved to `docs/plans/2026-05-12-decompose-database-service.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review each, maintain tight feedback loop.

**2. Parallel Agent Execution** - I spawn multiple agents to work independent tasks concurrently, then integrate results.

**3. Self-Executed** - You run through the plan yourself in a separate session.

Which would you prefer?

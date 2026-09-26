/**
 * Repository abstractions (DIP) for database access.
 *
 * Problem: API routes import the concrete `dbService` singleton directly,
 * violating the Dependency Inversion Principle (high-level route handlers
 * depend on a low-level concrete instead of an abstraction).
 *
 * Pattern (minimal, behavior-preserving):
 * - Routes depend on the `IIdeaRepository` interface.
 * - `getIdeaRepository()` factory returns the production implementation
 *   (bound `dbService` methods) by default.
 * - Tests / future callers inject a fake via `__setIdeaRepository()` or by
 *   passing `overrides` to the factory — no route logic changes needed.
 *
 * @module lib/db/repository
 */

import type { Idea, PaginatedResult, PaginationOptions } from './types';
import { dbService } from './service';

export type IdeaStatusFilter =
  | Idea['status']
  | 'all'
  | undefined;

export interface IdeaListFilters {
  status?: IdeaStatusFilter;
  search?: string;
}

export type NewIdeaInput = Omit<Idea, 'id' | 'created_at'>;

/**
 * Minimal idea-repository abstraction covering what `GET/POST /api/ideas`
 * needs. Extend incrementally (getIdea, updateIdea, ...) as more routes
 * migrate — do not grow this in one big-bang refactor.
 */
export interface IIdeaRepository {
  getUserIdeasPaginated(
    userId: string,
    pagination?: PaginationOptions,
    filters?: IdeaListFilters
  ): Promise<PaginatedResult<Idea>>;
  createIdea(idea: NewIdeaInput): Promise<Idea>;
}

/** Alias for convenience. */
export type IdeaRepository = IIdeaRepository;

let injectedRepository: IIdeaRepository | null = null;

/**
 * Resolve the active repository. Production default delegates to the
 * `dbService` singleton; an injected fake (set via
 * `__setIdeaRepository`) takes precedence when present.
 */
export function getIdeaRepository(
  overrides?: Partial<IIdeaRepository>
): IIdeaRepository {
  const base: IIdeaRepository =
    injectedRepository ?? createIdeaRepository(dbService);
  if (!overrides) return base;
  return { ...base, ...overrides };
}

/**
 * Build a repository adapter around any object exposing the two methods
 * (the concrete `DatabaseService`, a mock, etc.). Keeps `this` binding
 * correct via explicit closures instead of `.bind()`.
 */
export function createIdeaRepository(
  service: Pick<IIdeaRepository, 'getUserIdeasPaginated' | 'createIdea'>
): IIdeaRepository {
  return {
    getUserIdeasPaginated: (userId, pagination, filters) =>
      service.getUserIdeasPaginated(userId, pagination, filters),
    createIdea: (idea) => service.createIdea(idea),
  };
}

/**
 * Test-only seam: inject a fake repository (or reset with `null`).
 * Not used by production code paths.
 */
export function __setIdeaRepository(repo: IIdeaRepository | null): void {
  injectedRepository = repo;
}

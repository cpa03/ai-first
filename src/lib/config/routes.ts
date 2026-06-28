/**
 * Page Routes Configuration
 *
 * Centralizes all client-side page navigation paths for better modularity
 * and maintainability. Eliminates hardcoded route strings throughout the codebase.
 *
 * Supports environment variable overrides via EnvLoader for flexibility
 * in different deployment environments.
 *
 * Usage:
 * ```typescript
 * import { ROUTES } from '@/lib/config';
 * router.push(ROUTES.DASHBOARD);
 * <Link href={ROUTES.LOGIN}>Login</Link>
 * ```
 *
 * ## Migration Guide
 *
 * Replace hardcoded route strings with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * router.push('/dashboard');
 * <Link href="/signup">Sign Up</Link>
 *
 * // AFTER (modular)
 * import { ROUTES } from '@/lib/config';
 * router.push(ROUTES.DASHBOARD);
 * <Link href={ROUTES.SIGNUP}>Sign Up</Link>
 * ```
 */

import { EnvLoader } from './environment';

/**
 * Page Routes
 * All client-side navigation paths centralized in one place
 */
export const ROUTES = {
  /** Home/landing page */
  HOME: EnvLoader.string('ROUTE_HOME', '/'),

  /** Clarification flow page */
  CLARIFY: EnvLoader.string('ROUTE_CLARIFY', '/clarify'),

  /** Results/blueprint display page */
  RESULTS: EnvLoader.string('ROUTE_RESULTS', '/results'),

  /** Dashboard page - authenticated user's idea list */
  DASHBOARD: EnvLoader.string('ROUTE_DASHBOARD', '/dashboard'),

  /** Login page */
  LOGIN: EnvLoader.string('ROUTE_LOGIN', '/login'),

  /** Signup page */
  SIGNUP: EnvLoader.string('ROUTE_SIGNUP', '/signup'),

  /** Auth callback page - handles OAuth redirects */
  AUTH_CALLBACK: EnvLoader.string('ROUTE_AUTH_CALLBACK', '/auth/callback'),

  /** Documentation page */
  DOCS: EnvLoader.string('ROUTE_DOCS', '/docs'),

  /** About page */
  ABOUT: EnvLoader.string('ROUTE_ABOUT', '/about'),

  /** Contact page */
  CONTACT: EnvLoader.string('ROUTE_CONTACT', '/contact'),

  /** Forgot password page */
  FORGOT_PASSWORD: EnvLoader.string(
    'ROUTE_FORGOT_PASSWORD',
    '/forgot-password'
  ),
} as const;

/**
 * TypeScript type for ROUTES
 */
export type Routes = typeof ROUTES;

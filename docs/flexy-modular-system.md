# Flexy Modular System

> **Flexy** loves modularity and hates hardcoded values. **Flexy**'s mission is to eliminate hardcoded values and create modular, configurable systems.

## Philosophy

The Flexy Modular System is the architectural pattern used throughout IdeaFlow to ensure:

1. **No Hardcoded Values** - Every magic number, string, URL, or configuration is centralized
2. **Environment Variable Support** - All values can be overridden via environment variables
3. **Type Safety** - Full TypeScript support with proper types
4. **Documentation** - Every constant includes JSDoc with default values and env var names

## Architecture

### Configuration Directory Structure

```
src/lib/config/
├── index.ts                    # Central export point
├── environment.ts              # EnvLoader utility
├── modular-constants.ts        # Core modular constants
├── app.ts                      # Application configuration
├── api-endpoints.ts            # API endpoint paths
├── routes.ts                   # Client-side routes
├── theme.ts                    # Theme and styling
├── validation.ts               # Validation rules
├── agents.ts                   # AI agent configuration
├── ... (60+ config files)
```

### Core Pattern: EnvLoader

Every configurable value uses `EnvLoader` for environment variable support:

```typescript
import { EnvLoader } from './environment';

export const MY_CONFIG = {
  /**
   * Description of the constant
   * Env: MY_ENV_VAR (default: 42)
   */
  MY_VALUE: EnvLoader.number('MY_ENV_VAR', 42, 1, 100),
} as const;
```

### Benefits

1. **Single Source of Truth** - All values defined in one place
2. **Environment Overrides** - Change behavior without code changes
3. **Type Safety** - TypeScript catches errors at compile time
4. **Documentation** - Self-documenting with JSDoc
5. **Testability** - Easy to mock in tests

## Usage Examples

### Before (Hardcoded)

```typescript
// ❌ Bad - hardcoded values
const maxRetries = 3;
const timeout = 5000;
const apiUrl = 'https://api.example.com';
```

### After (Modular)

```typescript
// ✅ Good - modular configuration
import { RETRY_CONFIG, TIMEOUT_CONFIG, API_CONFIG } from '@/lib/config';

const maxRetries = RETRY_CONFIG.MAX_RETRIES;
const timeout = TIMEOUT_CONFIG.QUICK;
const apiUrl = API_CONFIG.BASE_URL;
```

## Configuration Categories

### Core Configuration

- `modular-constants.ts` - Hash, timestamp, session, rate limit configs
- `app.ts` - Application metadata and branding
- `environment.ts` - Environment detection and EnvLoader

### API Configuration

- `api-endpoints.ts` - API route paths
- `api-routes.ts` - API route constants
- `timeout-config.ts` - API timeout values

### UI Configuration

- `theme.ts` - Colors, spacing, animations
- `ui-dimensions.ts` - Pixel dimensions
- `animation-classes.ts` - Tailwind animation classes
- `component-styles.ts` - Component-specific styles

### Feature Configuration

- `agents.ts` - AI agent settings
- `validation.ts` - Input validation rules
- `cache.ts` - Caching configuration

## Adding New Constants

1. **Choose the right config file** - Or create a new one in `src/lib/config/`
2. **Use EnvLoader** - For environment variable support
3. **Add JSDoc** - Document the default value and env var name
4. **Export from index.ts** - Make it available to the codebase

```typescript
// In your config file
export const NEW_CONFIG = {
  /**
   * Maximum items to display
   * Env: NEW_MAX_ITEMS (default: 10)
   */
  MAX_ITEMS: EnvLoader.number('NEW_MAX_ITEMS', 10, 1, 100),
} as const;
```

## Environment Variables

All environment variables follow the pattern:

- `SCREAMING_SNAKE_CASE`
- Prefixed by category (e.g., `API_TIMEOUT_*`, `RATE_LIMIT_*`)
- Documented in JSDoc of each constant

## Validation

The `config-validator.ts` module validates configuration at startup:

```typescript
import { validateConfiguration } from '@/lib/config';

const result = validateConfiguration();
if (!result.healthy) {
  console.error('Configuration errors:', result.errors);
}
```

## Migration Guide

When you find hardcoded values in the codebase:

1. **Identify the value** - What is it? Where is it used?
2. **Choose or create a config** - Find the appropriate config file
3. **Add with EnvLoader** - Support environment overrides
4. **Update the code** - Import and use the config constant
5. **Document** - Add JSDoc with default and env var

## Related Files

- `src/lib/config/index.ts` - Central exports
- `src/lib/config/environment.ts` - EnvLoader implementation
- `src/lib/config/modular-constants.ts` - Core constants
- `src/lib/config/config-validator.ts` - Configuration validation

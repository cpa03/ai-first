# Configuration Guide

This document describes all configurable options in IdeaFlow.

## Overview

IdeaFlow uses a modular configuration system that allows you to customize behavior through environment variables. All configuration is centralized in `src/lib/config/` directory.

## Environment Variables

### Required Variables

| Variable                        | Description               | Default |
| ------------------------------- | ------------------------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      | -       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | -       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | -       |
| `OPENAI_API_KEY`                | OpenAI API key            | -       |
| `ANTHROPIC_API_KEY`             | Anthropic API key         | -       |

### Optional Variables

| Variable           | Description          | Default               |
| ------------------ | -------------------- | --------------------- |
| `APP_BASE_URL`     | Base URL for the app | `https://ideaflow.ai` |
| `APP_SITE_URL`     | Site URL for SEO     | `https://ideaflow.ai` |
| `COST_LIMIT_DAILY` | Daily AI cost limit  | `10.0`                |

## Configuration Modules

### Application Configuration (`src/lib/config/app.ts`)

Base application URLs and metadata.

```typescript
import { APP_CONFIG } from '@/lib/config';

// Usage
const baseUrl = APP_CONFIG.BASE; // https://ideaflow.ai
const siteUrl = APP_CONFIG.SITE; // https://ideaflow.ai
```

### Navigation Configuration (`src/lib/config/navigation.ts`)

Navigation items and social links.

```typescript
import { MAIN_NAV_CONFIG, FOOTER_NAV_CONFIG } from '@/lib/config';

// Usage
const navItems = MAIN_NAV_CONFIG.ITEMS;
const socialLinks = FOOTER_NAV_CONFIG.SOCIAL_LINKS;
```

**Environment Variables:**

- `MAIN_NAV_ITEMS` - JSON string of nav items
- `FOOTER_SOCIAL_LINKS` - JSON string of social links

### UI Configuration (`src/lib/config/ui.ts`)

UI constants, styling, and component defaults.

```typescript
import { UI_CONFIG, UI_STRINGS } from '@/lib/config';

// Usage
const animationDuration = UI_CONFIG.ANIMATION.DURATION.NORMAL;
const whyChooseAnimations = UI_STRINGS.ANIMATION.WHY_CHOOSE;
```

### Animation Configuration (`src/lib/config/animation.ts`)

Animation timing values.

```typescript
import { ANIMATION_CONFIG } from '@/lib/config';

// Usage
const fastAnimation = ANIMATION_CONFIG.FAST;
const taskProgressDuration = ANIMATION_CONFIG.TASK_MANAGEMENT.PROGRESS_DURATION;
```

### Error Messages (`src/lib/config/error-messages.ts`)

Centralized error messages.

```typescript
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

// Usage
const errorMsg = API_ERROR_MESSAGES.AI.OPENAI_NOT_INITIALIZED;
```

### HTTP Status Codes (`src/lib/config/http.ts`)

HTTP status codes and headers.

```typescript
import { STATUS_CODES, HTTP_HEADERS } from '@/lib/config/http';

// Usage
const okStatus = STATUS_CODES.OK; // 200
const contentType = HTTP_HEADERS.CONTENT_TYPE;
```

## Adding New Configuration

1. Create or update the appropriate config file in `src/lib/config/`
2. Use `EnvLoader` for environment variable support
3. Export the configuration constant
4. Update the central index file if needed
5. Add tests for the configuration
6. Update this documentation

### Example

```typescript
// src/lib/config/my-config.ts
import { EnvLoader } from './environment';

export const MY_CONFIG = {
  SETTING: EnvLoader.string('MY_SETTING', 'default-value'),
  NUMBER: EnvLoader.number('MY_NUMBER', 42, 0, 100),
} as const;
```

## Testing Configuration

All configuration modules should have corresponding tests in `tests/` directory.

```typescript
// tests/my-config.test.ts
import { MY_CONFIG } from '@/lib/config/my-config';

describe('MY_CONFIG', () => {
  it('should have default values', () => {
    expect(MY_CONFIG.SETTING).toBeDefined();
    expect(MY_CONFIG.NUMBER).toBe(42);
  });
});
```

## Best Practices

1. **Use Environment Variables**: Always use `EnvLoader` for configurable values
2. **Provide Defaults**: Always provide sensible defaults
3. **Document Changes**: Update this guide when adding new configuration
4. **Test Configuration**: Add tests for new configuration modules
5. **Keep Centralized**: Use the central index file for exports

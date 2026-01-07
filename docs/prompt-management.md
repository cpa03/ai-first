# Prompt Management Blueprint

## Overview

The Prompt Management system provides a clean, maintainable approach to managing AI prompt templates across the application. Prompts are separated from code logic, enabling easier maintenance, version control, and A/B testing.

## Architecture

### Core Components

1. **PromptService** (`src/lib/prompts/prompt-service.ts`)
   - Loads prompt templates from the file system
   - Provides variable interpolation using `{{variable}}` syntax
   - Implements caching to avoid repeated file reads
   - Graceful error handling with descriptive messages

2. **Prompt Template Directory Structure**
   ```
   src/lib/prompts/
   ├── prompt-service.ts       # Core PromptService implementation
   ├── index.ts                # Public API exports
   ├── clarifier/              # Clarifier agent prompts
   │   ├── system.txt
   │   ├── generate-questions.txt
   │   ├── refine-idea-system.txt
   │   └── refine-idea.txt
   └── breakdown/             # Breakdown engine prompts
       ├── analyze-idea-system.txt
       ├── analyze-idea.txt
       ├── decompose-tasks-system.txt
       └── decompose-tasks.txt
   ```

## API

### PromptService Methods

#### `loadPrompt(agentName: string, promptName: string, variables?: Record<string, any>): string`

Loads a prompt template and optionally interpolates variables.

**Parameters:**

- `agentName`: Name of the agent (e.g., 'clarifier', 'breakdown')
- `promptName`: Name of the prompt file (e.g., 'generate-questions.txt')
- `variables`: Optional object with key-value pairs for variable substitution

**Returns:** Interpolated prompt string

**Example:**

```typescript
import { promptService } from '@/lib/prompts';

const prompt = promptService.loadPrompt('clarifier', 'generate-questions.txt', {
  ideaText: 'Build a mobile app for tracking fitness goals',
});
```

#### `loadSystemPrompt(agentName: string): string`

Convenience method to load the system prompt for an agent.

**Parameters:**

- `agentName`: Name of the agent

**Returns:** System prompt string

#### `setCacheEnabled(enabled: boolean): void`

Enable or disable prompt caching.

#### `clearCache(): void`

Clear the prompt cache.

#### `reloadPrompt(agentName: string, promptName: string): void`

Reload a specific prompt from disk and update cache.

#### `promptExists(agentName: string, promptName: string): boolean`

Check if a prompt file exists.

#### `getCacheSize(): number`

Get the number of cached prompts.

## Variable Interpolation

Prompts support variable substitution using double curly braces: `{{variableName}}`

**Example Template:**

```
Analyze the following idea:

Idea: "{{ideaText}}"
User Responses: {{userResponses}}

Generate a detailed breakdown...
```

**Usage:**

```typescript
const prompt = promptService.loadPrompt('breakdown', 'analyze-idea.txt', {
  ideaText: 'Build a CRM system',
  userResponses: JSON.stringify(responses, null, 2),
});
```

## Benefits

1. **Separation of Concerns**: Prompts are separate from business logic
2. **Maintainability**: Easy to modify prompts without touching code
3. **Version Control**: Prompt changes are tracked in Git
4. **A/B Testing**: Easy to create multiple prompt versions
5. **Reusability**: Prompts can be shared across agents
6. **Caching**: Reduces file I/O and improves performance
7. **Type Safety**: Variables are explicitly provided

## Design Patterns Used

- **Singleton Pattern**: PromptService is exported as a singleton
- **Template Method Pattern**: Prompts follow a consistent structure
- **Cache Pattern**: Implemented for performance optimization

## Error Handling

The PromptService provides descriptive error messages:

- Missing prompt files: `Failed to load prompt ${agentName}/${promptName}: File not found`
- Invalid variables: Variables not found in template are left as-is (no error)

## Migration Path

For adding new agents:

1. Create a directory under `src/lib/prompts/` with the agent name
2. Add prompt template files (`.txt` extension)
3. Import `promptService` in the agent code
4. Replace inline prompts with `promptService.loadPrompt()` calls
5. Update this blueprint with the new prompts

## Future Enhancements

- Support for prompt versioning (v1, v2, etc.)
- A/B testing framework for prompt comparison
- Prompt analytics and performance tracking
- Multi-language prompt support
- Prompt validation to ensure all variables are provided

## Related Components

- **Clarifier Agent** (`src/lib/agents/clarifier.ts`): Uses clarifier prompts
- **Breakdown Engine** (`src/lib/agents/breakdown-engine.ts`): Uses breakdown prompts
- **AI Service** (`src/lib/ai.ts`): Provides model execution capabilities

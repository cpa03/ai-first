# Contributing to IdeaFlow

Thank you for your interest in contributing to IdeaFlow! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Development Scripts](#development-scripts)
- [IDE Setup](#ide-setup)
- [Troubleshooting](#troubleshooting)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ai-first.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and configure environment variables
5. Start development server: `npm run dev`

## Development Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Supabase account**: For database and authentication
- **GitHub account**: For repository automation

### Environment Variables

Copy the example environment file and configure your credentials:

```bash
cp config/.env.example .env.local
```

Required variables:

| Variable                        | Description               | Required |
| ------------------------------- | ------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | Server   |
| `OPENAI_API_KEY`                | OpenAI API key            | Optional |

### Package Manager

This project uses **npm** as its package manager. Please use npm for all dependency management:

- ✅ `npm install` - Install dependencies
- ✅ `npm run <script>` - Run npm scripts
- ❌ Do not use yarn or pnpm (to avoid lock file conflicts)
  JQ|- ❌ Do not use yarn or pnpm (to avoid lock file conflicts)
  #QH|
  #MB|### Pre-commit Hooks
  #QV|
  #KM|This project uses **Husky** and **lint-staged** for pre-commit code quality checks.
  #KM|
  #QV|After running `npm install`, the pre-commit hook will automatically run on every commit:
  #QM|
  #JB|- **ESLint** - Lints and fixes TypeScript/JavaScript files
  #QM|- **Prettier** - Formats code in staged files
  #QM|
  #BV|To bypass pre-commit hooks (use sparingly):
  #QM|
  #QS|`bash
#QS|git commit --no-verify -m "Your commit message"
#QS|`
  #QS|
  #QM|## Project Structure

## Project Structure

```
ai-first/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── clarify/      # Clarification flow
│   │   ├── dashboard/    # Dashboard pages
│   │   └── results/      # Results display
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core utilities and services
│   │   ├── agents/       # AI agent implementations
│   │   ├── prompts/      # AI prompt templates
│   │   └── resilience/   # Circuit breaker, retry logic
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles
├── tests/                # Test files
├── docs/                 # Documentation
├── config/               # Configuration files
└── supabase/             # Database schema and migrations
```

## Coding Standards

### TypeScript

- Use **strict mode** for all TypeScript code
- Explicitly type function parameters and return types
- Avoid `any` type; use `unknown` when type is truly unknown
- Use path aliases (`@/`) for imports from `src/`

```typescript
// Good
import { createIdea } from '@/lib/db';

export async function processIdea(ideaId: string): Promise<Idea> {
  // ...
}

// Bad
import { createIdea } from '../../../lib/db';

export async function processIdea(ideaId): Promise<any> {
  // ...
}
```

### React Components

- Use functional components with hooks
- Follow the single responsibility principle
- Keep components small and focused
- Use TypeScript interfaces for props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  onClick,
  children,
}: ButtonProps) {
  // ...
}
```

### Styling

- Use **Tailwind CSS** for all styling
- Use `clsx` for conditional class names
- Follow the existing class name patterns

### Error Handling

- Use the `AppError` class for custom errors
- Include error codes from `src/lib/errors.ts`
- Log errors with context using the logger

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

### Writing Tests

- Place tests in the `tests/` directory
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

```typescript
describe('IdeaService', () => {
  it('should create a new idea with valid input', async () => {
    // Arrange
    const input = { title: 'Test Idea', description: 'Test' };

    // Act
    const result = await createIdea(input);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.title).toBe(input.title);
  });
});
```

### Test Categories

- **Unit tests**: Test individual functions/components
- **Integration tests**: Test API routes and services
- **Component tests**: Test React components with Testing Library

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                           |
| ---------- | ------------------------------------- |
| `feat`     | New feature                           |
| `fix`      | Bug fix                               |
| `docs`     | Documentation changes                 |
| `style`    | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring                      |
| `test`     | Adding or modifying tests             |
| `chore`    | Maintenance tasks                     |
| `perf`     | Performance improvements              |

### Examples

```bash
feat(clarify): add keyboard navigation support
fix(api): resolve timeout issue in clarification endpoint
docs(readme): update installation instructions
test(resilience): add circuit breaker edge case tests
```

### Agent Commits

If you're an AI agent, include `AGENT=<agent-name>` in your commit messages:

```bash
feat(ui): add loading spinner component

AGENT=frontend-engineer
```

## Pull Request Process

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Run checks** before pushing:

   ```bash
   npm run lint && npm run type-check && npm run test:ci
   ```

4. **Push your branch** and create a PR:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Fill out the PR template** completely:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (if applicable)

6. **Wait for CI** to pass and code review

### PR Checklist

- [ ] All tests pass
- [ ] Lint and type-check pass
- [ ] Documentation updated (if applicable)
- [ ] PR description is complete
- [ ] Linked to relevant issues

## Development Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server             |
| `npm run dev:check`    | Start dev server with env validation |
| `npm run build`        | Build for production                 |
| `npm run build:check`  | Build with env validation            |
| `npm run lint`         | Run ESLint                           |
| `npm run lint:fix`     | Run ESLint with auto-fix             |
| `npm run type-check`   | Run TypeScript type checking         |
| `npm test`             | Run tests                            |
| `npm run test:ci`      | Run tests with coverage (CI mode)    |
| `npm run test:watch`   | Run tests in watch mode              |
| `npm run test:changed` | Run only tests for changed files     |
| `npm run env:check`    | Validate environment configuration   |
| `npm run check`        | Run lint, type-check, and tests      |

## IDE Setup

### VS Code (Recommended)

1. Install the recommended extensions when prompted
2. Settings are pre-configured in `.vscode/settings.json`
3. Extensions are listed in `.vscode/extensions.json`

**Recommended Extensions:**

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- TypeScript Nightly (`ms-vscode.vscode-typescript-next`)

### EditorConfig

An `.editorconfig` file is provided for consistent formatting across editors. Most modern editors support this out of the box or via plugin.

## Troubleshooting

### Common Issues

**Module not found errors:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Type errors after pull:**

```bash
npm run type-check
```

**Test failures:**

```bash
npm run test:ci -- --clearCache
npm run test:ci
```

**Environment variables not loading:**

- Ensure `.env.local` exists in the project root
- Restart the development server after changes

### Getting Help

- Check existing [issues](https://github.com/cpa03/ai-first/issues)
- Review [documentation](./docs/)
- Open a new issue with:
  - Clear description of the problem
  - Steps to reproduce
  - Expected vs. actual behavior
  - Environment details (Node.js version, OS, etc.)

## Code of Conduct

Please follow our Code of Conduct in all interactions:

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

---

Thank you for contributing to IdeaFlow!

# ADR-010: GitHub Actions for CI/CD

## Status

Accepted

## Context

We needed a CI/CD solution for automated testing and deployment. Options:

- **Jenkins**: Powerful but self-hosted, complex setup
- **CircleCI**: Good but costs add up
- **Travis CI**: Legacy, less modern features
- **GitLab CI**: Requires GitLab account
- **GitHub Actions**: Native to GitHub, generous free tier

## Decision

Use GitHub Actions for all CI/CD pipelines.

### Workflows

| Workflow                    | Trigger           | Purpose                   |
| --------------------------- | ----------------- | ------------------------- |
| `test-unified-workflow.yml` | Every PR          | Lint, type-check, tests   |
| `on-pull.yml`               | PR opened/updated | Code quality checks       |
| `parallel.yml`              | Manual            | Parallel test suites      |
| `iterate.yml`               | Schedule          | Continuous agent tasks    |
| `specialists-unified.yml`   | Issue/PR          | Specialist agent tasks    |
| `issue-solver.yml`          | Issue labeled     | Auto-solve labeled issues |

### Key Features

1. **Matrix builds**: Run tests across multiple Node versions
2. **Caching**: npm dependencies cached between runs
3. **Parallel jobs**: Independent tasks run simultaneously
4. **Artifacts**: Build outputs preserved for debugging
5. **Secrets**: Secure environment variable management

### Test Pipeline

```yaml
# .github/workflows/test-unified-workflow.yml
name: Test Suite

on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
```

## Consequences

### Positive

- **Native integration**: Everything in one place
- **Generous free tier**: 2000 mins/month free
- **Great docs**: Extensive action marketplace
- **Matrix builds**: Test on multiple configurations
- **Secret management**: Secure env vars

### Negative

- **GitHub dependency**: Must use GitHub
- **Minutes limits**: Heavy usage hits limits
- **Cold starts**: First run can be slow
- **Debugging**: Logs can be verbose

## Alternatives Considered

- **Vercel CI**: Tied to Vercel hosting
- **CircleCI**: Similar but separate platform
- **Self-hosted runners**: High setup cost

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CI/CD Pipeline](./deploy.md#cicd-pipeline)
- [Workflow Files](./.github/workflows/)

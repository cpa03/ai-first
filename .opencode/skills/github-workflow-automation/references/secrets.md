# Secrets Management

Managing secrets, environment variables, and security in GitHub Actions workflows.

---

## GitHub Secrets Types

### Repository Secrets
Repository-level secrets, accessible to all workflows in the repo.

**Location:** Settings → Secrets and variables → Actions → New repository secret

### Environment Secrets
Specific to deployment environments (staging, production).

**Location:** Settings → Environments → [Environment Name] → Secrets

### Organization Secrets
Shared across multiple repositories in the organization.

**Location:** Organization Settings → Secrets → New organization secret

---

## Using Secrets in Workflows

### Basic Secret Access

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}

jobs:
  job:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Use Secret
        run: echo "Using secret"
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

### Secret Environment Variable

```yaml
jobs:
  build:
    runs-on: ubuntu-24.04-arm
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    steps:
      - name: Use Env
        run: echo "Connecting to $DATABASE_URL"
```

---

## Required Secrets for OpenCode

### OpenCode GitHub App
**File:** `.github/workflows/opencode.yml`

```yaml
jobs:
  opencode:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: anomalyco/opencode/github@latest
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          model: opencode/kimi-k2.5-free
```

### OpenCode CLI with Secrets

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    env:
      # Pass OpenCode API key
      OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
   steps:
      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Run OpenCode
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          opencode run "Process with API key" \
            --model opencode/kimi-k2.5-free
```

---

## GITHUB_TOKEN and Permissions

### Define Permissions

```yaml
permissions:
  contents: write      # Repository files and commits
  pull-requests: write # PRs creation and comments
  issues: write        # Issues comments and labels
  id-token: write      # OIDC token generation
  actions: read        # Read workflow runs
```

### Pass GITHUB_TOKEN to Checkout

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Checkout with Write Access
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0
```

---

## Environment-Specific Secrets

### Deploy to Staging

```yaml
jobs:
  deploy-staging:
    environment: staging
    runs-on: ubuntu-24.04-arm
    env:
      DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      API_KEY: ${{ secrets.STAGING_API_KEY }}
    steps:
      - name: Deploy to Staging
        run: echo "Deploying to staging..."
```

### Deploy to Production

```yaml
jobs:
  deploy-production:
    environment: production
    runs-on: ubuntu-24.04-arm
    env:
      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
      API_KEY: ${{ secrets.PROD_API_KEY }}
    steps:
      - name: Deploy to Production
        run: echo "Deploying to production..."
```

---

## Secret Encryption

### GitHub Secret Encryption
GitHub secrets are encrypted at rest and only passed to workflows that reference them.

**Best Practices:**
- Never log secrets in workflow output
- Use `@actions/core` setSecret to mask values
- Use environment variables instead of inline secrets

### Masking Secrets in Output

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Install CLI for Masking
        run: |
          echo "::add-mask::${{ secrets.SECRET_VALUE }}"
          echo "This value is now masked in logs"
```

### Using Core Action to Mask

**In bash script:**
```bash
# Mask secret
echo "::add-mask::${SECRET}"

# Use secret
curl -H "Authorization: Bearer ${SECRET}" https://api.example.com
```

---

## Working with .env Files

### Create .env from Secrets

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Create .env File
        run: |
          cat > .env <<EOF
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          API_KEY=${{ secrets.API_KEY }}
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          EOF

      - name: Verify .env
        run: |
          cat .env | grep -v "DATABASE_URL" | grep -v "API_KEY" | grep -v "JWT_SECRET"
```

### Use .env in Node.js

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Setup Environment
        run: |
          cat > .env <<EOF
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          EOF

      - name: Run Node.js App
        run: |
          node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'DB loaded' : 'DB missing');"
```

---

## Custom Secrets Configuration

### Multiple API Keys

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    env:
      PRIMARY_API_KEY: ${{ secrets.PRIMARY_API_KEY }}
      SECONDARY_API_KEY: ${{ secrets.SECONDARY_API_KEY }}
      BACKUP_API_KEY: ${{ secrets.BACKUP_API_KEY }}
    steps:
      - name: Use Multiple Keys
        run: echo "Using multiple API keys"
```

### Rotating Secrets

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    env:
      # Try new secret, fallback to old
      API_KEY: ${{ secrets.API_KEY_V2 || secrets.API_KEY_V1 }}
    steps:
      - name: Rotate Secret
        run: echo "Using rotated API key"
```

---

## Secret Validation

### Validate Secret Before Use

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Validate Secrets
        id: validate
        run: |
          if [ -z "${{ secrets.API_KEY }}" ]; then
            echo "secret_valid=false" >> $GITHUB_OUTPUT
            echo "API_KEY is not set"
            exit 1
          fi
          echo "secret_valid=true" >> $GITHUB_OUTPUT

      - name: Use Secret
        if: steps.validate.outputs.secret_valid == 'true'
        run: echo "Secret is valid"
```

### Required Secrets Check

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Check Required Secrets
        run: |
          REQUIRED_SECRETS=("API_KEY" "DATABASE_URL" "JWT_SECRET")
          MISSING=()

          for secret in "${REQUIRED_SECRETS[@]}"; do
            if [ -z "${{ secrets[secret] }}" ]; then
              MISSING+=("$secret")
            fi
          done

          if [ ${#MISSING[@]} -gt 0 ]; then
            echo "Missing secrets: ${MISSING[*]}"
            exit 1
          fi

          echo "All required secrets are set"
```

---

## Secrets vs Environment Variables

| Feature | Secrets | Environment Variables |
|----------|---------|----------------------|
| Encryption | Encrypted at rest | Plain text |
| Visibility | Hidden in logs | Visible in logs |
| Scope | Repo/Org/Env | Job/Step/Global |
| Access Control | granular | limited |
| Persistence | Persistent | Runtime only |
| Best for | API keys, passwords | Configuration flags |

**When to Use Secrets:**
- API keys
- Database passwords
- JWT secrets
- Authentication tokens
- Sensitive credentials

**When to Use Environment Variables:**
- Feature flags
- Environment names (dev, staging, prod)
- API URLs
- Configuration paths
- Non-sensitive data

---

## Security Best Practices

### 1. Never Log Secrets

```yaml
- name: Bad Example
  run: echo "Using API key ${{ secrets.API_KEY }}"  # DON'T DO THIS

- name: Good Example
  run: echo "Using API key"  # DO THIS
```

### 2. Mask Secrets Explicitly

```bash
# Before using secret
echo "::add-mask::${API_KEY}"

# Then use it
curl -H "Authorization: ${API_KEY}" https://api.example.com
```

### 3. Avoid Committing Secrets
**Don't commit `.env` or secrets files:**

```gitignore
# .gitignore
.env
.env.local
secrets.txt
```

### 4. Rotate Secrets Regularly
Set reminders to rotate:
- API keys
- Database passwords
- JWT secrets
- OAuth tokens

### 5. Use Least Privilege
Give minimum required permissions:

```yaml
permissions:
  contents: read  # Only read if not committing
```

### 6. Environment-Specific Secrets
Different secrets for different environments:

```yaml
STAGING_DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}
PRODUCTION_DATABASE_URL=${{ secrets.PRODUCTION_DATABASE_URL }}
```

### 7. Validate Secrets at Runtime
Check if secret is set before using:

```bash
if [ -z "${{ secrets.API_KEY }}" ]; then
  echo "API_KEY not set"
  exit 1
fi
```

---

## Troubleshooting Secrets

### Secret Not Found

**Error:**
```
Error: Unable to resolve variable 'secrets.MY_SECRET'
```

**Solutions:**
1. Verify secret is created
2. Check secret name matches exactly
3. Ensure secret is in correct scope (repo/org)
4. For environment secrets, ensure environment is set

### Secret Not Passed to Action

**Error:**
```
Error: API key required
```

**Solutions:**
1. Pass secret via `env:` instead of `with:`
2. Use `secrets.GITHUB_TOKEN` for actions that need it
3. Double-check secret syntax: `${{ secrets.MY_SECRET }}`

### Secret Leaked in Logs

**Error:**
Secret appears in workflow logs.

**Solutions:**
1. Rotate the secret immediately
2. Mask the secret before use
3. Don't echo secrets
4. Check environment output
5. Use `@actions/core` setSecret

---

## Summary

Key concepts covered:
- Secret types (repo, env, org)
- Using secrets in workflows
- GITHUB_TOKEN and permissions
- Environment-specific secrets
- Secret masking
- Working with .env files
- Secret validation
- Security best practices
- Troubleshooting

**Critical Rule:** Never log secrets; always mask them before use.
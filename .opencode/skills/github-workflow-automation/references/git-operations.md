# Git Operations in GitHub Actions

Git operations for automation workflows, including branch strategies and conflict handling.

---

## Standard Git Configuration

### Git User Setup
Configure git user for automated commits:

```yaml
- name: Configure Git
  run: |
    git config --global user.name "${{ github.actor }}"
    git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"
```

### Verify Git Configuration
```yaml
- name: Verify Git Config
  run: |
    git config --global user.name
    git config --global user.email
```

---

## Fetch Depth Strategy

### Fetch Depth: Full History
Use `fetch-depth: 0` for git operations that need full history:

```yaml
- name: Checkout Code
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    token: ${{ secrets.GITHUB_TOKEN }}
```

**When to use:**
- Creating branches
- Merging branches
- Checking previous commits
- Git blame operations

### Fetch Depth: Default (1 commit)

```yaml
- name: Shallow Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 1
```

**When to use:**
- Simple CI/CD
- Single commit operations
- Performance-critical workflows

---

## Branch Management

### Standard agent-workspace Pattern

This is the **MANDATORY** branch strategy for all automations.

```yaml
- name: Branch Management (agent-workspace)
  run: |
    git fetch --all

    # Check if agent-workspace branch exists
    if git branch -r | grep "origin/agent-workspace"; then
      # Branch exists: checkout and pull
      git checkout agent-workspace
      git pull origin agent-workspace
    else
      # Branch doesn't exist: create from current ref
      git checkout -b agent-workspace
    fi

    # Merge main to keep up to date
    git merge origin/main --no-edit || echo "Merge conflict or already up to date"
```

### Create Feature Branch from agent-workspace

```yaml
- name: Create Feature Branch
  run: |
    MAIN_REF=${{ github.event.issue.number || 'feature' }}
    BRANCH_NAME=agent/feature-${MAIN_REF}

    # Start from agent-workspace
    git checkout agent-workspace
    git pull origin agent-workspace

    # Create feature branch
    git checkout -b ${BRANCH_NAME}

    # Save branch name for later use
    echo "branch_name=${BRANCH_NAME}" >> $GITHUB_ENV
```

### Clean Up Old Branches

```yaml
- name: Clean Up Old Branches
  run: |
    git fetch --prune
    # Delete merged local branches
    git branch --merged | grep -v "main" | grep -v "agent-workspace" | xargs -I {} git branch -d {}
```

---

## Merge Operations

### Simple Merge

```yaml
- name: Merge main into agent-workspace
  run: |
    git fetch --all
    git checkout agent-workspace
    git merge origin/main -m "Merge branch 'main' into agent-workspace"
```

### Merge with No-Edit

```yaml
- name: Merge (No Edit)
  run: |
    git checkout agent-workspace
    git merge origin/main --no-edit
```

### Merge with Custom Message

```yaml
- name: Merge with Custom Message
  run: |
    MESSAGE="Merging main after deploy"
    git checkout agent-workspace
    git merge origin/main -m "${MESSAGE}"
```

### Squash Merge

```yaml
- name: Squash Merge
  run: |
    git checkout main
    git merge --squash feature-branch
    git commit -m "Squash merged feature-branch"
```

---

## Conflict Resolution

### Abort on Conflicts

```yaml
- name: Safe Merge (Abort on Conflict)
  id: merge
  continue-on-error: true
  run: |
    git checkout agent-workspace
    git merge origin/main

- name: Check Merge Status
  if: steps.merge.outcome == 'failure'
  run: |
    echo "Merge failed due to conflicts"
    git merge --abort
    # Handle conflict (notify, create issue, etc.)
```

### Resolve Conflicts with OpenCode

```yaml
- name: Resolve Conflicts
  run: |
    if [ -f .git/MERGE_HEAD ]; then
      # Conflicts detected
      echo "Conflicts found, resolving..."

      opencode run "$(cat <<'PROMPT'
        Resolve git merge conflicts in agent-workspace branch.

        Check for conflict markers:
        - <<<<<<< HEAD
        - =======  
        - >>>>>>> branch-name

        Resolve each conflict by:
        1. Understanding both sides
        2. Choosing correct code
        3. Removing conflict markers
        4. Committing resolution: "Resolved merge conflicts"

        Don't break existing tests.
      PROMPT
      )" --model opencode/kimi-k2.5-free
    fi
```

### Check for Uncommitted Changes

```yaml
- name: Check for Uncommitted Changes
  id: status
  run: |
    if [ -z "$(git status --porcelain)" ]; then
      echo "clean=true" >> $GITHUB_OUTPUT
    else
      echo "clean=false" >> $GITHUB_OUTPUT
    fi

- name: Commit Changes
  if: steps.status.outputs.clean != 'true'
  run: |
    git add .
    git commit -m "Automated changes"
```

---

## Commit Operations

### Basic Commit

```yaml
- name: Commit Changes
  run: |
    git add .
    git commit -m "Automated commit"
```

### Commit with Specific Message

```yaml
- name: Commit with Message
  run: |
    git add .
    git commit -m "feat: Add new feature

    - Implementation details
    - Added tests
    - Updated docs
    "
```

### Commit with Author Override

```yaml
- name: Commit as Bot
  run: |
    git add .
    git commit -m "Automated changes" \
      --author="Bot <bot@users.noreply.github.com>"
```

### Ammend Commit

```yaml
- name: Amend Last Commit
  run: |
    git add .
    git commit --amend --no-edit
```

### Create Empty Commit

```yaml
- name: Create Empty Commit (Trigger Build)
  run: |
    git commit --allow-empty -m "Trigger build"
```

---

## Push Operations

### Basic Push

```yaml
- name: Push to Branch
  run: git push origin agent-workspace
```

### Force Push

```yaml
- name: Force Push (Use with Caution)
  run: git push origin agent-workspace --force
```

### Push to Specific Branch

```yaml
- name: Push to Dynamic Branch
  run: |
    git push origin ${BRANCH_NAME}  # Ensure BRANCH_NAME is set
```

### Push with Tags

```yaml
- name: Push with Tags
  run: |
    git tag -a v1.0.0 -m "Release v1.0.0"
    git push origin v1.0.0
```

---

## Pull Operations

### Simple Pull

```yaml
- name: Pull Latest Changes
  run: |
    git checkout agent-workspace
    git pull origin agent-workspace
```

### Pull with Rebase

```yaml
- name: Pull with Rebase
  run: |
    git checkout agent-workspace
    git pull --rebase origin agent-workspace
```

### Pull with Prune

```yaml
- name: Pull and Prune
  run: |
    git fetch --prune
    git checkout agent-workspace
    git pull origin agent-workspace
```

---

## Branch Comparison

### Check Branch Divergence

```yaml
- name: Check Branch Status
  run: |
    git fetch --all
    BEHIND=$(git rev-list --count HEAD..origin/agent-workspace)
    AHEAD=$(git rev-list --count origin/agent-workspace..HEAD)
    echo "Branch is ${BEHIND} commits behind, ${AHEAD} commits ahead"
```

### Check if Branch Exists

```yaml
- name: Check Branch Exists
  id: check
  run: |
    if git branch -r | grep "origin/agent-workspace"; then
      echo "exists=true" >> $GITHUB_OUTPUT
    else
      echo "exists=false" >> $GITHUB_OUTPUT
    fi

- name: Create Branch
  if: steps.check.outputs.exists == 'false'
  run: git checkout -b agent-workspace
```

---

## Tag Operations

### Create Tag

```yaml
- name: Create Tag
  run: |
    git tag -a v${{ github.event.release.tag_name }} -m "Release tag"
```

### List Tags

```yaml
- name: List Tags
  run: git tag -l
```

### Delete Tag

```yaml
- name: Delete Tag
  run: |
    git tag -d v1.0.0
    git push origin :refs/tags/v1.0.0
```

---

## Revert Operations

### Revert Last Commit

```yaml
- name: Revert Last Commit
  run: |
    git revert HEAD --no-edit
    git push origin agent-workspace
```

### Reset Last Commit (DANGEROUS)

```yaml
- name: Reset Last Commit (Soft)
  run: |
    git reset --soft HEAD~1

- name: Reset Last Commit (Hard)
  run: |
    git reset --hard HEAD~1
    git push origin agent-workspace --force
```

---

## Cherry-Pick Operations

### Cherry-Pick Commit

```yaml
- name: Cherry-Pick Commit
  run: |
    git checkout agent-workspace
    git cherry-pick <commit-sha>
```

### Cherry-Pick Multiple Commits

```yaml
- name: Cherry-Pick Range
  run: |
    git checkout agent-workspace
    git cherry-pick start-sha..end-sha
```

---

## Submodule Operations

### Update Submodules

```yaml
- name: Update Submodules
  run: |
    git submodule update --init --recursive
```

### Checkout with Submodules

```yaml
- name: Checkout with Submodules
  uses: actions/checkout@v4
  with:
    submodules: recursive
```

---

## Best Practices for Git Operations

### 1. Always Configure Git Before Operations
```yaml
- name: Configure Git
  run: |
    git config --global user.name "${{ github.actor }}"
    git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com}"
```

### 2. Use fetch-depth: 0 for Git Operations
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

### 3. Always Use agent-workspace for Automation
```yaml
- name: Branch Management
  run: |
    git fetch --all
    git checkout agent-workspace || git checkout -b agent-workspace
    git pull origin agent-workspace || true
```

### 4. Handle Merge Conflicts Gracefully
```yaml
- id: merge
  continue-on-error: true
  run: git merge origin/main

- if: steps.merge.outcome == 'failure'
  run: git merge --abort
```

### 5. Verify Before Push
```yaml
- name: Verify Before Push
  run: |
    # Check for conflicts
    if git diff --quiet && git diff --cached --quiet; then
      echo "Nothing to commit"
      exit 0
    fi
    # Run tests
    npm test
    # Push if tests pass
    git push origin agent-workspace
```

### 6. Use Meaningful Commit Messages
```yaml
- run: |
    git add .
    git commit -m "feat: Add feature X

    - Implementation
    - Tests added
    - Docs updated

    Closes #123"
```

---

## Common Patterns

### Pattern 1: Update Code and Create PR

```yaml
- name: Update and Create PR
  run: |
    # Configure git
    git config --global user.name "${{ github.actor }}"
    git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"

    # Branch setup
    git fetch --all
    git checkout agent-workspace || git checkout -b agent-workspace
    git pull origin agent-workspace || true
    git checkout -b feature/new-feature

    # Make changes... (code changes)

    # Commit
    git add .
    git commit -m "feat: Add new feature"

    # Push
    git push origin feature/new-feature

    # Create PR via gh cli or api
    gh pr create \
      --base main \
      --title "Add new feature" \
      --body "Implementing feature from issue #123"
```

### Pattern 2: Sync agent-workspace with main

```yaml
- name: Sync agent-workspace
  run: |
    git config --global user.name "${{ github.actor }}"
    git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"

    git fetch --all
    git checkout agent-workspace || git checkout -b agent-workspace
    git merge origin/main --no-edit || git merge --abort
    git push origin agent-workspace
```

### Pattern 3: Clean Agent Workspace

```yaml
- name: Clean Workspace
  run: |
    git fetch --prune
    git checkout agent-workspace
    git reset --hard origin/agent-workspace
    git clean -fd
```

---

## Summary

Key git operations covered:
- Configuration (user, email)
- Branch management (agent-workspace pattern)
- Merge operations (simple, squash, conflict handling)
- Commit operations (basic, amend, empty)
- Push/pull operations
- Comparison (divergence, existence)
- Tag operations
- Revert, cherry-pick, submodules

**Critical Rule:** Always use `agent-workspace` branch for all automation workflows.
# Git & GitHub Laws (Repo Maintainer Command Set)

**Repo Maintainer is not an LLM.** It is the deterministic shell command set below, executed by the orchestrator.

---

## 0. Label Bootstrap (STATE 0, run once)

Ensure all three labels exist before any PR or issue creation:

```bash
gh label create "aok-auto-issue" --description "Automated issue discovered by AOK-GH" --color "d73a4a" || true
gh label create "aok-remediation-pr" --description "Automated fix proposed by AOK-GH" --color "0e8a16" || true
gh label create "technical-debt" --description "Frozen technical debt item from AOK-GH" --color "fbca04" || true
```

---

## 1. Git Sync — The Canonical Sync Command

Always sync this way. Never pull into a dirty worktree:

```bash
git fetch origin && git checkout "${TARGET_BRANCH}" && git pull --ff-only origin "${TARGET_BRANCH}"
```

---

## 2. Topic Branch Management

### Initial Creation:

```bash
git checkout -b "fix/aok-${domain}-${issue_hash}" "origin/${TARGET_BRANCH}"
```

### On a Retry (branch already exists):

- **Request-Changes Path (Branch b & c):** Stay on the existing topic branch. Keep prior commits so the next remediator builds on previous feedback:
  ```bash
  git checkout "fix/aok-${domain}-${issue_hash}"
  ```
- **Regression Path (Branch d):** Hard reset to fresh target branch:
  ```bash
  git checkout "fix/aok-${domain}-${issue_hash}" && git reset --hard "origin/${TARGET_BRANCH}"
  ```

---

## 3. Serialization (`SERIAL_WORKERS: 1`)

- Exactly **one active branch at a time**.
- The current branch must be merged or reclaimed before the next branch is created.
- Never run concurrent git write operations on the same working copy.

---

## 4. Forbidden Operations

- ❌ Direct commits to `${TARGET_BRANCH}`.
- ❌ Force-push (`git push --force` or `-f`).
- ❌ `git push origin ${TARGET_BRANCH}`.
- ❌ Deleting any branches that do not match `fix/aok-*`.

---

## 5. Merge Gate

Both conditions must pass before `gh pr merge`:

1. **Local tests pass:** Remediator's payload reports `tests: "PASS"`.
   - _Exception:_ If profiler found no test suite (`test_command: null`), payload reports `tests: "NO_TEST_SUITE"` — this counts as satisfied, and must be noted in the PR body.
2. **Remote CI checks:** If CI workflows exist on the PR, wait for checks:
   ```bash
   gh pr checks ${pr_number}
   ```
   (If no CI checks are configured on the repo, proceed silently).

### Merge Command:

```bash
gh pr merge ${pr_number} --squash --auto --delete-branch
```

---

## 6. Branch Reclaim (Any Failure / Circuit Breaker Path)

When a fix fails, times out, or trips a circuit breaker:

1. **If PR is open:**
   ```bash
   gh pr close ${pr_number} --delete-branch
   ```
2. **If no PR was created:**
   ```bash
   git checkout "${TARGET_BRANCH}" && git branch -D "fix/aok-${domain}-${issue_hash}"
   ```
3. Always re-sync before picking up the next finding:
   ```bash
   git fetch origin && git checkout "${TARGET_BRANCH}" && git pull --ff-only origin "${TARGET_BRANCH}"
   ```

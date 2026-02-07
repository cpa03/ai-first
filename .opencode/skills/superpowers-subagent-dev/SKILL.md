---
name: superpowers-subagent-dev
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

**vs. Executing Plans (parallel session):**

- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then code quality
- Faster iteration (no human-in-loop between tasks)

## The Process

### Per Task Loop:

1. **Dispatch implementer subagent**
   - Provide full task text and context
   - Let them ask questions if needed

2. **Implementer subagent implements, tests, commits, self-reviews**

3. **Dispatch spec reviewer subagent**
   - Confirm code matches spec
   - If issues found: implementer fixes, re-review

4. **Dispatch code quality reviewer subagent**
   - Review code quality
   - If issues found: implementer fixes, re-review

5. **Mark task complete in TodoWrite**

6. **Repeat for next task**

### After All Tasks:

7. **Dispatch final code reviewer for entire implementation**

8. **Use superpowers-finishing-branch to complete**

## Advantages

**vs. Manual execution:**

- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe (subagents do not interfere)

**vs. Executing Plans:**

- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

## Red Flags

**Never:**

- Start implementation on main/master branch without explicit user consent
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- Start code quality review before spec compliance is approved (wrong order)
- Move to next task while either review has open issues

## Integration

**Required workflow skills:**

- **superpowers-git-worktrees** - REQUIRED: Set up isolated workspace before starting
- **superpowers-writing-plans** - Creates the plan this skill executes
- **superpowers-requesting-review** - Code review template for reviewer subagents
- **superpowers-finishing-branch** - Complete development after all tasks

**Subagents should use:**

- **superpowers-tdd** - Subagents follow TDD for each task

**Alternative workflow:**

- **superpowers-executing-plans** - Use for parallel session instead of same-session execution

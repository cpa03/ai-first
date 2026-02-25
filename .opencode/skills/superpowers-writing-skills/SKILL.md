---
name: superpowers-writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

**Core principle:** If you did not watch an agent fail without the skill, you do not know if the skill teaches the right thing.

**REQUIRED BACKGROUND:** You MUST understand superpowers-tdd before using this skill.

## What is a Skill?

A **skill** is a reference guide for proven techniques, patterns, or tools. Skills help future agents find and apply effective approaches.

**Skills are:** Reusable techniques, patterns, tools, reference guides

**Skills are NOT:** Narratives about how you solved a problem once

## TDD Mapping for Skills

| TDD Concept             | Skill Creation                               |
| ----------------------- | -------------------------------------------- |
| **Test case**           | Pressure scenario with agent                 |
| **Production code**     | Skill document (SKILL.md)                    |
| **Test fails (RED)**    | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present            |
| **Refactor**            | Close loopholes while maintaining compliance |

## SKILL.md Structure

**Frontmatter (YAML):**

```yaml
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---
```

- Only two fields: `name` and `description` (max 1024 chars total)
- `name`: Use letters, numbers, and hyphens only
- `description`: Third-person, describes ONLY when to use (NOT what it does)
  - Start with "Use when..."
  - Include specific symptoms and situations
  - NEVER summarize the skill's process or workflow

## Directory Structure

```
skills/
  skill-name/
    SKILL.md              # Main reference (required)
    supporting-file.*     # Only if needed
```

## Key Principles

1. **CSO (Claude Search Optimization):**
   - Rich description with triggering conditions
   - Keywords throughout (errors, symptoms, tools)
   - Active voice, verb-first naming
   - Concise content (<500 words)

2. **Content Structure:**
   - Clear overview with core principle
   - When to use (with symptoms)
   - Core pattern or steps
   - Quick reference table
   - Common mistakes

3. **Cross-References:**
   - Use skill name only
   - Explicit requirement markers: `**REQUIRED SUB-SKILL:** Use superpowers-tdd`
   - No @ links (force-loads files)

## The Iron Law (Same as TDD)

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS to existing skills.

Write skill before testing? Delete it. Start over.
Edit skill without testing? Same violation.

**No exceptions.**

## RED-GREEN-REFACTOR for Skills

### RED: Write Failing Test (Baseline)

Run pressure scenario with agent WITHOUT the skill. Document exact behavior:

- What choices did they make?
- What rationalizations did they use (verbatim)?
- Which pressures triggered violations?

### GREEN: Write Minimal Skill

Write skill that addresses those specific rationalizations. Do not add extra content for hypothetical cases.

Run same scenarios WITH skill. Agent should now comply.

### REFACTOR: Close Loopholes

Agent found new rationalization? Add explicit counter. Re-test until bulletproof.

## STOP: Before Moving to Next Skill

**After writing ANY skill, you MUST STOP and complete the deployment process.**

**Do NOT:**

- Create multiple skills in batch without testing each
- Move to next skill before current one is verified
- Skip testing because "batching is more efficient"

## Skill Creation Checklist

**RED Phase:**

- [ ] Create pressure scenarios (3+ combined pressures for discipline skills)
- [ ] Run scenarios WITHOUT skill - document baseline behavior verbatim
- [ ] Identify patterns in rationalizations/failures

**GREEN Phase:**

- [ ] Name uses only letters, numbers, hyphens
- [ ] YAML frontmatter with only name and description (max 1024 chars)
- [ ] Description starts with "Use when..." and includes specific triggers/symptoms
- [ ] Description written in third person
- [ ] Keywords throughout for search
- [ ] Clear overview with core principle
- [ ] Address specific baseline failures identified in RED
- [ ] Run scenarios WITH skill - verify agents now comply

**REFACTOR Phase:**

- [ ] Identify NEW rationalizations from testing
- [ ] Add explicit counters (if discipline skill)
- [ ] Build rationalization table from all test iterations
- [ ] Create red flags list
- [ ] Re-test until bulletproof

**Deployment:**

- [ ] Commit skill to git
- [ ] Consider contributing back via PR (if broadly useful)

## The Bottom Line

**Creating skills IS TDD for process documentation.**

Same Iron Law: No skill without failing test first.
Same cycle: RED (baseline) -> GREEN (write skill) -> REFACTOR (close loopholes).
Same benefits: Better quality, fewer surprises, bulletproof results.

If you follow TDD for code, follow it for skills. It is the same discipline applied to documentation.

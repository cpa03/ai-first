---
name: superpowers-using
description: Use when starting any conversation - establishes how to find and use skills
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## How to Access Skills

**In OpenCode:** Skills are automatically discovered from `.opencode/skills/` directory.

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you do not need to use it.

## Red Flags

These thoughts mean STOP-you are rationalizing:

| Thought                               | Reality                                            |
| ------------------------------------- | -------------------------------------------------- |
| "This is just a simple question"      | Questions are tasks. Check for skills.             |
| "I need more context first"           | Skill check comes BEFORE clarifying questions.     |
| "Let me explore the codebase first"   | Skills tell you HOW to explore. Check first.       |
| "I can check git/files quickly"       | Files lack conversation context. Check for skills. |
| "I can gather information first"      | Skills tell you HOW to gather information.         |
| "This does not need a formal skill"   | If a skill exists, use it.                         |
| "I remember this skill"               | Skills evolve. Read current version.               |
| "This does not count as a task"       | Action = task. Check for skills.                   |
| "The skill is overkill"               | Simple things become complex. Use it.              |
| "I will just do this one thing first" | Check BEFORE doing anything.                       |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** (frontend-design, mcp-builder) - these guide execution

"Let's build X" -> brainstorming first, then implementation skills.
"Fix this bug" -> debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Do not adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" does not mean skip workflows.

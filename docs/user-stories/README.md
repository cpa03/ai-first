# User Stories

This directory contains all user stories for the IdeaFlow project, organized by feature area.

## 📊 Progress Dashboard

### Summary Statistics

| Metric               | Count |
| -------------------- | ----- |
| **Total Stories**    | 7     |
| **P0 (Must Have)**   | 5     |
| **P1 (Should Have)** | 2     |
| **P2 (Could Have)**  | 0     |
| **P3 (Won't Have)**  | 0     |

### Story Points Summary

| Category          | Story Points | Stories Included                                                                         |
| ----------------- | ------------ | ---------------------------------------------------------------------------------------- |
| **MVP (P0)**      | 23           | US-AUTH-001 (3), US-AUTH-002 (2), US-IDEA-001 (5), US-IDEA-002 (5), US-BREAKDOWN-001 (8) |
| **Post-MVP (P1)** | 5            | US-AUTH-003 (2), US-EXPORT-001 (3)                                                       |
| **Total**         | **28**       | All stories                                                                              |

### Estimated Effort (Based on Story Points)

| Points | Time Estimate | MVP Stories                                       | Post-MVP Stories  |
| ------ | ------------- | ------------------------------------------------- | ----------------- |
| 1-2    | < 2 hours     | US-AUTH-002 (2)                                   | US-AUTH-003 (2)   |
| 3-5    | 2-8 hours     | US-AUTH-001 (3), US-IDEA-001 (5), US-IDEA-002 (5) | US-EXPORT-001 (3) |
| 8+     | 1-2+ days     | US-BREAKDOWN-001 (8)                              | -                 |

**MVP Estimated Effort**: ~4-5 development days (based on 23 story points)
**Total Estimated Effort**: ~5-6 development days (based on 28 story points)

### Status Overview

| Status      | Count | Stories                                                                                          |
| ----------- | ----- | ------------------------------------------------------------------------------------------------ |
| Ready       | 7     | US-AUTH-001, US-AUTH-002, US-AUTH-003, US-IDEA-001, US-IDEA-002, US-BREAKDOWN-001, US-EXPORT-001 |
| In Progress | 0     | -                                                                                                |
| Done        | 0     | -                                                                                                |
| Released    | 0     | -                                                                                                |

### Issue-to-Story Cross-Reference

| Issue | Title                        | Related Stories                                    | Priority | Status   |
| ----- | ---------------------------- | -------------------------------------------------- | -------- | -------- |
| #1177 | Authentication blocking MVP  | US-AUTH-001, US-AUTH-002, US-AUTH-003              | P1       | Closed   |
| #1176 | MVP launch timeline at risk  | US-IDEA-001, US-IDEA-002, US-BREAKDOWN-001, All P0 | P1       | Open     |
| #205  | Export functionality         | US-IDEA-001, US-IDEA-002, US-EXPORT-001            | -        | Open   |
| #219  | Plan generation              | US-IDEA-001, US-IDEA-002, US-EXPORT-001            | -        | Open   |
| #638  | Idea submission improvements | US-IDEA-001, US-IDEA-002                           | -        | Open   |
| #721  | Breakdown system             | US-BREAKDOWN-001                                   | -        | Open   |
| #747  | Task decomposition           | US-BREAKDOWN-001                                   | -        | Open   |

### MVP Progress Tracker

**Target: Phase 1 MVP**

| P0 Story         | Title            | Status | Blocking Issues | Ready for Dev |
| ---------------- | ---------------- | ------ | --------------- | ------------- |
| US-AUTH-001      | User Signup      | Ready  | -               | ✅ Yes        |
| US-AUTH-002      | User Login       | Ready  | -               | ✅ Yes        |
| US-IDEA-001      | Idea Submission  | Ready  | -               | ✅ Yes        |
| US-IDEA-002      | Idea Dashboard   | Ready  | -               | ✅ Yes        |
| US-BREAKDOWN-001 | Breakdown Engine | Ready  | -               | ✅ Yes        |

**MVP Completion: 0% (0/5 P0 stories implemented)**

### Priority Distribution by Feature

| Feature Area    | P0    | P1    | P2    | P3    | Total |
| --------------- | ----- | ----- | ----- | ----- | ----- |
| Authentication  | 2     | 1     | 0     | 0     | 3     |
| Idea Management | 2     | 0     | 0     | 0     | 2     |
| Breakdown       | 1     | 0     | 0     | 0     | 1     |
| Export          | 0     | 1     | 0     | 0     | 1     |
| **Total**       | **5** | **2** | **0** | **0** | **7** |

---

## Directory Structure

```
user-stories/
├── README.md                    # This file
├── personas.md                  # User personas reference
├── authentication/              # Authentication feature stories
│   ├── us-auth-001-signup.md    # User signup with email verification
│   ├── us-auth-002-login.md     # User login with error handling
│   └── us-auth-003-password-reset.md # Self-service password reset
├── idea-management/             # Idea management feature stories
│   ├── us-idea-001-submission.md # Idea submission with clarification
│   └── us-idea-002-dashboard.md  # Idea dashboard for viewing and managing ideas
├── breakdown/                   # Breakdown system feature stories
│   └── us-breakdown-001-engine.md # Automatic idea breakdown into tasks
└── export/                      # Export & integration feature stories
    └── us-export-001-markdown.md # Export plan to Markdown format
```

## User Story Index

### Authentication Flow

| Story ID                                                      | Title          | Priority | Status | Persona         |
| ------------------------------------------------------------- | -------------- | -------- | ------ | --------------- |
| [US-AUTH-001](./authentication/us-auth-001-signup.md)         | User Signup    | P0       | Ready  | Startup Founder |
| [US-AUTH-002](./authentication/us-auth-002-login.md)          | User Login     | P0       | Ready  | Startup Founder |
| [US-AUTH-003](./authentication/us-auth-003-password-reset.md) | Password Reset | P1       | Ready  | Startup Founder |

**Related Issues**: #1177 (Closed), #1176

### Idea Management

| Story ID                                                   | Title           | Priority | Status | Persona         |
| ---------------------------------------------------------- | --------------- | -------- | ------ | --------------- |
| [US-IDEA-001](./idea-management/us-idea-001-submission.md) | Idea Submission | P0       | Ready  | Startup Founder |
| [US-IDEA-002](./idea-management/us-idea-002-dashboard.md)  | Idea Dashboard  | P0       | Ready  | Startup Founder |

**Related Issues**: #205, #219, #638, #1176

### Breakdown System

| Story ID                                                   | Title                      | Priority | Status | Persona         |
| ---------------------------------------------------------- | -------------------------- | -------- | ------ | --------------- |
| [US-BREAKDOWN-001](./breakdown/us-breakdown-001-engine.md) | Automatic Breakdown Engine | P0       | Ready  | Startup Founder |

**Related Issues**: #721, #747

### Export & Integration

| Story ID                                            | Title                   | Priority | Status | Persona         |
| --------------------------------------------------- | ----------------------- | -------- | ------ | --------------- |
| [US-EXPORT-001](./export/us-export-001-markdown.md) | Export Plan to Markdown | P1       | Ready  | Startup Founder |

**Related Issues**: #205, #219

## How to Use This Directory

### For Product Managers

1. Review user stories during sprint planning
2. Assign stories to sprints based on priority
3. Update status as stories progress through development
4. Link completed stories to PRs and releases

### For Developers

1. Read the story thoroughly before implementation
2. Review acceptance criteria carefully
3. Check dependencies on other stories
4. Follow Definition of Done checklist
5. Update story status as work progresses

### For QA

1. Use acceptance criteria as test cases
2. Verify all scenarios pass
3. Check Definition of Done items
4. Report any gaps or edge cases discovered

## Story Lifecycle

```
Draft → Ready → In Progress → In Review → Done → Released
```

### Status Definitions

| Status      | Description                         |
| ----------- | ----------------------------------- |
| Draft       | Story is being written or refined   |
| Ready       | Story is ready for sprint planning  |
| In Progress | Developer actively implementing     |
| In Review   | Code review or QA in progress       |
| Done        | All acceptance criteria met, merged |
| Released    | Deployed to production              |

## Creating New User Stories

1. Use the [User Story Template](../templates/user-story_template.md)
2. Follow the [User Story Engineer Guide](../user-story-engineer.md)
3. Reference appropriate [Persona](./personas.md)
4. Assign priority using MoSCoW method (P0-P3)
5. Link related issues and dependencies

### Quick Reference

**Story Format:**

```
As a [persona],
I want [goal],
So that [benefit].
```

**Acceptance Criteria Format:**

```gherkin
Given [context]
When [action]
Then [expected outcome]
```

## Priority Reference

| Priority | Label | MoSCoW      | Description                      |
| -------- | ----- | ----------- | -------------------------------- |
| P0       | `P0`  | Must Have   | Critical for MVP, blocks release |
| P1       | `P1`  | Should Have | Important but not blocking       |
| P2       | `P2`  | Could Have  | Nice to have, can defer          |
| P3       | `P3`  | Won't Have  | Explicitly out of scope          |

## Related Documentation

- [User Story Engineer Guide](../user-story-engineer.md) - Best practices and guidelines
- [User Story Template](../templates/user-story_template.md) - Template for new stories
- [User Personas](./personas.md) - Target user descriptions
- [Roadmap](../roadmap.md) - Project timeline and milestones

## Contributing

When adding new user stories:

1. Create a new subdirectory for the feature area (if needed)
2. Use the naming convention: `us-[feature]-[number]-[short-name].md`
3. Add the story to this index
4. Link relevant issues

---

_Maintained by the User Story Engineer specialist. Last updated: February 22, 2026 (Updated Issue #1177 status to Closed)._

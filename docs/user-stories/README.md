# User Stories

This directory contains all user stories for the IdeaFlow project, organized by feature area.

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
│   └── us-idea-001-submission.md # Idea submission with clarification
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

**Related Issues**: #1177, #1176

### Idea Management

| Story ID                                                   | Title           | Priority | Status | Persona         |
| ---------------------------------------------------------- | --------------- | -------- | ------ | --------------- |
| [US-IDEA-001](./idea-management/us-idea-001-submission.md) | Idea Submission | P0       | Ready  | Startup Founder |

**Related Issues**: #205, #219, #638

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

_Maintained by the User Story Engineer specialist. Last updated: February 20, 2026._

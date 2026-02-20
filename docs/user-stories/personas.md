# User Personas

This document defines the primary user personas for IdeaFlow. Use these personas when writing user stories to ensure consistent understanding of user needs, goals, and pain points.

---

## ⚡ Quick Reference

| Persona           | Role            | Primary Need                  | Best For                               |
| ----------------- | --------------- | ----------------------------- | -------------------------------------- |
| **Alex Chen**     | Startup Founder | Quick idea-to-plan conversion | Onboarding, exports, simple UI         |
| **Jordan Taylor** | Product Manager | Structured roadmap creation   | Integrations, templates, collaboration |
| **Sam Rivera**    | Developer       | Technical task breakdown      | Dependencies, code generation, APIs    |

### Persona Selection by Feature Area

| Feature Area              | Primary Persona | Secondary       |
| ------------------------- | --------------- | --------------- |
| Onboarding / Quick Start  | Startup Founder | -               |
| Export / Sharing          | Startup Founder | Product Manager |
| Integrations              | Product Manager | Developer       |
| Technical Breakdown       | Developer       | Product Manager |
| Templates / Customization | Product Manager | Developer       |

---

## Persona Overview

| Persona       | Role            | Primary Need                  | Priority |
| ------------- | --------------- | ----------------------------- | -------- |
| Alex Chen     | Startup Founder | Quick idea-to-plan conversion | P0       |
| Jordan Taylor | Product Manager | Structured roadmap creation   | P1       |
| Sam Rivera    | Developer       | Technical task breakdown      | P1       |

---

## Persona 1: Startup Founder

### Profile

| Attribute        | Value                                        |
| ---------------- | -------------------------------------------- |
| **Name**         | Alex Chen                                    |
| **Role**         | Startup Founder / Solo Entrepreneur          |
| **Experience**   | First-time founder, non-technical background |
| **Age Range**    | 25-35                                        |
| **Company Size** | 1-5 people                                   |

### Goals

- Quickly transform raw app ideas into actionable development plans
- Understand what needs to be built without technical jargon
- Get a prioritized task list to share with developers or use personally
- Estimate timeline and effort for fundraising/pitching purposes

### Pain Points

- Doesn't know how to break down an idea into technical tasks
- Overwhelmed by project management tools and complexity
- Needs to communicate vision to developers effectively
- Wants to validate ideas quickly before investing resources

### Behaviors

- Prefers simple, guided workflows over complex interfaces
- Values speed and efficiency over customization
- Often works on multiple ideas simultaneously
- Needs mobile-friendly access for on-the-go planning

### User Story Context

When writing stories for Alex, focus on:

- Simple, intuitive user interfaces
- Quick onboarding with minimal setup
- Clear, non-technical language
- Export options for sharing with developers

### Success Metrics

| Metric                     | Target      | Measurement Method                   |
| -------------------------- | ----------- | ------------------------------------ |
| Time to first plan         | < 5 minutes | Analytics: idea submission to export |
| Onboarding completion rate | > 80%       | Funnel analysis                      |
| Plan export rate           | > 60%       | Export action tracking               |
| Return within 7 days       | > 40%       | User retention analytics             |
| NPS score                  | > 40        | In-app survey                        |
| Support ticket rate        | < 5%        | Help desk integration                |

**Key Indicators of Success:**

- User completes idea submission in first session
- User exports plan within first visit
- User returns to refine or create additional ideas
- User shares plan with stakeholders

### Example User Stories

```
As a startup founder,
I want to enter my app idea in plain language,
So that I can get a structured plan without learning technical terminology.
```

```
As a startup founder,
I want to export my plan as a shareable document,
So that I can discuss it with potential developers or investors.
```

---

## Persona 2: Product Manager

### Profile

| Attribute        | Value                           |
| ---------------- | ------------------------------- |
| **Name**         | Jordan Taylor                   |
| **Role**         | Product Manager                 |
| **Experience**   | 5+ years in product development |
| **Age Range**    | 30-40                           |
| **Company Size** | 50-500 people                   |

### Goals

- Create structured roadmaps from feature requests
- Align stakeholder expectations with realistic timelines
- Track progress and update plans as requirements evolve
- Integrate with existing project management tools (Notion, Trello, Jira)

### Pain Points

- Spends too much time translating business requirements into tasks
- Difficulty maintaining consistency across multiple projects
- Needs to balance competing stakeholder priorities
- Existing tools are either too simple or too complex

### Behaviors

- Uses multiple project management tools simultaneously
- Values templates and reusable frameworks
- Regularly updates plans based on feedback
- Collaborates with distributed teams

### User Story Context

When writing stories for Jordan, focus on:

- Integration with existing tools (Notion, Trello, GitHub)
- Customizable templates and workflows
- Collaboration and sharing features
- Progress tracking and reporting

### Success Metrics

| Metric                       | Target   | Measurement Method               |
| ---------------------------- | -------- | -------------------------------- |
| Integration adoption rate    | > 50%    | Integration connection tracking  |
| Template customization rate  | > 30%    | Template edit analytics          |
| Team collaboration sessions  | > 2/week | Shared plan analytics            |
| Plan update frequency        | > 1/week | Plan revision tracking           |
| Cross-tool sync success rate | > 95%    | Integration health monitoring    |
| Stakeholder share rate       | > 70%    | Export and share action tracking |

**Key Indicators of Success:**

- User connects at least one external integration
- User customizes breakdown templates
- User updates plans based on team feedback
- User maintains consistent planning cadence

### Example User Stories

```
As a product manager,
I want to customize the breakdown templates for my team's workflow,
So that the output matches our existing process.
```

```
As a product manager,
I want to sync my plan with Notion automatically,
So that my team always has the latest tasks in our workspace.
```

---

## Persona 3: Developer

### Profile

| Attribute        | Value                              |
| ---------------- | ---------------------------------- |
| **Name**         | Sam Rivera                         |
| **Role**         | Full-Stack Developer               |
| **Experience**   | 3-5 years professional development |
| **Age Range**    | 25-35                              |
| **Company Size** | 10-50 people (startup)             |

### Goals

- Get technical task breakdowns from product requirements
- Understand dependencies between tasks before starting
- Estimate effort accurately for sprint planning
- Generate boilerplate code or setup scripts where possible

### Pain Points

- Vague requirements lead to rework and scope creep
- Difficulty estimating tasks without clear technical specs
- Time spent on setup and boilerplate instead of core features
- Context switching between multiple projects

### Behaviors

- Prefers detailed technical specifications
- Values automation and tooling
- Uses Git-based workflows extensively
- Appreciates accurate time estimates for planning

### User Story Context

When writing stories for Sam, focus on:

- Technical depth in task descriptions
- Dependency visualization
- Code generation and templates
- GitHub/GitLab integration

### Success Metrics

| Metric                         | Target | Measurement Method                  |
| ------------------------------ | ------ | ----------------------------------- |
| Task estimation accuracy       | > 80%  | Planned vs actual time comparison   |
| GitHub/GitLab integration rate | > 60%  | Integration connection tracking     |
| Dependency identification rate | > 90%  | Task dependency analysis            |
| Code template usage            | > 40%  | Template generation tracking        |
| Sprint planning accuracy       | > 75%  | Committed vs completed story points |
| Technical spec completeness    | > 85%  | Spec quality scoring                |

**Key Indicators of Success:**

- User connects GitHub/GitLab for project sync
- User utilizes dependency visualization features
- User leverages code generation for project setup
- User provides accurate time estimates

### Example User Stories

```
As a developer,
I want to see technical dependencies between tasks,
So that I can plan my work in the correct order.
```

```
As a developer,
I want to generate project scaffolding from the plan,
So that I can start coding faster with less setup time.
```

---

## Using Personas in User Stories

### Format Reference

When writing user stories, always reference the appropriate persona:

```
As a [persona name/role],
I want [some goal/desire],
So that [some benefit/reason].
```

### Persona Selection Guidelines

| User Story Focus          | Primary Persona | Secondary Persona |
| ------------------------- | --------------- | ----------------- |
| Onboarding / Quick Start  | Startup Founder | -                 |
| Export / Sharing          | Startup Founder | Product Manager   |
| Integrations              | Product Manager | Developer         |
| Technical Breakdown       | Developer       | Product Manager   |
| Templates / Customization | Product Manager | Developer         |

### Avoiding Anti-Patterns

1. **Generic "User" References**: Replace "As a user" with a specific persona
   - Bad: "As a user, I want to export my plan"
   - Good: "As a startup founder, I want to export my plan"

2. **Missing Context**: Always include the "So that" clause with persona-specific benefit
   - Bad: "As a developer, I want API documentation"
   - Good: "As a developer, I want API documentation, so that I can integrate with the system faster"

3. **Conflicting Personas**: If a story serves multiple personas differently, split it
   - Bad: Single story for both founders and developers
   - Good: Separate stories tailored to each persona's needs

## Related Documentation

- [User Story Engineer Guide](../user-story-engineer.md) - Best practices for writing user stories
- [User Story Template](../templates/user-story_template.md) - Template for creating new stories
- [Architecture](../architecture.md) - Technical architecture overview

---

_Maintained by the User Story Engineer specialist._

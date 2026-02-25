# Specialist User Story Template

This template provides guidance for specialist roles (backend, frontend, security, etc.) when writing user stories that align with the IdeaFlow user story system.

## Overview

Specialist roles should write user stories that:

- Reference appropriate user personas (Startup Founder, Product Manager, Developer)
- Include domain-specific acceptance criteria
- Connect technical work to user value

## Specialist Story Format

```
As a [persona],
I want [specialist-specific goal],
So that [user benefit].
```

### Domain-Specific Guidance

#### Backend Engineer

When writing stories for backend work, focus on:

- **API endpoints and data handling**
- **Database design and optimization**
- **Performance and scalability**
- **Security and data integrity**

**Example:**

```
As a developer,
I want API endpoints that support bulk operations,
So that I can process large datasets efficiently without making multiple API calls.
```

**Acceptance Criteria:**

```gherkin
Given the API accepts bulk requests
When I submit up to 100 items in a single request
Then all items are processed within 5 seconds
And I receive a structured response with success/failure per item
```

#### Frontend Engineer

When writing stories for frontend work, focus on:

- **User interface and experience**
- **Responsive design and accessibility**
- **State management and performance**
- **Component reusability**

**Example:**

```
As a startup founder,
I want a mobile-responsive dashboard,
So that I can manage my ideas on any device.
```

**Acceptance Criteria:**

```gherkin
Given I am on the dashboard
When I view it on a mobile device (320px width)
Then all elements are visible without horizontal scrolling
And interactive elements have touch-friendly sizing (min 44px)
```

#### Security Engineer

When writing stories for security work, focus on:

- **Authentication and authorization**
- **Data protection and privacy**
- **Vulnerability prevention**
- **Compliance requirements**

**Example:**

```
As a startup founder,
I want my ideas to be encrypted at rest,
So that my sensitive business concepts are protected from unauthorized access.
```

**Acceptance Criteria:**

```gherkin
Given data is stored in the database
When a database administrator queries the storage
Then the idea content is not readable in plaintext
And encryption uses AES-256 or stronger
```

#### Performance Engineer

When writing stories for performance work, focus on:

- **Response time optimization**
- **Resource efficiency**
- **Load handling**
- **Monitoring and alerting**

**Example:**

```
As a product manager,
I want ideas to load within 2 seconds,
So that my team can quickly browse and select ideas to work on.
```

**Acceptance Criteria:**

```gherkin
Given the idea list contains 100 items
When I navigate to the dashboard
Then the page fully loads within 2 seconds
And time to interactive is under 3 seconds
```

#### Integration Engineer

When writing stories for integration work, focus on:

- **External service connections**
- **Data synchronization**
- **API compatibility**
- **Error handling and retries**

**Example:**

```
As a product manager,
I want to sync my plan with Notion automatically,
So that my team always has the latest tasks in our workspace.
```

**Acceptance Criteria:**

```gherkin
Given I have connected my Notion account
When I update tasks in IdeaFlow
Then changes appear in Notion within 30 seconds
And bidirectional sync works for create/update/delete operations
```

#### DevOps Engineer

When writing stories for DevOps work, focus on:

- **Deployment and infrastructure**
- **CI/CD pipelines**
- **Monitoring and logging**
- **Scalability and reliability**

**Example:**

```
As a developer,
I want automated deployment pipelines,
So that code changes reach production quickly and safely.
```

**Acceptance Criteria:**

```gherkin
Given a pull request is merged to main
When the CI pipeline completes
Then the application is deployed to staging automatically
And can be promoted to production with approval
```

#### UI/UX Engineer

When writing stories for UI/UX work, focus on:

- **User experience and flow**
- **Visual design consistency**
- **Accessibility (WCAG)**
- **Usability testing**

**Example:**

```
As a startup founder,
I want a clear onboarding flow that guides me through idea submission,
So that I can create my first plan without confusion.
```

**Acceptance Criteria:**

```gherkin
Given I am a new user
When I first access the application
Then I see a guided flow with 3 or fewer steps to create my first idea
And I can skip the flow if I prefer to explore independently
```

## Story Checklist for Specialists

Before submitting a specialist user story:

- [ ] Story follows standard format (As a... I want... So that...)
- [ ] References appropriate persona (Startup Founder, Product Manager, or Developer)
- [ ] Includes domain-specific acceptance criteria in Gherkin format
- [ ] Acceptance criteria are testable and measurable
- [ ] Priority label assigned (P0/P1/P2/P3)
- [ ] Dependencies on other stories documented
- [ ] Technical requirements noted

## Related Documentation

- [User Story Engineer Guide](../user-story-engineer.md) - Full user story guidelines
- [User Personas](../user-stories/personas.md) - Persona definitions
- [User Story Template](./user-story_template.md) - General template

---

_This template supports specialist roles in writing user-centric stories. See [User Story Engineer Guide](../user-story-engineer.md) for details._

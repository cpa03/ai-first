#SW|# User Story Engineer Guide
#KM|
#RR|Specialist guide for writing, managing, and refining user stories in the IdeaFlow project.
#RW|
#MS|## Overview
#SY|
#NZ|The User Story Engineer is responsible for transforming ideas and requirements into well-structured, actionable user stories that follow industry best practices and integrate seamlessly with the IdeaFlow workflow.
#XW|
#MK|---
#SK|
#QP|## ⚡ Quick Reference
#TX|
#HR|### Story Format (Copy-Paste Ready)
#BY|
#ST|`
#NN|As a [persona],
#PJ|I want [goal],
#NQ|So that [benefit].
#VN|`
#YQ|
#QB|### Acceptance Criteria Format
#ZP|
#HB|`gherkin
#YZ|Given [context]
#YB|When [action]
#JH|Then [expected outcome]
#BJ|`
#HQ|
#NP|### Priority Labels
#ZM|
#KV|| Label | MoSCoW | When to Use |
#YP|| ----- | ----------- | ----------------------- |
#RR|| `P0` | Must Have | Blocks MVP/release |
#RJ|| `P1` | Should Have | Important, not blocking |
#QY|| `P2` | Could Have | Nice to have |
#JW|| `P3` | Won't Have | Explicitly deferred |
#RB|
#PS|### Story Points Quick Reference
#MS|
#PQ|| Points | Complexity | Time Estimate |
#JT|| ------ | ---------- | ------------- |
#TM|| 1 | Trivial | < 1 hour |
#WM|| 2 | Simple | 1-2 hours |
#ZR|| 3 | Medium | 2-4 hours |
#PS|| 5 | Complex | 4-8 hours |
#HH|| 8 | Large | 1-2 days |
#WP|| 13 | Very Large | 2-3 days |
#MQ|| ? | Unknown | Needs spike |
#BN|
#VS|### INVEST Checklist
#PZ|
#KN|- **I**ndependent - No blocking dependencies
#YY|- **N**egotiable - Details can be refined
#ZM|- **V**aluable - Clear user/business value
#ZR|- **E**stimable - Can be sized
#WX|- **S**mall - Completable in one sprint
#MZ|- **T**estable - Verifiable acceptance criteria
#KR|
#YX|### Definition of Ready Summary
#HQ|
#PB|- [ ] Story follows standard format
#TQ|- [ ] Acceptance criteria are testable
#HV|- [ ] Priority and story points assigned
#ZW|- [ ] No unresolved questions
#KY|- [ ] Dependencies documented
#JQ|
#BY|### Definition of Done Summary
#RT|
#SN|- [ ] No TypeScript errors
#ZS|- [ ] No lint warnings
#VQ|- [ ] Unit tests passing
#QQ|- [ ] Acceptance criteria verified
#RW|- [ ] Code reviewed
#HQ|
#MJ|### Templates
#JW|
#SX|- [User Story Template](./templates/user-story_template.md)
#QB|- [Specialist User Story Template](./templates/specialist-user-story_template.md)
#TJ|- [User Personas](./user-stories/personas.md)
#KB|
#XZ|---
#YR|
#PR|## Core Responsibilities
#WR|
#TZ|1. **Story Creation**: Write clear, concise user stories following the standard format
#XR|2. **Story Refinement**: Ensure stories meet INVEST criteria and have clear acceptance criteria
#JY|3. **Story Prioritization**: Collaborate with product owners to prioritize stories in backlogs
#NS|4. **Story Decomposition**: Break down large stories into smaller, manageable ones
#SV|5. **Story Integration**: Ensure stories align with blueprints, roadmaps, and project goals
#QT|
#KW|## User Story Format
#JZ|
#ZZ|### Standard Format
#MS|
#KX|`
#PN|As a [type of user/persona],
#XW|I want [some goal/desire],
#MX|So that [some benefit/reason].
#YQ|`
#SR|
#RN|### Example
#PJ|
#YN|`
#BX|As a startup founder,
#BZ|I want to quickly convert my app idea into a prioritized task list,
#KR|So that I can start development with a clear roadmap.
#HJ|`
#YQ|
#ZM|## INVEST Criteria
#WY|
#WN|Every user story must satisfy the INVEST criteria:
#QJ|
#QY|### Independent (I)
#BJ|
#QP|- Stories should be self-contained with no inherent dependencies on other stories
#YB|- If dependencies exist, document them clearly
#TJ|- Order stories to minimize dependencies
#RM|
#PW|**Good**: "As a user, I want to log in with my email"
#XM|
#NS|**Bad**: "As a user, I want to log in (requires #123)"
#JQ|
#SZ|### Negotiable (N)
#KZ|
#KK|- Stories are not contracts; they're invitations to conversation
#PM|- Details can be refined during implementation
#PB|- Leave room for discussion and adaptation
#YX|
#SQ|### Valuable (V)
#PX|
#NJ|- Stories must deliver value to the user or business
#HP|- Value should be clear from the "So that" clause
#MN|- Avoid technical stories that don't provide user value
#QZ|
#NR|**Good**: "As a founder, I want to see estimated hours for each task"
#NQ|
#HN|**Bad**: "As a developer, I want to refactor the API"
#KK|
#KZ|### Estimable (E)
#XS|
#XT|- Stories must be sized enough to estimate
#HK|- If too large, break down into smaller stories
#PR|- Include technical context for accurate estimation
#BT|
#WR|### Small (S)
#JM|
#ZV|- Stories should be completable within a single sprint
#YK|- Target 1-5 story points typically
#HQ|- Large stories are "epics" that need decomposition
#PY|
#JK|### Testable (T)
#HM|
#VM|- Stories must have clear acceptance criteria
#RR|- Criteria should be verifiable through testing
#PJ|- Use Given-When-Then format for complex scenarios
#TT|
#MN|## Acceptance Criteria Guidelines
#TV|
#JS|### Format
#ZB|
#HB|`gherkin
#HK|Given [initial context/precondition]
#NR|When [action/trigger]
#JH|Then [expected outcome]
#KH|`
#QB|
#RN|### Example
#BT|
#HB|`gherkin
#RS|Given I am on the idea submission page
#ZP|When I enter my project idea and click "Generate Plan"
#XQ|Then I should see a confirmation message
#RV|And I should receive a breakdown within 60 seconds
#VK|`
#BN|
#QR|### Best Practices
#HM|
#QZ|1. **Be Specific**: Use concrete values and conditions
#NH|2. **Be Complete**: Cover happy path and error scenarios
#KP|3. **Be Testable**: Each criterion should be verifiable
#BV|4. **Be Concise**: One criterion per line, clear language
#BY|5. **Prioritize**: Mark criteria as required/optional if needed
#VB|
#RR|## Definition of Ready (DoR)
#HM|
#QN|A user story is "Ready" to be worked on when all of the following criteria are met:
#YV|
#HM|### Story Quality
#RS|
#RP|- [ ] Story follows the standard format (As a... I want... So that...)
#YW|- [ ] Story meets all INVEST criteria
#NY|- [ ] Story has clear, testable acceptance criteria
#WY|- [ ] Story includes appropriate persona reference
#PS|- [ ] Story has been reviewed by product owner
#JZ|
#HH|### Clarity & Scope
#MH|
#BY|- [ ] Story is small enough to complete in one sprint (≤8 story points)
#QJ|- [ ] Story has no unresolved questions or ambiguities
#VJ|- [ ] Technical approach is understood by the team
#WY|- [ ] Dependencies on other stories are documented and resolved
#JM|
#RM|### Priority & Estimation
#PX|
#BH|- [ ] Priority label assigned (P0/P1/P2/P3)
#SY|- [ ] Story points estimated by the team
#PY|- [ ] Story is in the sprint backlog
#NZ|
#WZ|### Resources
#ZX|
#RT|- [ ] Necessary design mockups available (if UI-related)
#BP|- [ ] API documentation available (if integration-related)
#YP|- [ ] Technical specifications available (if complex)
#KZ|
#XV|### Readiness Checklist Summary
#RZ|
#NW|| Category | Required Items | Status |
#MN|| ------------- | -------------------------------------------- | --------- |
#JH|| Story Quality | Format, INVEST, Acceptance Criteria, Persona | ☐ All met |
#KP|| Clarity | Scope defined, No blockers, Tech approach | ☐ All met |
#YH|| Priority | Label, Points, Backlog position | ☐ All met |
#HY|| Resources | Mockups, Docs, Specs | ☐ All met |
#MK|
#BT|**A story should NOT be pulled into a sprint if any Required item is missing.**
#MJ|
#KQ|---
#VQ|
#JS|## Definition of Done (DoD)
#TZ|
#QM|A user story is "Done" when:
#NQ|
#XP|### Code Quality
#YZ|
#PY|- [ ] Code follows project style guidelines (ESLint/Prettier)
#MM|- [ ] Code reviewed by at least one team member
#SN|- [ ] No TypeScript errors
#YB|- [ ] No linting warnings
#NQ|
#BR|### Testing
#XP|
#WZ|- [ ] Unit tests written and passing
#TS|- [ ] Integration tests (if applicable) passing
#QQ|- [ ] Acceptance criteria verified
#MK|- [ ] Edge cases covered
#VJ|
#TR|### Documentation
#KJ|
#PV|- [ ] API documentation updated (if applicable)
#QW|- [ ] README updated (if applicable)
#PX|- [ ] Changelog updated
#TM|
#PQ|### Deployment
#MX|
#KP|- [ ] Feature flag implemented (if needed)
#PR|- [ ] Database migrations run (if applicable)
#MQ|- [ ] CI/CD pipeline passes
#BK|
#SV|### Security
#WQ|
#QS|- [ ] Security review completed (if applicable)
#ZS|- [ ] No secrets committed
#YB|- [ ] PII handling verified
#WJ|
#TX|## Story Prioritization Framework
#SV|
#SZ|### MoSCoW Method
#QQ|
#NV|| Priority | Label | Description |
#YJ|| ----------- | ----- | --------------------------------------- |
#KZ|| Must Have | `P0` | Critical for MVP, no release without it |
#TT|| Should Have | `P1` | Important but not critical |
#QQ|| Could Have | `P2` | Nice to have, can be deferred |
#RW|| Won't Have | `P3` | Explicitly out of scope for now |
#WZ|
#HH|### Priority Factors
#MH|
#XN|1. **Business Value**: How much value does this deliver?
#NR|2. **Risk Reduction**: Does this reduce technical or business risk?
#VT|3. **Dependencies**: Does this unblock other stories?
#QS|4. **Time Sensitivity**: Is there a deadline or market window?
#QM|5. **Effort**: What's the story point estimate?
#QT|
#TS|## Story Decomposition Patterns
#XQ|
#ZH|### When to Decompose
#QB|
#ZW|- Story exceeds 8 story points
#WB|- Multiple acceptance criteria that could be separate
#XN|- Complex technical requirements
#XM|- Multiple user types or personas involved
#BV|
#TR|### Decomposition Approaches
#VK|
#XT|1. **By Workflow**: Split by steps in a process
#HX|2. **By User Type**: Split by different personas
#TR|3. **By Data Type**: Split by different data categories
#HT|4. **By Platform**: Split by web/mobile/API
#QN|5. **By Complexity**: Split happy path from edge cases
#XN|
#ZP|### Example Decomposition
#RM|
#HS|**Epic**: "As a user, I want to export my plan to different formats"
#NK|
#HJ|**Stories**:
#NN|
#BZ|1. "As a user, I want to export my plan to Markdown"
#BR|2. "As a user, I want to export my plan to Notion"
#MX|3. "As a user, I want to export my plan to Trello"
#XX|4. "As a user, I want to export my plan to GitHub Projects"
#SZ|
#YH|---
#NW|
#NX|## Story Splitting Decision Tree
#RN|
#HT|Use this decision tree when a story exceeds 8 story points or feels too large for a single sprint.
#JS|
#SH|### Quick Decision Flowchart
#BV|
#XZ|`
#ZW|┌─────────────────────────────────────┐
#WQ|│   Story > 8 points or feels large?  │
#KQ|└─────────────────┬───────────────────┘
#NT|                  │ YES
#MM|                  ▼
#WV|┌─────────────────────────────────────┐
#MS|│  Does it have multiple user types?  │
#RQ|└─────────────────┬───────────────────┘
#RJ|                  │ YES → Split by User Type
#SR|                  │ NO
#ZV|                  ▼
#WS|┌─────────────────────────────────────┐
#YH|│  Does it have multiple outcomes?    │
#ZN|└─────────────────┬───────────────────┘
#NN|                  │ YES → Split by Outcome
#SR|                  │ NO
#TQ|                  ▼
#YX|┌─────────────────────────────────────┐
#MX|│  Does it have multiple steps?       │
#BT|└─────────────────┬───────────────────┘
#XN|                  │ YES → Split by Workflow Step
#SR|                  │ NO
#WY|                  ▼
#SZ|┌─────────────────────────────────────┐
#HY|│  Does it handle multiple data types?│
#QT|└─────────────────┬───────────────────┘
#NX|                  │ YES → Split by Data Type
#SR|                  │ NO
#KJ|                  ▼
#KT|┌─────────────────────────────────────┐
#ZR|│  Does it have CRUD operations?      │
#SY|└─────────────────┬───────────────────┘
#SN|                  │ YES → Split by Operation
#SR|                  │ NO
#VY|                  ▼
#MV|┌─────────────────────────────────────┐
#JV|│   Split Happy Path vs Edge Cases    │
#YS|└─────────────────────────────────────┘
#VM|`
#QR|
#PT|### Splitting Strategy Selection
#BR|
#YS|| Situation | Strategy | Example |
#WW|| -------------------------- | ------------------- | ------------------------------------------------------ |
#NW|| Multiple user types | Split by Persona | "As a founder..." → "As a PM..." → "As a developer..." |
#MW|| Multiple outputs/outcomes | Split by Outcome | Export → Markdown, Notion, Trello (separate stories) |
#SK|| Sequential process steps | Split by Workflow | Submit → Clarify → Confirm → Complete |
#SM|| Different data categories | Split by Data Type | Manage users, manage ideas, manage exports |
#KH|| Create/Read/Update/Delete | Split by CRUD | Create idea, View idea, Update idea, Delete idea |
#ZV|| Simple + Complex scenarios | Split by Complexity | Basic auth, 2FA auth, SSO auth (incremental) |
#PP|| Platform-specific behavior | Split by Platform | Web, Mobile, API (separate stories) |
#MZ|
#PM|### When NOT to Split
#BM|
#SY|| Situation | Reason |
#TM|| --------------------------------------- | ------------------------------------- |
#QY|| Story is already ≤5 points | Appropriate size, no splitting needed |
#RH|| Splitting breaks INVEST independence | Creates artificial dependencies |
#KY|| Acceptance criteria are tightly coupled | Cannot be delivered separately |
#RW|| Value is lost without complete story | User doesn't get value from partial |
#ZK|
#VP|### Splitting Checklist
#TB|
#HB|Before splitting a story, confirm:
#ZY|
#HW|- [ ] Story has multiple independent acceptance criteria
#XN|- [ ] Each split story can deliver value independently
#RJ|- [ ] Splits don't create circular dependencies
#YM|- [ ] Each split meets INVEST criteria
#TH|- [ ] Estimated points per split ≤8
#HR|
#VQ|### Example: Splitting a Large Story
#TN|
#YY|**Original Story (13 points)**:
#KP|
#BS|`
#BX|As a startup founder,
#WP|I want to manage my ideas with full CRUD operations,
#ZR|So that I can organize my projects effectively.
#PV|`
#RN|
#NB|**Split Stories**:
#VJ|
#PW|| Split | Story | Points |
#PB|| ----- | ----------------------------------------------------- | ------ |
#BP|| 1 | As a founder, I want to create and save new ideas | 3 |
#YX|| 2 | As a founder, I want to view my saved ideas | 2 |
#JS|| 3 | As a founder, I want to edit my existing ideas | 3 |
#VV|| 4 | As a founder, I want to delete ideas I no longer need | 2 |
#PJ|| 5 | As a founder, I want to archive ideas for later | 2 |
#QY|
#JQ|**Result**: 5 stories totaling 12 points, each independently deliverable.
#XY|
#QB|## Story Points Estimation Guide
#QM|
#HM|### Fibonacci Scale
#QY|
#YM|IdeaFlow uses the Fibonacci sequence for story point estimation:
#PB|
#VS|| Points | Complexity | Time Estimate | Example |
#QQ|| ------ | --------------- | --------------- | ----------------------------------------------- |
#QY|| **1** | Trivial | < 1 hour | Fix typo, add log statement |
#ZP|| **2** | Simple | 1-2 hours | Add form field, small UI tweak |
#TQ|| **3** | Straightforward | 2-4 hours | Simple CRUD operation, basic validation |
#QY|| **5** | Medium | 4-8 hours | Feature with clear requirements, known patterns |
#NQ|| **8** | Complex | 1-2 days | Multi-component feature, some unknowns |
#RS|| **13** | Very Complex | 2-3 days | Significant feature, integration required |
#XY|| **21** | Epic | 3-5 days | Should be decomposed into smaller stories |
#XB|| **?** | Unknown | Cannot estimate | Needs spike/research first |
#QS|
#NN|### Estimation Considerations
#WR|
#BR|When estimating story points, consider:
#SW|
#XV|1. **Complexity**: How difficult is the implementation?
#MX|2. **Uncertainty**: How much is unknown about the solution?
#KP|3. **Dependencies**: Are there external dependencies?
#XX|4. **Risk**: What could go wrong?
#ST|5. **Effort**: How much work is actually required?
#ST|
#QS|### Estimation Anti-Patterns
#WP|
#ST|| Anti-Pattern | Problem | Solution |
#HQ|| ----------------------- | ------------------------------- | --------------------------------------- |
#KT|| Padding estimates | Inflates velocity, hides issues | Estimate honestly, track actuals |
#YS|| Averaging team opinions | Loses important context | Discuss outliers, reach consensus |
#SZ|| Ignoring tech debt | Accumulates over time | Include refactoring in estimates |
#NQ|| One-person estimation | Missing perspectives | Use planning poker with team |
#NH|| Perfect precision | Wastes time on false precision | Use relative sizing, accept uncertainty |
#TS|
#ZW|### Planning Poker Process
#HW|
#BP|1. **Read Story**: Product owner reads the user story
#ZK|2. **Discuss**: Team asks clarifying questions
#RJ|3. **Estimate**: Each member selects a card privately
#TS|4. **Reveal**: All cards revealed simultaneously
#QH|5. **Discuss Outliers**: High/low estimates explain reasoning
#MR|6. **Consensus**: Re-vote until consensus (or accept majority)
#HW|
#YK|### Quick Estimation Checklist
#XX|
#SW|- [ ] Story meets INVEST criteria
#BS|- [ ] Acceptance criteria are clear
#VT|- [ ] Technical approach is understood
#QM|- [ ] Dependencies are identified
#KM|- [ ] Similar stories have been estimated before (for reference)
#SQ|- [ ] Team has necessary skills/knowledge
#JQ|
#PM|### Velocity Tracking
#SH|
#VY|Track team velocity to improve estimation accuracy:
#MX|
#HP|`
#TJ|Velocity = Total Story Points Completed / Sprint
#SW|`
#NX|
#MH|| Metric | Purpose |
#WW|| -------------------------- | ------------------------------ |
#BQ|| **Average Velocity** | Sprint planning baseline |
#ZH|| **Velocity Trend** | Team improvement over time |
#WT|| **Commitment Reliability** | Committed vs. completed points |
#BV|
#VM|---
#TX|
#NP|## Integration with IdeaFlow
#SK|
#QZ|### Story Lifecycle in IdeaFlow
#QW|
#RX|`
#WJ|Idea → Clarification → Breakdown → Stories → Tasks → Implementation
#XZ|`
#VX|
#XZ|### Story Generation
#VP|
#ZS|1. **From Blueprint**: Extract user-facing features
#VQ|2. **From Roadmap**: Convert milestones to stories
#BK|3. **From Feedback**: Transform user feedback into stories
#YY|4. **From Bugs**: Convert bugs with user impact
#NT|
#WV|### AI-Assisted Story Writing
#WW|
#XS|When using AI agents to generate stories:
#PB|
#KS|1. **Review**: Always review AI-generated stories
#SM|2. **Refine**: Add missing acceptance criteria
#VB|3. **Validate**: Ensure INVEST compliance
#ZR|4. **Prioritize**: Set appropriate priority
#VN|
#TT|## Common Anti-Patterns
#RJ|
#RS|### Avoid These
#KB|
#QK|1. **Technical Stories Without User Value**
#QH| - Bad: "Refactor database layer"
#BK| - Good: "As a user, I want faster load times on the dashboard"
#YV|
#JX|2. **Vague Acceptance Criteria**
#XQ| - Bad: "The feature should work well"
#KP| - Good: "The API responds within 200ms for 95% of requests"
#ZK|
#SB|3. **Stories Too Large**
#JB| - Bad: "As a user, I want a complete dashboard with analytics"
#KT| - Good: "As a user, I want to see my total idea count on the dashboard"
#YX|
#KZ|4. **Missing Context**
#MS| - Bad: "I want to save my work"
#TK| - Good: "As a user creating a new idea, I want auto-save so I don't lose progress"
#PH|
#YK|5. **Negative Stories**
#HT| - Bad: "As a user, I don't want the app to crash"
#YS| - Good: "As a user, I want the app to handle errors gracefully"
#PY|
#BJ|## Story Writing Checklist
#WY|
#QX|Before submitting a story for review:
#SS|
#BS|- [ ] Uses standard format (As a... I want... So that...)
#YX|- [ ] Meets all INVEST criteria
#SS|- [ ] Has clear, testable acceptance criteria
#VH|- [ ] Includes priority label
#VZ|- [ ] Estimated with story points (if applicable)
#TQ|- [ ] Dependencies documented (if any)
#HY|- [ ] Technical requirements noted (if any)
#XM|- [ ] Aligned with project blueprint/roadmap
#HR|
#MX|## Templates
#HB|
#KN|Use the [User Story Template](./templates/user-story_template.md) for consistent story formatting.
#QJ|
#PS|## Programmatic Validation
#KY|
#KN|The codebase includes built-in user story format validation that can be used programmatically. This section provides comprehensive examples for integrating validation into your workflow.
#HX|
#RT|### Available Functions
#JX|
#SH|`typescript
#SY|import {
#ZV|  validateUserStoryFormat,
#RM|  validateIdeaWithUserStory,
#SK|  type UserStoryValidationResult,
#VV|  type ValidationError,
#TB|} from '@/lib/validation';
#YN|`
#VJ|
#SM|### Function Signatures
#MK|
#SH|`typescript
#HX|// Validate user story format only (no length checks)
#PT|function validateUserStoryFormat(
#ZB|  idea: string,
#PV|  options?: {
#TW|    strict?: boolean;   // Default: true - reject partial/incomplete stories
#XJ|    enabled?: boolean;  // Default: from USER_STORY_FORMAT_VALIDATION_ENABLED env
#PJ|  }
#JW|): UserStoryValidationResult;
#YS|
#MB|// Validate idea with user story format (includes length checks)
#HS|function validateIdeaWithUserStory(
#YM|  idea: unknown,
#PV|  options?: {
#WZ|    validateUserStory?: boolean;  // Default: false
#HV|    strictUserStory?: boolean;    // Default: true
#KK|  }
#JW|): UserStoryValidationResult;
#HZ|`
#XN|
#BN|### Usage Examples
#JZ|
#YV|#### Basic User Story Validation
#SB|
#SH|`typescript
#JZ|// Validate a complete user story
#BT|const result = validateUserStoryFormat(
#QB|  'As a startup founder, I want to create a landing page, So that I can attract customers.',
#SP|  { strict: true, enabled: true }
#XB|);
#XN|
#YS|if (result.valid) {
#PX|  console.log('Persona:', result.persona);     // 'startup founder'
#VJ|  console.log('Goal:', result.goal);           // 'to create a landing page'
#ZX|  console.log('Benefit:', result.benefit);     // 'I can attract customers.'
#QM|} else {
#KN|  console.log('Errors:', result.errors);
#TH|  console.log('Suggestions:', result.suggestions);
#QK|}
#ZV|`
#PX|
#QZ|#### Partial Story Detection
#KX|
#SH|`typescript
#HR|// Non-strict mode allows partial stories
#PY|const partialResult = validateUserStoryFormat(
#QK|  'As a developer, I want to see API docs',  // Missing benefit clause
#ZK|  { strict: false, enabled: true }
#JP|);
#HT|
#HY|// Result: valid=true, isPartial=true
#VH|console.log('Is partial:', partialResult.isPartial);  // true
#HX|`
#XV|
#KW|#### Integration with Idea Submission
#WJ|
#SH|`typescript
#YK|// Validate idea with optional user story enforcement
#PJ|const ideaResult = validateIdeaWithUserStory(userInput, {
#SM|  validateUserStory: true,    // Enable user story format check
#NY|  strictUserStory: true,      // Require complete format
#MV|});
#YP|
#RN|if (!ideaResult.valid) {
#JJ|  // Handle validation errors
#MH|  const errorMessages = ideaResult.errors.map(e => e.message).join('; ');
#BT|  return { error: errorMessages, suggestions: ideaResult.suggestions };
#NS|}
#WW|
#VT|return {
#ZW|  success: true,
#ZX|  extracted: {
#PN|    persona: ideaResult.persona,
#JV|    goal: ideaResult.goal,
#YR|    benefit: ideaResult.benefit,
#YX|  },
#XH|};
#MT|`
#QP|
#TW|### Validation Result
#RW|
#SH|`typescript
#HH|interface UserStoryValidationResult {
#XB|  valid: boolean;           // Overall validation status
#WH|  errors: ValidationError[]; // Array of validation errors
#PX|  persona?: string;         // Extracted persona if valid (e.g., 'startup founder')
#WW|  goal?: string;            // Extracted goal if valid
#QX|  benefit?: string;         // Extracted benefit if valid
#MV|  suggestions?: string[];   // Improvement suggestions for partial/invalid stories
#XZ|  isPartial?: boolean;      // True if story has 'As a... I want...' but missing benefit
#RK|}
#BM|
#QV|interface ValidationError {
#KY|  field: string;            // Field that failed validation
#NX|  message: string;          // Human-readable error message
#SV|}
#RZ|`
#YH|
#NN|### Configuration
#HY|
#PN|User story validation is controlled by environment variable:
#SJ|
#XX|- `USER_STORY_FORMAT_VALIDATION_ENABLED`: Set to `true` to enable format validation by default (default: `false` for backward compatibility)
#KT|
#XQ|The validation uses patterns defined in `src/lib/config/constants.ts` under `USER_STORY_CONFIG`:
#RZ|
#SH|`typescript
#KW|const USER_STORY_CONFIG = {
#SW|  FORMAT_VALIDATION_ENABLED: false, // Default off for backward compatibility
#SP|  KNOWN_PERSONAS: ['startup founder', 'product manager', 'developer'],
#MJ|  MIN_LENGTHS: { PERSONA: 3, GOAL: 5, BENEFIT: 5 },
#RV|  PATTERNS: {
#JS|    FULL_STORY: /^As\s+(?:an?\s+)?(.+?),?\s*I\s+want\s+(.+?),?\s*(?:So\s+that|In\s+order\s+to)\s+(.+)$/i,
#XN|    PARTIAL_STORY: /^As\s+(?:an?\s+)?(.+?),?\s*I\s+want\s+/i,
#SR|  },
#SQ|  // ... error messages, etc.
#QS|};
#MK|`
#XX|
#KQ|### Troubleshooting
#QB|
#PW|#### Common Issues and Solutions
#VW|
#MT|| Issue | Cause | Solution |
#SV||-------|-------|----------|
#QP|| Story rejected but looks correct | Missing comma or wrong punctuation | Ensure format: `As a [persona], I want [goal], So that [benefit]` |
#NT|| `isPartial=true` with no errors | Missing 'So that' clause | Add benefit: `So that [benefit]` or use `In order to [benefit]` |
#TX|| Persona not recognized | Unknown persona used | Use known personas: startup founder, product manager, developer |
#NJ|| Goal/Benefit too short | Content below minimum length | Provide more descriptive goal/benefit (min 5 chars each) |
#NY|| Validation always passes | `enabled: false` by default | Set `USER_STORY_FORMAT_VALIDATION_ENABLED=true` or pass `{ enabled: true }` |
#KW|
#KH|#### Testing User Story Format
#HV|
#SH|`typescript
#NN|// Quick test in development console
#MZ|import { validateUserStoryFormat } from '@/lib/validation';
#QH|
#RW|const testStories = [
#SH|  'As a founder, I want x, So that y.',           // Invalid: too short
#ZP|  'As a startup founder, I want to build an app, So that I can launch my business.', // Valid
#ZW|  'Build me a SaaS product',                     // Invalid: not user story format
#JP|  'As a developer, I want API docs',             // Partial: missing benefit
#JR|];
#MR|
#KN|testStories.forEach(story => {
#WJ|  const result = validateUserStoryFormat(story, { enabled: true, strict: true });
#YT|  console.log({ story, valid: result.valid, isPartial: result.isPartial });
#BP|});
#ZK|`
#MB|
#JJ|## Related Documentation
#VM|
#BT|- [Blueprint Template](./templates/blueprint_template.md) - For project blueprints
#TV|- [Tasks Template](./templates/tasks_template.md) - For task breakdown
#HJ|- [Roadmap Template](./templates/roadmap_template.md) - For project roadmaps
#HH|- [Feature Guide](./feature.md) - For feature requests
#MW|- [Bug Guide](./bug.md) - For bug reports
#KZ|---
#RQ|
#NN|### 2026-02-26: PR #1891 - UserOnboarding Tour Content Update
#SQ|
#TW|Updated UserOnboarding component to match issue #1859 acceptance criteria:
#JB|
#RW|1. **Issue**: Tour content didn't match 'idea submission → clarification → breakdown → export' criteria
#KP|
#JX|2. **Solution**: Updated tour step content to better explain the workflow:
#VT| - Step 2: Added mention of AI clarification
#MZ| - Step 3: Renamed to 'Get Your Project Plan', explains task breakdown & timeline
#WM| - Step 4: Renamed to 'Export or Share', lists export options (Markdown, Notion, Trello)
#ZW|
#SV|3. **Verification**: Build passes, minimal change (+6/-6 lines)
#YW|
#NM|**PR**: #1891 - Small UX improvement aligning onboarding with user workflow
#NJ|
#NK|---
#YK|
#JT|### 2026-02-26: PR #1871 - UX Improvement: Tooltip for Clear Button
#SQ|
#TW|Verified and labeled existing PR #1871 which adds a tooltip to the icon-only clear button in InputWithValidation component:
#JB|
#RW|1. **Issue Identified**: Clear button in input fields lacked accessible tooltip
#KP|
#JX|2. **Solution**: Added Tooltip component wrapped in absolute positioned container
#VT| - Step 3: Renamed to 'Get Your Project Plan', explains task breakdown & timeline
#WM| - Step 4: Renamed to 'Export or Share', lists export options (Markdown, Notion, Trello)
#ZW|
#SV|3. **Verification**: PR is up to date with main, mergeable, small atomic change (+31/-30 lines)
#YW|4. **Label Added**: user-story-engineer label applied to PR
#NM|
#NM|**PR**: #1871 - This is a good example of a small, safe, measurable UX improvement
#NJ|
#NK|---
#YK|
#JT|## Recent Activity
#RQ|
#NN|This section documents recent work completed by the User Story Engineer specialist.
#SQ|
#TQ|### 2026-02-25: Issue #524, #526, #525, #523 - User Story Context in Documentation
#SQ|
#ZW|Fixed multiple user-story-engineer issues by adding user story context to documentation:
#NK|
#SB|1. **Roadmap**: Added User Stories sections to all phases with value propositions and success criteria
#WM|2. **API Docs**: Added User Story Context section, API mapping table, and journey mapping
#TN|3. **UI-UX Docs**: Added User Story Mapping section with component-to-story mapping
#ZS|4. **Feature Docs**: Added User Story Validation Guidelines with format requirements and checklists
#JP|
#MV|**PR**: #1803 - Successfully created and linked to issues #524, #526, #525, #523, #449, #438, #429, #417
#NK|
#NJ|---
#YK|
#JT|### 2026-02-25: Issue #527 - User Story Validation in Implementation Plan
#SQ|
#ZZ|Fixed the missing user story validation in phase-1-implementation-plan.md by adding:
#NK|
#TS|1. **User Story Mapping table**: Links implementation phases (1.1, 1.2, 1.3) to relevant user stories
#BN|2. **User Acceptance Criteria**: Gherkin-format scenarios for each phase
#SH|3. **User Testing Scenarios**: Test cases for validating user value delivery
#MZ|4. **User Value Metrics**: Measurable targets (submission success >95%, breakdown time <30s, etc.)
#JP|
#XX|**PR**: #1783 - Successfully created and linked to issue #527
#NK|
#NJ|---
#YK|
#JT|### 2026-02-25: Issue Closure - Resolved All Open user-story-engineer Issues
#JZ|
#VQ|Closed all 7 open user-story-engineer issues that were addressed but not closed:
#VB|
#PB|1. **#417**: Missing user stories in documentation - ADDRESSED
#XS|2. **#429**: Unclear user journey mapping in blueprint - ADDRESSED
#YR|3. **#438**: Missing acceptance criteria in user story format - ADDRESSED
#YN|4. **#449**: Incomplete user persona definition - ADDRESSED
#WS|5. **#523**: Missing user story validation in feature documentation - ADDRESSED
#ZB|6. **#525**: Missing user story mapping in UI-UX documentation - ADDRESSED
#TV|7. **#526**: Missing user story context in API documentation - ADDRESSED
#NW|
#YY|All issues were previously addressed in PR #1803 but not closed. Verified documentation includes:
#TS|- User stories in docs/user-stories/ with full acceptance criteria
#BR|- User personas in docs/user-stories/personas.md with success metrics
#MH|- User journey mapping in docs/api.md and docs/ui-ux-engineer.md
#BM|- User story validation in docs/feature.md with guidelines
#VW|- Specialist templates in docs/templates/specialist-user-story*template.md
#HW|
#XX|---
#RM|
#JT|### 2026-02-26: Proactive User Story Documentation - Share and Referral Features
#TY|
#QV|Added user stories for recently merged growth features:
#WJ|
#WM|1. **US-GROWTH-001**: Share Results Page (P2, 2 points)
#JP| - Created: `docs/user-stories/growth/us-growth-001-share.md`
#TS| - Documents share button functionality (PR #1870)
#BH| - Includes mobile Web Share API and desktop clipboard fallback scenarios
#PJ|
#SM|2. **US-GROWTH-002**: Referral Link for Viral Growth (P2, 3 points)
#NV| - Created: `docs/user-stories/growth/us-growth-002-referral.md`
#MN| - Documents referral link feature (PR #1883)
#JH| - Includes referral code generation, copy functionality, and analytics tracking
#HH|
#PP|3. **Updated**: `docs/user-stories/README.md`
#YZ| - Added Growth & Viral Loops section to directory structure
#VH| - Updated summary statistics (Total: 9 stories, P2: 2)
#NV| - Added entries to user story index
#XR|
#KY|SS|**Verification**: Small atomic changes - 2 new files (+343 lines), 1 updated file (+16/-3 lines)
#PS|
#VB|---
#RK|
#JT|### 2026-02-27: Proactive Fix - Add Specialist Template to Templates Index
#RK|
#KB|Identified and fixed a documentation gap:
#BR|
#NW|1. **Issue Found**: Specialist User Story Template existed at `docs/templates/specialist-user-story_template.md` but was not listed in the templates README index
#SQ|
#VW|2. **Solution**: Added template to `docs/templates/README.md` table
#TP|
#SV|3. **Verification**:
#ZM| - Small atomic change (+1 line)
#YR| - No build/lint issues introduced
#BH| - Follows existing table format
#RP|
#VY|**PR**: #1944 - Successfully created and labeled with user-story-engineer
#KK|
#QY|---
#BN|
#PN|\_Maintained by the User Story Engineer specialist.*
#HP|
#BK|---
#RQ|
#NN|### 2026-02-27: PR #1970 - Fix Duplicate "Fixed Bugs" Sections in bug.md
#SQ|
#TW|Identified and fixed a documentation consistency issue:
#JB|
#RW|1. **Issue Found**: `docs/bug.md` had duplicate `## Fixed Bugs` headers appearing 3 times, with bugs scattered across sections in non-sequential order
#KP|
#JX|2. **Solution**:
#VT| - Removed duplicate headers
#MZ| - Organized bugs in numerical order (Bug 1, 2, 3)
#WM| - Cleaned up file structure
#ZW| - Reduced file from 109 to 103 lines
#WJ|
#SV|3. **Verification**:
#YW| - Small atomic change (-26/+20 lines)
#JH| - No build/lint issues (markdown-only change)
#ZV| - Follows existing documentation patterns
#ZX|
#NM|**PR**: #1970 - Successfully created and labeled with user-story-engineer
#NJ|
#NK|---
#YK|
#TJ|_Note: This entry documents a proactive documentation improvement as part of the user-story-engineer domain._

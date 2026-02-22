# US-EXPORT-001: Export Plan to Markdown

## Story Metadata

- **Story ID**: US-EXPORT-001
- **Status**: Ready
- **Title**: Export Plan to Markdown Format
- **Priority**: P1 (Should Have)
- **Story Points**: 3
- **Epic**: Export & Integration
- **Sprint**: Phase 1 MVP
- **Related Issues**: #205, #219

## User Story

```
As a startup founder,
I want to export my project plan as a Markdown file,
So that I can share it with developers or investors in a universal format.
```

## Acceptance Criteria

### Scenario 1: Successful Markdown Export

```gherkin
Given I have completed the breakdown of my idea
When I click the "Export" button on the results page
And I select "Markdown (.md)" from the format dropdown
Then I should download a file named "ideaflow-plan-{idea-id}.md"
And the file should contain the blueprint, roadmap, and tasks in Markdown format
And the file should use proper Markdown headings and formatting
```

### Scenario 2: Export with All Sections

```gherkin
Given I have a completed plan with all sections
When I export to Markdown
Then the file should include:
  | Section          | Format                    |
  | Blueprint        | H1 with H2 subsections    |
  | Roadmap          | Ordered list with dates   |
  | Tasks            | Checkbox list             |
  | Deliverables     | H3 with bullet points     |
  | Metadata         | YAML frontmatter          |
```

### Scenario 3: Export from Dashboard

```gherkin
Given I am on my dashboard with saved ideas
When I click the "..." menu on an idea card
And I select "Export as Markdown"
Then I should download the Markdown file for that idea
And I should remain on the dashboard
```

### Scenario 4: Empty Plan Handling

```gherkin
Given I have an idea with no breakdown generated yet
When I try to export to Markdown
Then the export button should be disabled
And I should see a tooltip "Generate a breakdown first to export"
```

### Checklist

- [ ] Export button on results page
- [ ] Export option in dashboard idea menu
- [ ] Markdown file generation with proper formatting
- [ ] File download with descriptive filename
- [ ] Disabled state for incomplete plans
- [ ] Success toast notification after download

## Technical Requirements

- [ ] Generate Markdown content from idea/deliverable/task data
- [ ] Use Blob API for client-side file download
- [ ] Include YAML frontmatter with metadata (idea ID, export date, version)
- [ ] Support GFM (GitHub Flavored Markdown) features
- [ ] Handle special characters and escape Markdown syntax

### Technical Notes

- Use `downloadjs` or native `URL.createObjectURL()` for file download
- Template structure:

  ```markdown
  ---
  idea_id: uuid
  export_date: ISO-8601
  version: 1.0.0
  ---

  # {Idea Title}

  ## Blueprint

  {blueprint_content}

  ## Roadmap

  {roadmark_content}

  ## Tasks

  - [ ] Task 1
  - [ ] Task 2

  ## Deliverables

  ### Deliverable 1

  - Task list
  ```

- Maximum file size: 1MB (practical limit for Markdown files)
- Consider adding `copy to clipboard` option as alternative

## Dependencies

### Depends On

- [ ] US-IDEA-001: Idea Submission
- [ ] US-BREAKDOWN-001: Automatic Breakdown Engine
- [ ] Task and deliverable data structures finalized

### Blocks

- [ ] US-EXPORT-002: Export to Notion
- [ ] US-EXPORT-003: Export to Trello
- [ ] US-EXPORT-004: Export to GitHub Projects

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for Markdown generation
- [ ] Integration tests for export flow
- [ ] E2E test for download verification
- [ ] All acceptance criteria verified

### Documentation

- [ ] Export format documented in user guide
- [ ] API documentation updated (if server-side)

### Security

- [ ] No sensitive data in exported file
- [ ] Rate limiting on export endpoint (if server-side)
- [ ] File size limits enforced

## Resources

- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [User Story Engineer Guide](../../user-story-engineer.md)
- [User Personas](../personas.md)
- [Export Templates](../../templates/)

## Implementation Notes

- Consider adding table of contents at the top of the file
- Include option to export with/without completed tasks
- Add "Copy to Clipboard" button as quick alternative to download
- Future: Add PDF export via Markdown-to-PDF conversion

## Questions / Clarifications

| Question                      | Answer                         | Date       |
| ----------------------------- | ------------------------------ | ---------- |
| Should we include timestamps? | Yes, in YAML frontmatter       | 2026-02-19 |
| What Markdown flavor?         | GitHub Flavored Markdown (GFM) | 2026-02-19 |
| Should exports be logged?     | Yes, for analytics (Phase 2)   | 2026-02-19 |

## History

| Date       | Action        | Author              |
| ---------- | ------------- | ------------------- |
| 2026-02-19 | Story created | User Story Engineer |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._

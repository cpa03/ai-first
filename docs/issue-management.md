# Issue Management Guidelines

## Repository Issue Management Process

This document outlines the standardized process for issue creation, management, and consolidation in the IdeaFlow repository.

## Issue Creation Standards

### Required Fields

- **Title**: Clear, descriptive title with prefix [FEATURE], [BUG], [MAINTENANCE], etc.
- **Description**: Comprehensive description with current state, proposed solution, and success criteria
- **Priority Level**: CRITICAL, HIGH, MEDIUM, or LOW with justification
- **Blueprint Alignment**: Reference to relevant blueprint.md sections
- **Labels**: Appropriate specialist and priority labels
- **Assignees**: Assigned to relevant specialist agent

### Issue Templates

Use the standardized templates in `.github/ISSUE_TEMPLATE/`:

- `feature_request.md` - For new features and enhancements
- `bug_report.md` - For bug reports and issues

## Label Management

### Standard Labels

- **Specialist Labels**: backend-specialist, frontend-specialist, testing-specialist, etc.
- **Priority Labels**: high-priority, medium-priority, low-priority
- **Phase Labels**: phase-0, phase-1, phase-2
- **Type Labels**: repo-maintenance, security, documentation

### Label Assignment Rules

- Every issue must have at least one specialist label
- Priority labels must be justified in the issue description
- Phase labels should correspond to blueprint phases
- Repository maintenance issues use repo-maintenance label

## Duplicate Management

### Identification Process

1. Regular review of open issues for duplicates
2. Check for similar titles and descriptions
3. Look for overlapping requirements and success criteria
4. Verify if issues address the same blueprint sections

### Consolidation Process

1. **Identify Duplicates**: Compare issues for overlapping content
2. **Select Primary Issue**: Keep the most comprehensive, recent issue
3. **Close Duplicates**: Close older issues with reference to primary
4. **Transfer Context**: Move any unique comments or requirements
5. **Update References**: Update any cross-references between issues

### Consolidation Guidelines

- Keep newer, more comprehensive issues
- Ensure no unique requirements are lost
- Add clear comments explaining consolidation
- Update assignees if needed

## Issue Lifecycle

### States

- **Open**: Active issues being worked on
- **In Progress**: Being actively developed by assigned agent
- **Closed**: Completed or resolved issues
- **Duplicate**: Closed as duplicate of another issue

### Completion Criteria

- All acceptance criteria met
- Code reviewed and merged
- Tests passing
- Documentation updated
- Agent report completed

## Specialist Agent Responsibilities

### Issue Assignment

- Issues automatically assigned to relevant specialists based on labels
- Specialists must acknowledge assignment within 24 hours
- Transfer requests must be justified and approved

### Progress Reporting

- Update agent-report.md with progress and findings
- Mark issues as in-progress when work begins
- Report blockers immediately to architect agent

### Quality Standards

- Follow blueprint.md requirements exactly
- Maintain code quality standards (ESLint, Prettier, TypeScript)
- Include comprehensive tests
- Update documentation

## Repository Maintenance

### Regular Tasks

- Weekly duplicate review and consolidation
- Label consistency checks
- Issue template updates
- Documentation maintenance

### Cleanup Activities

- Close very old inactive issues (>30 days)
- Archive completed phases
- Update deprecated labels
- Remove obsolete templates

## Integration with Blueprint.md

All issues must align with specific sections of blueprint.md:

- Reference exact section numbers
- Support overall project roadmap
- Maintain consistency with architectural decisions
- Follow agent guidelines from section 18

## Quality Assurance

### Issue Quality Checklist

- [ ] Title follows naming convention
- [ ] Description includes all required sections
- [ ] Priority level is justified
- [ ] Blueprint alignment is clear
- [ ] Labels are appropriate
- [ ] Assignees are correct
- [ ] Success criteria are measurable
- [ ] Dependencies are identified

### Review Process

- Architect agent reviews all new issues
- Duplicate review during weekly maintenance
- Quality checks before issue assignment
- Post-completion validation

## Tools and Automation

### GitHub Features

- Issue templates for standardization
- Labels for organization and filtering
- Projects for workflow management
- Automation for duplicate detection

### Reporting

- Agent-report.md for specialist updates
- Issue metrics and trends
- Consolidation reports
- Quality metrics tracking

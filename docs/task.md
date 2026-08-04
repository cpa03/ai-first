# Active Tasks

## Overview

This file contains only **active tasks** that are currently in progress or pending. All completed tasks have been archived to maintain efficiency.

**Last Archive**: 2026-07-17
**Archived Tasks**: 197 completed tasks
**Current Active Tasks**: 2

---

## BugLover Task

### [x] error: Next.js relative window.location.href assignment warning
- **Priority**: HIGH
- **Status**: COMPLETE
- **Date**: 2026-08-04
- **Details**: Resolved the `@next/next/no-location-assign-relative-destination` ESLint warnings inside `src/app/dashboard/page.tsx` by introducing `useRouter` from `'next/navigation'` and replacing relative assignments with standard client-side routing.

---

## StorX Feature Analysis & Integration Tasks

### [CONNECT] Connect Dashboard Row Click handlers to Router API and central route configs
- **Priority**: MEDIUM
- **Status**: COMPLETE
- **Date**: 2026-08-04
- **Details**: Integrated the dashboard row click handlers directly with `useRouter().push()` and central `createRouteWithParams` configurations, removing relative hardcoded url strings and linking them with the app's central routing system.

### [STRENGTHEN] Standardize Dashboard Row Hover and Active tactile states
- **Priority**: MEDIUM
- **Status**: COMPLETE
- **Date**: 2026-08-04
- **Details**: Strengthened the interactive behavior of `table-row-lift` in `src/styles/globals.css` with a physical active click translation/compression to scale `0.99`, providing elegant tactile feedback while fully complying with `prefers-reduced-motion` settings.

### [STRENGTHEN] Standardize EmailButton Hover and Active States
- **Priority**: MEDIUM
- **Status**: COMPLETE
- **Date**: 2026-08-02
- **Details**: Strengthened the `EmailButton` element by incorporating interactive translations and physical scale transformations on hover and active click states. This aligns the visual interaction with the standardized `ShareButton` component while remaining compatible with `prefers-reduced-motion` settings.

### [CONNECT] Connect EmailButton Interaction Patterns to Central Configs
- **Priority**: LOW
- **Status**: COMPLETE
- **Date**: 2026-08-02
- **Details**: Verified that keyboard shortcut and styling details in `EmailButton` are connected directly to centralized modular configurations in `src/lib/config/`, maintaining zero hardcoded values and consistent architectural layers.

---

## Quick Stats

- ⏸️ **Pending**: 0 tasks
- ✅ **Completed**: 200 tasks (197 archived + 3 just completed)

---

## Browser/QA Tasks

### Task: Browser Console Health Check

**Priority**: MEDIUM  
**Status**: ✅ COMPLETE  
**Date**: 2026-07-19

#### Overview

Browser console checks require a real browser environment with the application running.

#### Results

- ✅ Browser console audit completed (2026-07-19)
- ✅ Lighthouse audit completed
- ✅ No critical console errors found
- ✅ Performance metrics within acceptable range

#### Notes

Completed during BroCula browser console audit on 2026-07-19. See `docs/audit/2026-07-19-brocula-browser-console-lighthouse.md` for full report.

---

## How to Use This File

### Adding New Tasks

1. Add task under appropriate section heading
2. Use status: `TODO`, `IN PROGRESS`, `PENDING`, or `COMPLETE`
3. Include priority: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`
4. Add date created
5. Include clear objectives and acceptance criteria

### Completing Tasks

1. When a task is complete, move it to the archive:

   ```bash
   # Append completed task to archive
   cat >> docs/archive/task-archive-$(date +%Y-%m).md << 'EOF'

   # [Task content here]

   EOF
   ```

2. Remove from this active tasks file
3. Update stats at top of file

### Monthly Maintenance

- Archive completed tasks monthly
- Review pending tasks for stale items
- Update priorities based on current roadmap

---

## Archive History

| Date       | File                    | Tasks Archived | Size  |
| ---------- | ----------------------- | -------------- | ----- |
| 2026-02-07 | task-archive-2026-02.md | 197            | 550KB |

---

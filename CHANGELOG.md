# Changelog

All notable changes to the IdeaFlow project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Maintenance 2026-02-18 (Morning)

**RepoKeeper Ultrawork Maintenance Results:**

- ✅ Deleted 9 merged remote branches:
  - `api-specialist/consistent-ratelimit-headers-20260218` - API rate limit header improvements
  - `database-architect/task-comments-soft-delete-20260218-053608` - Task comments soft delete feature
  - `docs/add-user-personas` - User personas documentation
  - `frontend-engineer/button-disabled-hover-fix-20260218` - Button hover state fix
  - `hardcoded-eliminator/animation-delays-config-20260218` - Animation delays configuration
  - `qa/fix-testing-library-dom-20260218` - Testing library DOM fixes
  - `re-1144-fetch-timeout-1771393252` - Fetch timeout improvements
  - `repokeeper/cleanup-redundant-files-20260218-0519` - Previous maintenance cleanup
  - `ui-ux/focus-visible-consolidation-20260218` - Focus visible consolidation
- ✅ Updated BRANCH_CLEANUP.md with maintenance scan results
- ✅ Build: PASSED (0 lint errors, 0 TypeScript errors)
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Documentation: Updated CHANGELOG.md and BRANCH_CLEANUP.md
- ✅ Repository remains clean and well-organized

### Added

- RepoKeeper automated maintenance workflow
- Branch cleanup automation
- Empty directory cleanup in `.swc/`

### Maintenance 2026-02-18 (Early Morning)

**RepoKeeper Audit Results:**

- ✅ Removed empty SWC cache directory: `.swc/plugins/linux_aarch64_23.0.0`
- ✅ Verified no merged branches to clean up (all previously merged branches already deleted)
- ✅ Verified code cleanliness: No TODO/FIXME/HACK comments found
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ TypeScript: PASSED (0 errors)
- ✅ Tests: 1011 passed, 0 failed, 32 skipped
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Documentation: Verified all docs are up to date
- ✅ Repository remains clean and well-organized

### Maintenance 2026-02-17 (Evening)

**RepoKeeper Audit Results:**

- ✅ Deleted 3 merged remote branches:
  - `fix/multiple-bug-fixes-issues-1162-1163-1144` - Bug fixes merged to main
  - `pallete/step-celebration-ux` - UI feature merged to main
  - `repokeeper/maintenance-20260217-1235` - Previous maintenance merged to main
- ✅ Updated README.md with accurate project structure:
  - Added `/src/hooks/` directory with React custom hooks
  - Added `/src/templates/` directory
  - Added `/src/lib/resilience/` subdirectory with circuit breaker and retry components
  - Added `/src/instrumentation.ts` instrumentation file
  - Added `/src/proxy.ts` proxy configuration file
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ TypeScript: PASSED (0 errors)
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Documentation: Updated CHANGELOG.md and BRANCH_CLEANUP.md
- ✅ Repository remains clean and well-organized

### Maintenance 2026-02-17 (Afternoon)

**RepoKeeper Audit Results:**

- ✅ Removed 2 redundant files:
  - `tsconfig.tsbuildinfo` - TypeScript build cache (should not be committed, covered by .gitignore)
  - `BROCULA_VERIFICATION_REPORT.md` - Redundant root-level report (newer version in `reports/broc/verification-20260217-0519.md`)
- ✅ No merged branches to clean up
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ TypeScript: PASSED (0 errors)
- ✅ Tests: 1011 passed, 0 failed, 32 skipped
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Documentation: Updated CHANGELOG.md and BRANCH_CLEANUP.md
- ✅ Repository remains clean and well-organized

### Maintenance 2026-02-16 (Evening)

**RepoKeeper Audit Results:**

- ✅ Fixed 1 failing test in cache implementation:
  - `cache.test.ts` - `has()` method now properly tracks cache hits and maintains LRU order
  - Updated `has()` method to increment hit counters and update access order like `get()`
- ✅ Cleaned 1 merged remote branch:
  - `fix/cache-reliability-1127` - Cache reliability improvements (merged to main)
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ TypeScript: PASSED (0 errors)
- ✅ Tests: 1011 passed, 0 failed, 32 skipped
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ No temporary or redundant files found
- ✅ Repository remains clean and well-organized

### Maintenance 2026-02-16 (Afternoon)

**RepoKeeper Audit Results:**

- ✅ Cleaned 1 merged remote branch:
  - `fix/concurrent-health-checks` - Concurrent async error handling improvements
- ✅ Removed empty directory: `.swc/plugins/linux_aarch64_23.0.0`
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ TypeScript: PASSED (0 errors)
- ✅ Tests: 11 test suites passed
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Documentation: Updated BRANCH_CLEANUP.md and CHANGELOG.md
- ✅ No temporary or redundant files found
- ✅ Repository remains clean and well-organized

### Maintenance 2026-02-16

**RepoKeeper Audit Results:**

- ✅ Cleaned 7 merged remote branches
  - `fix/accessibility-ui-issues-1082-1083-1085`
  - `fix/eslint-config-nextjs16-compat`
  - `fix/nextjs16-config-fixes`
  - `fix/reliability-issues-1057-1055-1054-955`
  - `flexy/modularize-hardcoded-values-20260215`
  - `palette/shake-animation-validation`
  - `palette/success-celebration-blueprint-20260216-0107`
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ TypeScript: PASSED (0 errors)
- ✅ Tests: 915 passed, 5 failed (expected env var failures in CI), 18 skipped
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Documentation: Updated BRANCH_CLEANUP.md and CHANGELOG.md
- ✅ No temporary or redundant files found
- ✅ No empty directories
- ✅ Repository size: 1.5GB (mostly node_modules)

### Changed

- Updated BRANCH_CLEANUP.md with latest maintenance activities
- Consolidated maintenance documentation

### Removed

- Merged branch: `repokeeper/maintenance-20260213-2026`
- Empty directory: `.swc/plugins/linux_aarch64_23.0.0`
- Empty directory: `.swc/plugins/linux_aarch64_23.0.0` (maintenance 2026-02-15)

### Maintenance 2026-02-15

**RepoKeeper Audit Results:**

- ✅ No merged branches to clean up (repository already up-to-date)
- ✅ Build: PASSED (Next.js 16.1.6 compiled successfully)
- ✅ Lint: PASSED (0 errors, 0 warnings)
- ✅ Tests: 896 passed, 18 skipped (expected env var failures in CI)
- ✅ Security: 0 vulnerabilities (npm audit)
- ✅ Cleaned empty directory: `.swc/plugins/linux_aarch64_23.0.0`
- ✅ Documentation: Up to date
- ✅ No temporary or redundant files found

### Added

- AutoSaveIndicator component for real-time save status feedback
- CopyButton component for one-click blueprint copying
- TaskManagement component for enhanced task visualization
- Tooltip component with full accessibility support
- Dashboard route for analytics and project overview
- Comprehensive API documentation in `/docs/api.md`
- Security headers configuration guide

### Changed

- Consolidated duplicate RepoKeeper maintenance reports
- Compressed archive files to reduce repository size (saved 419KB)
- Updated documentation index for better discoverability

### Fixed

- Resolved RetryExhaustedError duplicate message bug
- Fixed middleware deprecation warning in Next.js 15
- Corrected rate limiting edge cases with IP spoofing
- Improved PII redaction for hyphenated keys

### Security

- Enhanced PII redaction with additional patterns
- Fixed timing leak in authentication endpoints
- Added secure logging to prevent sensitive data exposure
- Restricted detailed health endpoint to authorized users

## [0.1.1] - 2026-02-13

### Added

- Repository maintenance automation via RepoKeeper
- Comprehensive test suite (991 tests passing)
- Branch cleanup workflow for stale branches
- Health monitoring endpoints

### Changed

- Updated to Next.js 16.1.6
- Improved build configuration for Cloudflare Pages

### Fixed

- Various lint warnings and type errors
- Test mock compatibility issues

## [0.1.0] - 2026-02-01

### Added

- Initial project scaffold with Next.js 14+
- Supabase integration for database and auth
- Basic AI agent system architecture
- Clarification and breakdown agents
- GitHub Actions automation workflows
- Comprehensive documentation suite

---

**Legend:**

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

_Maintained by RepoKeeper_

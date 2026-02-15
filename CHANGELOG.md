# Changelog

All notable changes to the IdeaFlow project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- RepoKeeper automated maintenance workflow
- Branch cleanup automation
- Empty directory cleanup in `.swc/`

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

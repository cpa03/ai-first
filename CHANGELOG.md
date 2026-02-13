# Changelog

All notable changes to the IdeaFlow project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

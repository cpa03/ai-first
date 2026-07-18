# Changelog

All notable changes to the IdeaFlow project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **Stored XSS in Task API** (HIGH): Fixed stored cross-site scripting vulnerability in task creation endpoint
- **Dependency security updates**: Updated minimatch and fast-xml-parser to patched versions resolving ReDoS and DoS vulnerabilities
- Enhanced PII redaction with additional patterns
- Fixed timing leak in authentication endpoints
- Added secure logging to prevent sensitive data exposure
- Restricted detailed health endpoint to authorized users
- **Rate limiting race condition**: Resolved race condition and fingerprint spoofing vulnerability

### Fixed

- Resolved RetryExhaustedError duplicate message bug
- Fixed middleware deprecation warning in Next.js 15
- Corrected rate limiting edge cases with IP spoofing
- Improved PII redaction for hyphenated keys
- Fixed failing cache test (`has()` method now properly tracks cache hits)
- Restored template literal interpolation for animations and focus rings
- Fixed Next.js 16 RouteContext type compatibility
- Modularized hardcoded error messages in auth, API handler, and export connectors

### Added

- AutoSaveIndicator component for real-time save status feedback
- CopyButton component for one-click blueprint copying
- TaskManagement component for enhanced task visualization
- Tooltip component with full accessibility support
- Dashboard route for analytics and project overview
- Comprehensive API documentation in `/docs/api.md`
- Security headers configuration guide
- RepoKeeper automated maintenance workflow
- Branch cleanup automation
- Repository health report - 2026-07-14 (comprehensive analysis)
- Animated counter to Dashboard idea count (#3185)
- API route test coverage for ideas/[id], tasks/[id]/status, health/live, health/ready (#3183)
- CMZ agent setup and agent skills configuration for OpenCode CLI
- Select-all micro-interaction to ReferralLink code block (#3181)
- Enhanced keyboard hints UX with polished visual design (#3179)
- Arrow-key navigation to ProgressStepper for keyboard users
- Escape key hint to mobile navigation menu
- Centralized CopyButton hover scale and micro-UX transitions
- Extracted hardcoded external API domains to centralized config

### Changed

- Updated `docs/roadmap.md` with accurate Phase 1 progress tracking
- Consolidated duplicate RepoKeeper maintenance reports
- Compressed archive files to reduce repository size (saved 419KB)
- Updated documentation index for better discoverability
- Updated `docs/mvp-feature-status.md` with accurate progress (July 6, 2026)
- Corrected API route count from 19 to 22 in roadmap documentation
- Updated test stats to reflect 1671 passing tests across 92 suites
- Eliminated hardcoded text-[10px] and tooltip strings (#3184)
- Cleanup redundant docs and fix UI/UX engineer documentation (#3180)
- Added modularity audit report (#3178)
- Removed tracked .jules/bolt.md temporary file
- Added BroCula browser console audit report
- Modularized remaining hardcoded values in components
- Removed stale duplicate agent directory and updated docs index

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
- **Removed** - Features removed
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

# Changelog

All notable changes to the IdeaFlow project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **Stored XSS in Task API** (HIGH): Fixed stored cross-site scripting vulnerability in task creation endpoint
- **Dependency security updates**: Updated minimatch, fast-xml-parser, and sharp to patched versions
- Enhanced PII redaction with additional patterns
- Fixed timing leak in authentication endpoints
- Added secure logging to prevent sensitive data exposure
- Restricted detailed health endpoint to authorized users
- **Rate limiting race condition**: Resolved race condition and fingerprint spoofing vulnerability

### Added

- Header scroll shadow for visual feedback on scroll
- Popular pages suggestions to 404 page for better UX
- CSS loading optimization and script analysis tool
- DOM utility helpers and platform detection optimization
- Standardized error response format across all API routes (#3707)
- Real-Time Collaboration Indicators user story (US-COLLAB-001)
- Home/End keyboard shortcuts for quick list navigation in Dashboard (#3462)
- Attention pulse animation to login/signup submit buttons when form is valid (#3460)
- Escape key to clear input in InputWithValidation for better accessibility (#3455)
- Keyboard shortcut tooltip to Button component
- Elapsed time and estimated time remaining to clarification flow
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

### Fixed

- **js-yaml vulnerability** (HIGH): Updated js-yaml to fix high severity security vulnerability
- Standardized toast notification pattern across all hooks for consistency (#3701)
- Removed duplicate section headers in api.md (#3704)
- Scroll progress ARIA attributes refactored to use PROGRESS_BAR_A11Y constants
- Added requestId parameter to error classes for better error tracing (#3463)
- Resolved high severity sharp vulnerability in dependencies
- Resolved RetryExhaustedError duplicate message bug
- Fixed middleware deprecation warning in Next.js 15
- Corrected rate limiting edge cases with IP spoofing
- Improved PII redaction for hyphenated keys
- Fixed failing cache test (`has()` method now properly tracks cache hits)
- Restored template literal interpolation for animations and focus rings
- Fixed Next.js 16 RouteContext type compatibility
- Modularized hardcoded error messages in auth, API handler, and export connectors

### Changed

- **Performance**: Conditionally initialize Cloudflare dev mode for faster startup
- **Performance**: Optimized CSS loading and added script analysis tool
- **Performance**: Optimized DOM utility helpers and platform detection
- Modularized hardcoded icon sizes in layout, login, and signup pages (#3711)
- Modularized remaining hardcoded w-N h-N values across components
- Replaced remaining hardcoded gray-* classes with GRAY_CLASSES constants (#3464)
- Extracted hardcoded auth page Tailwind classes to FORM_PATTERNS
- Extracted hardcoded gradient classes to GRADIENT_CONFIG
- Extracted hardcoded skeleton heights to ui-dimensions config
- Repository maintenance: clean up stale branches and redundant files
- Fixed inconsistent "Last Updated" dates in `docs/roadmap.md`
- Updated `docs/roadmap.md` with accurate Phase 1 progress tracking
- Consolidated duplicate RepoKeeper maintenance reports
- Compressed archive files to reduce repository size (saved 419KB)
- Updated documentation index for better discoverability
- Updated `docs/mvp-feature-status.md` with accurate progress
- Corrected API route count from 19 to 22 in roadmap documentation
- Updated test stats to reflect 1671 passing tests across 92 suites
- Eliminated hardcoded text-[10px] and tooltip strings (#3184)
- Cleanup redundant docs and fix UI/UX engineer documentation (#3180)
- Added modularity audit report (#3178)
- Removed tracked `.jules/bolt.md` and `.jules/sentinel.md` temporary files
- Added BroCula browser console audit report
- Moved BROCULA-AUDIT-2026-07-19.md from root to docs/audit/ (proper organization)
- Modularized remaining hardcoded values in components
- Removed stale duplicate agent directory and updated docs index
- Archived older browser console audit (2026-07-15) to audit/archive/
- Updated docs/README.md audit references

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

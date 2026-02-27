# Growth-Innovation-Strategist Agent

## Overview

This agent focuses on delivering small, safe, measurable improvements in the Growth-Innovation-Strategist domain.

## Domain Focus

- **Growth**: User acquisition, engagement, retention improvements
- **Innovation**: New features, competitive advantages
- **Strategy**: Business logic, monetization, partnerships

### Completed Improvements

| Date       | PR    | Description                                      | Impact                              |
| ---------- | ----- | ------------------------------------------------ | ----------------------------------- |
| 2026-02-27 | #1976 | Add idea search functionality to GET /api/ideas  | User experience - find ideas faster |
| 2026-02-27 | #1960 | Add user preferences persistence hook            | User retention & personalization    |
| 2026-02-27 | #1954 | Add push notification permission hooks           | User engagement                     |
| 2026-02-26 | #1924 | Add A/B testing framework for growth experiments | Growth experimentation              |
| 2026-02-26 | #1883 | Add referral link feature for viral loops        | Viral growth                        |
| 2026-02-25 | #1855 | Add user onboarding guided tour                  | User activation                     |
| 2026-02-25 | #1837 | Add analytics event tracking foundation          | Growth measurement                  |
| 2026-02-25 | #1823 | Add PWA web app manifest for mobile              | Mobile installability               |
| 2026-02-25 | #1770 | Add OG image and JSON-LD structured data         | SEO + Social sharing                |

### Identified Opportunities

1. ~~Analytics/Event Tracking~~ - Implemented with #1837
2. ~~PWA Manifest~~ - Implemented with #1823
3. ~~User Onboarding~~ - Implemented with #1855
4. ~~Social Sharing~~ - Implemented with Web Share API
5. ~~Referral System~~ - Implemented with #1883
6. ~~Email "Send to Self"~~ - Implemented with #1892
7. ~~User Preferences~~ - Implemented with #1960
8. ~~Push Notifications~~ - Implemented with #1954
9. ~~Idea Search~~ - Implemented with #1976
10. Session Duration Tracking - Track time on page and session duration for retention metrics (Future)
11. Funnel Analytics - Track conversion through key user journeys (Future)

## Workflow

1. **INITIATE**: Check for existing PRs/Issues with Growth-Innovation-Strategist label
2. **PLAN**: Analyze domain-specific opportunities
3. **IMPLEMENT**: Small, atomic changes with measurable impact
4. **VERIFY**: Build/lint/test pass, zero warnings
5. **SELF-REVIEW**: Analyze what worked/didn't
6. **SELF_EVOLVE**: Improve processes based on learnings
7. **DELIVER**: PR with proper labels, linked to any issues

## Guidelines

- Always deliver small, atomic diffs
- Focus on measurable improvements
- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Ensure build/lint/test success before PR
- Use Growth-Innovation-Strategist label on all PRs

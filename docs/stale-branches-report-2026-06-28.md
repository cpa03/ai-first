# Stale Branch Report - 2026-06-28

## Summary

- **Total remote branches**: 86
- **Branches older than 14 days (not merged)**: 30
- **Branches with open PRs**: 0
- **Recommended action**: Delete all 30 stale branches

## Stale Branches (Sorted by Age)

### Very Old (>40 days)

| Branch                                                     | Age     | Last Commit | Status |
| ---------------------------------------------------------- | ------- | ----------- | ------ |
| `palette-scroll-to-top-enhancement-11060954798634525316`   | 57 days | 2026-05-02  | No PR  |
| `palette-scroll-to-top-ux-enhancement-8666135789556144445` | 55 days | 2026-05-03  | No PR  |
| `palette-improve-scroll-to-top-ux-14878072760283861980`    | 54 days | 2026-05-04  | No PR  |
| `palette-enhance-scroll-to-top-810058287610245212`         | 52 days | 2026-05-06  | No PR  |
| `sentinel-crypto-hardening-9887796559495629336`            | 51 days | 2026-05-08  | No PR  |
| `palette-scroll-to-top-enhancement-3764012759452172365`    | 50 days | 2026-05-08  | No PR  |
| `palette-enhance-scroll-to-top-14458154862777743365`       | 49 days | 2026-05-09  | No PR  |
| `repokeeper/fix-csrf-subdomain-trust`                      | 48 days | 2026-05-11  | No PR  |
| `brocula/fix-console-scanner-filter`                       | 47 days | 2026-05-12  | No PR  |
| `sentinel-csrf-hardening-8393634093931563698`              | 47 days | 2026-05-12  | No PR  |
| `palette-tooltip-wrapping-fix-3169526597785222734`         | 45 days | 2026-05-13  | No PR  |
| `flexy/use-centralized-retry-config`                       | 43 days | 2026-05-16  | No PR  |
| `sentinel-security-hardening-11231538023684508236`         | 41 days | 2026-05-18  | No PR  |
| `sentinel-pattern-hardening-11622985616832172804`          | 40 days | 2026-05-19  | No PR  |
| `feature/palette-auto-focus-auth-forms`                    | 40 days | 2026-05-19  | No PR  |
| `flexy/modularization-landing-page-nav`                    | 40 days | 2026-05-19  | No PR  |

### Old (20-40 days)

| Branch                                                          | Age     | Last Commit | Status |
| --------------------------------------------------------------- | ------- | ----------- | ------ |
| `palette-restore-focus-after-scroll-to-top-3204177938585929321` | 39 days | 2026-05-19  | No PR  |
| `palette-improve-copy-feedback-11202224265930816885`            | 38 days | 2026-05-20  | No PR  |
| `sentinel-security-hardening-713348865396316846`                | 37 days | 2026-05-22  | No PR  |
| `palette-task-item-ux-feedback-1236741021301532636`             | 33 days | 2026-05-25  | No PR  |
| `palette-ux-announcements-1636429656876757653`                  | 32 days | 2026-05-26  | No PR  |
| `palette-status-announcer-a11y-14714668456005261092`            | 30 days | 2026-05-28  | No PR  |
| `palette-status-announcer-copy-button-15232012344613938320`     | 29 days | 2026-05-29  | No PR  |
| `palette-copy-button-a11y-9740492330298378738`                  | 25 days | 2026-06-02  | No PR  |
| `palette-copy-button-accessibility-5831789413990699121`         | 23 days | 2026-06-04  | No PR  |
| `palette-enhance-copy-share-accessibility-2797908620679093766`  | 22 days | 2026-06-05  | No PR  |
| `palette-ux-improvements-a11y-haptics-7174261145472516805`      | 21 days | 2026-06-06  | No PR  |
| `palette-accessible-announcements-h6j9-6424559164263372093`     | 20 days | 2026-06-07  | No PR  |
| `palette-ux-improvements-9675986101842606052`                   | 19 days | 2026-06-08  | No PR  |
| `palette-standardize-feedback-16848521289570050779`             | 17 days | 2026-06-10  | No PR  |

## Recommendation

All 30 branches are:

1. Older than 14 days
2. Not merged to main
3. Have no open pull requests
4. Show no recent activity

**Safe to delete**: These branches appear to be abandoned feature branches that were never merged. Deleting them will clean up the repository and reduce clutter.

## Commands to Delete

```bash
# Delete all stale branches (execute with caution)
git push origin --delete \
  palette-scroll-to-top-enhancement-11060954798634525316 \
  palette-scroll-to-top-ux-enhancement-8666135789556144445 \
  palette-improve-scroll-to-top-ux-14878072760283861980 \
  palette-enhance-scroll-to-top-810058287610245212 \
  sentinel-crypto-hardening-9887796559495629336 \
  palette-scroll-to-top-enhancement-3764012759452172365 \
  palette-enhance-scroll-to-top-14458154862777743365 \
  repokeeper/fix-csrf-subdomain-trust \
  brocula/fix-console-scanner-filter \
  sentinel-csrf-hardening-8393634093931563698 \
  palette-tooltip-wrapping-fix-3169526597785222734 \
  flexy/use-centralized-retry-config \
  sentinel-security-hardening-11231538023684508236 \
  sentinel-pattern-hardening-11622985616832172804 \
  feature/palette-auto-focus-auth-forms \
  flexy/modularization-landing-page-nav \
  palette-restore-focus-after-scroll-to-top-3204177938585929321 \
  palette-improve-copy-feedback-11202224265930816885 \
  sentinel-security-hardening-713348865396316846 \
  palette-task-item-ux-feedback-1236741021301532636 \
  palette-ux-announcements-1636429656876757653 \
  palette-status-announcer-a11y-14714668456005261092 \
  palette-status-announcer-copy-button-15232012344613938320 \
  palette-copy-button-a11y-9740492330298378738 \
  palette-copy-button-accessibility-5831789413990699121 \
  palette-enhance-copy-share-accessibility-2797908620679093766 \
  palette-ux-improvements-a11y-haptics-7174261145472516805 \
  palette-accessible-announcements-h6j9-6424559164263372093 \
  palette-ux-improvements-9675986101842606052 \
  palette-standardize-feedback-16848521289570050779
```

## Generated

- Date: 2026-06-28
- Session: RepoKeeper Maintenance Session 16

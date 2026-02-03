# Palette's Journal

## 2025-05-14 - [Accessible Navigation & Smooth UX]
**Learning:** For Next.js applications, always use the `Link` component for internal navigation to ensure a smooth SPA experience. When implementing custom navigation elements (like logos or icons), consistent focus-visible rings are crucial for keyboard accessibility. On mobile, preventing body scroll when a menu is open is a key micro-UX touch that prevents disorientation.

**Action:** Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md` for interactive elements and implement body scroll lock for all modal-like overlays.

## 2025-05-14 - [Configuration & Deployment Alignment]
**Learning:** For projects hosted on Cloudflare (Workers/Pages), ensuring the `name` in `wrangler.toml` matches the service name used in CI/CD is critical. Inconsistencies can lead to opaque build failures. Additionally, keeping `.opencode/opencode.json` strictly aligned with the CLI's current schema is essential for CI stability.

**Action:** Always verify `wrangler.toml` project names against the repository/service name, and use `opencode debug config` to validate any configuration changes.

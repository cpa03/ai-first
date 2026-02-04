# Palette's Journal

## 2025-05-14 - [Accessible Navigation & Smooth UX]
**Learning:** For Next.js applications, always use the `Link` component for internal navigation to ensure a smooth SPA experience. When implementing custom navigation elements (like logos or icons), consistent focus-visible rings are crucial for keyboard accessibility. On mobile, preventing body scroll when a menu is open is a key micro-UX touch that prevents disorientation.

**Action:** Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md` for interactive elements and implement body scroll lock for all modal-like overlays.

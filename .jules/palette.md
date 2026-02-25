## 2026-02-19 - [Keyboard Shortcuts Modal Enhancements & Cloudflare Compatibility]
**Learning:** Platform-specific UI elements (like shortcut keys) can cause hydration mismatches in Next.js if they rely on `navigator` during the initial render. Using a `useEffect` to set platform state after mounting is the standard fix. Additionally, in Next.js 16 environments deploying to Cloudflare Workers via OpenNext, the `src/proxy.ts` convention may be forced to the Node.js runtime, which is unsupported. Migrating back to `src/middleware.ts` with `export const runtime = 'experimental-edge'` resolves this while still allowing edge-based middleware logic.
**Action:** Always use `useEffect` for platform detection in client components. When facing Node.js runtime errors in Cloudflare builds with Next.js 16, consider reverting `proxy.ts` to `middleware.ts` and explicitly setting the experimental edge runtime.
## 2026-02-22 - [Tooltip Text Wrapping Improvement]
**Learning:** Tooltips with fixed maximum widths should use `whitespace-normal` instead of `whitespace-nowrap` to ensure long content wraps correctly. Using `whitespace-nowrap` with `max-w` leads to layout issues where text either overflows or is truncated without proper affordance.
**Action:** When implementing tooltips or small popovers with constrained widths, always prefer `whitespace-normal` to accommodate varying content lengths.

## 2026-02-24 - [System-wide Haptic Feedback for Success States]
**Learning:** Adding tactile feedback to success events (copying, completing tasks, reaching milestones) significantly enhances the mobile user experience by providing a physical confirmation of digital actions. Centralizing this logic in a utility ensures consistency and makes it easy to apply to new interaction points.
**Action:** Use the `triggerHapticFeedback` utility for key user success interactions to provide delightful tactile confirmation on supported devices.

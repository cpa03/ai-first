## 2026-05-13 - [Hardened Environment Variable Exposure Detection]
**Vulnerability:** Accidental exposure of arbitrary secrets via `NEXT_PUBLIC_` prefix.
**Learning:** Previous validation only checked a hardcoded list (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY`), leaving other sensitive variables (e.g., `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) unprotected if a developer incorrectly prefixed them with `NEXT_PUBLIC_`. This would cause Next.js to bundle them into client-side code.
**Prevention:** Implement a catch-all check (`checkNextPublicExposure`) that scans all environment variables starting with `NEXT_PUBLIC_` and flags those matching `isSensitiveVar` patterns, while maintaining a whitelist (`ALLOWED_PUBLIC_KEYS`) for legitimate public variables.

## 2026-03-05 - CSRF Broad Suffix Matching Vulnerability
**Vulnerability:** The CSRF protection logic in `src/lib/security/csrf.ts` allowed any origin ending in `.vercel.app` or `.pages.dev` to be considered "trusted".
**Learning:** Broad suffix matching on shared hosting platforms (like Vercel or Cloudflare Pages) allows any user on those platforms to bypass CSRF protections. This is a form of "Same-Platform Attack".
**Prevention:** Always use exact origin matching for trusted domains. Avoid `endsWith()` or similar suffix checks for domains you do not fully control the entire subdomain space of.

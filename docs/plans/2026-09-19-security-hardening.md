# Security Hardening Implementation Plan

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-executing-plans or superpowers-subagent-dev to implement this plan task-by-task.

**Goal:** Improve security score from 88 to >90 by implementing edge-level security middleware, CSP nonces, body scanning, and request signing verification.

**Architecture:** Enhance existing middleware.ts with CSP nonce generation, HSTS, COEP, and request signing verification. Update suspicious-patterns.ts to enable body scanning. Replace 'unsafe-inline' with nonce-based CSP in both middleware and next.config.js.

**Tech Stack:** Next.js middleware, CSP nonces, HMAC-SHA256 request signing, suspicious pattern detection

---

### Task 1: Update suspicious-patterns.ts to enable body scanning

**Files:**
- Modify: `src/lib/security/suspicious-patterns.ts:344-348`
- Test: `tests/security/suspicious-patterns.test.ts`

**Step 1: Write the failing test for body scanning**

```typescript
// tests/security/suspicious-patterns.test.ts
it('should detect suspicious patterns in request body when scanBody=true', async () => {
  const request = new Request('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ query: "SELECT * FROM users" }),
    headers: { 'content-type': 'application/json' }
  });
  
  const result = detectSuspiciousPatterns(request, {
    scanBody: true,
    minSeverity: 2,
    logDetected: false
  });
  
  expect(result.detected).toBe(true);
  expect(result.patterns.some(p => p.category === 'sql_injection')).toBe(true);
});
```

**Step 2: Run test to verify it fails**
Run: `npm test -- --testPathPattern="suspicious-patterns" -v`
Expected: FAIL - body scanning not implemented

**Step 3: Implement body scanning in suspicious-patterns.ts**
- Add body reading logic (clone request to avoid stream consumption issues)
- Parse body based on content-type (JSON, form-data, text)
- Scan body content for suspicious patterns

**Step 4: Run test to verify it passes**

**Step 5: Commit**

---

### Task 2: Update CSP config to support nonces

**Files:**
- Modify: `src/lib/config/csp-config.ts`
- Modify: `src/lib/config/security-config.ts` (add nonce config)

**Step 1: Write the failing test**

```typescript
// tests/csp-config.test.ts
it('should generate CSP with nonce placeholder for scripts and styles', () => {
  const nonce = 'test-nonce-123';
  const csp = generateCSPWithNonce(nonce);
  expect(csp).toContain(`'nonce-${nonce}'`);
  expect(csp).not.toContain("'unsafe-inline'");
});
```

**Step 2: Run test to verify it fails**

**Step 3: Implement nonce-based CSP generation**
- Add nonce support to CSP_CONFIG
- Create helper function to generate CSP with nonce
- Remove 'unsafe-inline' from style-src

**Step 4: Run test to verify it passes**

**Step 5: Commit**

---

### Task 3: Enhance middleware.ts with CSP nonces, HSTS, COEP, and request signing verification

**Files:**
- Modify: `src/middleware.ts`
- Test: `tests/middleware.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/middleware.test.ts
it('should add CSP header with nonce', () => {
  const response = new NextResponse();
  addSecurityHeaders(response, 'test-nonce');
  expect(response.headers.get('Content-Security-Policy')).toContain("'nonce-test-nonce'");
});

it('should add HSTS header in production', () => {
  const response = new NextResponse();
  addSecurityHeaders(response);
  expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
});

it('should add COEP header', () => {
  const response = new NextResponse();
  addSecurityHeaders(response);
  expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe('credentialless');
});

it('should verify request signing for internal API routes', async () => {
  const request = new NextRequest('http://localhost/api/internal/test', {
    headers: { 'X-Internal-Signature': 't=1234567890,sig=validsig' }
  });
  const result = await verifyInternalRequestInMiddleware(request);
  expect(result.verified).toBe(true);
});
```

**Step 2: Run tests to verify they fail**

**Step 3: Implement middleware enhancements**
- Add nonce generation per request
- Add CSP header with nonce
- Add HSTS header (production only)
- Add COEP header
- Add request signing verification for `/api/internal/*` routes
- Integrate with request-signer.ts

**Step 4: Run tests to verify they pass**

**Step 5: Commit**

---

### Task 4: Update next.config.js CSP to use nonce-based approach

**Files:**
- Modify: `next.config.js:80-116`
- Modify: `public/_headers:41,96`

**Step 1: Update next.config.js CSP**
- Replace 'unsafe-inline' with nonce-based approach
- Use 'strict-dynamic' for scripts
- Remove 'unsafe-inline' from style-src

**Step 2: Update public/_headers CSP**
- Align with nonce-based CSP

**Step 3: Test build**

**Step 4: Commit**

---

### Task 5: Update withApiHandler to enable scanBody=true

**Files:**
- Modify: `src/lib/api-handler/wrapper.ts:186-191`

**Step 1: Write the failing test**

```typescript
// tests/api-handler-wrapper.test.ts
it('should enable body scanning in suspicious pattern detection', () => {
  const options = { scanBody: true };
  const handler = withApiHandler(async () => new Response('ok'), options);
  // Verify scanBody is passed to detectSuspiciousPatterns
});
```

**Step 2: Run test to verify it fails**

**Step 3: Update wrapper.ts to pass scanBody: true**
- Change `scanBody: false` to `scanBody: true` in detectSuspiciousPatterns call

**Step 4: Run test to verify it passes**

**Step 5: Commit**

---

### Task 6: Run full test suite and verify security score

**Files:**
- Run: `npm test`
- Run: `npm run build`
- Run: Security audit scripts

**Step 1: Run all tests**

**Step 2: Verify no regressions**

**Step 3: Run security audit if available**

**Step 4: Commit**

---

### Task 7: Update documentation

**Files:**
- Modify: `docs/security-headers.md`
- Modify: `docs/security-engineer.md`

**Step 1: Document nonce-based CSP**

**Step 2: Document request signing in middleware**

**Step 3: Commit**
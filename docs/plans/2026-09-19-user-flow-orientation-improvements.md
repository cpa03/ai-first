# User Flow & Orientasi Improvements Implementation Plan

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-executing-plans or superpowers-subagent-dev to implement this plan task-by-task.

**Goal:** Increase User Flow & Orientasi score from 78 to >90 by implementing anonymous/guest mode for Clarify page, improving auth gate UX, adding progress indicators, enhancing empty states, and prefill from onboarding.

**Architecture:** Implement guest mode using localStorage for anonymous idea tracking, modify Clarify page auth gate to allow preview for anonymous users, add transition progress component, enhance Dashboard empty states with CTAs, and connect onboarding answers to IdeaInput prefill.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Supabase auth, localStorage for guest persistence.

---

### Task 1: Add Guest Mode Support to API Routes

**Files:**

- Modify: `src/app/api/ideas/route.ts` - Allow anonymous idea creation
- Modify: `src/app/api/ideas/[id]/route.ts` - Allow anonymous idea retrieval
- Create: `src/lib/auth/guest.ts` - Guest mode utilities

**Step 1: Write the failing test**

```typescript
// tests/integration-guest-mode.test.ts
import { POST, GET } from '@/app/api/ideas/route';
import { GET as getIdea } from '@/app/api/ideas/[id]/route';

describe('Guest Mode API', () => {
  it('should create idea without authentication', async () => {
    const request = new Request('http://localhost/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: 'Test guest idea' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.data.id).toBeDefined();
  });

  it('should retrieve idea without authentication for guest', async () => {
    // First create an idea
    const createRequest = new Request('http://localhost/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: 'Test guest idea for retrieval' }),
    });
    const createResponse = await POST(createRequest);
    const createData = await createResponse.json();
    const ideaId = createData.data.id;

    // Then retrieve it
    const request = new Request(`http://localhost/api/ideas/${ideaId}`, {
      method: 'GET',
    });
    const response = await getIdea(request, { params: Promise.resolve({ id: ideaId }) });
    expect(response.status).toBe(200);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/integration-guest-mode.test.ts`
Expected: FAIL with authentication errors

**Step 3: Write minimal implementation**

- Create `src/lib/auth/guest.ts` with guest user utilities
- Modify `src/app/api/ideas/route.ts` to support optional auth
- Modify `src/app/api/ideas/[id]/route.ts` to support optional auth

**Step 4: Run test to verify it passes**

Run: `npm test tests/integration-guest-mode.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/auth/guest.ts src/app/api/ideas/route.ts src/app/api/ideas/[id]/route.ts tests/integration-guest-mode.test.ts
git commit -m "feat: add guest mode support for anonymous idea creation and retrieval"
```

---

### Task 2: Implement Anonymous/Guest Mode in Clarify Page

**Files:**

- Modify: `src/app/clarify/page.tsx` - Allow anonymous access with guest mode
- Modify: `src/hooks/useAuthCheck.ts` - Add guest mode detection
- Create: `src/hooks/useGuestMode.ts` - Guest mode hook

**Step 1: Write the failing test**

```typescript
// tests/clarify-guest-mode.test.tsx
import { render, screen } from '@testing-library/react';
import ClarifyPage from '@/app/clarify/page';

describe('Clarify Page Guest Mode', () => {
  it('should show clarify flow without authentication when ideaId is in localStorage', () => {
    localStorage.setItem('guest_idea_id', 'test-guest-id');
    render(<ClarifyPage />);
    // Should not show auth required message
    expect(screen.queryByText('Sign In Required')).not.toBeInTheDocument();
    expect(screen.queryByText('Clarify Your Idea')).toBeInTheDocument();
  });

  it('should redirect to login with returnUrl when accessing clarify without guest idea', () => {
    localStorage.removeItem('guest_idea_id');
    render(<ClarifyPage />);
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/clarify-guest-mode.test.tsx`
Expected: FAIL - auth gate blocks access

**Step 3: Write minimal implementation**

- Create `src/hooks/useGuestMode.ts` for guest session management
- Modify `src/app/clarify/page.tsx` to check guest mode before auth gate
- Add returnUrl parameter to login redirect

**Step 4: Run test to verify it passes**

Run: `npm test tests/clarify-guest-mode.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useGuestMode.ts src/app/clarify/page.tsx src/hooks/useAuthCheck.ts tests/clarify-guest-mode.test.tsx
git commit -m "feat: implement anonymous/guest mode for Clarify page"
```

---

### Task 3: Add Progress Indicator for Idea Input → Clarify Transition

**Files:**

- Create: `src/components/TransitionProgress.tsx` - Progress indicator component
- Modify: `src/app/HomePageClient.tsx` - Add progress indicator on submit
- Modify: `src/components/IdeaInput.tsx` - Track submission state

**Step 1: Write the failing test**

```typescript
// tests/transition-progress.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import HomePageClient from '@/app/HomePageClient';
import TransitionProgress from '@/components/TransitionProgress';

describe('Transition Progress', () => {
  it('should show progress indicator during idea submission', async () => {
    render(<HomePageClient />);
    // Fill and submit idea
    // Should show TransitionProgress component
    await waitFor(() => {
      expect(screen.getByText('Processing your idea...')).toBeInTheDocument();
    });
  });

  it('should show step indicators: Saving → Clarifying → Ready', () => {
    render(<TransitionProgress currentStep={1} totalSteps={3} />);
    expect(screen.getByText('Saving')).toBeInTheDocument();
    expect(screen.getByText('Clarifying')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/transition-progress.test.tsx`
Expected: FAIL - component doesn't exist

**Step 3: Write minimal implementation**

- Create `src/components/TransitionProgress.tsx` with animated step indicators
- Add to HomePageClient during submission
- Show in Clarify page during initial load

**Step 4: Run test to verify it passes**

Run: `npm test tests/transition-progress.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/TransitionProgress.tsx src/app/HomePageClient.tsx src/components/IdeaInput.tsx tests/transition-progress.test.tsx
git commit -m "feat: add progress indicator for Idea Input to Clarify transition"
```

---

### Task 4: Improve Dashboard Empty States for New Users

**Files:**

- Modify: `src/app/dashboard/page.tsx` - Enhanced empty state with CTAs
- Create: `src/components/EmptyStateDashboard.tsx` - Reusable empty state

**Step 1: Write the failing test**

```typescript
// tests/dashboard-empty-state.test.tsx
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

describe('Dashboard Empty State', () => {
  it('should show onboarding CTA for first-time users with no ideas', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Start Your First Project')).toBeInTheDocument();
    expect(screen.getByText('Share your idea and get an AI-powered project plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first idea/i })).toBeInTheDocument();
  });

  it('should show filtered empty state with clear filter action', () => {
    // Render with filter
    render(<DashboardPage />);
    // Should show "No matching ideas" with clear filter button
    expect(screen.getByText('Clear filter')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/dashboard-empty-state.test.tsx`
Expected: FAIL - current empty state is basic

**Step 3: Write minimal implementation**

- Create `src/components/EmptyStateDashboard.tsx` with:
  - First-time user variant with illustrated flow
  - Filtered variant with clear filter action
  - Keyboard shortcut hints
- Update DashboardPage to use new component

**Step 4: Run test to verify it passes**

Run: `npm test tests/dashboard-empty-state.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/EmptyStateDashboard.tsx src/app/dashboard/page.tsx tests/dashboard-empty-state.test.tsx
git commit -m "feat: improve dashboard empty states with onboarding CTAs"
```

---

### Task 5: Add Smart Prefill from Onboarding Answers to Idea Input

**Files:**

- Modify: `src/components/UserOnboarding.tsx` - Store onboarding answers
- Modify: `src/components/IdeaInput.tsx` - Read and prefill from onboarding
- Create: `src/lib/onboarding-prefill.ts` - Prefill utilities

**Step 1: Write the failing test**

```typescript
// tests/onboarding-prefill.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import HomePageClient from '@/app/HomePageClient';
import IdeaInput from '@/components/IdeaInput';

describe('Onboarding Prefill', () => {
  it('should prefill idea input with onboarding answers', async () => {
    localStorage.setItem('onboarding_answers', JSON.stringify({
      projectType: 'SaaS',
      targetAudience: 'Developers',
      mainGoal: 'Build a developer tool',
    }));
    render(<HomePageClient />);
    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(expect.stringContaining('SaaS'));
      expect(textarea).toHaveValue(expect.stringContaining('Developers'));
    });
  });

  it('should not prefill if no onboarding data exists', () => {
    localStorage.removeItem('onboarding_answers');
    render(<IdeaInput onSubmit={jest.fn()} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/onboarding-prefill.test.tsx`
Expected: FAIL - no prefill logic

**Step 3: Write minimal implementation**

- Modify UserOnboarding to save answers to localStorage
- Create `src/lib/onboarding-prefill.ts` with formatting logic
- Modify IdeaInput to read and apply prefill on mount

**Step 4: Run test to verify it passes**

Run: `npm test tests/onboarding-prefill.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/onboarding-prefill.ts src/components/UserOnboarding.tsx src/components/IdeaInput.tsx tests/onboarding-prefill.test.tsx
git commit -m "feat: add smart prefill from onboarding answers to Idea Input"
```

---

### Task 6: Enhance Auth Gate with Return URL and Preview for Anonymous

**Files:**

- Modify: `src/app/clarify/page.tsx` - Add returnUrl to login redirect
- Modify: `src/app/results/page.tsx` - Allow preview for anonymous users
- Modify: `src/app/login/page.tsx` - Handle returnUrl parameter

**Step 1: Write the failing test**

```typescript
// tests/auth-gate-return-url.test.tsx
import { render, screen } from '@testing-library/react';
import ClarifyPage from '@/app/clarify/page';
import ResultsPage from '@/app/results/page';

describe('Auth Gate with Return URL', () => {
  it('should redirect to login with returnUrl when not authenticated and no guest mode', () => {
    render(<ClarifyPage />);
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', expect.stringContaining('returnUrl'));
  });

  it('should allow results preview for anonymous users', () => {
    render(<ResultsPage />);
    // Should show preview with CTA to sign up for full access
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Sign up to save')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/auth-gate-return-url.test.tsx`
Expected: FAIL - no returnUrl handling

**Step 3: Write minimal implementation**

- Add returnUrl to login redirect in ClarifyPage
- Modify ResultsPage to show preview for anonymous users
- Update Login page to handle returnUrl

**Step 4: Run test to verify it passes**

Run: `npm test tests/auth-gate-return-url.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/clarify/page.tsx src/app/results/page.tsx src/app/login/page.tsx tests/auth-gate-return-url.test.tsx
git commit -m "feat: enhance auth gate with return URL and anonymous preview"
```

---

### Task 7: Integration Testing and Verification

**Files:**

- Create: `tests/e2e-user-flow.test.tsx` - Full user flow test
- Modify: All test files above

**Step 1: Write the failing test**

```typescript
// tests/e2e-user-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import HomePageClient from '@/app/HomePageClient';

describe('Complete User Flow E2E', () => {
  it('should allow anonymous user to complete full flow: Home → Idea Input → Clarify → Results', async () => {
    render(<HomePageClient />);

    // Step 1: Enter idea
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Build a todo app' } });
    fireEvent.submit(screen.getByRole('form'));

    // Step 2: Should redirect to clarify with progress
    await waitFor(() => {
      expect(screen.getByText('Processing your idea...')).toBeInTheDocument();
    });

    // Step 3: Should show clarify flow without auth
    await waitFor(() => {
      expect(screen.getByText('Clarify Your Idea')).toBeInTheDocument();
    });

    // Step 4: Complete clarification
    // ... complete all steps

    // Step 5: Should show results (preview for anonymous)
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/e2e-user-flow.test.tsx`
Expected: FAIL - integration gaps

**Step 3: Write minimal implementation**

- Fix any integration issues found during E2E testing
- Ensure all components work together smoothly

**Step 4: Run test to verify it passes**

Run: `npm test tests/e2e-user-flow.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e-user-flow.test.tsx
git commit -m "test: add E2E user flow test for anonymous guest mode"
```

---

## Expected Outcomes

After completing all tasks:

1. **Anonymous/Guest Mode**: Users can try Clarify without signing up (localStorage-based)
2. **Auth Gate UX**: Login redirect preserves returnUrl, Results page shows preview for anonymous
3. **Progress Indicator**: Visual feedback during Home → Clarify transition
4. **Dashboard Empty States**: Compelling CTAs for new users with illustrated flow
5. **Smart Prefill**: Onboarding answers populate Idea Input automatically
6. **Score Target**: User Flow & Orientasi > 90

## Dependencies

- localStorage for guest session persistence
- Supabase auth for authenticated flows
- Existing component library (Button, Alert, etc.)
- Analytics for tracking guest vs authenticated conversions
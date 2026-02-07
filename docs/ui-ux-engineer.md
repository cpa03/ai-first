# UI-UX Engineer Documentation

## Project Overview

### Tech Stack

| Technology            | Version | Purpose                         |
| --------------------- | ------- | ------------------------------- |
| Next.js               | 16.1.6  | React framework with App Router |
| React                 | 18      | UI library                      |
| TypeScript            | 5       | Type safety                     |
| Tailwind CSS          | 3.4.1   | Utility-first CSS framework     |
| Jest                  | 29.7.0  | Testing framework               |
| React Testing Library | 16.0.0  | Component testing utilities     |

### Architecture Overview

**IdeaFlow** is an AI-powered project planning tool built with Next.js App Router architecture:

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (idea input)
│   ├── layout.tsx         # Root layout with navigation
│   ├── clarify/           # Clarification flow pages
│   ├── results/           # Blueprint results pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and services
└── styles/               # Global styles
```

**Key Architectural Decisions:**

- App Router for server-side rendering and API routes
- Component-based architecture with clear separation of concerns
- Dynamic imports for code splitting
- Error boundaries for graceful error handling
- Comprehensive accessibility (a11y) support

---

## Component Inventory

### Alert

**File:** `src/components/Alert.tsx`

Purpose: Display contextual feedback messages (error, warning, info, success).

**Props Interface:**

```typescript
interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Usage Example:**

```tsx
<Alert type="error" title="Validation Error">
  <p>Please check your input and try again.</p>
</Alert>

<Alert type="success">
  <p>Your idea has been saved successfully!</p>
</Alert>
```

**Known Issues:** None

---

### Button

**File:** `src/components/Button.tsx`

Purpose: Primary action component with multiple variants and loading states.

**Props Interface:**

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

**Usage Example:**

```tsx
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit
</Button>

<Button variant="secondary" loading={isLoading} disabled={!isValid}>
  Save Changes
</Button>

<Button variant="outline" fullWidth>
  Cancel
</Button>
```

**Features:**

- Focus-visible ring for keyboard navigation
- Loading spinner animation
- Scale transform on hover/active
- `aria-busy` attribute for loading state

**Known Issues:** None

---

### BlueprintDisplay

**File:** `src/components/BlueprintDisplay.tsx`

Purpose: Display generated project blueprint with download and copy functionality.

**Props Interface:**

```typescript
interface BlueprintDisplayProps {
  idea: string;
  answers: Record<string, string>;
}
```

**Usage Example:**

```tsx
<BlueprintDisplay
  idea="Build a habit tracking app"
  answers={{
    target_audience: 'Health-conscious individuals',
    timeline: '3 months',
    main_goal: 'Launch MVP',
  }}
/>
```

**Features:**

- Skeleton loading state during generation
- Markdown download functionality
- Clipboard copy with toast notification
- Responsive layout

**Known Issues:**

- "Start Over" and "Export to Tools" buttons are disabled (planned features)

---

### ClarificationFlow

**File:** `src/components/ClarificationFlow.tsx`

Purpose: Multi-step question wizard for clarifying user ideas.

**Props Interface:**

```typescript
interface ClarificationFlowProps {
  idea: string;
  ideaId?: string;
  onComplete: (answers: Record<string, string>) => void;
}
```

**Usage Example:**

```tsx
<ClarificationFlow
  idea="Build a mobile app"
  ideaId="idea-123"
  onComplete={(answers) => console.log(answers)}
/>
```

**Features:**

- Dynamic question fetching from API
- Fallback questions on API failure
- Progress stepper visualization
- Previous/Next navigation
- Answer persistence when navigating back
- Three input types: text, textarea, select

**Known Issues:** None

---

### ErrorBoundary

**File:** `src/components/ErrorBoundary.tsx`

Purpose: Catch and display React errors gracefully without crashing the app.

**Props Interface:**

```typescript
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

**Usage Example:**

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**

- Error logging with context
- Reset functionality
- Home navigation button
- Expandable error details for debugging

**Known Issues:** None

---

### FeatureGrid

**File:** `src/components/FeatureGrid.tsx`

Purpose: Display 3-step feature explanation grid on homepage.

**Props Interface:** None (static content)

**Usage Example:**

```tsx
<FeatureGrid />
```

**Features:**

- Responsive grid layout (3 columns on desktop, stack on mobile)
- Semantic article elements
- Accessible with aria-hidden icons

**Known Issues:** None

---

### IdeaInput

**File:** `src/components/IdeaInput.tsx`

Purpose: Main idea input form with validation.

**Props Interface:**

```typescript
interface IdeaInputProps {
  onSubmit: (idea: string, ideaId: string) => void;
}
```

**Usage Example:**

```tsx
<IdeaInput onSubmit={(idea, id) => router.push(`/clarify?ideaId=${id}`)} />
```

**Features:**

- Client-side validation (min 10, max 500 characters)
- API integration to save ideas
- Error handling with Alert component
- Loading state during submission

**Known Issues:** None

---

### InputWithValidation

**File:** `src/components/InputWithValidation.tsx`

Purpose: Form input with built-in validation, character counting, and accessibility.

**Props Interface:**

```typescript
interface InputWithValidationProps extends InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label: string;
  error?: string;
  helpText?: string;
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
}
```

**Usage Example:**

```tsx
<InputWithValidation
  id="idea-input"
  label="What's your idea?"
  value={idea}
  onChange={handleChange}
  multiline={true}
  maxLength={500}
  showCharCount={true}
  helpText="Be specific for better results"
/>
```

**Features:**

- Text and textarea variants
- Real-time character counting with warning threshold
- Error state styling
- `aria-invalid` and `aria-describedby` support
- Focus-visible ring styling

**Known Issues:** None

---

### LoadingAnnouncer

**File:** `src/components/LoadingAnnouncer.tsx`

Purpose: Screen reader announcements for loading states.

**Props Interface:**

```typescript
interface LoadingAnnouncerProps {
  message: string;
  ariaLive?: 'polite' | 'assertive';
}
```

**Usage Example:**

```tsx
<LoadingAnnouncer message="Generating your blueprint" />
```

**Features:**

- Visually hidden (sr-only class)
- Announces to screen readers
- Supports polite and assertive announcement modes

**Known Issues:** None

---

### LoadingOverlay

**File:** `src/components/LoadingOverlay.tsx`

Purpose: Full-screen or inline loading overlay with spinner and message.

**Props Interface:**

```typescript
interface LoadingOverlayProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}
```

**Usage Example:**

```tsx
<LoadingOverlay message="Saving your idea..." fullScreen />

<LoadingOverlay message="Loading..." size="md" />
```

**Features:**

- Full-screen backdrop blur option
- Size variants
- Integrated LoadingAnnouncer for accessibility

**Known Issues:** None

---

### LoadingSpinner

**File:** `src/components/LoadingSpinner.tsx`

Purpose: Animated loading spinner.

**Props Interface:**

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}
```

**Usage Example:**

```tsx
<LoadingSpinner size="lg" ariaLabel="Generating blueprint" />
```

**Features:**

- Three size variants
- Customizable aria-label
- CSS animation with reduced motion support

**Known Issues:** None

---

### MobileNav

**File:** `src/components/MobileNav.tsx`

Purpose: Responsive navigation with mobile hamburger menu.

**Props Interface:** None (configuration internal)

**Usage Example:**

```tsx
<MobileNav />
```

**Features:**

- Desktop: Horizontal navigation links
- Mobile: Hamburger menu with slide-out panel
- Keyboard navigation support (Tab, Shift+Tab, Escape)
- Focus trap when menu is open
- Click outside to close
- Body scroll lock when menu open
- Minimum touch target sizes (44px)

**Known Issues:** None

---

### ProgressStepper

**File:** `src/components/ProgressStepper.tsx`

Purpose: Visual progress indicator for multi-step processes.

**Props Interface:**

```typescript
interface Step {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}
```

**Usage Example:**

```tsx
<ProgressStepper
  steps={[
    { id: '1', label: 'Question 1', completed: true, current: false },
    { id: '2', label: 'Question 2', completed: false, current: true },
  ]}
  currentStep={1}
/>
```

**Features:**

- Mobile: Dots with step counter
- Desktop: Numbered steps with connecting lines
- Completed, current, and upcoming state styles
- ARIA labels for screen readers

**Known Issues:** None

---

### Skeleton

**File:** `src/components/Skeleton.tsx`

Purpose: Loading placeholder with pulse animation.

**Props Interface:**

```typescript
interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}
```

**Usage Example:**

```tsx
<Skeleton className="h-32 w-full" variant="rect" />
<Skeleton className="h-12 w-12" variant="circle" />
<Skeleton className="w-3/4" variant="text" />
```

**Features:**

- Three shape variants
- Pulse animation
- aria-hidden (decorative only)

**Known Issues:** None

---

### ToastContainer

**File:** `src/components/ToastContainer.tsx`

Purpose: Toast notification system with auto-dismiss.

**Props Interface:**

```typescript
export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // default: 5000ms
}
```

**Usage Example:**

```tsx
// In layout or app root
<ToastContainer />;

// Trigger anywhere via global function
window.showToast({
  type: 'success',
  message: 'Blueprint copied!',
  duration: 3000,
});
```

**Features:**

- Four toast types with distinct colors
- Auto-dismiss with configurable duration
- Manual close button
- Slide-in/out animations
- Stacked notifications
- ARIA live regions for announcements

**Known Issues:**

- Uses global window object (may need refactoring for SSR compatibility)

---

### WhyChooseSection

**File:** `src/components/WhyChooseSection.tsx`

Purpose: Marketing section highlighting product benefits.

**Props Interface:** None (static content)

**Usage Example:**

```tsx
<WhyChooseSection />
```

**Features:**

- 2x2 grid of benefit cards
- Checkmark icons
- Responsive layout

**Known Issues:** None

---

## Pages Inventory

### Home Page

**Route:** `/`
**File:** `src/app/page.tsx`

**Purpose:** Landing page with idea input form and marketing content.

**Key Features:**

- Hero section with value proposition
- IdeaInput form for collecting user ideas
- Dynamic FeatureGrid component (lazy loaded)
- Dynamic WhyChooseSection component (lazy loaded)
- Idea confirmation display after submission
- Automatic redirect to clarify page with query params

**Dependencies:**

- IdeaInput
- FeatureGrid (dynamic import)
- WhyChooseSection (dynamic import)
- next/navigation (router)

---

### Clarify Page

**Route:** `/clarify?idea={text}&ideaId={id}`
**File:** `src/app/clarify/page.tsx`

**Purpose:** Multi-step clarification wizard for refining user ideas.

**Key Features:**

- URL parameter parsing for idea and ideaId
- Dynamic ClarificationFlow component
- Loading state while fetching questions
- Error handling with Alert and retry
- Completion state showing collected answers
- Redirect to results page on completion

**Dependencies:**

- ClarificationFlow (dynamic import)
- Alert (dynamic import)
- Button (dynamic import)
- LoadingSpinner
- next/navigation

---

### Results Page

**Route:** `/results?ideaId={id}`
**File:** `src/app/results/page.tsx`

**Purpose:** Display generated blueprint and export options.

**Key Features:**

- Fetch idea and session data from API
- BlueprintDisplay component with real data
- Export options (Markdown, JSON)
- Loading states for data fetching and export
- Error handling with user-friendly messages

**Dependencies:**

- BlueprintDisplay (dynamic import)
- LoadingSpinner
- Button
- export-connectors (exportManager, exportUtils)

---

### Dashboard Page

**Route:** `/dashboard`
**File:** `src/app/dashboard/page.tsx`

**Purpose:** List and manage user's ideas.

**Key Features:**

- Ideas table with pagination
- Status filtering (dropdown)
- Status badges with color coding
- Continue/View/Delete actions per idea
- Empty state for new users
- Loading and error states

**Dependencies:**

- Button
- LoadingSpinner
- next/link

---

### API Routes (for reference)

| Route                     | Purpose                       |
| ------------------------- | ----------------------------- |
| `/api/ideas`              | CRUD operations for ideas     |
| `/api/ideas/[id]/session` | Session state management      |
| `/api/clarify`            | Generate clarifying questions |
| `/api/clarify/start`      | Start clarification session   |
| `/api/clarify/answer`     | Submit answer to question     |
| `/api/clarify/complete`   | Complete clarification        |
| `/api/breakdown`          | Generate task breakdown       |
| `/api/health`             | Health check endpoint         |

---

## Styling System

### Tailwind Configuration

**File:** `tailwind.config.js`

**Color Palette:**

```javascript
colors: {
  primary: {
    50: '#eff6ff',   // Lightest
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Base
    600: '#2563eb',  // Primary button
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',  // Darkest
  },
  gray: {
    50: '#f9fafb',   // Background
    100: '#f3f4f6',
    200: '#e5e7eb',  // Borders
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',  // Secondary text
    600: '#4b5563',
    700: '#374151',  // Labels
    800: '#1f2937',  // Primary text
    900: '#111827',  // Headings
  },
}
```

**Typography:**

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

Font weights: 300, 400, 500, 600, 700

### Custom CSS Classes

**File:** `src/styles/globals.css`

**Button Components:**

```css
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}
.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}
.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}
```

**Form Components:**

```css
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
}
.textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md resize-y;
}
```

**Animations:**

```css
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
.slide-up {
  animation: slideUp 0.4s ease-out;
}
.scale-in {
  animation: scaleIn 0.3s ease-out;
}
```

**Accessibility:**

```css
.sr-only {
  /* Screen reader only */
}
.not-sr-only {
  /* Override sr-only on focus */
}
.focus-visible-ring {
  /* Custom focus ring */
}
```

### Spacing System

Uses Tailwind's default spacing scale:

- `px-4` = 1rem (16px) - standard horizontal padding
- `py-3` = 0.75rem (12px) - standard vertical padding
- `p-6` = 1.5rem (24px) - card padding
- `p-8` = 2rem (32px) - section padding
- `gap-4` = 1rem (16px) - grid gaps
- `space-y-4` = 1rem (16px) - vertical stack spacing

### Responsive Breakpoints

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

**Common Patterns:**

```tsx
// Container padding
className = 'px-4 sm:px-6 lg:px-8';

// Grid columns
className = 'grid md:grid-cols-3 gap-8';

// Text sizing
className = 'text-xl sm:text-2xl font-semibold';

// Button full-width on mobile
className = 'w-full sm:w-auto';
```

---

## Accessibility Guidelines

### Current a11y Implementation

1. **Semantic HTML:**
   - Proper heading hierarchy (h1 → h2 → h3)
   - `<main>`, `<section>`, `<article>`, `<header>`, `<footer>` usage
   - `<nav>` for navigation
   - `<button>` for clickable actions

2. **ARIA Attributes:**
   - `aria-label` on icon-only buttons and links
   - `aria-labelledby` linking headings to sections
   - `aria-describedby` for form field descriptions
   - `aria-live` for dynamic content updates
   - `aria-invalid` for form validation errors
   - `aria-busy` for loading states
   - `role="alert"` for error messages
   - `role="status"` for loading spinners

3. **Keyboard Navigation:**
   - Focus-visible rings on all interactive elements
   - Tab order follows visual order
   - Escape key closes modals/menus
   - Tab trapping in mobile menu

4. **Screen Reader Support:**
   - `sr-only` class for visually hidden labels
   - Loading announcements via LoadingAnnouncer
   - Progress indicators with descriptive labels
   - Skip-to-content link in layout

5. **Reduced Motion:**
   - `prefers-reduced-motion` media query support
   - Animations disabled when user prefers reduced motion

### Areas Needing Improvement

1. **Focus Management:**
   - Add focus management for dynamic content changes
   - Ensure focus returns to trigger element after modal close

2. **Color Contrast:**
   - Verify all text meets WCAG AA standards (4.5:1 for normal text)
   - Some placeholder text may need darker color

3. **Form Labels:**
   - Some dynamically rendered content may need additional labeling

4. **Error Messages:**
   - Ensure all error messages are announced to screen readers
   - Associate error messages with form fields using aria-describedby

### WCAG Compliance Status

| Criterion                    | Status    | Notes                                    |
| ---------------------------- | --------- | ---------------------------------------- |
| 1.1.1 Non-text Content       | ✅ Pass   | All images have alt text or aria-hidden  |
| 1.3.1 Info and Relationships | ✅ Pass   | Semantic HTML used throughout            |
| 1.4.3 Contrast (Minimum)     | ⚠️ Review | Check placeholder text contrast          |
| 2.1.1 Keyboard               | ✅ Pass   | All functionality available via keyboard |
| 2.4.3 Focus Order            | ✅ Pass   | Logical tab order                        |
| 2.4.6 Headings and Labels    | ✅ Pass   | Descriptive headings and labels          |
| 2.4.7 Focus Visible          | ✅ Pass   | Focus rings on all interactive elements  |
| 3.3.1 Error Identification   | ✅ Pass   | Errors identified and described          |
| 4.1.2 Name, Role, Value      | ✅ Pass   | ARIA attributes used appropriately       |

---

## Common UI Patterns

### Form Handling

**Validation Pattern:**

```typescript
const validateIdea = (idea: string): string | null => {
  if (idea.trim().length < MIN_IDEA_LENGTH) {
    return `Idea must be at least ${MIN_IDEA_LENGTH} characters.`;
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    return `Idea must be at most ${MAX_IDEA_LENGTH} characters.`;
  }
  return null;
};
```

**Form Submission Pattern:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validationError = validateIdea(idea);
  if (validationError) {
    setValidationError(validationError);
    return;
  }

  setIsSubmitting(true);
  setError(null);

  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const result = await response.json();
    onSuccess(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Loading States

**Button Loading State:**

```tsx
<Button loading={isLoading} disabled={!isValid}>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

**Page Loading State:**

```tsx
if (loading) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <LoadingOverlay message="Loading..." />
    </div>
  );
}
```

**Skeleton Loading:**

```tsx
<div className="space-y-4">
  <Skeleton className="h-8 w-3/4" variant="text" />
  <Skeleton className="h-4 w-full" variant="text" />
  <Skeleton className="h-4 w-5/6" variant="text" />
</div>
```

### Error Handling

**Error Alert Pattern:**

```tsx
{
  error && (
    <div className="slide-up">
      <Alert type="error">
        <p>{error}</p>
      </Alert>
    </div>
  );
}
```

**Error Boundary Usage:**

```tsx
// In layout.tsx
<ErrorBoundary>{children}</ErrorBoundary>
```

### Navigation Patterns

**Next.js Navigation:**

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate with query params
router.push(`/clarify?idea=${encodeURIComponent(idea)}&ideaId=${id}`);

// Go back
router.back();
```

**Link Component:**

```tsx
import Link from 'next/link';

<Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
  View Dashboard
</Link>;
```

### Dynamic Imports for Code Splitting

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton className="h-32" />,
  ssr: false, // Disable server-side rendering if needed
});
```

---

## Testing UI Components

### Testing Approach

Uses **Jest** with **React Testing Library** for component testing.

**Configuration:** `jest.config.js`

**Key Testing Principles:**

1. Test behavior, not implementation
2. Use semantic queries (getByRole, getByLabelText)
3. Avoid testing implementation details
4. Test accessibility attributes

### Common Test Patterns

**Basic Component Render:**

```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

**User Interaction Testing:**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

it('handles user input', async () => {
  const mockOnSubmit = jest.fn();
  render(<MyComponent onSubmit={mockOnSubmit} />);

  const input = screen.getByLabelText(/label text/i);
  fireEvent.change(input, { target: { value: 'test value' } });

  const button = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith('test value');
  });
});
```

**Async Testing:**

```typescript
it('shows loading state', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'result' }),
  });

  render(<MyComponent />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });
});
```

**Error State Testing:**

```typescript
it('displays error message on failure', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/api error/i);
  });
});
```

**Accessibility Testing:**

```typescript
it('has accessible labels', () => {
  render(<MyComponent />);

  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- IdeaInput.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="loading"
```

### Test File Locations

- Component tests: `tests/{ComponentName}.test.tsx`
- API tests: `tests/api/{route}.test.ts`
- Utility tests: `tests/{utility}.test.ts`

---

## Known Issues & TODOs

### Current Bugs

1. **BlueprintDisplay Disabled Buttons**
   - "Start Over" and "Export to Tools" buttons are disabled
   - **Workaround:** Use browser back button or direct navigation
   - **Status:** Planned features not yet implemented

2. **ToastContainer Global Window Usage**
   - Uses `window.showToast` which may cause SSR issues
   - **Impact:** None currently (client-side only)
   - **Status:** Low priority - consider React Context refactor

3. **Results Page Hardcoded Styles**
   - Some error states use hardcoded Tailwind classes instead of Alert component
   - **File:** `src/app/results/page.tsx:169-178`
   - **Status:** Should be refactored for consistency

### Technical Debt

1. **Type Definitions Duplication**
   - Some interfaces defined in both components and types files
   - **Action:** Consolidate in `src/types/` directory

2. **Magic Numbers**
   - Character limits and timeouts scattered throughout code
   - **Action:** Centralize in `src/lib/config/constants.ts`

3. **API Error Handling**
   - Inconsistent error handling patterns across components
   - **Action:** Create reusable error handling hook

### Planned Improvements

1. **Component Library Documentation**
   - Add Storybook for component documentation
   - **Priority:** Medium

2. **Dark Mode Support**
   - Implement dark mode toggle
   - **Priority:** Low

3. **Animations**
   - Add page transition animations
   - Enhance loading state animations
   - **Priority:** Low

4. **Mobile Experience**
   - Improve mobile navigation UX
   - Add swipe gestures for clarification flow
   - **Priority:** Medium

5. **Testing Coverage**
   - Increase component test coverage to 80%
   - Add visual regression tests
   - **Priority:** High

---

## Quick Reference

### Color Variables

```
Primary: primary-600 (#2563eb)
Success: green-600
Error: red-600
Warning: yellow-600
Info: blue-600
Text Primary: gray-900
Text Secondary: gray-600
Border: gray-200
Background: gray-50
```

### Common Tailwind Patterns

```
// Container
max-w-4xl mx-auto px-4 sm:px-6 lg:px-8

// Card
bg-white rounded-lg shadow-lg p-6 sm:p-8

// Button
bg-primary-600 text-white hover:bg-primary-700
focus:outline-none focus:ring-2 focus:ring-primary-500

// Input
w-full px-4 py-3 border border-gray-300 rounded-md
focus:outline-none focus:ring-2 focus:ring-primary-500

// Typography
font-sans text-gray-900
font-mono text-sm
```

### File Naming Conventions

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `{ComponentName}.test.tsx`
- Styles: `kebab-case.css`

---

## Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **React Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Project Blueprint:** `/home/runner/work/ai-first/ai-first/blueprint.md`
- # **Architecture Docs:** `/home/runner/work/ai-first/ai-first/docs/architecture.md`

# UI-UX Engineer

This document outlines the role, responsibilities, and guidelines for the UI-UX Engineer agent working on the IdeaFlow codebase.

## Role Overview

The UI-UX Engineer is responsible for ensuring the application provides an accessible, responsive, and user-friendly interface. This includes fixing bugs, improving usability, maintaining design consistency, and implementing best practices for modern web applications.

## Areas of Responsibility

### 1. Accessibility (a11y)

- **ARIA Labels & Roles**: Ensure all interactive elements have proper ARIA attributes
- **Keyboard Navigation**: Verify all features are accessible via keyboard
- **Focus Management**: Implement proper focus indicators and focus trapping in modals
- **Screen Reader Support**: Test with screen readers and provide live region announcements
- **Color Contrast**: Maintain WCAG AA compliance (4.5:1 for normal text)
- **Reduced Motion**: Respect `prefers-reduced-motion` media query

### 2. Responsive Design

- **Mobile-First Approach**: Design for mobile, enhance for larger screens
- **Breakpoint Consistency**: Use standard breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Touch Targets**: Minimum 44x44px for interactive elements
- **Viewport Units**: Use relative units (rem, em, %) over fixed pixels where appropriate

### 3. Loading States & Feedback

- **Loading Skeletons**: Use Skeleton component for content placeholders
- **Progress Indicators**: Show progress for long-running operations
- **Optimistic UI**: Provide immediate visual feedback before API confirmation
- **Error States**: Clear error messaging with recovery actions

### 4. Form UX

- **Validation Feedback**: Real-time validation with clear error messages
- **Input Constraints**: Character counters, max length indicators
- **Submission States**: Loading states during form submission
- **Auto-save**: Preserve user progress for multi-step forms

### 5. Design Consistency

- **Color Palette**: Use Tailwind config colors (primary, secondary, etc.)
- **Typography**: Consistent heading hierarchy and text sizes
- **Spacing**: Use standardized spacing scale from Tailwind
- **Component Patterns**: Reuse Button, Alert, Input components

## Common Issues & Solutions

### Accessibility Issues

#### Missing ARIA States

```typescript
// Bad - Toggle button without state indication
<button aria-label="Toggle task">
  <CheckIcon />
</button>

// Good - With aria-pressed
<button
  aria-label="Toggle task completion"
  aria-pressed={isCompleted}
>
  <CheckIcon />
</button>
```

#### Keyboard Navigation

```typescript
// Ensure Escape key closes modals
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

### UX Patterns

#### Error Handling

```typescript
// Bad - Using native alert
alert('Failed to delete item');

// Good - Using Alert component
const [error, setError] = useState<string | null>(null);
{error && <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />}
```

#### Loading States

```typescript
// Bad - No loading state
<button onClick={handleSubmit}>Submit</button>

// Good - With loading state
<Button onClick={handleSubmit} loading={isSubmitting}>
  Submit
</Button>
```

#### Disabled States

```typescript
// Bad - Disabled without explanation
<Button disabled>Export</Button>

// Good - With tooltip or helper text
<div className="group relative">
  <Button disabled>Export</Button>
  <span className="hidden group-hover:block absolute bottom-full mb-2">
    Export will be available after generation completes
  </span>
</div>
```

### Responsive Design

#### Container Queries

```typescript
// Use responsive prefixes consistently
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

#### Text Sizing

```typescript
// Responsive typography
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
```

## Component Guidelines

### Button Component

**Location**: `/src/components/Button.tsx`

**Usage**:

```typescript
<Button variant="primary" size="md" loading={isLoading}>
  Submit
</Button>
```

**Props**:

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `fullWidth`: boolean

### Alert Component

**Location**: `/src/components/Alert.tsx`

**Usage**:

```typescript
<Alert
  variant="error"
  title="Error"
  message="Something went wrong"
  onClose={() => setError(null)}
/>
```

### InputWithValidation Component

**Location**: `/src/components/InputWithValidation.tsx`

**Usage**:

```typescript
<InputWithValidation
  value={value}
  onChange={setValue}
  validate={(v) => v.length >= 10}
  errorMessage="Must be at least 10 characters"
  showCharacterCount
  maxLength={500}
/>
```

### Skeleton Component

**Location**: `/src/components/Skeleton.tsx`

**Usage**:

```typescript
<Skeleton variant="text" className="h-4 w-3/4" />
<Skeleton variant="rect" className="h-32 w-full" />
<Skeleton variant="circle" className="h-12 w-12" />
```

## Testing Checklist

Before submitting changes, verify:

- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] ARIA labels are present and descriptive
- [ ] Screen reader announces dynamic content changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Responsive layout works at all breakpoints
- [ ] Loading states are implemented
- [ ] Error states have clear messaging
- [ ] Reduced motion preference is respected
- [ ] Touch targets are adequate size on mobile

## Files to Review Regularly

### Component Files

- `/src/components/Button.tsx` - Reusable button component
- `/src/components/Alert.tsx` - Alert/notification component
- `/src/components/InputWithValidation.tsx` - Form input with validation
- `/src/components/Skeleton.tsx` - Loading skeletons
- `/src/components/ErrorBoundary.tsx` - Error handling
- `/src/components/LoadingAnnouncer.tsx` - Screen reader announcements

### Page Files

- `/src/app/page.tsx` - Landing page
- `/src/app/dashboard/page.tsx` - Dashboard
- `/src/app/clarify/page.tsx` - Clarification flow
- `/src/app/results/page.tsx` - Results page

### Style Files

- `/src/styles/globals.css` - Global styles
- `/tailwind.config.js` - Tailwind configuration

## Integration with Other Agents

- **Backend Engineer**: Coordinate on API loading states and error handling
- **Integration Engineer**: Ensure third-party components meet a11y standards
- **QA Engineer**: Collaborate on testing accessibility and responsive design
- **Technical Writer**: Document UI patterns and component usage

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

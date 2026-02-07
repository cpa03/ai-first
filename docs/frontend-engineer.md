# Frontend Engineer Documentation

## Overview

This document provides guidelines and standards for frontend development in the AI-First project. It covers bug fixes, best practices, and architectural decisions.

## Bug Fixes Applied

### 1. Memory Leak Fixes

#### ToastContainer.tsx

- **Issue**: Nested `setTimeout` calls were not being cleaned up when the component unmounted
- **Solution**: Added proper cleanup for both the main timer and the nested leave animation timeout
- **Impact**: Prevents memory leaks when toasts are removed or the component unmounts

#### ClarificationFlow.tsx

- **Issue**: `setTimeout` used for input focus was not being cleaned up
- **Solution**: Added cleanup function to clear the timeout when the component unmounts or dependencies change
- **Impact**: Prevents memory leaks and potential state updates on unmounted components

#### BlueprintDisplay.tsx

- **Issue**: `setTimeout` for simulating blueprint generation was not being cleaned up
- **Solution**: Added proper cleanup for the timeout in the useEffect return function
- **Impact**: Prevents memory leaks when the component unmounts during the loading state

### 2. Next.js Best Practices

#### ClarifyPage (`app/clarify/page.tsx`)

- **Issue**: Direct usage of `window.location.search` causes hydration mismatches in Next.js
- **Solution**:
  - Refactored to use `useSearchParams` hook from `next/navigation`
  - Wrapped component with `Suspense` boundary for proper SSR handling
  - Separated content into `ClarifyPageContent` component
- **Impact**: Eliminates hydration mismatches and improves SSR compatibility

#### ResultsPage (`app/results/page.tsx`)

- **Issue**: Direct usage of `window.location.search` causes hydration mismatches
- **Solution**:
  - Refactored to use `useSearchParams` hook
  - Added `Suspense` boundary for async component handling
  - Created `ResultsPageContent` component
- **Impact**: Consistent SSR behavior and no hydration errors

#### ErrorBoundary (`components/ErrorBoundary.tsx`)

- **Issue**: Using `window.location.href` bypasses Next.js client-side routing
- **Solution**: Replaced with Next.js `Link` component for proper client-side navigation
- **Impact**: Better performance through client-side routing and proper prefetching

## Architecture Patterns

### Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button.tsx       # Button with variants and loading states
│   ├── Alert.tsx        # Alert/notification component
│   ├── InputWithValidation.tsx  # Form input with validation
│   └── ...
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Home page
│   ├── clarify/         # Clarification flow page
│   ├── results/         # Results/blueprint page
│   └── dashboard/       # Dashboard page
├── lib/                 # Utility functions and hooks
└── styles/             # Global styles and Tailwind config
```

### Key Principles

1. **Memory Management**: Always clean up timers, intervals, and subscriptions in useEffect cleanup functions
2. **SSR Compatibility**: Use Next.js hooks (`useSearchParams`, `useRouter`) instead of browser globals (`window.location`)
3. **Suspense Boundaries**: Wrap client components that use browser APIs with Suspense
4. **Accessibility**: All interactive elements have proper ARIA labels and keyboard navigation
5. **Error Boundaries**: Use ErrorBoundary component to catch and handle React errors gracefully

## Component Guidelines

### Button Component

- Supports multiple variants: primary, secondary, outline, ghost
- Built-in loading state with spinner
- Full accessibility support with aria-busy
- Focus visible states for keyboard navigation

### Form Components

- InputWithValidation provides built-in validation
- Character count with threshold warnings
- Error messaging with aria-live for screen readers
- Proper label association with htmlFor

### Loading States

- LoadingSpinner with size variants
- Skeleton component for content placeholders
- LoadingAnnouncer for screen reader announcements
- Proper aria-labels on all loading elements

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- --testPathPattern="ClarificationFlow|IdeaInput|BlueprintDisplay"

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Component rendering
- User interactions (clicking, typing)
- API mocking with fetch
- Error state handling
- Loading state verification

## Build and Lint

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Run linting (ESLint)
npx eslint src/ --ext .js,.jsx,.ts,.tsx
```

## Common Issues and Solutions

### Hydration Mismatch

- **Cause**: Using `window` or `document` in render phase
- **Solution**: Use Next.js hooks or move to useEffect

### Memory Leaks

- **Cause**: Uncleaned timers or subscriptions
- **Solution**: Always return cleanup function from useEffect

### Focus Management

- **Cause**: Dynamic content without focus management
- **Solution**: Use refs and setTimeout with cleanup for focus shifts

## Dependencies

### Production

- Next.js 16.x
- React 18.x
- Tailwind CSS 3.x
- TypeScript 5.x

### Development

- Jest for testing
- React Testing Library
- ESLint with Next.js config
- TypeScript

## Performance Considerations

1. **Dynamic Imports**: Use `next/dynamic` for code splitting
2. **Memoization**: Use `React.memo` for expensive components
3. **Lazy Loading**: Load heavy components only when needed
4. **Image Optimization**: Use Next.js Image component for optimized images

## Accessibility Standards

1. All interactive elements have focus states
2. Proper heading hierarchy (h1 → h2 → h3)
3. ARIA labels for icon buttons
4. Screen reader announcements for dynamic content
5. Keyboard navigation support
6. Reduced motion support via media queries

## Future Improvements

1. Add React Query for server state management
2. Implement virtual scrolling for long lists
3. Add progressive web app (PWA) support
4. Implement real-time collaboration features
5. Add more comprehensive E2E tests with Playwright

---

Last Updated: 2025-02-07
Maintained by: Frontend Engineering Team

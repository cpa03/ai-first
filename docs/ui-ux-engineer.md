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

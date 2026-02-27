---
name: frontend-ui-ux
description: Designer-turned-developer who crafts stunning UI/UX even without design mockups. Use when (1) building React components, pages, or full-stack features, (2) creating or modifying Next.js UI, (3) implementing responsive layouts, (4) adding animations and micro-interactions, (5) working with Tailwind CSS, or (6) improving visual design quality. Generates creative, polished code that avoids generic AI aesthetics.
---

# Frontend UI/UX Skill

Expert guidance for building beautiful, accessible, and functional user interfaces.

## When to Use This Skill

This skill triggers when working on:

- React components and pages
- Next.js App Router development
- Tailwind CSS styling
- Responsive design
- UI animations and transitions
- Form components and validation
- Dashboard and data visualization

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Components**: React 18+

## Design Principles

### Visual Quality

- Avoid generic AI aesthetics (defaults, basic gradients)
- Use distinctive color palettes and typography
- Add subtle shadows, borders, and spacing for depth
- Implement smooth transitions and micro-interactions

### Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

### Responsiveness

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly targets (min 44px)

## Component Patterns

### Button

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Action Label
</Button>
```

### Card

```tsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Form Input

```tsx
<Input label="Email" type="email" error={errors.email} {...register('email')} />
```

## Tailwind Patterns

### Centered Content

```tsx
<div className="flex min-h-screen items-center justify-center">
  {/* content */}
</div>
```

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* items */}
</div>
```

### Card with Shadow

```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

## Animation Patterns

### Fade In

```tsx
<div className="animate-fade-in">{/* content */}</div>
```

### Slide Up

```tsx
<div className="animate-slide-up">{/* content */}</div>
```

## Common Tasks

### Add Loading State

```tsx
{
  isLoading ? <Skeleton /> : <Content />;
}
```

### Toast Notification

```tsx
<ToastContainer>
  <Toast variant="success" message="Saved!" />
</ToastContainer>
```

## File Locations

- Components: `src/components/`
- Hooks: `src/hooks/`
- Styles: `src/styles/`
- Types: `src/types/`

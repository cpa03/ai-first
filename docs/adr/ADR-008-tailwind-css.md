# ADR-008: Use Tailwind CSS for Styling

## Status

Accepted

## Context

We needed a styling solution for the Next.js frontend. Evaluated options:

- **CSS Modules**: No runtime overhead, but verbose class names
- **Styled Components**: Popular but adds runtime overhead
- **Sass/SCSS**: Powerful but requires compilation pipeline
- **Tailwind CSS**: Utility-first, no runtime, highly customizable

## Decision

Use Tailwind CSS as the primary styling solution.

### Why Tailwind?

1. **No runtime overhead**: Styles compiled to static CSS at build time
2. **Utility-first**: Compose styles with existing classes
3. **Design system**: Built-in constraints enforce consistency
4. **Responsive**: Easy mobile-first responsive design
5. **Dark mode**: Native support for theme switching
6. **Small bundles**: Unused styles are tree-shaken

### Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "^3.4.1",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Usage Example

```tsx
// Using Tailwind utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Click me
</button>;

// Conditional classes with tailwind-merge
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Component with merged classes
<Component className={cn('base styles here', isActive && 'active state')} />;
```

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
```

## Consequences

### Positive

- **Consistent design**: Enforced through design tokens
- **Small bundle**: Only used styles included
- **Fast development**: No context switching to CSS files
- **Easy responsive**: Built-in breakpoints
- **Great DX**: VS Code autocomplete for classes

### Negative

- **Learning curve**: New syntax to learn
- **HTML pollution**: Long class strings in JSX
- **Naming collisions**: Must use @apply carefully
- **Design system dependency**: Hard to deviate from defaults

## Alternatives Considered

- **CSS Modules + Sass**: Good but more setup
- **Styled Components**: Runtime overhead
- **Plain CSS**: No constraints, inconsistent

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Styling Guide](./frontend-engineer.md)

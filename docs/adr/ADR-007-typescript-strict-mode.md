# ADR-007: TypeScript Strict Mode for Type Safety

## Status

Accepted

## Context

TypeScript provides varying levels of type safety through compiler options. Without strict mode:

- `null` and `undefined` can slip through
- Implicit `any` types can hide bugs
- Type assertions bypass the type system
- Less confidence in refactoring

We wanted maximum type safety to catch bugs at compile time rather than runtime.

## Decision

Enable TypeScript strict mode for the entire codebase.

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Key Strict Options

| Option                         | Purpose                                                 |
| ------------------------------ | ------------------------------------------------------- |
| `strict: true`                 | Enables all strict type-checking options                |
| `noImplicitAny`                | Error on expressions/parameters with implied `any` type |
| `strictNullChecks`             | Null and undefined must be explicitly handled           |
| `strictPropertyInitialization` | Class properties must be initialized in constructor     |
| `noUnusedLocals`               | Error on unused local variables                         |
| `noUnusedParameters`           | Error on unused function parameters                     |
| `noImplicitReturns`            | Error when not all code paths return a value            |
| `noFallthroughCasesInSwitch`   | Error on switch case fallthrough                        |

### Code Example

```typescript
// Without strict mode - potentially dangerous
function getUserName(user: User | null) {
  return user.name; // user could be null!
}

// With strict mode - explicit handling required
function getUserName(user: User | null): string {
  if (user === null) {
    throw new Error('User is required');
  }
  return user.name; // TypeScript knows user is not null here
}
```

## Consequences

### Positive

- **Bug prevention**: Catches null/undefined errors at compile time
- **Confidence**: Refactoring is safer
- **Self-documenting**: Code clearly expresses intent
- **Better IDE support**: More accurate autocomplete and errors

### Negative

- **Initial friction**: Steeper learning curve
- **More explicit code**: Cannot use implicit `any`
- **Migration cost**: Existing code needs fixes
- **Sometimes verbose**: Explicit null checks add lines

## Alternatives Considered

- **Loose TypeScript**: Faster initial development but more runtime bugs
- **Partial strictness**: Selected options only - inconsistent

## References

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [tsconfig.json](./tsconfig.json)
- [Contributing Guidelines](./CONTRIBUTING.md)

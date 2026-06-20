# Static Assets Directory

This directory contains static assets served directly by Next.js.

## Usage

Files in the `public/` directory are served at the root path:

- `public/assets/custom.js` → `/assets/custom.js`
- `public/assets/styles.css` → `/assets/styles.css`

## Best Practices

1. **Optimize**: Compress images and assets before adding
2. **Organize**: Use subdirectories for different asset types as needed
3. **Cache**: Leverage Next.js caching for static assets

## Related

- [Next.js Static Files Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
- Issue #872: Static assets directory structure

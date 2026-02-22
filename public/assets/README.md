# Static Assets Directory

This directory contains static assets served directly by Next.js.

## Directory Structure

```
public/assets/
├── fonts/    # Custom font files (.woff2, .woff, .ttf)
├── icons/    # Icon files (favicon variants, app icons, social sharing icons)
└── images/   # Image files (logos, backgrounds, illustrations)
```

## Usage

Files in the `public/` directory are served at the root path:

- `public/assets/images/logo.png` → `/assets/images/logo.png`
- `public/assets/fonts/custom.woff2` → `/assets/fonts/custom.woff2`
- `public/assets/icons/icon-192.png` → `/assets/icons/icon-192.png`

## Best Practices

1. **Images**: Optimize images before adding (use WebP format when possible)
2. **Fonts**: Use `.woff2` format for best compression
3. **Icons**: Include multiple sizes for different use cases (favicon, app icons, social)

## Related

- [Next.js Static Files Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
- Issue #872: Static assets directory structure

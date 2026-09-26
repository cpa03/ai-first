#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Create CSS directory for OpenNext (required for static assets)
mkdir -p .open-next/assets/_next/static/css

# First run Next.js build with webpack (disable Turbopack - not compatible with OpenNext yet)
npm run build:cloudflare:webpack

# Then run OpenNext Cloudflare build
npx @opennextjs/cloudflare build

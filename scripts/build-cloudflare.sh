#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches safely
npx patch-package --ignore-missing 2>/dev/null || true

# Ensure CSS and static directories exist for OpenNext asset tracing
mkdir -p .next/static/css
mkdir -p .next/static/chunks
mkdir -p .next/static/media
mkdir -p .next/standalone/.next/static/css 2>/dev/null || true
mkdir -p .next/standalone/.next/static/chunks 2>/dev/null || true
mkdir -p .next/standalone/.next/static/media 2>/dev/null || true

# Run the Cloudflare build using local opennextjs-cloudflare binary from node_modules
if [ -f "./node_modules/.bin/opennextjs-cloudflare" ]; then
  ./node_modules/.bin/opennextjs-cloudflare build
else
  npx opennextjs-cloudflare build
fi

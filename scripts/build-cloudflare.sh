#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Ensure .next static css directories exist prior to OpenNext asset copying
mkdir -p .next/static/css
mkdir -p .next/standalone/.next/static/css 2>/dev/null || true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

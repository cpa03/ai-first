#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Ensure static CSS directory exists to prevent ENOENT errors during OpenNext asset tracing
mkdir -p .next/static/css 2>/dev/null || true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

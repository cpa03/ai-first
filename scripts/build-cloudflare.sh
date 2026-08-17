#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Run the Cloudflare build
if command -v pnpm &> /dev/null; then
  pnpm opennextjs-cloudflare build
else
  npx @opennextjs/cloudflare build
fi

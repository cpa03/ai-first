#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Ensure .next/static/css directory exists before building with OpenNext
mkdir -p .next/static/css

# Run the Cloudflare build
npx @opennextjs/cloudflare build

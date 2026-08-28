#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
pnpm exec patch-package 2>/dev/null || true

# Run the Cloudflare build
pnpm exec opennextjs-cloudflare build

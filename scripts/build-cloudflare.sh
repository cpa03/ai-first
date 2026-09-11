#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Create CSS directories required by OpenNext copyTracedFiles asset tracing
mkdir -p .next/static/css
mkdir -p .next/standalone/.next/static/css

# Run the Cloudflare build
npx @opennextjs/cloudflare build

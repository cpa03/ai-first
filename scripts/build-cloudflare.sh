#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Set environment flags so build phase environment validation succeeds in CI/Cloudflare Workers build containers
export OPENNEXT_CLOUDFLARE=true
export CF_WORKER=true

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

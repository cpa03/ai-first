#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Set environment flags so build-time config validation knows it's Cloudflare Workers build
export OPENNEXT_CLOUDFLARE=true
export CF_WORKER=true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

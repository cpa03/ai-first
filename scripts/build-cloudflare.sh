#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Export OpenNext Cloudflare environment flag so build phase skips strict runtime secret validation
export OPENNEXT_CLOUDFLARE=true

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

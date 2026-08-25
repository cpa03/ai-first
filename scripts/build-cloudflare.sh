#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Set environment flag so env validation bypasses missing production secrets during build phase
export OPENNEXT_CLOUDFLARE=true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

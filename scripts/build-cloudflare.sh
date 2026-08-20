#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Ensure environment validation bypass flags are present during Cloudflare builds
export OPENNEXT_CLOUDFLARE=true
export CF_PAGES=true

# Apply patch-package patches
npx patch-package 2>/dev/null || true

# Run the Cloudflare build
npx @opennextjs/cloudflare build

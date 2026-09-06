#!/bin/bash
# Cloudflare build wrapper that ensures OpenNext CSS directory fix is applied
set -e

# Apply patch-package patches using local binary if available
if [ -f "./node_modules/.bin/patch-package" ]; then
  ./node_modules/.bin/patch-package || true
else
  npx patch-package 2>/dev/null || true
fi

# Run the Cloudflare build using local binary if available
if [ -f "./node_modules/.bin/opennextjs-cloudflare" ]; then
  ./node_modules/.bin/opennextjs-cloudflare build
else
  npx @opennextjs/cloudflare build
fi

#!/bin/bash

# setup_opencode.sh - Install and configure OpenCode CLI on Ubuntu runners
# This script is designed for GitHub Actions runners

set -e

echo "::group::Installing OpenCode CLI"

# Install OpenCode CLI
echo "Installing OpenCode CLI..."
curl -fsSL https://opencode.ai/install | bash

# Add to PATH
echo "$HOME/.opencode/bin" >> $GITHUB_PATH

echo "OpenCode CLI installed successfully"

# Verify installation
echo "::group::Verifying OpenCode installation"
opencode --version

echo "::endgroup::"
echo "::endgroup::"

echo "::notice title=OpenCode Setup::OpenCode CLI installed and ready"

# Export for immediate use
export PATH="$HOME/.opencode/bin:$PATH"

#!/bin/bash

# Exit on first error
set -e

# Check for yarn.lock to determine package manager to use
if [ -f yarn.lock ]; then
  echo "Using Yarn for dependency management"
  yarn install
else
  echo "Using npm for dependency management"
  npm install
fi

# Apply patch using next-ws-cli
echo "Applying next-ws patch"
echo "y" | npx next-ws-cli@latest patch

# Build the project
if [ -f yarn.lock ]; then
  echo "Building with Yarn"
  yarn build
else
  echo "Building with npm"
  npm run build
fi

echo "Build completed successfully"

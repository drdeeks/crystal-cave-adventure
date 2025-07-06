#!/bin/bash

echo "🧹 Cleaning up Crystal Cave project..."

# Remove build artifacts (regeneratable)
echo "Removing build artifacts..."
rm -rf out/
rm -rf cache/
rm -rf broadcast/
rm -rf node_modules/.cache/

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Remove any .DS_Store files (macOS)
find . -name ".DS_Store" -type f -delete 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "To rebuild:"
echo "  npm install"
echo "  npm run build" 
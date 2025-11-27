#!/bin/bash

# Safari Extension Packaging Helper
# This script prepares the extension for conversion to a Safari Web Extension.

set -e  # Exit on error

echo "🦁 Preparing Safari Extension..."

# 1. Build the project
echo "📦 Building project..."
npm run build

# 2. Create a directory for the Safari build
echo "📂 Creating safari-build directory..."
rm -rf safari-build
mkdir -p safari-build

# 3. Copy dist contents
echo "📋 Copying build files..."
cp -r dist/* safari-build/

# 4. Copy icons from public folder
echo "🎨 Copying icons..."
cp -r public/icons safari-build/

# 5. Copy manifest
echo "📄 Copying manifest..."
cp public/manifest.json safari-build/

# 6. Verify the build
echo ""
echo "📋 Safari build contents:"
ls -la safari-build/
echo ""
echo "📋 Assets:"
ls -la safari-build/assets/
echo ""

# 7. Instructions
echo "✅ Build ready in 'safari-build' directory."
echo ""
echo "To create/update the Safari App, run the following command:"
echo ""
echo "  xcrun safari-web-extension-converter safari-build --project-location safari-app --app-name 'OPFS Explorer' --bundle-identifier 'io.bayat.hasan.extensions.opfs-explorer' --force"
echo ""
echo "Note: You need Xcode installed to run the above command."
echo "The --force flag will overwrite the existing project while preserving any customizations."
echo ""
echo "After running the command, open the generated Xcode project and:"
echo "  1. Select the macOS or iOS scheme"
echo "  2. Build and run to test in Safari"
echo "  3. Archive and export for App Store distribution"

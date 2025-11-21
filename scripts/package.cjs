const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

// Paths relative to project root
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const RELEASE_DIR = path.resolve(ROOT_DIR, 'releases');

// Ensure release directory exists
if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR);
}

// 1. Build
console.log('🏗️  Building project...');
try {
    execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
} catch (e) {
    console.error("❌ Build failed");
    process.exit(1);
}

// 2. Create Zip
const version = require(path.join(ROOT_DIR, 'package.json')).version;
const zipName = `opfs-explorer-v${version}.zip`;
const zipPath = path.join(RELEASE_DIR, zipName);

console.log(`📦 Creating Zip: ${zipName}...`);

try {
    const zip = new AdmZip();
    // Add the CONTENTS of dist folder to the root of the zip
    zip.addLocalFolder(DIST_DIR);
    zip.writeZip(zipPath);
    
    console.log(`\n✅ Success! Package created at:\n   ${zipPath}`);
} catch (e) {
    console.error("❌ Zip failed:", e.message);
    process.exit(1);
}


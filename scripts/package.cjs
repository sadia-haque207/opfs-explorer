const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

// Paths relative to project root
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const RELEASE_DIR = path.resolve(ROOT_DIR, 'releases');

// Files to exclude from packages
const EXCLUDE_FILES = ['.DS_Store'];

// Ensure release directory exists
if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR);
}

// Helper function to add folder to zip while excluding certain files
function addFolderToZip(zip, folderPath, zipPath = '') {
  const files = fs.readdirSync(folderPath);
  files.forEach(file => {
    if (EXCLUDE_FILES.includes(file)) return;
    const filePath = path.join(folderPath, file);
    const fileZipPath = zipPath ? `${zipPath}/${file}` : file;
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      addFolderToZip(zip, filePath, fileZipPath);
    } else {
      zip.addLocalFile(filePath, zipPath || undefined);
    }
  });
}

// 1. Build
console.log('🏗️  Building project...');
try {
    execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
} catch (e) {
    console.error("❌ Build failed");
    process.exit(1);
}

const version = require(path.join(ROOT_DIR, 'package.json')).version;

// 2. Create Chromium Zip
const chromiumZipName = `opfs-explorer-v${version}-chromium.zip`;
const chromiumZipPath = path.join(RELEASE_DIR, chromiumZipName);

console.log(`📦 Creating Chromium Zip: ${chromiumZipName}...`);

try {
    const zip = new AdmZip();
    addFolderToZip(zip, DIST_DIR);
    zip.writeZip(chromiumZipPath);
    console.log(`   ✅ Created: ${chromiumZipPath}`);
} catch (e) {
    console.error("❌ Chromium Zip failed:", e.message);
}

// 3. Create Firefox Zip (Currently same as Chromium, but ready for specific manifest tweaks if needed)
const firefoxZipName = `opfs-explorer-v${version}-firefox.zip`;
const firefoxZipPath = path.join(RELEASE_DIR, firefoxZipName);

console.log(`📦 Creating Firefox Zip: ${firefoxZipName}...`);

try {
    const zip = new AdmZip();
    addFolderToZip(zip, DIST_DIR);
    // If we needed to modify manifest for Firefox, we would do it here before zipping
    // e.g. zip.addFile("manifest.json", Buffer.from(firefoxManifestContent));
    zip.writeZip(firefoxZipPath);
    console.log(`   ✅ Created: ${firefoxZipPath}`);
} catch (e) {
    console.error("❌ Firefox Zip failed:", e.message);
}

// 4. Create Source Code Zip (Required for Mozilla Review)
const sourceZipName = `opfs-explorer-v${version}-source.zip`;
const sourceZipPath = path.join(RELEASE_DIR, sourceZipName);

console.log(`📦 Creating Source Code Zip: ${sourceZipName}...`);

try {
    const zip = new AdmZip();
    // Add all files from root, excluding ignored ones
    const files = fs.readdirSync(ROOT_DIR);
    const ignoreList = ['.git', 'node_modules', 'dist', 'releases', '.DS_Store', '.env'];
    
    files.forEach(file => {
        if (ignoreList.includes(file)) return;
        const filePath = path.join(ROOT_DIR, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            zip.addLocalFolder(filePath, file);
        } else {
            zip.addLocalFile(filePath);
        }
    });
    
    zip.writeZip(sourceZipPath);
    console.log(`   ✅ Created: ${sourceZipPath}`);
} catch (e) {
    console.error("❌ Source Zip failed:", e.message);
}

console.log(`\n🎉 All packages created in ${RELEASE_DIR}`);


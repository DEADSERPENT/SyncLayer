const fs = require('fs');
const path = require('path');

// Simple build script to copy UI file to dist
const srcPath = path.join(__dirname, 'src', 'ui.html');
const distPath = path.join(__dirname, 'dist', 'ui.html');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy file
fs.copyFileSync(srcPath, distPath);
console.log('UI built successfully!');

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('Watching for UI changes...');
  fs.watch(srcPath, (eventType) => {
    if (eventType === 'change') {
      fs.copyFileSync(srcPath, distPath);
      console.log('UI rebuilt!');
    }
  });
}

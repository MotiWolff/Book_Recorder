const fs = require('fs');
const path = require('path');

console.log('=== CHECKING STATIC FILES ===');
console.log('Current directory:', __dirname);

const publicDir = path.join(__dirname, 'public');
const cssDir = path.join(publicDir, 'css');
const jsDir = path.join(publicDir, 'js');

// Check if directories exist
console.log('\nDirectory Check:');
console.log('public exists:', fs.existsSync(publicDir));
console.log('public/css exists:', fs.existsSync(cssDir));
console.log('public/js exists:', fs.existsSync(jsDir));

// List contents
if (fs.existsSync(publicDir)) {
    console.log('\nPublic directory contents:');
    console.log(fs.readdirSync(publicDir));
}

if (fs.existsSync(cssDir)) {
    console.log('\nCSS directory contents:');
    console.log(fs.readdirSync(cssDir));
}

if (fs.existsSync(jsDir)) {
    console.log('\nJS directory contents:');
    console.log(fs.readdirSync(jsDir));
}

// Check specific files
const cssFile = path.join(cssDir, 'styles.css');
const jsFile = path.join(jsDir, 'script.js');

console.log('\nFile Check:');
console.log('styles.css exists:', fs.existsSync(cssFile));
console.log('script.js exists:', fs.existsSync(jsFile));

if (fs.existsSync(cssFile)) {
    const cssStats = fs.statSync(cssFile);
    console.log('styles.css size:', cssStats.size, 'bytes');
}

if (fs.existsSync(jsFile)) {
    const jsStats = fs.statSync(jsFile);
    console.log('script.js size:', jsStats.size, 'bytes');
}
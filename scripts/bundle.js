// scripts/bundle.js
// Combine Milkdown Crepe outputs into two standalone files for Bubble.

const fs   = require('fs');
const path = require('path');

// ---------- Paths ----------
const jsInput  = path.join(__dirname, '..', 'packages/crepe/lib/esm/index.js');

// Common theme root
const commonDir = path.join(__dirname, '..', 'packages/crepe/lib/theme/common');
const themeCss  = path.join(__dirname, '..', 'packages/crepe/lib/theme/crepe/style.css');
const commonIndex = path.join(commonDir, 'style.css');

// Output
const outDir   = path.join(__dirname, '..', 'final-dist');
const outJS    = path.join(outDir, 'bundle.js');
const outCSS   = path.join(outDir, 'bundle.css');

// ---------- Helpers ----------
function read(file) {
  return fs.readFileSync(file, 'utf8');
}
function write(file, data) {
  fs.writeFileSync(file, data, 'utf8');
}
function concat(cssArr) {
  return cssArr.join('\n\n/* ---- next ---- */\n\n');
}

// ---------- Build JS ----------
fs.copyFileSync(jsInput, outJS);

// ---------- Build CSS ----------
const components = [];
const importRE = /@import\s+['"]\.\/(.+?\.css)['"];?/g;
const commonCss = read(commonIndex);

let match;
while ((match = importRE.exec(commonCss))) {
  components.push(path.join(commonDir, match[1]));
}

const cssParts = [
  // component css files in the order they appear in common/style.css
  ...components.map(read),
  // theme overrides last
  read(themeCss),
];

write(outCSS, concat(cssParts)); 
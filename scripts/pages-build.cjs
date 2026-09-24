// Publish only this app's assets, excluding unrelated legacy portfolio files.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'docs');
fs.mkdirSync(target, { recursive: true });
for (const name of ['index.html', 'asset-manifest.json', 'manifest.json', 'robots.txt', 'favicon.ico', 'skazka.jpg', 'static']) {
  fs.cpSync(path.join(root, 'build', name), path.join(target, name), { recursive: true });
}
fs.writeFileSync(path.join(target, '.nojekyll'), '');
console.log('GitHub Pages files generated in docs/.');

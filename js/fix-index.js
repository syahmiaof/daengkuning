const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('Testimoni Pendekar', 'Testimoni Masyarakat');
html = html.replace(/<img[^>]*src="assets\/img\/index\.html\/[^>]*>\s*/g, '');
fs.writeFileSync('index.html', html);

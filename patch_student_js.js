const fs = require('fs');

let text = fs.readFileSync('js/student.js', 'utf8');

text = text.replace(
    /document\.getElementById\('card-id'\)\.innerText = ahli\.id_ahli/g,
    `document.getElementById('card-tahun').innerText = ahli.tahun_aktif || '2026';\n        document.getElementById('card-id').innerText = ahli.id_ahli`
);

fs.writeFileSync('js/student.js', text);
console.log('card-tahun JS logic injected');

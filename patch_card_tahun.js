const fs = require('fs');

let html = fs.readFileSync('student-profile.html', 'utf8');

html = html.replace(
    '<h2 class="premium-label text-gold drop-shadow-sm tracking-[0.25em]">AHLI AKTIF <span class="ml-1 tracking-[0.25em]">2026</span></h2>',
    '<h2 class="premium-label text-gold drop-shadow-sm tracking-[0.25em]">AHLI AKTIF <span class="ml-1 tracking-[0.25em]" id="card-tahun">Memuat...</span></h2>'
);

fs.writeFileSync('student-profile.html', html);
console.log('card-tahun added');

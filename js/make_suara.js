const fs = require('fs');

let template = fs.readFileSync('student-silibus.html', 'utf8');

const tOldActive = 'class="flex items-center px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all"';
const tOldBase = 'class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group"';

template = template.replace(
    `<li><a href="student-silibus.html" ${tOldActive}><i class="fas fa-book-open w-6"></i><span class="font-medium">Silibus & Bengkung</span></a></li>`,
    `<li><a href="student-silibus.html" ${tOldBase}><i class="fas fa-book-open w-6 group-hover:text-gold transition-colors"></i><span class="font-medium">Silibus & Bengkung</span></a></li>`
);

template = template.replace(
    `<li><a href="student-suara.html" ${tOldBase}><i class="fas fa-bullhorn w-6 group-hover:text-gold transition-colors"></i><span class="font-medium">Suara Pesilat</span></a></li>`,
    `<li><a href="student-suara.html" class="flex items-center px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all"><i class="fas fa-bullhorn w-6"></i><span class="font-medium">Suara Pesilat</span></a></li>`
);

const i1 = template.indexOf('<div class="flex-1 p-6 lg:p-10 pb-24 max-w-7xl mx-auto w-full">');
const i2 = template.indexOf('</main>');

if (i1 > -1 && i2 > -1) {
    const curContent = template.substring(i1, i2);

    const newC = `
        <div class="flex-1 p-6 lg:p-10 pb-24 max-w-4xl mx-auto w-full">
            <!-- Suara Pesilat (Feed) -->
            <div class="glass-panel rounded-2xl p-6 lg:p-8 border-gold/30 overflow-hidden shadow-2xl">
                <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h4 class="text-2xl font-bold text-white font-serif mb-1"><i class="fas fa-bullhorn text-gold mr-2"></i>Suara Pesilat</h4>
                        <p class="text-sm text-gray-400">Ruang komuniti untuk bertukar fikiran & berkongsi maklumat dalam suasana tertutup.</p>
                    </div>
                </div>
                
                <div class="mb-6 flex gap-3">
                    <div class="w-10 h-10 rounded-full bg-black/40 border border-gold/30 flex items-center justify-center shadow-inner"><i class="fas fa-pen-nib text-gold"></i></div>
                    <div class="flex-1 relative group">
                        <textarea id="suaraInput" rows="3" class="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none shadow-inner" placeholder="Pencak langkah bermula di gelanggang, bicara bertebaran di halaman. Laungkan suaramu..."></textarea>
                        <button onclick="suaraPost()" id="suaraPostBtn" class="absolute bottom-3 right-3 px-5 py-2 bg-gradient-to-r from-gold to-gold-dark text-charcoal font-bold rounded-lg text-xs hover:scale-105 transition-transform shadow-[0_0_10px_rgba(212,175,55,0.4)]"><i class="fas fa-paper-plane mr-1"></i> Laungkan</button>
                    </div>
                </div>
                
                <div id="suaraFeedContainer" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar border-t border-white/5 pt-4">
                    <!-- Dimuatkan menerusi JS -->
                    <div class="text-center py-8 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Mendengar gema dari gelanggang...</div>
                </div>
            </div>
        </div>
`;

    template = template.replace(curContent, newC + '\n        ');
}

template = template.replace('<title>Silibus & Bengkung | Akademi Persilatan Daeng Kuning</title>', '<title>Suara Pesilat | Komuniti Daeng Kuning</title>');
template = template.replace(`Silibus <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Pesilat</span>`, `Suara <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Pesilat</span>`);
template = template.replace('Kurikulum dan modul latihan rasmi.', 'Halaman tertutup untuk ikatan komuniti Daeng Kuning.');

template = template.replace('<script src="js/student.js?v=6"></script>', '<script src="js/student.js?v=6"></script>\n    <script src="js/student-social.js"></script>');

fs.writeFileSync('student-suara.html', template);
console.log('student-suara.html created!');

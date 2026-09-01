const fs = require('fs');
let html = fs.readFileSync('student-suara.html', 'utf8');

const contentStart = html.indexOf('<div class="flex-1 p-6 lg:p-10 space-y-12 pb-24 max-w-7xl mx-auto w-full">');
const contentEnd = html.indexOf('</main>');

if(contentStart !== -1 && contentEnd !== -1) {
    const oldBlock = html.substring(contentStart, contentEnd);
    
    const newBlock = `
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

    html = html.replace(oldBlock, newBlock);
}

// Ensure scripts are correct
if(!html.includes('student-social.js')) {
    html = html.replace('<script src="js/chatbot.js"></script>', '<script src="js/student-social.js"></script>\n    <script src="js/chatbot.js"></script>');
}

// Optional fix for title
html = html.replace('Sukatan Pangkalan <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Silibus</span>', 'Hebahan Komuniti <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Daeng Kuning</span>');

fs.writeFileSync('student-suara.html', html);
console.log('Fixed DOM successfully in student-suara.html');

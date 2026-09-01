const fs = require('fs');
let html = fs.readFileSync('dashboard-student.html', 'utf8');

const t1 = `                <!-- Sifu Contact Block -->`;
const patchUI = `
                <!-- Suara Pesilat (Feed) -->
                <div class="md:col-span-12 glass-panel rounded-2xl p-6 lg:p-8 border-gold/30 overflow-hidden">
                    <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <div>
                            <h4 class="text-2xl font-bold text-white font-serif mb-1"><i class="fas fa-bullhorn text-gold mr-2"></i>Suara Pesilat</h4>
                            <p class="text-sm text-gray-400">Ruang komuniti untuk bertukar fikiran & berkongsi maklumat.</p>
                        </div>
                    </div>
                    
                    <div class="mb-6 flex gap-3">
                        <div class="w-10 h-10 rounded-full bg-black/40 border border-gold/30 flex items-center justify-center"><i class="fas fa-user text-gold"></i></div>
                        <div class="flex-1 relative">
                            <textarea id="suaraInput" rows="2" class="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none" placeholder="Sampaikan berita kepada komuniti Daeng Kuning..."></textarea>
                            <button onclick="suaraPost()" id="suaraPostBtn" class="absolute bottom-2 right-2 px-4 py-1.5 bg-gold text-charcoal font-bold rounded-lg text-xs hover:bg-gold-dark transition-colors"><i class="fas fa-paper-plane mr-1"></i> Siar</button>
                        </div>
                    </div>
                    
                    <div id="suaraFeedContainer" class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border-l-2 border-gold/20 pl-4 py-2">
                        <!-- Dimuatkan menerusi JS -->
                        <div class="text-center py-8 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Memuatkan Suara Pesilat...</div>
                    </div>
                </div>

                <!-- Sifu Contact Block -->`;

if(html.includes(t1.trim())) {
    html = html.replace(t1, patchUI);
    fs.writeFileSync('dashboard-student.html', html);
    console.log('dashboard-student patched');
} else {
    console.log('Target not found in HTML');
}

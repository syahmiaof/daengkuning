const fs = require('fs');
let html = fs.readFileSync('admin-notis.html', 'utf8');

const t2 = `            <!-- Table Area / List Area -->`;
const p2 = `
            <!-- Controls Bar Suara -->
            <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col justify-between gap-4 border-gold/30 mt-12">
                <div class="flex justify-between items-center w-full">
                    <h3 class="text-xl font-bold font-serif text-white"><i class="fas fa-users text-gold mr-2"></i>Suara Pesilat (Moderasi Komuniti)</h3>
                </div>
                <p class="text-sm text-gray-400">Bahagian ini menapis hantaran rawak ahli. Anda sebagai Admin mempunyai hak Mutlak untuk memadam, atau mengepin hantaran ini.</p>
            </div>
            
            <div class="glass-panel rounded-2xl border-gold/30 shadow-2xl p-6" id="suaraAdmin-container">
                <div id="suara-list" class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <div class="text-center text-gray-500 py-8">Memuatkan hantaran...</div>
                </div>
            </div>

            <!-- Table Area / List Area -->`;

if(html.includes(t2)) {
    html = html.replace(t2, p2);
    fs.writeFileSync('admin-notis.html', html);
    console.log('patched admin notis html');
} else {
    console.log('target t2 not found');
}

const t3 = `        document.addEventListener('DOMContentLoaded', () => {`;
const p3 = `
        async function loadAdminSuara() {
            try {
                const list = document.getElementById('suara-list');
                const { data, error } = await supabaseClient
                    .from('suara_post')
                    .select('*, ahli(nama, bengkung)')
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                
                if (!data || data.length === 0) {
                    list.innerHTML = \`<div class="py-8 text-center text-gray-500">Tiada hantaran suara pesilat dikesan.</div>\`;
                    return;
                }
                
                let html = '';
                data.forEach(x => {
                    let pinBtnClass = x.is_pinned ? 'text-gold' : 'text-gray-500 hover:text-white';
                    html += \`
                        <div class="flex items-start bg-black/40 p-4 rounded-lg border border-white/5 hover:border-gold/30 transition-colors">
                            <div class="flex-1">
                                <div class="flex justify-between mb-1">
                                    <h5 class="text-white font-bold">\${x.ahli?.nama || x.id_ahli} <span class="text-[10px] text-gold/80 px-1 ml-2 border border-gold/30 rounded">\${x.ahli?.bengkung || ''}</span></h5>
                                    <div class="flex items-center gap-3">
                                        <button onclick="togglePin('\${x.id}', \${x.is_pinned})" class="text-xs \${pinBtnClass}" title="Pin/Unpin"><i class="fas fa-thumbtack"></i></button>
                                        <button onclick="deleteSuaraAdmin('\${x.id}')" class="text-xs text-red-500 hover:text-red-400" title="Padam Pos Ini"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <p class="text-sm text-gray-300">\${x.kandungan_teks}</p>
                                <div class="mt-2 flex gap-3 text-[10px] text-gray-500 font-bold">
                                    <span><i class="fas fa-heart text-red-500 mr-1"></i>\${x.jumlah_like || 0} Likes</span>
                                    <span><i class="fas fa-comment text-blue-400 mr-1"></i>\${x.jumlah_komen || 0} Komen</span>
                                </div>
                            </div>
                        </div>
                    \`;
                });
                list.innerHTML = html;
            } catch(err) {
                console.error(err);
            }
        }
        
        window.togglePin = async function(id, curState) {
            try {
                await supabaseClient.from('suara_post').update({ is_pinned: !curState }).eq('id', id);
                loadAdminSuara();
            } catch(e) {}
        }
        
        window.deleteSuaraAdmin = async function(id) {
            if(!confirm('Padam hantaran komuniti ini?')) return;
            try {
                await supabaseClient.from('suara_post').delete().eq('id', id);
                loadAdminSuara();
            } catch(e) {}
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadAdminSuara();`;

if(html.includes(t3)) {
    html = html.replace(t3, p3);
    fs.writeFileSync('admin-notis.html', html);
    console.log('patched admin notis js');
} else {
    console.log('target t3 not found');
}

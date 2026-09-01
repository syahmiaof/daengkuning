// Suara Pesilat Logic
let curAhliId = '';
let suaraFeed = [];

document.addEventListener('DOMContentLoaded', () => {
    if(window.location.pathname.includes('student-suara.html') || window.location.pathname.includes('admin-suara.html') || window.location.pathname.includes('suara')) {
        const sessionStr = localStorage.getItem('userSession');
        if(sessionStr) {
            curAhliId = JSON.parse(sessionStr).username;
            fetchSuaraFeed();
            setInterval(fetchSuaraFeed, 30000); // Polling every 30s
            
            // Re-render after 3 seconds for initial avatar sync
            setTimeout(fetchSuaraFeed, 3000);
        }
    }
});

async function fetchSuaraFeed() {
    if(!window.supabaseClient) return;
    try {
        const { data: posts, error } = await supabaseClient
            .from('suara_post')
            .select('*, ahli!suara_post_id_ahli_fkey(nama, avatar_url, bengkung), suara_likes(id_ahli), suara_comments(id, id_ahli, teks_komen, created_at, ahli(nama, avatar_url, bengkung))')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });
            
        if(error) throw error;
        suaraFeed = posts || [];
        renderSuaraFeed();
        
    } catch(err) {
        console.error("Suara Feed Error:", err);
    }
}

function timeAgoLogic(dStr) {
    const d = new Date(dStr);
    const now = new Date();
    const diffInMins = Math.floor((now - d) / 60000);
    if(diffInMins < 1) return 'Baru sahaja';
    if(diffInMins < 60) return diffInMins + ' minit lepas';
    if(diffInMins < 1440) return Math.floor(diffInMins/60) + ' jam lepas';
    return Math.floor(diffInMins/1440) + ' hari lepas';
}

function renderSuaraFeed() {
    const c = document.getElementById('suaraFeedContainer');
    if(!c) return;
    
    if(suaraFeed.length === 0) {
        c.innerHTML = '<div class="text-center py-8 text-gray-500 font-medium">Jadilah orang pertama yang melaungkan suara!</div>';
        return;
    }
    
    c.innerHTML = '';
    
    suaraFeed.forEach(p => {
        // Liked by me?
        const myLike = p.suara_likes.find(lk => lk.id_ahli === curAhliId);
        const likeIconClass = myLike ? 'text-red-500 fas' : 'text-gray-400 far hover:text-red-400';
        const likeCnt = p.suara_likes.length;
        const bengkungRaw = p.ahli?.bengkung || 'Tiada';
        
        let pinBadge = '';
        if(p.is_pinned) pinBadge = '<span class="absolute -top-3 -right-2 bg-gold text-black text-[9px] px-2 py-0.5 rounded-full font-bold shadow-md shadow-gold/20 flex items-center"><i class="fas fa-thumbtack mr-1"></i>PIN</span>';
        
        let delBtn = '';
        if(p.id_ahli === curAhliId) {
            delBtn = `<button onclick="deleteSuara(${p.id})" class="text-xs text-red-500/50 hover:text-red-500 transition-colors ml-auto flex items-center justify-center p-1" title="Padam Pos"><i class="fas fa-trash"></i></button>`;
        }
        
        // Comment Render
        let comHtml = `<div class="mt-4 pt-4 border-t border-white/5 space-y-3 hidden" id="comBox_${p.id}">`;
        if(p.suara_comments && p.suara_comments.length > 0) {
            // sort old to new
            p.suara_comments.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).forEach(cm => {
                let cmDel = '';
                if(cm.id_ahli === curAhliId) cmDel = `<button onclick="deleteComment(${cm.id})" class="text-[9px] text-red-500/50 hover:text-red-500 mt-1"><i class="fas fa-times"></i></button>`;
                
                comHtml += `
                    <div class="flex gap-2">
                        <img src="${cm.ahli?.avatar_url || 'https://ui-avatars.com/api/?name=A&background=111&color=D4AF37'}" class="w-6 h-6 rounded-full object-cover">
                        <div class="bg-white/5 rounded-lg rounded-tl-none p-2 flex-1">
                            <div class="flex justify-between items-start">
                                <span class="text-[10px] text-gold font-bold">${cm.ahli?.nama || cm.id_ahli}</span>
                                ${cmDel}
                            </div>
                            <p class="text-[11px] text-gray-300">${cm.teks_komen}</p>
                        </div>
                    </div>
                `;
            });
        }
        
        // Post Comment block
        comHtml += `
               <div class="flex gap-2 mt-2">
                   <input type="text" id="comInput_${p.id}" class="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-[11px] focus:border-gold transition-colors text-white" placeholder="Balas luahan...">
                   <button onclick="postComment(${p.id})" class="text-gold hover:text-gold-dark text-sm px-2"><i class="fas fa-paper-plane"></i></button>
               </div>
            </div>`;

        const html = `
            <div class="relative bg-black/20 border border-white/5 rounded-xl p-4 transition-colors hover:border-gold/20">
                ${pinBadge}
                <div class="flex items-start gap-3">
                    <img src="${p.ahli?.avatar_url || 'https://ui-avatars.com/api/?name=P&background=111&color=D4AF37'}" class="w-10 h-10 rounded-full border border-gold/40 shadow-md">
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <h5 class="text-sm font-bold text-white tracking-wide">${p.ahli?.nama || p.id_ahli}</h5>
                            ${delBtn}
                        </div>
                        <div class="flex items-center text-[10px] text-gray-400 mt-0.5 gap-2">
                            <span class="text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded font-bold">${bengkungRaw}</span>
                            <span>• ${timeAgoLogic(p.created_at)}</span>
                        </div>
                        
                        <p class="text-sm text-gray-200 mt-3 leading-relaxed whitespace-pre-wrap">${p.kandungan_teks}</p>
                        
                        <!-- Interactions Bar -->
                        <div class="flex items-center gap-4 mt-4 text-xs font-semibold">
                            <button onclick="toggleLike(${p.id}, ${myLike?true:false})" class="flex items-center gap-1.5 ${likeIconClass} transition-transform hover:scale-110">
                                <i class="fa-heart"></i> <span class="${myLike?'text-white':'text-gray-400'}">${likeCnt} suka</span>
                            </button>
                            
                            <button onclick="document.getElementById('comBox_${p.id}').classList.toggle('hidden')" class="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors">
                                <i class="far fa-comment"></i> <span>${p.suara_comments?.length||0} Komen</span>
                            </button>
                        </div>
                        
                        ${comHtml}
                    </div>
                </div>
            </div>
        `;
        
        c.innerHTML += html;
    });
}

async function toggleLike(postId, isLiked) {
    if(!window.supabaseClient || !curAhliId) return;
    try {
        if(isLiked) {
            await supabaseClient.from('suara_likes').delete().eq('post_id', postId).eq('id_ahli', curAhliId);
        } else {
            await supabaseClient.from('suara_likes').insert({ post_id: postId, id_ahli: curAhliId });
            
            // Fire Notis
            const post = suaraFeed.find(p => p.id === postId);
            if(post && post.id_ahli !== curAhliId) {
                await supabaseClient.from('notis_interaksi').insert({ user_id: post.id_ahli, mesej: 'Ada pesilat menyukai hantaran anda.', type: 'like' });
            }
        }
        await fetchSuaraFeed();
    } catch(err) { console.error('Like error', err); }
}

async function suaraPost() {
    const inp = document.getElementById('suaraInput');
    const txt = inp.value.trim();
    if(!txt || !curAhliId || !window.supabaseClient) return;
    
    document.getElementById('suaraPostBtn').disabled = true;
    try {
        await supabaseClient.from('suara_post').insert({
            id_ahli: curAhliId,
            kandungan_teks: txt
        });
        inp.value = '';
        await fetchSuaraFeed();
        
        if(window.utils && window.utils.createLog) window.utils.createLog('Suara Pesilat', curAhliId + ' telah mengeluarkan suara baru');
    } catch(err) {
        console.error(err);
    } finally {
        document.getElementById('suaraPostBtn').disabled = false;
    }
}

async function deleteSuara(postId) {
    if(!confirm("Sah nak padam luahan ini? Komen dan Suka juga akan lesap.")) return;
    try {
        await supabaseClient.from('suara_post').delete().eq('id', postId);
        await fetchSuaraFeed();
    } catch(err) { console.error('Delete error', err); }
}

async function postComment(postId) {
    const inp = document.getElementById('comInput_'+postId);
    const txt = inp.value.trim();
    if(!txt || !curAhliId) return;
    
    try {
        await supabaseClient.from('suara_comments').insert({
            post_id: postId,
            id_ahli: curAhliId,
            teks_komen: txt
        });
        
        const post = suaraFeed.find(p => p.id === postId);
        if(post && post.id_ahli !== curAhliId) {
            await supabaseClient.from('notis_interaksi').insert({ user_id: post.id_ahli, mesej: 'Seseorang telah membalas luahan anda.', type: 'comment' });
        }
        
        inp.value = '';
        await fetchSuaraFeed();
        
        // Ensure comBox stays open after refresh
        setTimeout(() => {
            const cb = document.getElementById('comBox_'+postId);
            if(cb) cb.classList.remove('hidden');
        }, 300);
        
    } catch(err) { console.error('Comment error', err); }
}

async function deleteComment(cid) {
    try {
        await supabaseClient.from('suara_comments').delete().eq('id', cid);
        fetchSuaraFeed();
    } catch(err) { console.error(err); }
}

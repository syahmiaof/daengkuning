document.addEventListener('DOMContentLoaded', () => {
    // Inject the generic Notification Bell CSS/HTML Modal Wrapper if not present
    // The Bell Icon itself should be placed manually in the headers of specific pages
    
    // Auth Check
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return;
    
    try {
        const user = JSON.parse(sessionStr);
        window.bellUserId = (user.role === 'admin' || user.role === 'superadmin') ? 'ADMIN' : user.username;
        
        // Polling every minute
        fetchNotifications();
        setInterval(fetchNotifications, 60000);

    } catch (e) {
        console.error(e);
    }
});

async function fetchNotifications() {
    if (!window.supabaseClient || !window.bellUserId) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('notis_interaksi')
            .select('*')
            .eq('user_id', window.bellUserId)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        
        const notisList = data || [];
        updateBellUI(notisList);
        
    } catch (err) {
        console.error("Fetch Notifications Error:", err);
    }
}

function updateBellUI(notisList) {
    const bellIconDivs = document.querySelectorAll('.global-notis-bell');
    if (bellIconDivs.length === 0) return;
    
    let unreadCount = 0;
    const lastReadDateStr = localStorage.getItem('last_read_notis_' + window.bellUserId);
    const lastReadDate = lastReadDateStr ? new Date(lastReadDateStr) : new Date(0);
    
    notisList.forEach(n => {
        if (new Date(n.created_at) > lastReadDate) {
            unreadCount++;
        }
    });
    
    bellIconDivs.forEach(bellBtn => {
        // Red dot
        let dot = bellBtn.querySelector('.notis-dot');
        if (unreadCount > 0) {
            if (!dot) {
                const sp = document.createElement('span');
                sp.className = 'notis-dot absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-charcoal animate-pulse';
                bellBtn.appendChild(sp);
            }
        } else {
            if (dot) dot.remove();
        }
    });

    renderNotisDropdown(notisList, unreadCount);
}

function renderNotisDropdown(notisList, unreadCount) {
    let dropdown = document.getElementById('global-notis-dropdown');
    
    // Create it if it doesn't exist
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'global-notis-dropdown';
        dropdown.className = 'fixed top-20 right-4 sm:right-10 w-80 bg-charcoal border border-gold/30 rounded-xl shadow-2xl z-50 transform scale-95 opacity-0 pointer-events-none transition-all duration-300 origin-top-right flex flex-col max-h-[70vh]';
        document.body.appendChild(dropdown);
        
        // Outside click listener
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !e.target.closest('.global-notis-bell')) {
                closeNotisDropdown();
            }
        });
    }
    
    let headerHtml = `
        <div class="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/40 rounded-t-xl">
            <h3 class="font-bold text-white tracking-wide uppercase"><i class="fas fa-bell text-gold mr-2 text-sm"></i> Notifikasi</h3>
            ${unreadCount > 0 ? \`<span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">\${unreadCount} Baru</span>\` : ''}
        </div>
    `;
    
    let bodyHtml = '<div class="p-2 flex-1 overflow-y-auto custom-scrollbar">';
    
    if (notisList.length === 0) {
        bodyHtml += '<div class="p-6 text-center text-gray-500 text-sm">Tiada notifikasi setakat ini.</div>';
    } else {
        notisList.forEach(n => {
            let icon = 'fa-info-circle text-blue-400';
            if (n.type && n.type.includes('yuran')) icon = 'fa-file-invoice-dollar text-green-400';
            if (n.type && n.type.includes('admin')) icon = 'fa-user-shield text-gold';
            
            bodyHtml += `
                <div class="p-3 hover:bg-white/5 rounded-lg border border-transparent hover:border-gold/20 transition-all cursor-default mb-1 flex gap-3">
                    <div class="mt-0.5"><i class="fas ${icon}"></i></div>
                    <div>
                        <p class="text-sm text-gray-300">\${n.mesej}</p>
                        <span class="text-[10px] text-gray-500">\${new Date(n.created_at).toLocaleString('ms-MY', {dateStyle: 'short', timeStyle: 'short'})}</span>
                    </div>
                </div>
            `;
        });
    }
    
    bodyHtml += '</div>';
    dropdown.innerHTML = headerHtml + bodyHtml;
}

window.toggleNotisDropdown = function() {
    const dropdown = document.getElementById('global-notis-dropdown');
    if (!dropdown) return;
    
    if (dropdown.classList.contains('opacity-0')) {
        // Open
        dropdown.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        
        // Mark as read immediately
        localStorage.setItem('last_read_notis_' + window.bellUserId, new Date().toISOString());
        
        // Remove red dot visually right away
        const dot = document.querySelector('.notis-dot');
        if (dot) dot.remove();
        
        // Remove "Baru" badge
        setTimeout(fetchNotifications, 500); // re-fetch to clean up bubbles
    } else {
        closeNotisDropdown();
    }
};

function closeNotisDropdown() {
    const dropdown = document.getElementById('global-notis-dropdown');
    if (dropdown) {
        dropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    }
}

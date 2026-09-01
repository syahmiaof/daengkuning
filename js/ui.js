// Modular UI Global Handler

window.ui = {
    showModal: function(elementId) {
        const modal = document.getElementById(elementId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideModal: function(elementId) {
        const modal = document.getElementById(elementId);
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showConfirm: function(title, message, onConfirmCallback) {
        const confirmBox = document.getElementById('global-confirm-modal');
        if (confirmBox) {
            document.getElementById('confirm-title').innerText = title;
            document.getElementById('confirm-message').innerText = message;
            
            const btnConfirm = document.getElementById('confirm-yes-btn');
            
            // Clone block to remove prior listeners preventing multiple chained executions
            const newBtn = btnConfirm.cloneNode(true);
            btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

            newBtn.addEventListener('click', () => {
                this.hideModal('global-confirm-modal');
                if (typeof onConfirmCallback === 'function') onConfirmCallback();
            });

            this.showModal('global-confirm-modal');
        } else {
            // Browser native fallback
            if(confirm(`${title}\n${message}`)) {
                if (typeof onConfirmCallback === 'function') onConfirmCallback();
            }
        }
    },

    showToast: function(msg, type = 'success') {
        const toastId = 'global-toast';
        let toastEl = document.getElementById(toastId);
        
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = toastId;
            toastEl.className = 'fixed top-5 right-5 z-[100] transform transition-all duration-300 translate-x-full opacity-0 px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] border font-medium text-sm flex items-center gap-3 backdrop-blur-md';
            document.body.appendChild(toastEl);
        }

        let bgClass = 'bg-green-500/20';
        let borderClass = 'border-green-500/50';
        let textClass = 'text-green-400';
        let icon = '<i class="fas fa-check-circle"></i>';

        if (type === 'error') {
            bgClass = 'bg-red-500/20';
            borderClass = 'border-red-500/50';
            textClass = 'text-red-400';
            icon = '<i class="fas fa-exclamation-triangle"></i>';
        }

        toastEl.className = `fixed top-5 right-5 z-[100] transform transition-all duration-300 translate-x-full opacity-0 px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] border font-medium text-sm flex items-center gap-3 backdrop-blur-md ${bgClass} ${borderClass} ${textClass}`;
        toastEl.innerHTML = `${icon} <span>${msg}</span>`;

        // Animate in
        setTimeout(() => {
            toastEl.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Auto remove
        setTimeout(() => {
            toastEl.classList.add('translate-x-full', 'opacity-0');
        }, 3000);
    }
};

// Global Admin Header & Superadmin RBAC Init
document.addEventListener('DOMContentLoaded', () => {
    const sessionStr = localStorage.getItem('userSession');
    if (sessionStr) {
        try {
            const user = JSON.parse(sessionStr);
            if (user.role === 'admin' || user.role === 'superadmin') {
                const headerRight = document.querySelector('header .border-l.border-white\\/10');
                if (headerRight && !document.getElementById('header-admin-name')) {
                    const nameSpan = document.createElement('div');
                    nameSpan.className = 'hidden md:block text-right mr-3 animate-fade-in';
                    nameSpan.innerHTML = `<p class="text-xs text-gray-400 font-medium tracking-widest uppercase">Admin</p><p class="text-sm text-gold font-bold" id="header-admin-name">Memuatkan...</p>`;
                    headerRight.insertBefore(nameSpan, headerRight.firstChild);

                    if (typeof supabaseClient !== 'undefined') {
                        supabaseClient.from('users').select('remarks').ilike('username', user.username).single().then(resp => {
                            const nm = resp.data?.remarks || user.remarks || user.username;
                            const el = document.getElementById('header-admin-name');
                            if(el) el.innerText = nm;
                            
                            user.remarks = nm;
                            localStorage.setItem('userSession', JSON.stringify(user));
                        }).catch(e => {
                            const el = document.getElementById('header-admin-name');
                            if(el) el.innerText = user.remarks || user.username;
                        });
                    } else {
                        const el = document.getElementById('header-admin-name');
                        if(el) el.innerText = user.remarks || user.username;
                    }
                }

                // Superadmin RBAC Enforcement global observer
                const isSuperAdmin = user.role && user.role.toLowerCase() === 'superadmin';
                if (isSuperAdmin) {
                    const elSA = document.querySelector('#header-admin-name');
                    if (elSA) elSA.previousElementSibling.innerText = 'SUPERADMIN'; // Tukar title jadi superadmin
                    
                    // Reveal hidden access buttons globally
                    const unhideSuperadmin = () => {
                        document.querySelectorAll('.rbac-superadmin').forEach(el => {
                            el.classList.remove('hidden');
                        });
                    };
                    
                    unhideSuperadmin(); // run once
                    
                    // Watch for any dynamically rendered elements (tables etc)
                    const observer = new MutationObserver((mutations) => {
                        let shouldUnhide = false;
                        for(let mut of mutations) {
                            if(mut.addedNodes.length > 0) shouldUnhide = true;
                        }
                        if(shouldUnhide) unhideSuperadmin();
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            }
        } catch(e) {}
    }
});


/* NOTIS BELL LOGIC */


function injectBellIcon() {
    const p = window.location.pathname;
    const isProtected = p.includes('student') || p.includes('admin') || p.includes('dashboard');
    if (!isProtected || p.includes('login') || p.includes('index')) return;

    const header = document.querySelector('header');
    if (!header) return;
    
    const rDiv = header.lastElementChild;
    if (rDiv && rDiv.classList.contains('flex')) {
        const btn = document.createElement('button');
        btn.className = 'global-notis-bell relative w-10 h-10 rounded-full bg-charcoal/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all z-[60] ml-2 mt-px shadow-[0_0_15px_rgba(0,0,0,0.5)]';
        btn.setAttribute('onclick', 'window.toggleNotisDropdown(event)');
        btn.setAttribute('type', 'button');
        btn.innerHTML = '<i class="fas fa-bell"></i>';
        rDiv.insertBefore(btn, rDiv.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    injectBellIcon();
    // Inject the generic Notification Bell CSS/HTML Modal Wrapper if not present
    // The Bell Icon itself should be placed manually in the headers of specific pages
    
    // Auth Check
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return;
    
    try {
        const user = JSON.parse(sessionStr);
        // notis_interaksi stores user_id as DK0130 format = user.username
        if (user.role === 'admin' || user.role === 'superadmin') {
            window.bellUserId = 'ADMIN';
        } else {
            window.bellUserId = (user.username || '').toUpperCase();
        }
        
        // Polling every 60s
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
        console.error('Fetch Notifications Error:', err);
        updateBellUI([]);
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
            <div class="flex items-center gap-3">
                ${unreadCount > 0 ? '<span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">' + unreadCount + ' Baru</span>' : ''}
                <button onclick="clearNotifications()" class="text-gray-400 hover:text-red-400 text-xs transition-colors" title="Padam Semua Notis">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
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
                        <p class="text-sm text-gray-300">${n.mesej}</p>
                        <span class="text-[10px] text-gray-500">${new Date(n.created_at).toLocaleString('ms-MY', {dateStyle: 'short', timeStyle: 'short'})}</span>
                    </div>
                </div>
            `;
        });
    }
    
    bodyHtml += '</div>';
    dropdown.innerHTML = headerHtml + bodyHtml;
}

window.toggleNotisDropdown = async function(event) {
    if (event) event.stopPropagation();
    
    let dropdown = document.getElementById('global-notis-dropdown');
    
    // If already open — close it
    if (dropdown && !dropdown.classList.contains('opacity-0')) {
        dropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        dropdown.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        return;
    }
    
    // Create dropdown shell if not exist
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'global-notis-dropdown';
        dropdown.className = 'fixed top-20 right-4 sm:right-10 w-80 bg-charcoal border border-gold/30 rounded-xl shadow-2xl z-[9999] transform scale-95 opacity-0 pointer-events-none transition-all duration-300 origin-top-right flex flex-col max-h-[70vh]';
        document.body.appendChild(dropdown);
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !e.target.closest('.global-notis-bell')) {
                dropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                dropdown.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            }
        });
    }
    
    // Show loading state immediately
    dropdown.innerHTML = `
        <div class="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/40 rounded-t-xl">
            <h3 class="font-bold text-white tracking-wide uppercase"><i class="fas fa-bell text-gold mr-2 text-sm"></i> Notifikasi</h3>
        </div>
        <div class="p-6 text-center text-gray-500 text-sm">Memuat turun...</div>
    `;
    
    // Open dropdown
    dropdown.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    dropdown.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    
    // Get user ID
    try {
        const sessionStr = localStorage.getItem('userSession');
        if (!sessionStr) { dropdown.innerHTML += '<div class="p-4 text-red-400 text-sm">Sesi tamat. Sila log masuk semula.</div>'; return; }
        const user = JSON.parse(sessionStr);
        const uid = (user.role === 'admin' || user.role === 'superadmin') ? 'ADMIN' : (user.username || '').toUpperCase();
        
        if (!uid) { dropdown.innerHTML = '<div class="p-6 text-center text-gray-500 text-sm">ID pengguna tidak dijumpai.</div>'; return; }
        
        // Fetch directly
        const { data, error } = await window.supabaseClient
            .from('notis_interaksi')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(15);
        
        if (error) throw error;
        
        const notisList = data || [];
        
        // Mark as read
        localStorage.setItem('last_read_notis_' + uid, new Date().toISOString());
        const dot = document.querySelector('.notis-dot');
        if (dot) dot.remove();
        
        // Render content
        let bodyHtml = '<div class="p-2 flex-1 overflow-y-auto" style="max-height:50vh">';
        if (notisList.length === 0) {
            bodyHtml += '<div class="p-6 text-center text-gray-500 text-sm"><i class="fas fa-bell-slash mb-2 text-2xl block"></i>Tiada notifikasi setakat ini.</div>';
        } else {
            notisList.forEach(n => {
                let icon = 'fa-info-circle text-blue-400';
                if (n.type && n.type.includes('yuran')) icon = 'fa-file-invoice-dollar text-green-400';
                if (n.type && n.type.includes('admin')) icon = 'fa-user-shield text-gold';
                const dt = new Date(n.created_at).toLocaleString('ms-MY', {dateStyle:'short', timeStyle:'short'});
                bodyHtml += `
                    <div class="p-3 hover:bg-white/5 rounded-lg border border-transparent hover:border-gold/20 transition-all mb-1 flex gap-3">
                        <div class="mt-0.5 text-sm"><i class="fas ${icon}"></i></div>
                        <div>
                            <p class="text-sm text-gray-300">${n.mesej}</p>
                            <span class="text-[10px] text-gray-500">${dt}</span>
                        </div>
                    </div>`;
            });
        }
        bodyHtml += '</div>';
        
        const clearBtn = `<button onclick="window.clearNotifications()" class="text-gray-400 hover:text-red-400 text-xs transition-colors" title="Padam Semua"><i class="fas fa-trash-alt"></i></button>`;
        
        dropdown.innerHTML = `
            <div class="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/40 rounded-t-xl">
                <h3 class="font-bold text-white tracking-wide uppercase"><i class="fas fa-bell text-gold mr-2 text-sm"></i> Notifikasi</h3>
                ${clearBtn}
            </div>
            ${bodyHtml}
        `;
        
    } catch (err) {
        console.error('Bell fetch error:', err);
        dropdown.innerHTML = `<div class="p-6 text-center text-red-400 text-sm">Ralat: ${err.message || 'Gagal memuat notis'}</div>`;
    }
};

function closeNotisDropdown() {
    const dropdown = document.getElementById('global-notis-dropdown');
    if (dropdown) {
        dropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        dropdown.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
    }
}

window.clearNotifications = async function() {
    if (!window.supabaseClient) return;
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return;
    const user = JSON.parse(sessionStr);
    const uid = (user.role === 'admin' || user.role === 'superadmin') ? 'ADMIN' : (user.username || '').toUpperCase();
    
    if (confirm('Padam semua notifikasi?')) {
        try {
            await supabaseClient.from('notis_interaksi').delete().eq('user_id', uid);
            closeNotisDropdown();
            document.getElementById('global-notis-dropdown')?.remove();
        } catch (err) {
            console.error('Gagal padam notifikasi:', err);
        }
    }
};




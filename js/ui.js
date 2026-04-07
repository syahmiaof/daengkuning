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

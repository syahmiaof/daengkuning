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

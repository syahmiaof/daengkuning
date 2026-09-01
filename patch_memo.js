const fs = require('fs');

let html = fs.readFileSync('dashboard-student.html', 'utf8');

const modalHtml = `
    <!-- Memo Profile Popup -->
    <div id="memoPopup" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] hidden flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-[#111] to-black border border-gold/30 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-[0_0_40px_rgba(212,175,55,0.3)] relative overflow-hidden transform scale-95 opacity-0 transition-all duration-300">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[40px]"></div>
            
            <div class="w-14 h-14 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4 text-gold text-2xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            
            <h3 class="text-xl sm:text-2xl font-serif text-white text-center font-bold mb-2">Peringatan Penting</h3>
            
            <p class="text-center text-gray-400 text-sm leading-relaxed mb-6">
                Sila pastikan maklumat anda adalah maklumat terkini, jika ada sebarang maklumat yang ingin dikemaskini, sila maklumkan kepada admin.
            </p>
            
            <div class="flex flex-col gap-3 relative z-10">
                <button onclick="contactSifu('0107965236')" class="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2">
                    <i class="fab fa-whatsapp text-lg"></i> Coach Syahmi
                </button>
                <button onclick="closeMemoPopup()" class="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition-all">
                    Faham & Tutup
                </button>
            </div>
        </div>
    </div>
    
    <script>
        function closeMemoPopup() {
            const popup = document.getElementById('memoPopup');
            const inner = popup.querySelector('div');
            inner.classList.remove('scale-100', 'opacity-100');
            inner.classList.add('scale-95', 'opacity-0');
            setTimeout(() => popup.classList.add('hidden'), 300);
            sessionStorage.setItem('memoShown', 'true');
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            if(!sessionStorage.getItem('memoShown')) {
                const popup = document.getElementById('memoPopup');
                if(popup) {
                    const inner = popup.querySelector('div');
                    popup.classList.remove('hidden');
                    setTimeout(() => {
                        inner.classList.remove('scale-95', 'opacity-0');
                        inner.classList.add('scale-100', 'opacity-100');
                    }, 50);
                }
            }
        });
    </script>
`;

if (!html.includes('id="memoPopup"')) {
    html = html.replace('</body>', modalHtml + '\n</body>');
    fs.writeFileSync('dashboard-student.html', html);
    console.log('Memo popup injected into dashboard.');
} else {
    console.log('Memo popup already present.');
}

const fs = require('fs');

let cUI = fs.readFileSync('js/ui.js', 'utf8');
let cBell = fs.readFileSync('js/notis_bell.js', 'utf8');

cBell = cBell.replace(`document.addEventListener('DOMContentLoaded', () => {`, `document.addEventListener('DOMContentLoaded', () => {\n    injectBellIcon();`);

const injectBellIconFn = `
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
        btn.onclick = window.toggleNotisDropdown;
        btn.innerHTML = '<i class="fas fa-bell"></i>';
        rDiv.insertBefore(btn, rDiv.firstChild);
    }
}
`;

cUI += '\n\n/* NOTIS BELL LOGIC */\n\n' + injectBellIconFn + '\n' + cBell;
fs.writeFileSync('js/ui.js', cUI, 'utf8');
console.log('Successfully injected bell logic to ui.js');

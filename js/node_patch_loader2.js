const fs = require('fs');

const htmlPath = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/warisan.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Use regex to locate the exact div and overwrite its content
html = html.replace(/<div id="loader-overlay"[\s\S]*?<\/div>\s*<\/div>/, `<div id="loader-overlay" class="fixed inset-0 z-40 flex flex-col justify-center items-center bg-black transition-opacity duration-1000">
        <div class="relative flex justify-center items-center mb-4">
            <div class="w-16 h-16 border-4 border-silat-gold/30 border-t-silat-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
            <span id="loading-percent" class="absolute text-silat-gold font-bold text-sm tracking-widest">0%</span>
        </div>
        <p class="text-silat-gold font-serif text-lg tracking-widest animate-pulse">Menempa Keris...</p>
    </div>`);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("HTML Patched robustly.");

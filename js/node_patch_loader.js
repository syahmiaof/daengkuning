const fs = require('fs');

// Patch warisan.html
const htmlPath = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/warisan.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const oldHtmlLoader = `<div id="loader-overlay" class="fixed inset-0 z-40 flex flex-col justify-center items-center bg-black transition-opacity duration-1000">
        <div class="w-16 h-16 border-4 border-silat-gold/30 border-t-silat-gold rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
        <p class="text-silat-gold font-serif text-lg tracking-widest animate-pulse">Menempa Keris...</p>
    </div>`;

const newHtmlLoader = `<div id="loader-overlay" class="fixed inset-0 z-40 flex flex-col justify-center items-center bg-black transition-opacity duration-1000">
        <div class="relative flex justify-center items-center mb-4">
            <div class="w-16 h-16 border-4 border-silat-gold/30 border-t-silat-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
            <span id="loading-percent" class="absolute text-silat-gold font-bold text-sm tracking-widest">0%</span>
        </div>
        <p class="text-silat-gold font-serif text-lg tracking-widest animate-pulse">Menempa Keris...</p>
    </div>`;

html = html.replace(oldHtmlLoader, newHtmlLoader);
fs.writeFileSync(htmlPath, html, 'utf8');

// Patch js/warisan-logic.js
const jsPath = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/warisan-logic.js';
let js = fs.readFileSync(jsPath, 'utf8');

const oldJsLoader = `undefined, // Loading progress`;

const newJsLoader = `function(xhr) {
            const percentEl = document.getElementById('loading-percent');
            if (percentEl && xhr.total > 0) {
                const percent = Math.round((xhr.loaded / xhr.total) * 100);
                percentEl.innerText = percent + '%';
            }
        }, // Loading progress`;

// Note: If 'undefined, // Loading progress' occurs multiple times, we only replace the specific one. But it only exists once here.
js = js.replace(oldJsLoader, newJsLoader);

fs.writeFileSync(jsPath, js, 'utf8');
console.log("Successfully added percentage loading progress indicator!");

const fs = require('fs');
let html = fs.readFileSync('js/student.js', 'utf8');

const targetObj = `        } else if (statusRaw === 'rejected') {
            statusTag = '<span class="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] uppercase font-bold border border-red-500/30">Rejected</span>';
        } else {`;

const replaceObj = `        } else if (statusRaw === 'rejected') {
            const alasan = y.alasan_tolak ? \`<div class="text-[9px] text-red-400 mt-2 w-full text-center max-w-[120px] whitespace-normal mx-auto leading-tight opacity-90 border-t border-red-500/20 pt-1"><i class="fas fa-info-circle mr-1"></i>Sebab: \${y.alasan_tolak}</div>\` : '';
            statusTag = \`<div class="flex flex-col items-center justify-center"><span class="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] uppercase font-bold border border-red-500/30">Rejected</span>\${alasan}</div>\`;
        } else {`;

html = html.replace(targetObj, replaceObj);
fs.writeFileSync('js/student.js', html);
console.log("Patched!");

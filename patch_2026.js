const fs = require('fs');
let text = fs.readFileSync('student-profile.html', 'utf8');

text = text.replace(
  '<span class="text-white text-[0.7rem] tracking-widest font-black border border-gold/30 px-2 py-0.5 rounded bg-black/60 shadow-lg mt-1">2026</span>',
  '<span class="ml-1 tracking-[0.25em]">2026</span>'
);

fs.writeFileSync('student-profile.html', text);
console.log('2026 updated');

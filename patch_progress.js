const fs = require('fs');

const BENGKUNG_LEVELS = [
    'Hitam Mulus',
    'Awan Putih',
    'Pelangi Hijau',
    'Pelangi Merah',
    'Pelangi Merah C1',
    'Pelangi Merah C2',
    'Pelangi Merah C3',
    'Pelangi Kuning',
    'Pel. Kuning C1',
    'Pel. Kuning C2',
    'Pel. Kuning C3',
    'Pel. Kuning C4',
    'Pel. Kuning C5',
    'Harimau Pel. C1',
    'Harimau Pel. C2',
    'Harimau Pel. C3',
    'Harimau Pel. C4',
    'Harimau Pel. C5',
    'Harimau Pel. C6'
];

let text = fs.readFileSync('js/student.js', 'utf8');

const regex = /function calculateBengkungProgress\(bengkung\) \{[\s\S]*?return 10;\n\}/;

const replacement = `function calculateBengkungProgress(bengkung) {
    const raw = (bengkung || '').toLowerCase().trim();
    if (!raw) return 5;
    
    // Ordered by rank ascending
    const levels = [
        'hitam mulus', 'awan putih', 'pelangi hijau', 'pelangi merah',
        'pelangi merah c1', 'pelangi merah c2', 'pelangi merah c3',
        'pelangi kuning', 'pel. kuning c1', 'pel. kuning c2', 'pel. kuning c3', 'pel. kuning c4', 'pel. kuning c5',
        'harimau pel. c1', 'harimau pel. c2', 'harimau pel. c3', 'harimau pel. c4', 'harimau pel. c5', 'harimau pel. c6',
        'chula sakti', 'sakti 7'
    ];
    
    let highestIdx = 0;
    
    // Fuzzy matching since sometimes text might just say "Harimau Pelangi C2" instead of "Harimau Pel. C2"
    for(let i=0; i<levels.length; i++) {
        let l = levels[i];
        if(raw.includes(l) || raw.includes(l.replace('pel.', 'pelangi'))) {
            highestIdx = i;
        }
    }
    
    let total = levels.length;
    let percentage = Math.round(((highestIdx + 1) / total) * 100);
    return percentage;
}`;

text = text.replace(regex, replacement);
fs.writeFileSync('js/student.js', text);
console.log('Progress logic updated');

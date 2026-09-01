const fs = require('fs');

const path = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/student.js';
let js = fs.readFileSync(path, 'utf8');

// 1. Replace the inner contents of window.openStudentEditModal 
// that populates the form
js = js.replace(/document\.getElementById\('studEditName'\)\.value = ahli\.nama \|\| '';.*?window\.ui\.showModal\('student-edit-modal'\);/s, 
`document.getElementById('studEditName').value = ahli.nama || '';
    document.getElementById('studEditPssgm').value = ahli.no_pssgm || '';
    document.getElementById('studEditTel').value = ahli.no_tel || '';
    
    const icEl = document.getElementById('studEditIc');
    if(icEl) icEl.value = ahli.no_ic || '';

    const beltDisp = document.getElementById('studEditBeltDisplay');
    if(beltDisp) beltDisp.innerText = ahli.bengkung || 'Tiada';

    const gelanggangDisp = document.getElementById('studEditGelanggangDisplay');
    if(gelanggangDisp) gelanggangDisp.innerText = ahli.gelanggang || 'Tiada';
    
    window.ui.showModal('student-edit-modal');`);

fs.writeFileSync(path, js, 'utf8');

// Now patch HTML
const htmlPath = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/student-profile.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 2. We replace the No Tel Waris and Bengkung selects
html = html.replace(/<label class="block text-xs font-semibold text-gray-400 mb-1\.5 uppercase tracking-wider">No\. Tel Waris<\/label>.*?<i class="fas fa-chevron-down text-xs"><\/i>\s*<\/div>\s*<\/div>\s*<\/div>/s, 
`<label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">No. Kad Pengenalan (IC)</label>
                            <input type="text" id="studEditIc" placeholder="Contoh: 010101-14-1234" class="w-full px-4 py-2.5 bg-black/50 border border-white/10 hover:border-white/30 rounded-lg text-white focus:border-gold outline-none transition-all placeholder:text-gray-600">
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Bengkung Semasa (Dibaca Sahaja)</label>
                            <div class="w-full px-4 py-2.5 bg-black/20 border border-black/50 rounded-lg text-gray-500 outline-none flex items-center">
                                <i class="fas fa-ribbon text-gray-600 mr-2"></i>
                                <span id="studEditBeltDisplay" class="font-mono tracking-widest">-</span>
                            </div>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Gelanggang Utama (Dibaca Sahaja)</label>
                            <div class="w-full px-4 py-2.5 bg-black/20 border border-black/50 rounded-lg text-gray-500 outline-none flex items-center">
                                <i class="fas fa-map-marker-alt text-gray-600 mr-2"></i>
                                <span id="studEditGelanggangDisplay" class="font-mono tracking-widest">-</span>
                            </div>
                        </div>`);

fs.writeFileSync(htmlPath, html, 'utf8');

console.log("HTML and JS initialization successfully replaced.");

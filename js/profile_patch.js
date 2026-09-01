const fs = require('fs');

// Patch student.js
let js = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/student.js', 'utf8');

const oldPayload = `            const payload = {
                nama: document.getElementById('studEditName').value.trim(),
                no_pssgm: document.getElementById('studEditPssgm').value.trim(),
                no_tel: document.getElementById('studEditTel').value.trim(),
                no_tel_waris: document.getElementById('studEditTelWaris').value.trim()
            };`;

const newPayload = `            const icEl = document.getElementById('studEditIc');
            const payload = {
                nama: document.getElementById('studEditName').value.trim(),
                no_pssgm: document.getElementById('studEditPssgm').value.trim(),
                no_tel: document.getElementById('studEditTel').value.trim(),
                no_ic: icEl ? icEl.value.trim() : ''
            };`;

js = js.replace(oldPayload, newPayload);

const oldInit = `    document.getElementById('studEditName').value = ahli.nama || '';
    document.getElementById('studEditPssgm').value = ahli.no_pssgm || '';
    document.getElementById('studEditTel').value = ahli.no_tel || '';
    document.getElementById('studEditTelWaris').value = ahli.no_tel_waris || '';
    document.getElementById('studEditBelt').value = ahli.bengkung || 'Tiada';`;

const newInit = `    document.getElementById('studEditName').value = ahli.nama || '';
    document.getElementById('studEditPssgm').value = ahli.no_pssgm || '';
    document.getElementById('studEditTel').value = ahli.no_tel || '';
    
    const icEl = document.getElementById('studEditIc');
    if(icEl) icEl.value = ahli.no_ic || '';

    const beltDisp = document.getElementById('studEditBeltDisplay');
    if(beltDisp) beltDisp.innerText = ahli.bengkung || 'Putih';

    const gelanggangDisp = document.getElementById('studEditGelanggangDisplay');
    if(gelanggangDisp) gelanggangDisp.innerText = ahli.gelanggang || 'Tiada';
    
    const idDisp = document.getElementById('studEditIdDisplay');
    if (idDisp) idDisp.innerText = ahli.id_ahli || 'TIDAK JUMPA';`;

js = js.replace(oldInit, newInit);

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/student.js', js, 'utf8');

// Patch student-profile.html
let html = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/student-profile.html', 'utf8');

// The original inputs in HTML for NO TEL WARIS and BENGKUNG:
const htmlSearchCode = `                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">No. Tel Waris</label>
                            <input type="text" id="studEditTelWaris" class="w-full px-4 py-2.5 bg-black/50 border border-white/10 hover:border-white/30 rounded-lg text-white focus:border-gold outline-none transition-all placeholder:text-gray-600">
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Bengkung Semasa</label>
                            <div class="relative">
                                <select id="studEditBelt" class="w-full px-4 py-2.5 bg-black/50 border border-white/10 hover:border-white/30 rounded-lg text-white focus:border-gold outline-none transition-all appearance-none cursor-pointer">
                                    <option value="Putih">Putih</option>
                                    <option value="Kuning">Kuning</option>
                                    <option value="Kuning (Cula Sakti)">Kuning (Cula Sakti)</option>
                                    <option value="Hijau">Hijau</option>
                                    <option value="Merah">Merah</option>
                                    <option value="Merah (Cula Sakti)">Merah (Cula Sakti)</option>
                                    <option value="Chula Sakti">Chula Sakti</option>
                                    <option value="Sakti 7">Sakti 7</option>
                                    <option value="Sakti 14">Sakti 14</option>
                                    <option value="Sakti 21">Sakti 21</option>
                                    <option value="Sakti">Sakti</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                    <i class="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>`;

const htmlReplaceCode = `                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">No. Kad Pengenalan (IC/Pasport)</label>
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
                        </div>`;

html = html.replace(htmlSearchCode, htmlReplaceCode);

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/student-profile.html', html, 'utf8');

console.log("Successfully replaced both JS and HTML.");

const fs = require('fs');

const htmlPath = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/student-profile.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the nested grid
const oldHtml = `<div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Bengkung Semasa (Dibaca Sahaja)</label>
                                <div class="w-full px-4 py-2.5 bg-black/20 border border-black/50 rounded-lg text-gray-500 outline-none flex items-center">
                                    <i class="fas fa-ribbon text-gray-600 mr-2"></i>
                                    <span id="studEditBeltDisplay" class="font-mono tracking-widest">-</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Gelanggang Utama (Dibaca Sahaja)</label>
                                <div class="w-full px-4 py-2.5 bg-black/20 border border-black/50 rounded-lg text-gray-500 outline-none flex items-center">
                                    <i class="fas fa-map-marker-alt text-gray-600 mr-2"></i>
                                    <span id="studEditGelanggangDisplay" class="font-mono tracking-widest">-</span>
                                </div>
                            </div>
                        </div>`;

const newHtml = `<div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Bengkung Semasa (Dibaca Sahaja)</label>
                            <div class="w-full px-4 py-2.5 bg-black/20 border border-black/50 rounded-lg text-gray-500 outline-none flex items-center">
                                <i class="fas fa-ribbon text-gray-600 mr-2"></i>
                                <span id="studEditBeltDisplay" class="font-mono tracking-widest">-</span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Gelanggang Utama (Dibaca Sahaja)</label>
                            <div class="w-full px-4 py-2.5 bg-black/20 border border-black/50 rounded-lg text-gray-500 outline-none flex items-center">
                                <i class="fas fa-map-marker-alt text-gray-600 mr-2"></i>
                                <span id="studEditGelanggangDisplay" class="font-mono tracking-widest">-</span>
                            </div>
                        </div>`;
html = html.replace(oldHtml, newHtml);
fs.writeFileSync(htmlPath, html, 'utf8');

// Patch JS
const jsPath = 'c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/student.js';
let js = fs.readFileSync(jsPath, 'utf8');

// Fix IC parsing to mapping to ahli.ic not ahli.no_ic
js = js.replace(/if\(icEl\) icEl\.value \= ahli\.no_ic \|\| '';/g, 'if(icEl) icEl.value = ahli.ic || \'\';');
js = js.replace(/no_ic: icEl \? icEl\.value\.trim\(\) : ''/g, 'ic: icEl ? icEl.value.trim() : \'\'');

// Fix ID Parsing
js = js.replace(/if\(idDisp\) idDisp\.innerText \= ahli\.id_ahli \|\| ahli\.username \|\| '-';/g, 'if(idDisp) idDisp.innerText = ahli.id_ahli || JSON.parse(localStorage.getItem(\'userSession\'))?.username || \'-\';');
js = js.replace(/document\.getElementById\('card-id'\)\.innerText = ahli\.id_ahli \|\| 'N\/A';/g, 'document.getElementById(\'card-id\').innerText = ahli.id_ahli || JSON.parse(localStorage.getItem(\'userSession\'))?.username || \'N/A\';');

fs.writeFileSync(jsPath, js, 'utf8');
console.log("Successfully patched grid layout, IC column format, and ID parsing.");

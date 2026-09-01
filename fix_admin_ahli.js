const fs = require('fs');
let c = fs.readFileSync('admin-ahli.html', 'utf8');

const start = c.indexOf('        <!-- Main Content Inner -->');
const end = c.indexOf('    <!-- Unified Edit/Add Modal -->');

if (start === -1 || end === -1) {
    console.log('Markers not found! start:', start, 'end:', end);
    process.exit(1);
}

const newSection = `        <!-- Main Content Inner -->
        <div class="flex-1 p-6 lg:p-10 pb-24">
            
            <!-- Controls Bar -->
            <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-gold/30">
                <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    <div class="relative w-full md:w-72">
                        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="searchInput" placeholder="Cari ID, Nama, atau IC..." class="w-full bg-black/40 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600">
                    </div>
                    <div class="relative w-full md:w-48">
                        <select id="gelanggangFilter" class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-gold transition-colors appearance-none">
                            <option value="">Semua Cawangan</option>
                        </select>
                        <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                    </div>
                    <div class="relative w-full md:w-48">
                        <select id="bengkungFilter" class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-gold transition-colors appearance-none">
                            <option value="">Semua Bengkung</option>
                            <option value="Hitam Mulus" class="bg-charcoal text-gray-300">Hitam Mulus</option>
                            <option value="Awan Putih" class="bg-charcoal text-white">Awan Putih</option>
                            <option value="Pelangi Hijau" class="bg-charcoal text-green-400">Pelangi Hijau</option>
                            <option value="Pelangi Merah" class="bg-charcoal text-red-500">Pelangi Merah</option>
                            <option value="Pelangi Merah (Cula 1-3)" class="bg-charcoal text-red-400">Pelangi Merah (Cula 1-3)</option>
                            <option value="Pelangi Kuning" class="bg-charcoal text-yellow-500">Pelangi Kuning</option>
                            <option value="Pelangi Kuning (Cula 1-5)" class="bg-charcoal text-yellow-300">Pelangi Kuning (Cula 1-5)</option>
                            <option value="Pelangi Hitam Harimau Chula Sakti (Cula 1-6)" class="bg-charcoal text-gray-500">Pelangi Hitam Harimau Chula Sakti (Cula 1-6)</option>
                            <option value="Pelangi Hitam Harimau Chula Sakti 7" class="bg-charcoal text-gold">Pelangi Hitam Harimau Chula Sakti 7</option>
                        </select>
                        <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                    </div>
                </div>
                <div class="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
                    <button onclick="window.populateAkaunModal(); ui.showModal('portal-accounts-modal')" class="w-full md:w-auto px-6 py-2.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition-all text-sm flex items-center justify-center">
                        <i class="fas fa-user-check mr-2"></i> Akaun Berdaftar
                    </button>
                    <button onclick="exportToExcel()" class="w-full md:w-auto px-6 py-2.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/40 transition-all text-sm flex items-center justify-center">
                        <i class="fas fa-file-excel mr-2"></i> Ekstrak Excel
                    </button>
                    <button onclick="downloadCSVTemplate()" class="rbac-superadmin hidden w-full md:w-auto px-6 py-2.5 bg-gray-600/20 text-gray-300 border border-gray-500/30 rounded-lg hover:bg-gray-600/40 transition-all text-sm flex items-center justify-center">
                        <i class="fas fa-download mr-2"></i> Templat CSV
                    </button>
                    <label class="rbac-superadmin hidden w-full md:w-auto px-6 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition-all text-sm flex items-center justify-center cursor-pointer mb-0">
                        <i class="fas fa-file-import mr-2"></i> Import CSV
                        <input type="file" id="importExcelBtn" accept=".csv" class="hidden" onchange="window.handleImportCSV(event)">
                    </label>
                    <button onclick="openAddModal()" class="rbac-superadmin hidden w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-charcoal font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-105 transition-all text-sm flex items-center justify-center">
                        <i class="fas fa-plus mr-2"></i> Tambah Ahli
                    </button>
                </div>
            </div>

            <!-- Table Area -->
            <div class="glass-panel rounded-2xl border-gold/30 shadow-2xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr class="bg-white/5 border-b border-gold/20 text-gray-400 text-sm tracking-wide">
                                <th class="py-4 px-6 font-medium">ID Ahli</th>
                                <th class="py-4 px-6 font-medium">Nama Penuh</th>
                                <th class="py-4 px-6 font-medium">No. IC</th>
                                <th class="py-4 px-6 font-medium">No. PSSGM</th>
                                <th class="py-4 px-6 font-medium">No. Tel</th>
                                <th class="py-4 px-6 font-medium text-center">Bengkung</th>
                                <th class="py-4 px-6 font-medium">Gelanggang</th>
                                <th class="py-4 px-6 font-medium">Tarikh Daftar</th>
                                <th class="py-4 px-6 font-medium text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-white/5" id="main-member-table">
                            <tr id="table-loader">
                                <td colspan="8" class="py-16 text-center">
                                    <i class="fas fa-spinner fa-spin text-4xl text-gold mb-4"></i>
                                    <p class="text-gray-400">Sedang menarik data ahli...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    </main>

`;

c = c.substring(0, start) + newSection + c.substring(end);
fs.writeFileSync('admin-ahli.html', c, 'utf8');
console.log('Fixed! New length:', c.length);

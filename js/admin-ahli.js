let allMembers = [];

document.addEventListener('DOMContentLoaded', () => {
    // Basic Auth Check
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return;
    try {
        const user = JSON.parse(sessionStr);
        if (user.role === 'admin' || user.role === 'superadmin') {
            initAdminAhli();
        }
    } catch(e) {}
});

function initAdminAhli() {
    fetchAhliData();
    fetchGelanggangList();
    setupFilters();
    setupFormListener();
}

async function fetchAhliData() {
    const tbody = document.getElementById('main-member-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="py-16 text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-gold mb-4"></i>
                <p class="text-gray-400">Sedang memuat data...</p>
            </td>
        </tr>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('ahli')
            .select('id_ahli, nama, ic, no_pssgm, no_tel, bengkung, gelanggang, tarikh_daftar')
            .order('id_ahli', { ascending: true });

        if (error) throw error;
        
        allMembers = data || [];
        renderTable(allMembers);
    } catch (err) {
        console.error("Fetch Error:", err);
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-red-400">Ralat: ${err.message}</td></tr>`;
    }
}

async function fetchGelanggangList() {
    const sel = document.getElementById('memberLocation');
    try {
        const { data, error } = await supabaseClient.from('gelanggang').select('*').order('nama_gelanggang');
        if (error) throw error;
        
        sel.innerHTML = '<option value="">-- Pilih Gelanggang --</option>';
        const filterSel = document.getElementById('gelanggangFilter');
        if (filterSel) filterSel.innerHTML = '<option value="">Semua Cawangan</option>';
        
        if (data) {
            data.forEach(g => {
                sel.innerHTML += `<option value="${g.nama_gelanggang}" class="bg-charcoal">${g.nama_gelanggang} - ${g.lokasi}</option>`;
                if (filterSel) filterSel.innerHTML += `<option value="${g.nama_gelanggang}" class="bg-charcoal">${g.nama_gelanggang}</option>`;
            });
        }
    } catch(err) {
        console.error('Gelanggang load error', err);
        sel.innerHTML = '<option value="">Gagal memuat turun data</option>';
    }
}

function renderTable(dataArray) {
    const tbody = document.getElementById('main-member-table');
    tbody.innerHTML = '';

    if (!dataArray || dataArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-12 text-center text-gray-500 font-light">
                    <div class="flex flex-col items-center justify-center">
                        <i class="fas fa-folder-open text-4xl mb-3 text-white/10"></i>
                        <p>Tiada rekod jumpa/padan.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    dataArray.forEach(m => {
        // Safe null handling
        const id = m.id_ahli || '';
        const name = m.nama || 'Tiada Nama';
        const ic = m.ic || ' - ';
        const pssgm = m.no_pssgm || ' - ';
        const bengkung = m.bengkung || ' - ';
        const gelanggang = m.gelanggang || ' - ';
        const dateRaw = m.tarikh_daftar || '';

        // Belt color coding logic
        let beltBg = 'bg-white/10 text-white'; // Hitam Mulus / Awan Putih defaults
        const bLow = bengkung.toLowerCase();
        
        if (bLow.includes('hijau')) beltBg = 'bg-green-500/20 text-green-300 border-green-500/30';
        else if (bLow.includes('merah')) beltBg = 'bg-red-500/20 text-red-300 border-red-500/30';
        else if (bLow.includes('kuning')) beltBg = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        else if (bLow.includes('chula sakti')) beltBg = 'bg-black text-gold border-gold/50';

        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5 transition-colors";
        tr.innerHTML = `
            <td class="py-4 px-6 text-gold font-medium">#${id}</td>
            <td class="py-4 px-6 font-medium text-white">${name}</td>
            <td class="py-4 px-6 text-gray-400">${ic}</td>
            <td class="py-4 px-6 text-gray-400">${pssgm}</td>
            <td class="py-4 px-6 text-center">
                <span class="px-3 py-1 rounded-full text-xs font-semibold border ${beltBg}">${bengkung}</span>
            </td>
            <td class="py-4 px-6 text-gray-400">${gelanggang}</td>
            <td class="py-4 px-6 text-gray-400">${window.utils.formatDateMy(dateRaw)}</td>
            <td class="py-4 px-6 text-right flex justify-end space-x-2">
                <button onclick="openEditModal('${id}')" class="rbac-superadmin hidden text-blue-400 hover:text-blue-300 transition-colors p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/20" title="Kemaskini">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="confirmDelete('${id}')" class="rbac-superadmin hidden text-red-400 hover:text-red-300 transition-colors p-2 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20" title="Padam">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setupFilters() {
    const searchInp = document.getElementById('searchInput');
    const bengkungSel = document.getElementById('bengkungFilter');
    const gelanggangSel = document.getElementById('gelanggangFilter');

    const executeFilter = () => {
        const query = searchInp.value.toLowerCase();
        const belt = bengkungSel.value;
        const loc = gelanggangSel ? gelanggangSel.value : '';

        const filtered = allMembers.filter(m => {
            const matchesQuery = (m.id_ahli && m.id_ahli.toLowerCase().includes(query)) ||
                                 (m.nama && m.nama.toLowerCase().includes(query)) ||
                                 (m.ic && m.ic.toLowerCase().includes(query));
            
            const matchesBelt = belt === '' || (m.bengkung && m.bengkung === belt);
            const matchesLoc = loc === '' || (m.gelanggang && m.gelanggang === loc);
            
            return matchesQuery && matchesBelt && matchesLoc;
        });

        renderTable(filtered);
    };

    searchInp.addEventListener('input', executeFilter);
    bengkungSel.addEventListener('change', executeFilter);
    if(gelanggangSel) gelanggangSel.addEventListener('change', executeFilter);
}

// ---------------- CRUD LOGIC ----------------

async function openAddModal() {
    document.getElementById('memberForm').reset();
    document.getElementById('formMode').value = 'create';
    document.getElementById('originalMemberId').value = '';
    
    document.getElementById('modal-title-text').innerText = 'Tambah Ahli';
    const idInput = document.getElementById('memberId');
    idInput.readOnly = false; // allow editing PK
    idInput.classList.remove('opacity-50');
    idInput.value = "Menjana ID...";

    window.ui.showModal('member-form-modal');

    try {
        // Auto-generate next DK ID (4-digits)
        const { data, error } = await supabaseClient
            .from('ahli')
            .select('id_ahli')
            .ilike('id_ahli', 'dk%')
            .order('id_ahli', { ascending: false })
            .limit(1);

        if (!error && data && data.length > 0) {
            let lastId = data[0].id_ahli.toUpperCase();
            let numPart = parseInt(lastId.replace('DK', ''), 10);
            if (!isNaN(numPart)) {
                let nextNum = numPart + 1;
                idInput.value = 'DK' + nextNum.toString().padStart(4, '0');
            } else {
                idInput.value = 'DK0001';
            }
        } else {
            idInput.value = 'DK0001';
        }
    } catch(e) {
        idInput.value = '';
    }
}

function openEditModal(idAhli) {
    const mem = allMembers.find(m => m.id_ahli === idAhli);
    if (!mem) return;

    document.getElementById('formMode').value = 'edit';
    document.getElementById('originalMemberId').value = mem.id_ahli;
    
    document.getElementById('modal-title-text').innerText = 'Kemaskini Ahli';
    
    document.getElementById('memberId').value = mem.id_ahli;
    document.getElementById('memberId').readOnly = true; // Lock PK during edit to prevent cascading FK mess
    document.getElementById('memberId').classList.add('opacity-50');

    document.getElementById('memberName').value = mem.nama;
    document.getElementById('memberIC').value = mem.ic;
    document.getElementById('memberPSSGM').value = mem.no_pssgm || '';
    document.getElementById('memberTel').value = mem.no_tel || '';
    
    // Safely set dropdown
    const beltSelect = document.getElementById('memberBelt');
    const exists = Array.from(beltSelect.options).some(opt => opt.value === mem.bengkung);
    if(exists) beltSelect.value = mem.bengkung;

    document.getElementById('memberLocation').value = mem.gelanggang;

    window.ui.showModal('member-form-modal');
}

function confirmDelete(idAhli) {
    window.ui.showConfirm('Padam Rekod', `Tindakan ini tidak boleh berpatah balik. Rekod ID: ${idAhli} dan akses portal log masuknya akan dipadam.`, async () => {
        try {
            // STEP 1: Delete explicit FK relationship in 'users' table FIRST to prevent constraint lock
            const { error: errUser } = await supabaseClient
                .from('users')
                .delete()
                .eq('username', idAhli);
            
            // Ignore error because new students use Supabase native Auth and won't have a record here
            // if (errUser) throw errUser;

            // STEP 2: Delete parent record in 'ahli' table
            const { error: errAhli } = await supabaseClient
                .from('ahli')
                .delete()
                .eq('id_ahli', idAhli);

            if (errAhli) throw errAhli;

            // Phase 3: Audit Trail
            if (window.utils && window.utils.createLog) {
                window.utils.createLog('Penyingkiran Ahli', `Gugur: ${idAhli}`);
            }

            alert('Rekod berjaya dipadam secara menyeluruh.');
            fetchAhliData(); // Refresh UI
        } catch (err) {
            console.error(err);
            alert(`Gagal memadam: ${err.message}`);
        }
    });
}

function setupFormListener() {
    const form = document.getElementById('memberForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const mode = document.getElementById('formMode').value;
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...';

        try {
            const payloadAhli = {
                id_ahli: document.getElementById('memberId').value.trim().toUpperCase(),
                nama: document.getElementById('memberName').value.trim(),
                ic: document.getElementById('memberIC').value.trim(),
                no_pssgm: document.getElementById('memberPSSGM').value.trim(),
                no_tel: document.getElementById('memberTel').value.trim(),
                bengkung: document.getElementById('memberBelt').value,
                gelanggang: document.getElementById('memberLocation').value.trim()
            };

            if (mode === 'create') {
                payloadAhli.tarikh_daftar = new Date().toISOString().split('T')[0];

                // 1. Insert Ahli
                const { error: ahliError } = await supabaseClient.from('ahli').insert(payloadAhli);
                if (ahliError) throw ahliError;

                // Phase 3: Audit Trail
                if (window.utils && window.utils.createLog) {
                    window.utils.createLog('Pendaftaran Ahli', `${payloadAhli.nama} (${payloadAhli.id_ahli})`);
                }

                alert(`Ahli berjaya didaftarkan ke pangkalan data.\nSila maklumkan Ahli untuk membuat \"Pendaftaran Akaun Baru\" di laman Log Masuk menggunakan ID dan Nombor K/P mereka.`);

            } else if (mode === 'edit') {
                // 1. Update Ahli ONLY 
                const originalId = document.getElementById('originalMemberId').value;
                const { error: updateErr } = await supabaseClient
                    .from('ahli')
                    .update({
                        nama: payloadAhli.nama,
                        ic: payloadAhli.ic,
                        no_pssgm: payloadAhli.no_pssgm,
                        no_tel: payloadAhli.no_tel,
                        bengkung: payloadAhli.bengkung,
                        gelanggang: payloadAhli.gelanggang
                    })
                    .eq('id_ahli', originalId);

                if (updateErr) throw updateErr;
                // Optional: Alert success silent to avoid spam, or brief toast.
                alert("Maklumat berjaya dikemaskini.");
            }

            window.ui.hideModal('member-form-modal');
            fetchAhliData(); // Reload table data

        } catch (err) {
            console.error("Form Error:", err);
            alert(`Ralat: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Simpan Rekod';
        }
    });
}

// CSV Import Logic
window.handleImportCSV = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    window.ui.showConfirm('Pengesahan Import', `Teruskan import data dari fail <b>${file.name}</b>? Sila pastikan lajur mematuhi: <i>ID Ahli, Nama Penuh, No IC, No. Telefon, Bengkung, Gelanggang, Tarikh Daftar</i>.`, () => {
        
        window.ui.hideModal('global-confirm-modal');
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                if (results.errors && results.errors.length > 0) {
                    window.ui.showToast('Terdapat ralat semasa membaca fail CSV.', 'error');
                    console.error("PapaParse errors:", results.errors);
                    return;
                }

                const data = results.data;
                if (!data || data.length === 0) {
                    window.ui.showToast('Fail CSV kosong.', 'error');
                    return;
                }

                const toInsert = data.map(row => {
                    const keys = Object.keys(row);
                    const icRaw = row['No IC'] || row['IC'] || row[keys[2]] || '';
                    const telRaw = row['No. Telefon'] || row['Tel'] || row[keys[3]] || '';
                    return {
                        id_ahli: row['ID Ahli'] || row[keys[0]],
                        nama: row['Nama Penuh'] || row['Nama'] || row[keys[1]],
                        ic: icRaw.replace(/[^a-zA-Z0-9-]/g, ''), 
                        no_tel: telRaw.replace(/[^0-9+-]/g, ''),
                        bengkung: row['Bengkung'] || row[keys[4]],
                        gelanggang: row['Gelanggang'] || row[keys[5]],
                        tarikh_daftar: row['Tarikh Daftar'] || row[keys[6]] || new Date().toISOString()
                    };
                }).filter(r => r.id_ahli && r.nama); 

                if (toInsert.length === 0) {
                    window.ui.showToast('Tiada rekod sah dijumpai dalam CSV.', 'error');
                    return;
                }

                try {
                    const { error } = await supabaseClient
                        .from('ahli')
                        .upsert(toInsert, { onConflict: 'id_ahli' });
                    
                    if (error) throw error;
                    
                    window.ui.showToast(`Berjaya import/kemaskini ${toInsert.length} rekod ahli!`, 'success');
                    fetchAhliData(); 
                } catch(e) {
                    window.ui.showToast('Gagal import ke pangkalan data.', 'error');
                    console.error(e);
                }
                
                const btn = document.getElementById('importExcelBtn');
                if(btn) btn.value = '';
            }
        });
    });
};

// Download CSV Template
window.downloadCSVTemplate = function() {
    const csvContent = "data:text/csv;charset=utf-8,ID Ahli,Nama Penuh,No IC,No. Telefon,Bengkung,Gelanggang,Tarikh Daftar\nDK0001,Ali Bin Abu,010203040506,0123456789,Mulus,Utama,2026-04-01";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Templat_Ahli_DaengKuning.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

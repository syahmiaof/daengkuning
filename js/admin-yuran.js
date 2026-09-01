let allYuran = [];

// Helper: tukar nombor bulan ke nama bulan Melayu
function formatBulanMelayu(bulanRaw, tahunRaw) {
    const namaBulan = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
    // bulan mungkin '2', '2 2026', atau 'Feb 2026' — extract nombor sahaja
    const bulanNum = parseInt((bulanRaw || '').toString().trim().split(' ')[0]);
    const nama = (bulanNum >= 1 && bulanNum <= 12) ? namaBulan[bulanNum - 1] : (bulanRaw || '-');
    return tahunRaw ? `${nama} ${tahunRaw}` : nama;
}
window.formatBulanMelayu = formatBulanMelayu; // expose globally for utils.js

document.addEventListener('DOMContentLoaded', () => {
    // Basic Auth Check
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return;
    try {
        const user = JSON.parse(sessionStr);
        if (user.role === 'admin' || user.role === 'superadmin') {
            initAdminYuran();
        }
    } catch(e) {}
});

function initAdminYuran() {
    fetchYuranData();
    setupFilters();
    setupRejectForm();
}

async function fetchYuranData() {
    const tbody = document.getElementById('yuran-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="py-16 text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-gold mb-4"></i>
                <p class="text-gray-400">Menyegerak data kewangan pelayan...</p>
            </td>
        </tr>
    `;

    try {
        // Relational JOIN magic: .select('*, ahli(nama, bengkung)') 
        // This instructs Supabase to follow the foreign key from yuran.id_ahli to ahli.id_ahli
        const { data, error } = await supabaseClient
            .from('yuran')
            .select('*, ahli(nama, bengkung)')
            .order('tahun', { ascending: false })
            .order('bulan', { ascending: false });

        if (error) throw error;
        
        allYuran = data || [];
        renderYuranStats(allYuran);
        if (typeof window.executeYuranFilter === 'function') {
            window.executeYuranFilter();
        } else {
            renderTable(allYuran);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-red-500 bg-red-500/10"><i class="fas fa-exclamation-triangle text-3xl mb-3"></i><br>Ralat Pangkalan Data: ${err.message}<br><span class="text-xs text-red-400 mt-2 block">Gagal mengikat relasi SQL. Pastikan kunci asing diatur dengan tepat di pelayan.</span></td></tr>`;
    }
}

function renderYuranStats(dataset) {
    let totalKutipan = 0;
    let totalTertunggak = 0; // We consider 'Pending' and 'Rejected' as not yet collected. Or maybe just pending amount mathematically. Let's do amounts logic.
    let pendingCount = 0;

    dataset.forEach(item => {
        const jumlahVal = parseFloat(item.jumlah || 0);
        const status = (item.status || '').toLowerCase();

        if (status === 'lunas' || status === 'paid') {
            totalKutipan += jumlahVal;
        } else if (status === 'tertunggak' || status === 'pending') {
            totalTertunggak += jumlahVal;
            pendingCount++;
        }
    });

    document.getElementById('statTotalKutipan').innerText = window.utils.formatCurrency(totalKutipan);
    document.getElementById('statTertunggak').innerText = window.utils.formatCurrency(totalTertunggak);
    document.getElementById('statPending').innerText = `${pendingCount} Permohonan`;
}

function renderTable(dataset) {
    const tbody = document.getElementById('yuran-table-body');
    tbody.innerHTML = '';

    if (!dataset || dataset.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="py-12 text-center text-gray-500 font-light">
                    <div class="flex flex-col items-center justify-center">
                        <i class="fas fa-folder-open text-4xl mb-3 text-white/10"></i>
                        <p>Tiada rekod yuran lunas mahupun tertunggak dijumpai.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    dataset.forEach(y => {
        // Universal ID resolver just in case ERD named it id or id_yuran
        const pkId = y.id_yuran || y.id || null; 
        const idAhli = y.id_ahli || 'TIDAK DIKENAL';
        
        // Joined object resolution
        const ahliName = (y.ahli && y.ahli.nama) ? y.ahli.nama : 'Profil Ghaib / Dibuang';
        
        const bulan = y.bulan || '-';
        const tahun = y.tahun || '-';
        const tempohDisplay = formatBulanMelayu(bulan, tahun);
        const jumlah = y.jumlah || 0;
        const statusRaw = (y.status || 'pending').toLowerCase();
        const resitUrl = y.bukti_bayar_url || null;

        // Visual Status Tag
        let statusTag = '';
        let statusNorm = statusRaw;
        
        if (statusRaw === 'paid' || statusRaw === 'lunas') {
            statusTag = '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Paid</span>';
            statusNorm = 'paid';
        } else if (statusRaw === 'rejected' || statusRaw === 'batal' || statusRaw === 'tolak') {
            statusTag = '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Rejected</span>';
            statusNorm = 'rejected';
        } else {
            statusTag = '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Pending</span>';
            statusNorm = 'pending';
        }

        // Receipt Button
        let resitBtn = '<span class="text-xs text-gray-600 italic">Tiada Resit</span>';
        if (resitUrl) {
            resitBtn = `<button onclick="viewReceipt('${resitUrl}')" class="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded outline-none border border-blue-500/30 transition-colors"><i class="fas fa-eye mr-2"></i>Lihat</button>`;
        }

        // Action Buttons
        let actionBtns = '';
        if (statusNorm === 'pending') {
            // Only show approve/reject for pending
            actionBtns = `
                <div class="flex justify-end gap-2">
                    <button onclick="approveYuran('${pkId}')" class="rbac-superadmin hidden w-8 h-8 rounded bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]" title="Luluskan"><i class="fas fa-check"></i></button>
                    <button onclick="promptRejectYuran('${pkId}')" class="rbac-superadmin hidden w-8 h-8 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-white transition-all shadow-[0_0_10px_rgba(234,179,8,0.1)]" title="Tolak Laluan"><i class="fas fa-times"></i></button>
                    <button onclick="deleteYuran('${pkId}')" class="rbac-superadmin hidden w-8 h-8 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]" title="Padam Rekod"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else if (statusNorm === 'paid') {
            actionBtns = `
                <div class="flex justify-end gap-2">
                    <button onclick="adminPrintReceipt('${pkId}')" class="text-xs font-semibold px-3 py-1.5 rounded bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-black transition-all shadow-[0_0_10px_rgba(212,175,55,0.1)]" title="PDF">
                        <i class="fas fa-file-pdf mr-1"></i> Cetak PDF
                    </button>
                    <button onclick="deleteYuran('${pkId}')" class="rbac-superadmin hidden w-8 h-8 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] flex items-center justify-center p-0" title="Padam Rekod"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else {
            actionBtns = `
                <div class="flex justify-end gap-2">
                    <span class="text-xs text-gray-500 mt-2 mr-2">Ditolak</span>
                    <button onclick="deleteYuran('${pkId}')" class="rbac-superadmin hidden w-8 h-8 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] flex items-center justify-center p-0" title="Padam Rekod"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5 transition-colors";
        tr.innerHTML = `
            <td class="py-4 px-6">
                <div class="font-bold text-white tracking-wide">${ahliName}</div>
                <div class="text-xs text-gold">ID: ${idAhli}</div>
            </td>
            <td class="py-4 px-6 font-medium text-gray-300">${tempohDisplay}</td>
            <td class="py-4 px-6 text-gold font-serif">${window.utils.formatCurrency(jumlah)}</td>
            <td class="py-4 px-6 text-center">${statusTag}</td>
            <td class="py-4 px-6 text-center">${resitBtn}</td>
            <td class="py-4 px-6 text-right">${actionBtns}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.executeYuranFilter = function() {
    const searchInp = document.getElementById('searchYuran');
    const statusSel = document.getElementById('statusFilter');
    if (!searchInp || !statusSel) return;

    const query = searchInp.value.toLowerCase();
    const stFilter = statusSel.value.toLowerCase();

    const filtered = allYuran.filter(y => {
        const ahliName = ((y.ahli && y.ahli.nama) ? y.ahli.nama : '').toLowerCase();
        const ahliId = (y.id_ahli || '').toLowerCase();
        
        const matchesQuery = ahliName.includes(query) || ahliId.includes(query);
        
        let mappedNorm = '';
        const dbStatRaw = (y.status || 'pending').toLowerCase();
        if (dbStatRaw === 'paid' || dbStatRaw === 'lunas') mappedNorm = 'paid';
        else if (dbStatRaw === 'rejected' || dbStatRaw === 'batal' || dbStatRaw === 'tolak') mappedNorm = 'rejected';
        else mappedNorm = 'pending';

        const matchesStatus = stFilter === '' || mappedNorm === stFilter;
        
        return matchesQuery && matchesStatus;
    });

    renderTable(filtered);
};

function setupFilters() {
    const searchInp = document.getElementById('searchYuran');
    const statusSel = document.getElementById('statusFilter');

    if (searchInp) searchInp.addEventListener('input', window.executeYuranFilter);
    if (statusSel) statusSel.addEventListener('change', window.executeYuranFilter);
}


// ---- INTERACTIVE ACTIONS ----

function viewReceipt(url) {
    const imgEl = document.getElementById('receipt-image-preview');
    const pdfEl = document.getElementById('receipt-pdf-preview');
    const extBtn = document.getElementById('receipt-download-btn');
    
    if(extBtn) extBtn.href = url;

    // Detect if it's a PDF
    if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')) {
        if(imgEl) imgEl.classList.add('hidden');
        if(pdfEl) {
            pdfEl.classList.remove('hidden');
            pdfEl.src = url;
        }
    } else {
        if(pdfEl) {
            pdfEl.classList.add('hidden');
            pdfEl.src = '';
        }
        if(imgEl) {
            imgEl.classList.remove('hidden');
            imgEl.src = url;
            imgEl.onerror = function() {
                this.src = 'https://via.placeholder.com/600x400/111111/D4AF37?text=Maklumat+Gambar+Rosak';
            };
        }
    }
    
    window.ui.showModal('receipt-modal');
}

async function approveYuran(pk) {
    if (!pk) {
        alert("Ralat Kritikal Sistem: Kunci Primer rekod tidak dijumpai (Null PK).");
        return;
    }
    window.ui.showConfirm('Pengesahan Lulus', 'Adakah anda benar-benar menyemak resit ini dan sedia mengesahkan bayaran ini sah diterima?', async () => {
        try {
            let error = null;
            const record = allYuran.find(y => String(y.id) === String(pk) || String(y.id_yuran) === String(pk));
            
            if (record && record.kumpulan_resit_id) {
                const result = await supabaseClient
                    .from('yuran')
                    .update({ status: 'Paid' }) 
                    .eq('kumpulan_resit_id', record.kumpulan_resit_id);
                error = result.error;
            } else {
                const result = await supabaseClient
                    .from('yuran')
                    .update({ status: 'Paid' }) 
                    .eq('id_yuran', pk);
                error = result.error;
            }

            if (error) throw error;
            
            // Phase 3: Audit Trail
            if (window.utils && window.utils.createLog) {
                const n = record && record.ahli ? record.ahli.nama : pk;
                const groupText = (record && record.kumpulan_resit_id) ? ' (Berkumpulan)' : '';
                window.utils.createLog('Kelulusan Yuran', `Resit: ${n}${groupText}`);
            }

            // Phase 4: Notifikasi In-App Pesilat (Idea 1)
            let bText = record && record.bulan ? record.bulan : '';
            if (record && record.kumpulan_resit_id && record.bulan_list) bText = record.bulan_list;
            
            if (record && record.id_ahli) {
                await supabaseClient.from('notis_interaksi').insert({
                    user_id: record.id_ahli.toUpperCase(),
                    type: 'yuran_lulus',
                    mesej: `Tahniah! Resit bayaran yuran anda (Bulan: ${bText || 'Terkini'}) telah disemak dan disahkan LULUS.`
                });
            }

            // Phase 5: Refresh UI immediately
            fetchYuranData(); 

            // Phase 6: WhatsApp Prompt (Idea 2)
            const phoneStr = (record && record.ahli && record.ahli.no_tel) ? record.ahli.no_tel : '';
            if (phoneStr && phoneStr.length >= 9) {
                let cleanPhone = phoneStr.replace(/\D/g, '');
                if (cleanPhone.startsWith('0')) cleanPhone = '6' + cleanPhone;
                else if (!cleanPhone.startsWith('6')) cleanPhone = '60' + cleanPhone;
                
                const namaAhli = (record.ahli && record.ahli.nama) ? record.ahli.nama : 'Tuan/Puan';
                const msg = `Assalamualaikum ${document.createElement('div').appendChild(document.createTextNode(namaAhli)).parentNode.innerHTML.split(' ')[0]}, bayaran yuran anda bagi bulan ${bText} telah kami luluskan. Terima kasih kerana sentiasa komited menyokong APDK!`;
                
                setTimeout(() => { // slight delay so table renders first
                    if (confirm(`Yuran LULUS 🎉\n\nAdakah anda mahu menghantar mesej makluman rasmi ke WhatsApp pesilat ini?\nNo: ${phoneStr}`)) {
                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }
                }, 500);
            }
        } catch(err) {
            alert('Gagal meluluskan: ' + err.message);
        }
    });
}

function deleteYuran(pk) {
    if (!pk) return;
    window.ui.showConfirm('Padam Rekod Yuran', 'AMARAN: Anda pasti memadam rekod ini selama-lamanya? Data tidak boleh dikembalikan.', async () => {
        try {
            const { error } = await supabaseClient
                .from('yuran')
                .delete()
                .eq('id_yuran', pk);

            if (error) throw error;
            
            if (window.utils && window.utils.createLog) {
                window.utils.createLog('Padam Rekod Yuran', `Sistem ID: ${pk}`);
            }
            alert('Rekod berjaya dipadam menyeluruh!');
            fetchYuranData();
        } catch(err) {
            alert('Gagal padam rekod: ' + err.message);
        }
    });
}

function promptRejectYuran(pk) {
    document.getElementById('rejectYuranId').value = pk;
    document.getElementById('rejectReasonInput').value = '';
    window.ui.showModal('reject-reason-modal');
}

function setupRejectForm() {
    document.getElementById('rejectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pk = document.getElementById('rejectYuranId').value;
        const reason = document.getElementById('rejectReasonInput').value.trim();
        const btn = document.getElementById('rejectSubmitBtn');
        
        if (!pk) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';

        try {
            const record = allYuran.find(y => String(y.id) === String(pk) || String(y.id_yuran) === String(pk));
            let error = null;

            if (record && record.kumpulan_resit_id) {
                const result = await supabaseClient
                    .from('yuran')
                    .update({ status: 'Rejected', alasan_tolak: reason }) 
                    .eq('kumpulan_resit_id', record.kumpulan_resit_id);
                error = result.error;
            } else {
                const result = await supabaseClient
                    .from('yuran')
                    .update({ status: 'Rejected', alasan_tolak: reason }) 
                    .eq('id_yuran', pk);
                error = result.error;
            }

            if (error) throw error;

            // Phase 3: Audit Trail
            if (window.utils && window.utils.createLog) {
                const n = record && record.ahli ? record.ahli.nama : pk;
                const groupText = (record && record.kumpulan_resit_id) ? ' (Berkumpulan)' : '';
                window.utils.createLog('Tolak Yuran', `Resit: ${n}${groupText} - ${reason}`);
            }

            // Phase 4: Notis Pelajar Ditolak
            if (record && record.id_ahli) {
                let bText = record.bulan || 'Terkini';
                if (record.kumpulan_resit_id && record.bulan_list) bText = record.bulan_list;
                await supabaseClient.from('notis_interaksi').insert({
                    user_id: record.id_ahli.toUpperCase(),
                    type: 'yuran_batal',
                    mesej: `Maaf, bayaran yuran anda (Bulan: ${bText}) telah ditolak. Sebab: ${reason}`
                });
            }

            window.ui.hideModal('reject-reason-modal');
            alert('Pembayaran sah ditolak.');
            fetchYuranData();
        } catch(err) {
            alert('Sistem ralat: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Hantar Penolakan';
        }
    });
}

function adminPrintReceipt(pk) {
    // Cari data penuh yuran dari dataset allYuran (Tukar ke String untuk elak ralat Integer vs String)
    const record = allYuran.find(y => String(y.id) === String(pk) || String(y.id_yuran) === String(pk));
    if (!record) {
        alert("Rekod fail tidak ditemui."); return;
    }
    
    // Detect Group Recipe
    let combinedName = (record.ahli && record.ahli.nama) ? record.ahli.nama : 'Unknown';
    let combinedTotal = parseFloat(record.jumlah || 0);

    let kumpulanBulan = null;
    if (record.kumpulan_resit_id) {
        const groupMembers = allYuran.filter(y => y.kumpulan_resit_id === record.kumpulan_resit_id);
        if (groupMembers.length > 0) {
            const allNames = groupMembers.map(y => (y.ahli && y.ahli.nama) ? y.ahli.nama : 'Unknown');
            combinedName = [...new Set(allNames)].join('\n'); // Unique names vertically stacked
            combinedTotal = groupMembers.reduce((sum, y) => sum + parseFloat(y.jumlah || 0), 0);
            
            // Extract unique months and sort them chronologically
            const allMonthsRaw = groupMembers.map(y => y.bulan);
            const uniqueMonths = [...new Set(allMonthsRaw)];
            
            uniqueMonths.sort((a, b) => {
                const monthA = parseInt((a || '').toString().trim().split(' ')[0]) || 0;
                const monthB = parseInt((b || '').toString().trim().split(' ')[0]) || 0;
                return monthA - monthB;
            });

            kumpulanBulan = uniqueMonths.map(mRaw => {
                const parts = (mRaw || '').toString().split(' ');
                const bNom = parts[0];
                const tNom = record.tahun || parts[1] || '';
                return formatBulanMelayu(bNom, tNom);
            }).join(' & ');
        }
    }

    // Construct single object format that utils.js understands
    // Reusing the joined ahli name and id mapping explicitly
    const structuredData = {
        ...record,
        nama: combinedName,
        jumlah: combinedTotal,
        bengkung: (record.ahli && record.ahli.bengkung) ? record.ahli.bengkung : 'Tiada',
        kumpulan_bulan: kumpulanBulan // will be null for single payment
    };

    window.utils.generateReceiptPDF(structuredData);

    // Provide Whatsapp Notification option after 1.5 seconds (gives time to download)
    setTimeout(() => {
        window.ui.showConfirm(
            'Resit Dicetak', 
            'Resit berjaya dimuat turun! Adakah anda ingin hantar notis segera kepada pelajar melalui WhatsApp?', 
            () => {
                const phone = record.ahli ? (record.ahli.no_telefon || record.ahli.phone || '') : '';
                const nama = structuredData.nama;
                const bln = structuredData.bulan || '';
                const thn = structuredData.tahun || '';
                
                let msg = `Salam hormat Pendekar ${nama},\n\n`;
                msg += `Bayaran Yuran Latihan APDK (${formatBulanMelayu(bln, thn)}) telah disahkan. Resit rasmi anda kini boleh dimuat turun.\n\n`;
                msg += `Terima kasih atas komitmen anda.\n\n`;
                msg += `*"Biar Patah Tulang, Jangan Puteh Mata"*`;

                const encodedMsg = encodeURIComponent(msg);
                
                let waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
                // If we have a phone number, attempt direct
                if (phone && phone.length > 8) {
                    let cleanPhone = phone.replace(/\D/g,'');
                    if(cleanPhone.startsWith('0')) cleanPhone = '6' + cleanPhone;
                    waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
                }

                window.open(waUrl, '_blank');
            }
        );
    }, 1500);
}

// ---- FASA TAMBAH YURAN MANUAL (CASH) ----
let ahliListForSearch = [];
let selectedAhliManualArray = [];

async function openManualModal() {
    window.ui.showModal('manual-yuran-modal');
    // Fetch Ahli if not already fetched
    if (ahliListForSearch.length === 0) {
        try {
            const { data, error } = await supabaseClient.from('ahli').select('id_ahli, nama').order('nama');
            if (data) {
                ahliListForSearch = data;
            }
        } catch(e) { console.error("Gagal muat turun senarai ahli", e); }
    }
    
    // Reset Data Form
    document.getElementById('manualSearchAhli').value = '';
    document.getElementById('manualAhliDropdown').classList.add('hidden');
    document.getElementById('manualJumlah').value = '';
    
    // Auto set current month & year
    const now = new Date();
    document.getElementById('manualTahun').value = String(now.getFullYear());
    selectedAhliManualArray = [];
    document.getElementById('manualSelectedAhliContainer').innerHTML = '';

    // Render Month Checkboxes
    const monthGrid = document.getElementById('manualMonthGrid');
    if (monthGrid) {
        monthGrid.innerHTML = '';
        const mNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        const currentMonth = now.getMonth() + 1;
        for (let i = 1; i <= 12; i++) {
            const isChecked = i === currentMonth ? 'checked' : '';
            monthGrid.innerHTML += `
                <label class="flex items-center gap-2 bg-charcoal border border-white/10 p-2 rounded-lg cursor-pointer hover:border-gold transition-colors">
                    <input type="checkbox" class="manual-month-checkbox form-checkbox text-gold h-4 w-4 bg-black border-white/20 focus:ring-gold" value="${i}" ${isChecked}>
                    <span class="text-sm text-gray-300 select-none">${mNames[i-1]}</span>
                </label>
            `;
        }
    }
}

document.getElementById('manualSearchAhli')?.addEventListener('input', function() {
    const val = this.value.toLowerCase();
    const drop = document.getElementById('manualAhliDropdown');
    drop.innerHTML = '';
    if (!val) {
        drop.classList.add('hidden');
        return;
    }
    
    const filtered = ahliListForSearch.filter(a => 
        (a.nama && a.nama.toLowerCase().includes(val)) || 
        (a.id_ahli && a.id_ahli.toLowerCase().includes(val))
    );
    
    if (filtered.length > 0) {
        filtered.forEach(a => {
            const div = document.createElement('div');
            div.className = "p-3 hover:bg-gold/10 hover:text-gold cursor-pointer border-b border-white/5 text-sm";
            div.innerHTML = `<strong>${a.nama}</strong> <span class="text-xs text-gray-500 float-right mt-0.5">${a.id_ahli}</span>`;
            div.onclick = () => {
                if (!selectedAhliManualArray.some(s => s.id_ahli === a.id_ahli)) {
                    selectedAhliManualArray.push(a);
                    renderManualAhliBadges();
                }
                document.getElementById('manualSearchAhli').value = ''; // clear search field instead
                drop.classList.add('hidden');
            };
            drop.appendChild(div);
        });
        drop.classList.remove('hidden');
    } else {
        drop.innerHTML = `<div class="p-3 text-sm text-gray-500 italic">Tiada padanan...</div>`;
        drop.classList.remove('hidden');
    }
});

window.removeManualAhli = function(id_ahli) {
    selectedAhliManualArray = selectedAhliManualArray.filter(a => a.id_ahli !== id_ahli);
    renderManualAhliBadges();
};

function renderManualAhliBadges() {
    const container = document.getElementById('manualSelectedAhliContainer');
    if(!container) return;
    container.innerHTML = '';
    selectedAhliManualArray.forEach(a => {
        const badge = document.createElement('div');
        badge.className = 'flex items-center gap-2 px-3 py-1 bg-gold/20 text-gold text-xs rounded-full border border-gold/30 shadow-sm';
        badge.innerHTML = `<span>${a.nama.split(' ')[0]}</span>
                           <button type="button" onclick="removeManualAhli('${a.id_ahli}')" class="text-white/50 hover:text-red-400 transition-colors">
                               <i class="fas fa-times"></i>
                           </button>`;
        container.appendChild(badge);
    });
}

// Tutup dropdown if click away
document.addEventListener('click', (e) => {
    if (e.target.id !== 'manualSearchAhli') {
        const drop = document.getElementById('manualAhliDropdown');
        if (drop) drop.classList.add('hidden');
    }
});

document.getElementById('manualYuranForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (selectedAhliManualArray.length === 0) {
        alert("Sila cari dan pilih Ahli dari senarai dropdown terlebih dahulu.");
        return;
    }
    
    const checkedMonths = Array.from(document.querySelectorAll('.manual-month-checkbox:checked')).map(cb => cb.value);
    if (checkedMonths.length === 0) {
        alert("Sila tandakan sekurang-kurangnya SATU bulan.");
        return;
    }
    
    const tahun = document.getElementById('manualTahun').value;
    const jumlahRaw = document.getElementById('manualJumlah').value;
    const btn = document.getElementById('manualSubmitBtn');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Merekod...';

    try {
        const payloadArray = [];
        const totalItems = selectedAhliManualArray.length * checkedMonths.length;
        const splitAmount = (parseFloat(jumlahRaw) / totalItems).toFixed(2);
        const kumpulanResitId = totalItems > 1 ? 'GRP-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000) : null;
        
        selectedAhliManualArray.forEach(stu => {
            checkedMonths.forEach(mVal => {
                let payload = {
                    id_ahli: stu.id_ahli,
                    bulan: mVal + ' ' + tahun,
                    tahun: tahun,
                    jumlah: parseFloat(splitAmount),
                    status: 'Paid',
                    bukti_bayar_url: '(Bayaran Tunai di Gelanggang)'
                };
                if (kumpulanResitId) {
                    payload.kumpulan_resit_id = kumpulanResitId;
                }
                payloadArray.push(payload);
            });
        });

        const { error } = await supabaseClient
            .from('yuran')
            .insert(payloadArray);

        if (error) throw error;

        // Phase 3: Audit Trail Log
        if (window.utils && window.utils.createLog) {
            window.utils.createLog('Bayaran Manual (Tunai)', `Bil Trans: ${totalItems} | RM${jumlahRaw} (${checkedMonths.join(', ')}/${tahun})`);
        }

        alert(`Yuran Tunai Berjaya Direkodkan Secara Live! (${totalItems} rekod transakasi)`);
        window.ui.hideModal('manual-yuran-modal');
        fetchYuranData(); // Refresh UI
        
    } catch(err) {
        alert('Gagal merekod: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Lunas';
    }
});


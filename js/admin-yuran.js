let allYuran = [];

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
        renderTable(allYuran);
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
                    <button onclick="promptRejectYuran('${pkId}')" class="rbac-superadmin hidden w-8 h-8 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]" title="Tolak Laluan"><i class="fas fa-times"></i></button>
                </div>
            `;
        } else if (statusNorm === 'paid') {
            actionBtns = `
                <div class="flex justify-end gap-2">
                    <button onclick="adminPrintReceipt('${pkId}')" class="text-xs font-semibold px-3 py-1.5 rounded bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-black transition-all shadow-[0_0_10px_rgba(212,175,55,0.1)]" title="PDF">
                        <i class="fas fa-file-pdf mr-1"></i> Cetak PDF
                    </button>
                </div>
            `;
        } else {
            actionBtns = `<span class="text-xs text-gray-500">Tiada Tindakan</span>`;
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5 transition-colors";
        tr.innerHTML = `
            <td class="py-4 px-6">
                <div class="font-bold text-white tracking-wide">${ahliName}</div>
                <div class="text-xs text-gold">ID: ${idAhli}</div>
            </td>
            <td class="py-4 px-6 font-medium text-gray-300">${bulan} / ${tahun}</td>
            <td class="py-4 px-6 text-gold font-serif">${window.utils.formatCurrency(jumlah)}</td>
            <td class="py-4 px-6 text-center">${statusTag}</td>
            <td class="py-4 px-6 text-center">${resitBtn}</td>
            <td class="py-4 px-6 text-right">${actionBtns}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupFilters() {
    const searchInp = document.getElementById('searchYuran');
    const statusSel = document.getElementById('statusFilter');

    const executeFilter = () => {
        const query = searchInp.value.toLowerCase();
        const stFilter = statusSel.value.toLowerCase();

        const filtered = allYuran.filter(y => {
            const ahliName = ((y.ahli && y.ahli.nama) ? y.ahli.nama : '').toLowerCase();
            const ahliId = (y.id_ahli || '').toLowerCase();
            
            const matchesQuery = ahliName.includes(query) || ahliId.includes(query);
            
            // Map english status selection to possible malay variations DB might retain
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

    searchInp.addEventListener('input', executeFilter);
    statusSel.addEventListener('change', executeFilter);
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
            const { error } = await supabaseClient
                .from('yuran')
                .update({ status: 'Paid' }) 
                .eq('id_yuran', pk);

            if (error) throw error;
            
            // Phase 3: Audit Trail
            if (window.utils && window.utils.createLog) {
                const record = allYuran.find(y => String(y.id) === String(pk) || String(y.id_yuran) === String(pk));
                const n = record && record.ahli ? record.ahli.nama : pk;
                window.utils.createLog('Kelulusan Yuran', `Resit: ${n}`);
            }

            alert('Pembayaran diluluskan. Tahniah!');
            fetchYuranData(); // Refresh all to trigger stat recalcs
        } catch(err) {
            alert('Gagal meluluskan: ' + err.message);
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
            // Graceful DB Update Attempt:
            let updatePayload = { status: 'Rejected', alasan: reason };
            
            let { error } = await supabaseClient
                .from('yuran')
                .update(updatePayload)
                .eq('id_yuran', pk);

            if (error && error.message.includes('column') || error && error.code) {
                // FALLBACK: Retrying without explanation column!
                const fb = await supabaseClient
                    .from('yuran')
                    .update({ status: 'Rejected' })
                    .eq('id_yuran', pk);
                
                if (fb.error) throw fb.error;
            } else if (error) {
                 throw error; // Other generic error
            }

            // Phase 3: Audit Trail
            if (window.utils && window.utils.createLog) {
                const record = allYuran.find(y => String(y.id) === String(pk) || String(y.id_yuran) === String(pk));
                const n = record && record.ahli ? record.ahli.nama : pk;
                window.utils.createLog('Tolak Yuran', `Resit: ${n}`);
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
    
    // Construct single object format that utils.js understands
    // Reusing the joined ahli name and id mapping explicitly
    const structuredData = {
        ...record,
        nama: (record.ahli && record.ahli.nama) ? record.ahli.nama : 'Unknown',
        bengkung: (record.ahli && record.ahli.bengkung) ? record.ahli.bengkung : 'Tiada'
    };

    window.utils.generateReceiptPDF(structuredData);
}

// Admin Dashboard Logic & Data Control Center

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard Validation
    if(checkAuth()) {
        initDashboard();
    }
});

// Semak Jika Admin Sahaja Boleh Akses
function checkAuth() {
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return false;
    
    try {
        const user = JSON.parse(sessionStr);
        return user.role === 'admin' || user.role === 'superadmin';
    } catch (e) {
        return false;
    }
}

// Pusat Kawalan Utama
function initDashboard() {
    fetchStats();
    fetchRecentMembers();
    initCharts();
    setupAddMemberLogic();

    // Phase 3
    fetchFinancialProjection();
    fetchBengkungPipeline();
    fetchLiveActivityLogs();

    // Init forms
    fetchDashboardGelanggangList();
}

async function fetchDashboardGelanggangList() {
    const sel = document.getElementById('newMemberLocation');
    if (!sel) return;
    try {
        const { data, error } = await supabaseClient.from('gelanggang').select('*').order('nama_gelanggang');
        if (error) throw error;
        
        sel.innerHTML = '<option value="">-- Pilih Gelanggang --</option>';
        if (data) {
            data.forEach(g => {
                sel.innerHTML += `<option value="${g.nama_gelanggang}" class="bg-charcoal">${g.nama_gelanggang} - ${g.lokasi}</option>`;
            });
        }
    } catch(err) {
        console.error('Gelanggang load error', err);
        sel.innerHTML = '<option value="">Gagal memuat turun data</option>';
    }
}

// Global IC Formatter if not already present
window.formatAdminIC = function(el) {
    let val = el.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    if (val.length > 6) {
        val = val.substring(0, 6) + '-' + val.substring(6);
    }
    if (val.length > 9) {
        val = val.substring(0, 9) + '-' + val.substring(9);
    }
    el.value = val;
};

// 2. Real-time Statistics Logic
async function fetchStats() {
    try {
        // Fetch Total Ahli
        const { count: totalAhli, error: errAhli } = await supabaseClient
            .from('ahli')
            .select('*', { count: 'exact', head: true });
        
        if (!errAhli) {
            const statHeaders = document.querySelectorAll('.grid h3.text-4xl');
            if (statHeaders.length >= 1) statHeaders[0].innerText = totalAhli || 0;
        }

        // Fetch Yuran Tertunggak
        const { data: yuranData, error: errYuran } = await supabaseClient
            .from('yuran')
            .select('jumlah')
            .eq('status', 'Pending');
            
        if (!errYuran && yuranData && yuranData.length > 0) {
            const sumYuran = yuranData.reduce((total, item) => total + parseFloat(item.jumlah || 0), 0);
            const statHeaders = document.querySelectorAll('.grid h3.text-4xl');
            if (statHeaders.length >= 2) statHeaders[1].innerText = `RM ${sumYuran.toFixed(2)}`;
        } else {
            const statHeaders = document.querySelectorAll('.grid h3.text-4xl');
            if (statHeaders.length >= 2) statHeaders[1].innerText = 'RM 0.00';
        }

        // Kira 'Pendaftaran Baru'
        const date = new Date();
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const { count: newAhliCount, error: errNew } = await supabaseClient
            .from('ahli')
            .select('*', { count: 'exact', head: true })
            .gte('tarikh_daftar', firstDayOfMonth);
            
        if (!errNew && newAhliCount !== null) {
            const el = document.getElementById('stat-new');
            if(el) el.innerText = newAhliCount;
            else {
                const statHeaders = document.querySelectorAll('.grid h3.text-4xl');
                if (statHeaders.length >= 3) statHeaders[2].innerText = newAhliCount;
            }
        }

        // Fetch Hebahan
        const { count: totalHebahan, error: errHebahan } = await supabaseClient
            .from('pengumuman')
            .select('*', { count: 'exact', head: true });
        if (!errHebahan) {
            const el = document.getElementById('stat-hebahan');
            if (el) el.innerText = totalHebahan || 0;
        }

        // Fetch Gelanggang
        const { count: totalGelanggang, error: errGelanggang } = await supabaseClient
            .from('gelanggang')
            .select('*', { count: 'exact', head: true });
        if (!errGelanggang) {
            const el = document.getElementById('stat-gelanggang');
            if (el) el.innerText = totalGelanggang || 0;
        }

        // Fetch Admin
        const { count: totalAdmin, error: errAdmin } = await supabaseClient
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin');
        if (!errAdmin) {
            const el = document.getElementById('stat-admin');
            if (el) el.innerText = totalAdmin || 0;
        }

    } catch (err) {
        console.error("Error fetching stats:", err);
    }
}

// 4. Table Population
async function fetchRecentMembers() {
    try {
        const { data: members, error } = await supabaseClient
            .from('ahli')
            .select('id_ahli, nama, tarikh_daftar')
            .order('id_ahli', { ascending: false })
            .limit(5);

        if (error) throw error;

        // Fetch yuran status for current month for these members
        const now = new Date();
        const curMonth = String(now.getMonth() + 1);
        const curYear = String(now.getFullYear());
        const memberIds = (members || []).map(m => m.id_ahli);

        let yuranMap = {};
        if (memberIds.length > 0) {
            const { data: yuranData } = await supabaseClient
                .from('yuran')
                .select('id_ahli, status')
                .in('id_ahli', memberIds)
                .eq('bulan', curMonth)
                .eq('tahun', curYear);
            
            if (yuranData) {
                yuranData.forEach(y => { yuranMap[y.id_ahli] = y.status; });
            }
        }

        const tbody = document.getElementById('recent-members-table');
        
        if (members && members.length > 0) {
            tbody.innerHTML = '';
            
            members.forEach(member => {
                const dateObj = new Date(member.tarikh_daftar || Date.now());
                const dateStr = dateObj.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
                
                // Real yuran status for this month
                const rawStatus = (yuranMap[member.id_ahli] || '').toLowerCase();
                let statusYuranHtml;
                if (rawStatus === 'paid' || rawStatus === 'lunas' || rawStatus === 'selesai') {
                    statusYuranHtml = `<span class="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-500/20">Lunas</span>`;
                } else if (rawStatus === 'pending') {
                    statusYuranHtml = `<span class="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-500/20">Pending</span>`;
                } else {
                    statusYuranHtml = `<span class="px-2 py-1 bg-gray-800/60 text-gray-500 text-xs rounded border border-white/10">Belum Ada</span>`;
                }
                
                const tr = document.createElement('tr');
                tr.className = "hover:bg-white/5 transition-colors";
                tr.innerHTML = `
                    <td class="py-4 px-6 text-gray-300">#${member.id_ahli || 'N/A'}</td>
                    <td class="py-4 px-6 font-medium text-white flex items-center">
                        <div class="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs mr-3 border border-gold/30">
                            ${(member.nama || '?').charAt(0).toUpperCase()}
                        </div>
                        ${member.nama || 'Tanpa Nama'}
                    </td>
                    <td class="py-4 px-6 text-gray-400">${dateStr}</td>
                    <td class="py-4 px-6">${statusYuranHtml}</td>
                    <td class="py-4 px-6 text-right flex justify-end space-x-2">
                        <button class="rbac-superadmin hidden text-blue-400 hover:text-blue-300 transition-colors p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/20" title="Kemaskini"><i class="fas fa-edit"></i></button>
                        <button class="rbac-superadmin hidden text-red-400 hover:text-red-300 transition-colors p-2 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20" title="Padam"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

    } catch (err) {
        console.error("Ralat mendapatkan ahli terkini:", err);
    }
}

// 3. Adding New Members (Modal Form)
function setupAddMemberLogic() {
    const form = document.getElementById('addMemberForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ambil data form
        const idAhli = document.getElementById('newMemberId').value.trim();
        const name = document.getElementById('newMemberName').value.trim();
        const ic = document.getElementById('newMemberIC').value.trim();
        const tel = document.getElementById('newMemberTel').value.trim();
        const belt = document.getElementById('newMemberBelt').value;
        const location = document.getElementById('newMemberLocation').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';
        submitBtn.disabled = true;

        try {
            // STEP A: Insert into 'ahli' table first mapping columns 
            const { data: ahliData, error: ahliError } = await supabaseClient
                .from('ahli')
                .insert({
                    id_ahli: idAhli,
                    nama: name,
                    ic: ic,
                    no_tel: tel,
                    bengkung: belt,
                    gelanggang: location,
                    tarikh_daftar: new Date().toISOString().split('T')[0]
                })
                .select()
                .single(); // Supaya kita dapat balik row ID

            if (ahliError && !ahliError.message.includes('relation "ahli" does not exist')) {
                throw ahliError;
            }

            const assumedAhliId = ahliData ? ahliData.id_ahli : idAhli; 

            // STEP B: Insert into 'users' table linking the foreign key
            const { error: userError } = await supabaseClient
                .from('users')
                .insert({
                    id: crypto.randomUUID(), // Tambah auto UUID memandangkan ERD tiada default
                    username: assumedAhliId,
                    password: 'password123', // Kata laluan lalai mengikut spesifikasi baru
                    role: 'student' 
                });

            if (userError && !userError.message.includes('relation "users" does not exist')) {
                throw userError;
            }

            // Success UI update
            alert(`Ahli Baru Berjaya Ditambah!\nID/Username: ${assumedAhliId}\nKata Laluan (Lalai): ${ic}`);
            
            // Tutup modal dan reset form
            document.getElementById('add-member-modal').classList.add('hidden');
            form.reset();
            
            // Refresh data
            fetchStats();
            fetchRecentMembers();

        } catch (err) {
            console.error("Ralat menyimpan ahli baru:", err);
            alert("Ralat: " + err.message);
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Simpan Rekod';
            submitBtn.disabled = false;
        }
    });
}

// 1. Data Visualization (The Graphs in Gold & Black Theme)
async function initCharts() {
    let lineLabels = ['Nov', 'Dis', 'Jan', 'Feb', 'Mac', 'Apr'];
    let lineData = [0, 0, 0, 0, 0, 0];
    let doughnutData = [0, 0];
    let cawanganLabels = [];
    let cawanganData = [];
    let bengkungLabels = [];
    let bengkungData = [];
    let bengkungColors = [];

    try {
        const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        const { data: ahliData } = await supabaseClient.from('ahli').select('tarikh_daftar, gelanggang, bengkung');
        const curr = new Date();
        const months = [];
        const counts = [];
        for(let i=5; i>=0; i--) {
            let d = new Date(curr.getFullYear(), curr.getMonth() - i, 1);
            months.push({ m: d.getMonth(), y: d.getFullYear(), label: monthNames[d.getMonth()] });
            counts.push(0);
        }
        if (ahliData) {
            // Line data
            ahliData.forEach(a => {
                if(!a.tarikh_daftar) return;
                const ad = new Date(a.tarikh_daftar);
                months.forEach((mo, idx) => {
                    if (ad.getMonth() === mo.m && ad.getFullYear() === mo.y) counts[idx]++;
                });
            });
            lineLabels = months.map(m => m.label);
            lineData = counts;

            // Cawangan data
            const cawanganMap = {};
            ahliData.forEach(a => {
                const g = a.gelanggang || 'Lain-lain';
                cawanganMap[g] = (cawanganMap[g] || 0) + 1;
            });
            const sortedCawangan = Object.entries(cawanganMap).sort((a,b) => b[1]-a[1]);
            cawanganLabels = sortedCawangan.map(e => e[0]);
            cawanganData = sortedCawangan.map(e => e[1]);

            // Bengkung data
            const bengkungMap = {};
            ahliData.forEach(a => {
                const b = a.bengkung || 'Hitam Mulus';
                bengkungMap[b] = (bengkungMap[b] || 0) + 1;
            });
            const beltOrder = ['Hitam Mulus','Awan Putih','Pelangi Hijau','Pelangi Merah','Pelangi Merah (Cula 1-3)','Pelangi Kuning','Pelangi Kuning (Cula 1-5)','Pelangi Hitam Harimau Chula Sakti (Cula 1-6)','Pelangi Hitam Harimau Chula Sakti 7'];
            const beltColorMap = {
                'Hitam Mulus': '#555555', 'Awan Putih': '#e5e7eb',
                'Pelangi Hijau': '#22c55e', 'Pelangi Merah': '#ef4444',
                'Pelangi Merah (Cula 1-3)': '#f87171', 'Pelangi Kuning': '#eab308',
                'Pelangi Kuning (Cula 1-5)': '#fde047', 
                'Pelangi Hitam Harimau Chula Sakti (Cula 1-6)': '#a3a3a3',
                'Pelangi Hitam Harimau Chula Sakti 7': '#D4AF37'
            };
            beltOrder.forEach(b => {
                if(bengkungMap[b]) {
                    bengkungLabels.push(b.replace('Pelangi ', '').replace('Hitam Harimau Chula Sakti', 'Chula Sakti'));
                    bengkungData.push(bengkungMap[b]);
                    bengkungColors.push(beltColorMap[b] || '#888');
                }
            });
            // Add any unlisted belts
            Object.entries(bengkungMap).forEach(([b, cnt]) => {
                if(!beltOrder.includes(b)) {
                    bengkungLabels.push(b);
                    bengkungData.push(cnt);
                    bengkungColors.push('#888888');
                }
            });
        }

        // Finance doughnut data
        const { data: yuranD } = await supabaseClient.from('yuran').select('jumlah, status');
        let paid = 0, unpaid = 0;
        if(yuranD) {
            yuranD.forEach(y => {
                const j = parseFloat(y.jumlah) || 0;
                const stat = (y.status || '').toLowerCase();
                if(['paid','lunas','telah dibayar','selesai'].includes(stat)) paid += j;
                else unpaid += j;
            });
            doughnutData = [paid, unpaid];
        }
    } catch(err) {
        console.error("Charts data fetch error:", err);
    }

    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // === Chart 1: Member Growth Line ===
    const ctxLine = document.getElementById('memberGrowthChart');
    if (ctxLine) {
        const chartLine = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: lineLabels,
                datasets: [{
                    label: 'Pendaftaran Baru',
                    data: lineData,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#D4AF37',
                    pointBorderColor: '#111111',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.45
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1500, easing: 'easeInOutCubic' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17,17,17,0.95)', titleColor: '#D4AF37',
                        bodyColor: '#fff', borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1, padding: 12,
                        displayColors: false,
                        callbacks: { label: (c) => `+${c.parsed.y} Ahli` }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.04)' } },
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
        // Auto-animate: pulse data points
        setInterval(() => {
            chartLine.data.datasets[0].pointRadius = chartLine.data.datasets[0].pointRadius === 5 ? 7 : 5;
            chartLine.update('none');
        }, 2000);
    }

    // === Chart 2: Finance Doughnut ===
    const ctxDoughnut = document.getElementById('financeChart');
    if (ctxDoughnut) {
        const chartDonut = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Yuran Dibayar', 'Belum/Tertunggak'],
                datasets: [{
                    data: doughnutData,
                    backgroundColor: ['#D4AF37', '#ef4444'],
                    borderColor: '#111111', borderWidth: 4, hoverOffset: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '72%',
                animation: { duration: 1800, easing: 'easeInOutQuart' },
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: {
                        backgroundColor: 'rgba(17,17,17,0.95)', titleColor: '#fff', bodyColor: '#fff',
                        borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1, padding: 12,
                        callbacks: { label: (c) => ` RM ${c.parsed.toLocaleString('ms-MY', {minimumFractionDigits:2})}` }
                    }
                }
            }
        });
        // Auto-animate: rotate hoverOffset
        let hoverDir = 1;
        setInterval(() => {
            chartDonut.data.datasets[0].hoverOffset += hoverDir;
            if(chartDonut.data.datasets[0].hoverOffset >= 12 || chartDonut.data.datasets[0].hoverOffset <= 4) hoverDir = -hoverDir;
            chartDonut.update('none');
        }, 1500);
    }

    // === Chart 3: Cawangan Bar ===
    const ctxBar = document.getElementById('cawanganChart');
    if (ctxBar && cawanganLabels.length > 0) {
        const emeraldGradient = ctxBar.getContext('2d').createLinearGradient(0, 0, 0, 200);
        emeraldGradient.addColorStop(0, 'rgba(52, 211, 153, 0.9)');
        emeraldGradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');

        const chartBar = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: cawanganLabels,
                datasets: [{
                    label: 'Bilangan Ahli',
                    data: cawanganData,
                    backgroundColor: emeraldGradient,
                    borderColor: '#34d399',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1600, easing: 'easeInOutBounce' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17,17,17,0.95)', titleColor: '#34d399',
                        bodyColor: '#fff', borderColor: 'rgba(52,211,153,0.3)', borderWidth: 1, padding: 12,
                        callbacks: { label: (c) => ` ${c.parsed.y} Ahli` }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.03)' },
                         ticks: { maxRotation: 30, font: { size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
        // Auto-animate: sequential highlight effect
        let highlightIdx = 0;
        setInterval(() => {
            const n = cawanganData.length;
            const colors = Array(n).fill('rgba(52, 211, 153, 0.35)');
            colors[highlightIdx % n] = 'rgba(52, 211, 153, 0.95)';
            chartBar.data.datasets[0].backgroundColor = colors;
            chartBar.update('none');
            highlightIdx++;
        }, 1200);
    }

    // === Chart 4: Bengkung Doughnut ===
    const ctxBengkung = document.getElementById('bengkungChart');
    if (ctxBengkung && bengkungLabels.length > 0) {
        const chartBengkung = new Chart(ctxBengkung, {
            type: 'doughnut',
            data: {
                labels: bengkungLabels,
                datasets: [{
                    data: bengkungData,
                    backgroundColor: bengkungColors,
                    borderColor: '#111111', borderWidth: 3, hoverOffset: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '60%',
                animation: { duration: 2000, easing: 'easeInOutQuart' },
                plugins: {
                    legend: { position: 'right', labels: { padding: 10, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } } },
                    tooltip: {
                        backgroundColor: 'rgba(17,17,17,0.95)', titleColor: '#D4AF37',
                        bodyColor: '#fff', borderColor: 'rgba(212,175,55,0.2)', borderWidth: 1, padding: 12,
                        callbacks: { label: (c) => ` ${c.parsed} Ahli (${Math.round(c.parsed/bengkungData.reduce((a,b)=>a+b,0)*100)}%)` }
                    }
                }
            }
        });
        // Auto-animate: rotate chart
        let rotation = 0;
        setInterval(() => {
            rotation = (rotation + 1) % 360;
            chartBengkung.options.rotation = rotation * (Math.PI / 180);
            chartBengkung.update('none');
        }, 50);
    }
}

// -------------------------------------------------------------
// Phase 3: Analytics Integration
// -------------------------------------------------------------


async function fetchFinancialProjection() {
    try {
        // Fetch gelanggang rates
        const { data: gelanggangData } = await supabaseClient
            .from('gelanggang')
            .select('nama_gelanggang, kadar_yuran');

        const rateMap = {};
        if (gelanggangData) {
            gelanggangData.forEach(g => {
                rateMap[g.nama_gelanggang] = parseFloat(g.kadar_yuran) || 30;
            });
        }

        // Fetch all ahli with their gelanggang
        const { data: ahliList } = await supabaseClient
            .from('ahli')
            .select('gelanggang');

        // Calculate target: sum of (count_per_cawangan * rate_per_cawangan)
        let targetAmount = 0;
        if (ahliList) {
            ahliList.forEach(a => {
                const rate = rateMap[a.gelanggang] || 30;
                targetAmount += rate;
            });
        }

        // Actual collected (paid yuran this month)
        const now = new Date();
        const curMonth = String(now.getMonth() + 1);
        const curYear = String(now.getFullYear());

        const { data: yuranD } = await supabaseClient
            .from('yuran')
            .select('jumlah, status')
            .eq('bulan', curMonth)
            .eq('tahun', curYear);

        let actualAmount = 0;
        if (yuranD) {
            yuranD.forEach(y => {
                const stat = (y.status || '').toLowerCase();
                if (['paid', 'lunas', 'selesai'].includes(stat)) {
                    actualAmount += parseFloat(y.jumlah || 0);
                }
            });
        }

        let percentage = targetAmount > 0 ? (actualAmount / targetAmount) * 100 : 0;
        if (percentage > 100) percentage = 100;

        const projActEl = document.getElementById('projActual');
        const projTargEl = document.getElementById('projTarget');
        const projBarEl = document.getElementById('projBar');
        const projPercEl = document.getElementById('projPercent');

        // Animated counter for actual
        if (projActEl) animateCounter(projActEl, actualAmount, 'RM ');
        if (projTargEl) projTargEl.innerText = window.utils.formatCurrency(targetAmount);
        if (projBarEl) {
            setTimeout(() => { projBarEl.style.width = percentage.toFixed(1) + '%'; }, 300);
        }
        if (projPercEl) projPercEl.innerText = percentage.toFixed(1) + '%';

    } catch (e) { console.error('Financial Projection Error:', e); }
}

// Animated number counter
function animateCounter(el, targetVal, prefix = '', suffix = '') {
    const duration = 1500;
    const start = performance.now();
    const startVal = 0;
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        const current = startVal + (targetVal - startVal) * eased;
        el.innerText = prefix + current.toFixed(2);
        if (progress < 1) requestAnimationFrame(step);
        else el.innerText = prefix + targetVal.toFixed(2) + suffix;
    }
    requestAnimationFrame(step);
}


async function fetchBengkungPipeline() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const thresholdDateStr = sixMonthsAgo.toISOString().split('T')[0];

        const { data: calon, error } = await supabaseClient
            .from('ahli')
            .select('id_ahli, nama, bengkung, tarikh_daftar')
            .lte('tarikh_daftar', thresholdDateStr)
            .order('tarikh_daftar', { ascending: true }); // longest serving first

        const tbody = document.getElementById('pipelineTable');
        if(!tbody) return;
        tbody.innerHTML = '';

        if(error || !calon || calon.length === 0) {
            tbody.innerHTML = '<tr><td class="text-center text-gray-500 py-6 text-xs">Tiada calon berpotensi ditemui lani.</td></tr>';
            return;
        }

        calon.forEach(c => {
            const sendMsg = encodeURIComponent(`Salam ${c.nama}, anda kini melepasi syarat perkhidmatan (+6 Bulan). Sedia untuk kemaskini bengkung ${c.bengkung}!`);
            const wpLink = `https://wa.me/?text=${sendMsg}`;
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-white/5 transition-colors";
            tr.innerHTML = `
                <td class="py-3 px-4 font-bold text-gray-200 uppercase">${c.nama}</td>
                <td class="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-widest">${c.bengkung}</td>
                <td class="py-3 px-4 text-xs text-gray-400">Direkrut: ${window.utils.formatDateMy(c.tarikh_daftar)}</td>
                <td class="py-3 px-4 text-right">
                    <a href="${wpLink}" target="_blank" class="inline-block px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded border border-green-500/30 transition-all font-semibold text-xs shadow-[0_0_10px_rgba(34,197,94,0.2)]"><i class="fab fa-whatsapp mr-2"></i> Peringatan</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) { console.error('Bengkung Pipeline Error:', e) }
}

async function fetchLiveActivityLogs() {
    try {
        const { data: logs, error } = await supabaseClient
            .from('aktiviti_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        const container = document.getElementById('logStreamContainer');
        if(!container) return;
        container.innerHTML = '';

        if(error || !logs || logs.length === 0) {
            container.innerHTML = '<div class="text-center text-xs text-gray-500 pt-8">Jurnal log aktiviti bersih buat masa ini.</div>';
            return;
        }

        logs.forEach(L => {
            const d = new Date(L.created_at);
            const now = new Date();
            const diffInMins = Math.floor((now - d) / 60000);
            let timeAgo = '';
            if (diffInMins < 1) timeAgo = 'Baru sahaja';
            else if (diffInMins < 60) timeAgo = diffInMins + ' minit lepas';
            else if (diffInMins < 1440) timeAgo = Math.floor(diffInMins/60) + ' jam lepas';
            else timeAgo = Math.floor(diffInMins/1440) + ' hari lepas';

            let iconText = '<i class="fas fa-bolt text-gold"></i>';
            if(L.aksi.includes('Pendaftaran')) iconText = '<i class="fas fa-user-plus text-blue-400"></i>';
            else if(L.aksi.includes('Penyingkiran')) iconText = '<i class="fas fa-trash text-red-500"></i>';
            else if(L.aksi.includes('Kelulusan')) iconText = '<i class="fas fa-check-circle text-green-400"></i>';
            else if(L.aksi.includes('Tolak')) iconText = '<i class="fas fa-times-circle text-red-400"></i>';

            container.innerHTML += `
                <div class="flex items-start gap-4 p-3 rounded-lg bg-black/40 border border-white/5 hover:border-gold/30 transition-colors group mx-1">
                    <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                        ${iconText}
                    </div>
                    <div class="flex-1">
                        <p class="text-[13px] font-bold text-gray-200 capitalize tracking-wide">${L.aksi}</p>
                        <p class="text-xs text-gray-500 truncate mt-0.5"><span class="text-gold/80 font-mono tracking-widest">${L.admin_id}</span> : ${L.sasaran}</p>
                    </div>
                    <div class="text-[9px] text-gray-600 tracking-widest font-mono pt-1 text-right whitespace-nowrap">${timeAgo}</div>
                </div>
            `;
        });
    } catch(e) { console.error('Logs Error:', e) }
}

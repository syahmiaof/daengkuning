// Logik Pusat Portal Pesilat (Student Module)

document.addEventListener('DOMContentLoaded', () => {
    // Pengawal Keselamatan - Pastikan hanya pelajar yang melepasi halangan ini
    if (checkStudentAuth()) {
        const session = JSON.parse(localStorage.getItem('userSession'));
        const studentId = session.username; // Kerana username pengguna pesilat mewakili id_ahli mereka
        
        const path = window.location.pathname;
        if (path.includes('dashboard-student.html')) {
            initStudentDashboard(studentId);
        } else if (path.includes('student-payment.html')) {
            initStudentPayment(studentId);
        } else if (path.includes('student-profile.html')) {
            initStudentProfile(studentId);
        }
    }
});

let myPaymentHistory = [];

// ============================================
// 1. DASHBOARD STUDENT
// ============================================
async function initStudentDashboard(myId) {
    try {
        // Tarikh bulan ini
        const now = new Date();
        const curMonth = (now.getMonth() + 1).toString();
        const curYear = now.getFullYear().toString();

        // 1. Fetch info Profil Sendiri ('ahli')
        const { data: ahliData, error: errA } = await supabaseClient
            .from('ahli')
            .select('*')
            .eq('id_ahli', myId)
            .single();

        if (!errA && ahliData) {
            // Setup Hero
            const greeting = getTimeGreeting();
            document.getElementById('greetingText').innerText = greeting;
            document.getElementById('heroName').innerText = ahliData.nama || 'Pesilat Tanpa Nama';
            
            const mottoEl = document.getElementById('heroMotto');
            if(mottoEl) mottoEl.innerText = getRandomMotto();
            
            // Set Avatar
            const avatarUrl = ahliData.avatar_url;
            if (avatarUrl) {
                document.getElementById('profileAvatar').src = avatarUrl;
            } else {
                document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ahliData.nama)}&background=111111&color=D4AF37&rounded=true&size=256`;
            }

            // Bind Avatar Event
            setupAvatarUpload(myId);

            // Set Bengkung Progress
            const txtBengkungEl = document.getElementById('txtBengkung');
            if(txtBengkungEl) txtBengkungEl.innerText = ahliData.bengkung || 'Putih';
            
            const progress = calculateBengkungProgress(ahliData.bengkung || 'Putih');
            const txtBengkungPercentEl = document.getElementById('txtBengkungPercent');
            if(txtBengkungPercentEl) txtBengkungPercentEl.innerText = progress + '%';
            
            setTimeout(() => { 
                const barBengkungEl = document.getElementById('barBengkung');
                if(barBengkungEl) barBengkungEl.style.width = progress + '%';
            }, 500);

            // Set Theme Dynamically
            applyDynamicBeltTheme(ahliData.bengkung || 'Putih');

            // Set Address
            const statGelanggangEl = document.getElementById('statGelanggang');
            if(statGelanggangEl) statGelanggangEl.innerText = ahliData.gelanggang || 'Luar Kawasan';

            // Fetch Notifications for this Gelanggang
            fetchNotifications(ahliData.gelanggang);

            // Phase 2 Gated Content & Attendance
            validateGatedContent(ahliData.bengkung);
            fetchAttendanceAndLeaderboard(myId);
        }

        // 2. Fetch Status Yuran Semasa
        const { data: yuranData, error: errY } = await supabaseClient
            .from('yuran')
            .select('status')
            .eq('id_ahli', myId)
            .eq('bulan', curMonth)
            .eq('tahun', curYear);

        let statusText = 'Belum Dibayar / Tertunggak';
        let boxBorder = 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
        let iconBg = 'bg-red-500/20 border-red-500/50';
        let iconText = 'fa-exclamation-triangle text-red-500 animate-pulse';

        if (yuranData && yuranData.length > 0) {
            const rawStatus = (yuranData[0].status || 'pending').toLowerCase();
            if (rawStatus === 'paid' || rawStatus === 'lunas') {
                statusText = 'Lunas & Berlindung';
                boxBorder = 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
                iconBg = 'bg-green-500/20 border-green-500/50';
                iconText = 'fa-shield-alt text-green-400';
            } else if (rawStatus === 'rejected') {
                statusText = 'Gagal (Rujuk Rekod)';
                boxBorder = 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]';
                iconBg = 'bg-orange-500/20 border-orange-500/50';
                iconText = 'fa-times-circle text-orange-400';
            } else {
                statusText = 'Menunggu Pengesahan';
                boxBorder = 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
                iconBg = 'bg-blue-500/20 border-blue-500/50';
                iconText = 'fa-hourglass-half text-blue-400 animate-[spin_3s_linear_infinite]';
            }
        }
        
        const yuranEl = document.getElementById('statYuranSemasa');
        if (yuranEl) {
            const box = document.getElementById('yuranWidgetBox');
            if(box) box.className = `md:col-span-4 rounded-2xl p-6 lg:p-8 border flex flex-col justify-center items-center text-center group transition-all duration-500 relative overflow-hidden hover:scale-[1.02] bg-black/60 ${boxBorder}`;
            
            const iconBox = document.getElementById('yuranIconBox');
            if(iconBox) iconBox.className = `w-16 h-16 rounded-full border flex justify-center items-center mb-4 transition-all duration-500 z-10 shadow-inner ${iconBg}`;
            
            const iconI = document.getElementById('yuranStatusIcon');
            if(iconI) iconI.className = `fas ${iconText} text-2xl transition-colors duration-500`;
            
            yuranEl.innerHTML = `<span class="mt-2 text-sm font-bold uppercase tracking-widest text-shadow shadow-black text-gray-200">${statusText}</span>`;
        }

    } catch(e) {
        console.error("Dashboard Load Error: ", e);
    }
}

// --------------------------------------------
// Dashboard Utility Functions
// --------------------------------------------

function getTimeGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) return 'Selamat Pagi,';
    if (hr < 17) return 'Selamat Petang,';
    return 'Selamat Malam,';
}

function getRandomMotto() {
    const mottos = [
        "Biar putih tulang, jangan putih mata.",
        "Patah sayap bertongkat paruh, pantang pendekar mengalah separuh.",
        "Adat pahlawan, berani kerana benar.",
        "Tajam keris kerana diasah, tajam minda kerana menelaah.",
        "Kalau tiada angin masakan pokok bergoyang, kalau tiada ilmu masakan langkah sumbang.",
        "Pendekar beradab bukan sekadar kuat di padang, tapi hemah dipandang.",
        "Setinggi-tinggi terbang bangau, akhirnya hinggap di belakang kerbau.",
        "Pantang sang pendekar pulang sebelum menang.",
        "Bunga disusun langkah tari bermula, musuh menerpa kita bersedia.",
        "Belum cuba belum tahu, bila gayung dihunus pantang berundur."
    ];
    // Math.random() returns a float between 0 and <1. 
    // Multiplying by array length scales it.
    // Math.floor() rounds down to the nearest whole integer index (0-9).
    const randomIndex = Math.floor(Math.random() * mottos.length);
    return mottos[randomIndex];
}

function calculateBengkungProgress(bengkung) {
    const raw = (bengkung || '').toLowerCase().trim();
    if(raw.includes('sakti 7')) return 100;
    if(raw.includes('chula sakti')) return 88;
    if(raw.includes('kuning (cula')) return 77;
    if(raw.includes('kuning')) return 66;
    if(raw.includes('merah (cula')) return 55;
    if(raw.includes('merah')) return 44;
    if(raw.includes('hijau')) return 33;
    if(raw.includes('awan putih')) return 22;
    if(raw.includes('hitam mulus')) return 11;
    return 10;
}

function setupAvatarUpload(myId) {
    const inp = document.getElementById('avatarUpload');
    if(!inp) return;
    inp.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const imgEl = document.getElementById('profileAvatar');
        const oldSrc = imgEl.src;
        imgEl.style.opacity = 0.5;

        try {
            const ext = file.name.split('.').pop();
            const filePath = `${myId}_avatar.${ext}`;

            // Upload to pure storage
            const { data, error } = await supabaseClient.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
            if (error) throw error;

            // Extract resolving Public URL
            const { data: publicData } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
            const pubUrl = publicData.publicUrl + "?t=" + new Date().getTime(); // bypass cache

            // Update row parameter in database
            const { error: dbErr } = await supabaseClient.from('ahli').update({ avatar_url: pubUrl }).eq('id_ahli', myId);
            if (dbErr) throw dbErr;

            imgEl.src = pubUrl;
            
        } catch (err) {
            console.error("Avatar Upload Error:", err);
            alert("Ralat mengemaskini avatar: " + err.message);
            imgEl.src = oldSrc;
        } finally {
            imgEl.style.opacity = 1;
        }
    });
}

async function fetchNotifications() {
    try {
        const { data, error } = await supabaseClient
            .from('pengumuman')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        if (data && data.length > 0) {
            const popup = document.getElementById('marqueeTextPopup');
            if (popup) {
                popup.innerText = `[${data[0].tajuk}] ${data[0].kandungan}`;
            }
        } else {
            const popup = document.getElementById('marqueeTextPopup');
            if (popup) {
                popup.innerText = "Tiada hebahan semasa.";
                popup.classList.replace('text-white', 'text-gray-500');
            }
        }
    } catch (e) {
        console.error("Hebahan Gagal Dicari", e);
        const popup = document.getElementById('marqueeTextPopup');
        if (popup) popup.innerText = `Ralat: ${e.message || JSON.stringify(e)}`;
    }
}

// ---- PHASE 2 LOGIC ----

function validateGatedContent(bengkung) {
    const b = (bengkung || 'Hitam Mulus').toLowerCase().trim();
    const mTempur = document.getElementById('moduleTempur');
    const mRahsia = document.getElementById('moduleRahsia');
    
    // Unlock Tempur (Hijau, Merah, Kuning, Chula Sakti)
    const canTempur = b.includes('hijau') || b.includes('merah') || b.includes('kuning') || b.includes('chula sakti');
    if (canTempur && mTempur) {
        mTempur.classList.remove('opacity-50', 'bg-[#050505]');
        mTempur.classList.add('bg-gradient-to-b', 'from-green-900/20', 'to-transparent', 'hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]', 'scale-100');
        
        const overlay = mTempur.querySelector('.absolute');
        if(overlay) overlay.remove(); 
        
        const content = mTempur.querySelector('.opacity-20');
        if(content) {
            content.classList.remove('opacity-20', 'blur-[1px]', 'select-none', 'pointer-events-none');
            const btn = content.querySelector('button');
            if(btn) {
                btn.classList.replace('bg-gray-800', 'bg-green-500/10');
                btn.classList.replace('text-gray-600', 'text-green-400');
                btn.classList.add('border', 'border-green-500/30', 'hover:bg-green-500', 'hover:text-black', 'text-[10px]', 'uppercase', 'tracking-widest');
                btn.innerText = 'Buka Kandungan';
            }
        }
    }

    // Unlock Rahsia (Merah, Kuning, Chula Sakti)
    const canRahsia = b.includes('merah') || b.includes('kuning') || b.includes('chula sakti');
    if (canRahsia && mRahsia) {
        mRahsia.classList.remove('opacity-50', 'bg-[#050505]');
        mRahsia.classList.add('bg-gradient-to-b', 'from-red-900/20', 'to-transparent', 'hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]', 'scale-100');
        
        const overlay = mRahsia.querySelector('.absolute');
        if(overlay) overlay.remove();
        
        const content = mRahsia.querySelector('.opacity-20');
        if(content) {
            content.classList.remove('opacity-20', 'blur-[1px]', 'select-none', 'pointer-events-none');
            const btn = content.querySelector('button');
            if(btn) {
                btn.classList.replace('bg-gray-800', 'bg-red-500/10');
                btn.classList.replace('text-gray-600', 'text-red-400');
                btn.classList.add('border', 'border-red-500/30', 'hover:bg-red-500', 'hover:text-black', 'text-[10px]', 'uppercase', 'tracking-widest');
                btn.innerText = 'Buka Kandungan';
            }
        }
    }
}

function applyDynamicBeltTheme(bengkung) {
    const b = (bengkung || '').toLowerCase().trim();
    let glowColor = 'rgba(212,175,55,0.4)'; // Default Gold
    let borderColor = 'rgba(212,175,55,0.4)';
    
    if (b.includes('awan putih')) {
        glowColor = 'rgba(255,255,255,0.5)';
        borderColor = 'rgba(255,255,255,0.5)';
    } else if (b.includes('hijau')) {
        glowColor = 'rgba(34,197,94,0.5)';
        borderColor = 'rgba(34,197,94,0.5)';
    } else if (b.includes('merah')) {
        glowColor = 'rgba(239,68,68,0.5)';
        borderColor = 'rgba(239,68,68,0.5)';
    } else if (b.includes('kuning')) {
        glowColor = 'rgba(253,224,71,0.5)';
        borderColor = 'rgba(253,224,71,0.5)';
    } else if (b.includes('chula sakti') || b.includes('hitam mulus')) {
        glowColor = 'rgba(212,175,55,0.2)';
        borderColor = 'rgba(100,100,100,0.5)';
    }
    
    // Inject custom glow styles immediately
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .avatar-container .border-gold\\/50 { border-color: ${borderColor} !important; }
        .bg-gradient-to-tr.from-gold { box-shadow: 0 4px 30px ${glowColor} !important; }
        .membership-card { border-color: ${borderColor} !important; box-shadow: 0 30px 60px ${glowColor} !important; }
        .gold-ribbon { background: linear-gradient(90deg, #111 0%, ${borderColor} 50%, #111 100%) !important; }
        #card-bengkung, #card-ic .text-gold { color: ${borderColor} !important; }
        .text-gold\\/70 { color: ${borderColor} !important; opacity: 0.8; }
    `;
    document.head.appendChild(styleEl);
}

async function fetchAttendanceAndLeaderboard(myId) {
    try {
        const { data, error } = await supabaseClient.from('kehadiran').select('*, ahli(nama, avatar_url)');
        if (error) throw error;
        const allAtt = data || [];

        // 1. Heatmap for current user (Last 30 days)
        const myAtt = allAtt.filter(k => k.id_ahli === myId);
        renderHeatmap(myAtt);

        // 2. Calculate Attendance Rate for current user
        const totalPresents = myAtt.filter(k => k.status === 'Hadir').length;
        const rate = myAtt.length > 0 ? Math.round((totalPresents / myAtt.length) * 100) : 0;
        document.getElementById('statKehadiran').innerText = rate + '%';

    } catch (e) {
        console.error("Dashboard Kehadiran Error", e);
    }
}

function renderHeatmap(myAtt) {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for(let i = 0; i < 30; i++) {
        const hasRecord = myAtt[i]; 
        const isPresent = hasRecord && hasRecord.status === 'Hadir';
        let bgClass = 'bg-gray-800/80';
        if (isPresent) {
            bgClass = (Math.random() > 0.3) ? 'bg-gold' : 'bg-gold/[0.4]';
        }

        const div = document.createElement('div');
        div.className = `w-4 h-4 rounded-sm ${bgClass} transform hover:scale-125 hover:z-10 transition-all cursor-pointer`;
        if(hasRecord) div.title = `${hasRecord.tarikh} - ${hasRecord.status}`;
        grid.appendChild(div);
    }
}

// ---- SIFU AI CHAT MOCKUP ----
function toggleAIChat() {
    const w = document.getElementById('aiChatWindow');
    w.classList.toggle('hidden');
    w.classList.toggle('flex');
}

function sendAIMessage() {
    const inp = document.getElementById('aiChatInput');
    const txt = inp.value.trim();
    if(!txt) return;

    const body = document.getElementById('aiChatBody');
    
    // User bubble
    body.innerHTML += `<div class="self-end bg-gold text-black px-3 py-2 rounded-2xl rounded-tr-none border border-gold inline-block max-w-[85%]">${txt}</div>`;
    inp.value = '';
    body.scrollTop = body.scrollHeight;

    // AI thinking delay
    setTimeout(() => {
        let reply = "Mohon maaf, ilmu makrifat Daeng Kuning ini belum saya kuasai sepenuhnya. Boleh hubungi Coach Syahmi.";
        const low = txt.toLowerCase();
        
        if(low.includes('bunga sembah') || low.includes('bunga')) {
            reply = "Bunga Sembah adalah gerakan asas untuk menghormati gelanggang, kawan, dan lawan sebelum memulakan aksi tempur fizikal.";
        } else if(low.includes('bengkung') || low.includes('level')) {
            reply = "Bengkung bermula dari Putih, Kuning, Hijau, Merah, dan kemuncaknya Hitam (Lembaga). Teruskan berlatih!";
        } else if(low.includes('yuran') || low.includes('bayar')) {
            reply = "Yuran latihan bulanan perlu di muat naik resitnya di tab 'Lapor Bayaran Yuran' untuk disahkan oleh pihak pengurus.";
        }

        body.innerHTML += `<div class="self-start bg-gray-800/80 text-gray-200 px-3 py-2 rounded-2xl rounded-tl-none border border-white/5 inline-block max-w-[85%]">${reply}</div>`;
        body.scrollTop = body.scrollHeight;
    }, 800);
}

// ============================================
// 2. LAPOR YURAN (PAYMENT SUBMISSION)
// ============================================
function initStudentPayment(myId) {
    fetchStudentHistory(myId);

    const form = document.getElementById('payment-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        const originalBtn = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses Resit...';
        btn.disabled = true;

        try {
            const bulan = document.getElementById('payMonth').value;
            const tahun = document.getElementById('payYear').value;
            const jumlah = document.getElementById('payAmount').value;
            const fileInput = document.getElementById('payReceipt');
            const file = fileInput.files[0];

            if (!file) {
                throw new Error("Sila lampirkan fail resit pembayaran.");
            }

            // Upload ke Supabase Storage Bucket 'resit-yuran'
            btn.innerHTML = '<i class="fas fa-upload fa-bounce mr-2"></i>Memuat Naik Fail...';
            const ext = file.name.split('.').pop();
            // Format fail selamat & unik: id_bulan_tahun_timestamp.ext
            const filePath = `${myId}_${bulan}_${tahun}_${Date.now()}.${ext}`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('resit-yuran')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            // Dapatkan URL Awam
            btn.innerHTML = '<i class="fas fa-link fa-spin mr-2"></i>Mengesahkan URL...';
            const { data: publicData } = supabaseClient.storage
                .from('resit-yuran')
                .getPublicUrl(filePath);

            const resitUrl = publicData.publicUrl;

            // Memasukkan pautan sebenar ke dalam database
            btn.innerHTML = '<i class="fas fa-database fa-pulse mr-2"></i>Menyimpan Rekod...';
            const payload = {
                id_ahli: myId,
                bulan: bulan,
                tahun: tahun,
                jumlah: parseFloat(jumlah),
                status: 'Pending',
                bukti_bayar_url: resitUrl
            };

            const { error } = await supabaseClient.from('yuran').insert(payload);
            
            if (error) throw error;

            alert("Bayaran bagi bulan " + bulan + " berjaya di laporkan dan sedang menunggu kelulusan Pentadbir.");
            form.reset();

        } catch (err) {
            console.error("Payment Error:", err);
            alert("Sistem gagal memproses resit: " + err.message);
        } finally {
            btn.innerHTML = originalBtn;
            btn.disabled = false;
        }
    });
}

// Student History Extractor
async function fetchStudentHistory(myId) {
    try {
        const { data, error } = await supabaseClient
            .from('yuran')
            .select('*, ahli(nama, bengkung)')
            .eq('id_ahli', myId)
            .order('tahun', { ascending: false })
            .order('bulan', { ascending: false });
        
        if (error) throw error;
        myPaymentHistory = data || [];
        renderStudentHistory();

    } catch (e) {
        console.error("History Error", e);
    }
}

function renderStudentHistory() {
    const tbody = document.getElementById('studentHistoryTable');
    if (!tbody) return;

    if (myPaymentHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500 italic">Tiada sejarah dijumpai.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    myPaymentHistory.forEach(y => {
        const bulan = y.bulan || '-';
        const tahun = y.tahun || '-';
        const jumlah = parseFloat(y.jumlah || 0);
        const statusRaw = (y.status || 'pending').toLowerCase();
        
        let statusTag = '';
        if (statusRaw === 'paid' || statusRaw === 'lunas') {
            statusTag = '<span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] uppercase font-bold border border-green-500/30">Paid</span>';
        } else if (statusRaw === 'rejected') {
            statusTag = '<span class="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] uppercase font-bold border border-red-500/30">Rejected</span>';
        } else {
            statusTag = '<span class="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-[10px] uppercase font-bold border border-yellow-500/30">Pending</span>';
        }

        let actionBtn = '-';
        if (statusRaw === 'paid' || statusRaw === 'lunas') {
            // Kita pass `id_yuran` or fallback `id` to the print trigger
            const pk = y.id_yuran || y.id;
            actionBtn = `<button onclick="studentPrintReceipt('${pk}')" class="text-xs font-semibold px-3 py-1.5 rounded bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-black transition-all"><i class="fas fa-file-pdf mr-1"></i> Cetak PDF</button>`;
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5 transition-colors";
        tr.innerHTML = `
            <td class="px-6 py-4 text-gray-300 font-medium">${bulan} / ${tahun}</td>
            <td class="px-6 py-4 text-white">${window.utils.formatCurrency(jumlah)}</td>
            <td class="px-6 py-4 text-center">${statusTag}</td>
            <td class="px-6 py-4 text-right">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function studentPrintReceipt(pk) {
    const record = myPaymentHistory.find(y => String(y.id) === String(pk) || String(y.id_yuran) === String(pk));
    if (!record) return;

    // Normalizing Object
    const structuredData = {
        ...record,
        nama: (record.ahli && record.ahli.nama) ? record.ahli.nama : 'Unknown',
        bengkung: (record.ahli && record.ahli.bengkung) ? record.ahli.bengkung : 'Tiada'
    };

    window.utils.generateReceiptPDF(structuredData);
}

// ============================================
// 3. PROFIL SAYA (PROFILE & VIRTUAL ID)
// ============================================
async function initStudentProfile(myId) {
    try {
        const { data: ahli, error } = await supabaseClient
            .from('ahli')
            .select('*')
            .eq('id_ahli', myId)
            .single();

        if (error) throw error;
        
        // Populate Membership Card visually
        document.getElementById('card-id').innerText = ahli.id_ahli || 'N/A';
        document.getElementById('card-name').innerText = ahli.nama || 'N/A';
        document.getElementById('card-ic').innerText = ahli.ic || 'N/A';
        document.getElementById('card-gelanggang').innerText = ahli.gelanggang || 'N/A';
        
        // Warnakan kod bengkung dalam tulisan jawi/arab stylised atau biasa
        document.getElementById('card-bengkung').innerText = (ahli.bengkung || 'Tiada').toUpperCase();
        document.getElementById('card-date').innerText = 'Ahli sejak: ' + window.utils.formatDateMy(ahli.tarikh_daftar);

        // Phase 2: Dynamic QR & Avatar Integration
        const cardQr = document.getElementById('card-qr');
        if (cardQr) {
            const qrPayload = `DK-${ahli.id_ahli}`;
            cardQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}&color=D4AF37&bgcolor=111111`;
        }

        const cardAvatar = document.getElementById('card-avatar');
        if (cardAvatar) {
            if (ahli.avatar_url) {
                cardAvatar.src = ahli.avatar_url;
            } else {
                cardAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ahli.nama || 'Pesilat')}&background=111111&color=D4AF37&size=256`;
            }
        }

        // Apply Dynamic Theme
        applyDynamicBeltTheme(ahli.bengkung || 'putih');

        // Phase 2: 3D Hover Tilt Effect
        bindCardTiltEffect();

    } catch (e) {
        console.error("Gagal muat profil", e);
        document.getElementById('profile-error').innerText = "Gagal memuat profil anda dari pangkalan data.";
    }
}

// --------------------------------------------
// 3D Card Hover Engine (Phase 2)
// --------------------------------------------
function bindCardTiltEffect() {
    const card = document.getElementById('membershipCard');
    if (!card) return;

    // Remove old scaling overrides
    card.classList.remove('hover:scale-105');

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // X coordinate inside card
        const y = e.clientY - rect.top;  // Y coordinate inside card

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
        const rotateY = ((x - centerX) / centerX) * 15;

        card.style.transform = `scale3d(1.02, 1.02, 1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Dynamic Lighting Glare (Optional enhancement)
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        card.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(212,175,55,0.2) 0%, transparent 50%), linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg)`;
        card.style.background = `linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)`;
    });
}

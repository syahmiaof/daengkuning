const fs = require('fs');
let js = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/student.js', 'utf8');

const regex = /async function initStudentPayment\(myId\) \{.*/s;

const newContent = `async function initStudentPayment(myId) {
    if(typeof fetchStudentHistory === 'function') fetchStudentHistory(myId);

    // Fetch all Ahli for Multi-Select Checkboxes
    try {
        const { data: allAhli, error } = await supabaseClient
            .from('ahli')
            .select('id_ahli, nama, gelanggang')
            .order('nama', { ascending: true });
        
        const listDiv = document.getElementById('multiSelectListContent');
        if (listDiv && !error) {
            listDiv.innerHTML = '';
            
            // Render Checkboxes
            allAhli.forEach(a => {
                const isSelected = a.id_ahli === myId ? 'checked' : '';
                listDiv.innerHTML += \`
                    <label class="flex items-center px-4 py-2.5 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors student-label-item">
                        <input type="checkbox" value="\${a.id_ahli}" data-name="\${a.nama}" class="student-checkbox mr-3 form-checkbox text-gold bg-black border-gold/40 rounded focus:ring-gold focus:ring-offset-black" \${isSelected}>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-white student-name-text">\${a.nama}</span>
                            <span class="text-[10px] text-gold/60 uppercase tracking-widest">\${a.id_ahli} | \${a.gelanggang || 'Tiada Gelanggang'}</span>
                        </div>
                    </label>
                \`;
            });

            // Handle filter search
            const searchInput = document.getElementById('searchStudentInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    document.querySelectorAll('.student-label-item').forEach(lbl => {
                        const txt = lbl.querySelector('.student-name-text').innerText.toLowerCase();
                        if (txt.includes(term)) lbl.style.display = 'flex';
                        else lbl.style.display = 'none';
                    });
                });
            }

            // Handle Selection Changes
            const updateSelectionLabel = () => {
                const checked = document.querySelectorAll('.student-checkbox:checked');
                const label = document.getElementById('selectedNamesText');
                
                if (checked.length === 0) {
                    if(label) {
                        label.innerText = '-- Sila Pilih Minimum 1 Pesilat --';
                        label.classList.add('text-red-400');
                        label.classList.remove('text-white');
                    }
                } else if (checked.length === 1) {
                    if(label) {
                        label.innerText = checked[0].dataset.name;
                        label.classList.remove('text-red-400');
                        label.classList.add('text-white');
                    }
                } else {
                    if(label) {
                        const names = Array.from(checked).map(c => c.dataset.name);
                        label.innerText = names.join(', ');
                        label.classList.remove('text-red-400');
                        label.classList.add('text-white');
                    }
                }

                // If at least one selected, load the Month statuses based on the FIRST selected
                if (checked.length > 0) {
                    if(typeof loadStudentYuranMonths === 'function') loadStudentYuranMonths(checked[0].value);
                    if(typeof fetchGelanggangRate === 'function') fetchGelanggangRate(checked[0].value);
                } else {
                    const grid = document.getElementById('monthGrid');
                    if(grid) grid.innerHTML = '<div class="col-span-6 text-gray-500 text-sm text-center py-4">Pilih pesilat untuk papar bulan.</div>';
                }
            };

            // Bind change events
            document.querySelectorAll('.student-checkbox').forEach(cb => {
                cb.addEventListener('change', updateSelectionLabel);
            });

            // Close dropdown securely logic if clicked outside
            document.addEventListener('click', (e) => {
                const drop = document.getElementById('multiSelectDropdown');
                const list = document.getElementById('multiSelectList');
                if (drop && list && !drop.contains(e.target) && !list.contains(e.target) && e.target.id !== 'searchStudentInput') {
                    list.classList.add('hidden');
                }
            });

            updateSelectionLabel(); // init
        }
    } catch(err) { console.error(err); }

    const form = document.getElementById('payment-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const checkedStudents = Array.from(document.querySelectorAll('.student-checkbox:checked'));
        if (checkedStudents.length === 0) {
            alert("Sila pilih minimum SATU nama pesilat.");
            return;
        }

        const checkedMonths = Array.from(document.querySelectorAll('.month-checkbox:checked'));
        if (checkedMonths.length === 0) {
            alert("Sila pilih sekurang-kurangnya SATU bulan untuk dibayar.");
            return;
        }

        const tahun = document.getElementById('payYear').value;
        const jumlahSatuBulan = document.getElementById('payAmount').value;
        const payCatatanEle = document.getElementById('payCatatan');
        const payCatatan = payCatatanEle ? payCatatanEle.value.trim() : '';
        const fileInput = document.getElementById('payReceipt');
        const file = fileInput.files[0];

        if (!file) {
            alert("Sila lampirkan fail resit pembayaran.");
            return;
        }

        const btn = document.getElementById('submitBtn');
        const originalBtn = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses Resit...';
        btn.disabled = true;

        try {
            const totalAmount = parseFloat(jumlahSatuBulan) || 0;
            const totalRows = checkedStudents.length * checkedMonths.length;
            const splitAmount = (totalAmount / totalRows).toFixed(2);

            btn.innerHTML = '<i class="fas fa-upload fa-bounce mr-2"></i>Memuat Naik Fail...';
            const ext = file.name.split('.').pop();
            const filePath = \`bulk_\${Date.now()}.\${ext}\`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('resit-yuran')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabaseClient.storage
                .from('resit-yuran')
                .getPublicUrl(filePath);

            const resitUrl = publicData.publicUrl;

            btn.innerHTML = '<i class="fas fa-database fa-pulse mr-2"></i>Menyimpan Rekod...';
            
            const payloadArray = [];
            checkedStudents.forEach(stu => {
                checkedMonths.forEach(m => {
                    payloadArray.push({
                        id_ahli: stu.value,
                        bulan: m.value + ' ' + tahun,
                        tahun: tahun,
                        jumlah: parseFloat(splitAmount),
                        status: 'Pending',
                        bukti_bayar_url: resitUrl,
                        catatan: payCatatan
                    });
                });
            });

            const { error } = await supabaseClient.from('yuran').insert(payloadArray);
            if (error) throw error;

            alert("Berjaya! (Merekod " + totalRows + " baris data yuran).");
            form.reset();
            
            if(typeof fetchStudentHistory === 'function') fetchStudentHistory(myId);
            if(typeof loadStudentYuranMonths === 'function') loadStudentYuranMonths(checkedStudents[0].value); 

        } catch (err) {
            console.error("Payment Error:", err);
            alert("Sistem gagal memproses resit: " + err.message);
        } finally {
            btn.innerHTML = originalBtn;
            btn.disabled = false;
        }
    });

    const yearSel = document.getElementById('payYear');
    if (yearSel) {
        yearSel.addEventListener('change', () => {
            const stu = document.querySelector('.student-checkbox:checked');
            if (stu && typeof loadStudentYuranMonths === 'function') loadStudentYuranMonths(stu.value);
        });
    }
}

async function fetchGelanggangRate(studentId) {
    try {
        const { data: ahliData } = await supabaseClient.from('ahli').select('gelanggang, nama').ilike('id_ahli', studentId).single();
        if (ahliData && ahliData.gelanggang) {
            const { data: gData } = await supabaseClient.from('gelanggang').select('kadar_yuran').eq('nama_gelanggang', ahliData.gelanggang).single();
            const rate = gData ? parseFloat(gData.kadar_yuran) || 30 : 30;
            const amountEl = document.getElementById('payAmount');
            if (amountEl) {
                amountEl.value = rate.toFixed(2);
                const parentDiv = amountEl.closest('div.mb-6');
                if (parentDiv) {
                    let info = document.getElementById('rate-info');
                    if (!info) {
                        info = document.createElement('p');
                        info.id = 'rate-info';
                        info.className = 'mt-2 text-xs text-gold/70 leading-relaxed';
                        parentDiv.appendChild(info);
                    }
                    info.innerHTML = \`<i class="fas fa-info-circle mr-1"></i>Kadar sebulan rujuk ahli terawal: <strong class="text-gold">RM \${rate.toFixed(2)}</strong><br><em>*Sila masukkan JUMLAH KESELURUHAN resit jika bayar lebih dari 1 pakej/bulan. Sistem memecahkannya sama rata.</em>\`;
                }
            }
        }
    } catch (err) {}
}

async function loadStudentYuranMonths(studentId) {
    const curYearNum = document.getElementById('payYear').value || new Date().getFullYear().toString();
    const grid = document.getElementById('monthGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="col-span-6 text-gold text-sm text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Menyemak status tahun ' + curYearNum + '...</div>';

    try {
        const { data: yuranData, error } = await supabaseClient
            .from('yuran')
            .select('bulan, status')
            .ilike('id_ahli', studentId)
            .eq('tahun', curYearNum);

        let paidOrPendingMap = {};
        if (yuranData && !error) {
            yuranData.forEach(y => {
                const s = (y.status || 'pending').toLowerCase();
                const strB = (y.bulan || '').toLowerCase(); 
                const nums = strB.match(/\\b([1-9]|1[0-2])\\b/g);
                if (nums) nums.forEach(m => paidOrPendingMap[parseInt(m)] = s);
            });
        }

        const blnNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        let html = '';

        for (let i = 1; i <= 12; i++) {
            const isPaid = (paidOrPendingMap[i] === 'paid' || paidOrPendingMap[i] === 'lunas');
            const isPending = (paidOrPendingMap[i] === 'pending');
            const disabled = (isPaid || isPending) ? 'disabled' : '';
            const statusLabel = isPaid ? '(Lunas)' : (isPending ? '(Semakan)' : '(Bayar)');
            const colorClass = isPaid ? 'bg-green-500/10 border-green-500/30 text-green-500 opacity-60' : 
                               (isPending ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 opacity-60' : 'bg-black/50 border-white/10 text-white cursor-pointer hover:border-gold');

            html += \`
                <label class="flex flex-col items-center justify-center gap-1 p-2 border rounded-lg transition-colors \${colorClass}">
                    <span class="text-xs font-bold uppercase tracking-widest">\${blnNames[i-1]}</span>
                    <input type="checkbox" value="\${i}" class="month-checkbox mt-1 form-checkbox text-gold bg-black border-gold/40 rounded focus:ring-gold focus:ring-offset-black" \${disabled}>
                    <span class="text-[9px] min-h-[14px] font-bold">\${statusLabel}</span>
                </label>
            \`;
        }

        grid.innerHTML = html;

    } catch(err) {
        grid.innerHTML = '<div class="col-span-3 text-red-500 text-sm">Gagal menyemak rekod. Sila muat semula.</div>';
    }
}

// ============================================
// 3. EDIT PROFIL & KAD ID (NEW IMPLEMENTATION)
// ============================================
function initStudentProfile(myId) {
    // Populate form data lazily on button click
    const editBtn = document.getElementById('openEditProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', async () => {
            const wrapper = document.getElementById('studentEditModal');
            if (wrapper) wrapper.classList.remove('hidden');

            try {
                const { data: ahli } = await supabaseClient.from('ahli').select('*').eq('id_ahli', myId).single();
                if (ahli) {
                    document.getElementById('studEditName').value = ahli.nama || '';
                    const pssgmEl = document.getElementById('studEditPssgm');
                    if (pssgmEl) pssgmEl.value = ahli.no_pssgm || '';
                    
                    const telEl = document.getElementById('studEditTel');
                    if (telEl) telEl.value = ahli.no_tel || '';
                    
                    const beltEl = document.getElementById('studEditBelt');
                    if (beltEl) beltEl.value = ahli.bengkung || 'Putih';
                    
                    const idDisp = document.getElementById('studEditIdDisplay');
                    if (idDisp) idDisp.innerText = ahli.id_ahli || 'TIDAK JUMPA';
                }
            } catch(e) { console.error(e); }
        });
    }

    const cancelBtn = document.getElementById('studCancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('studentEditModal');
            if (wrapper) wrapper.classList.add('hidden');
        });
    }

    const studForm = document.getElementById('studentEditForm');
    if (studForm) {
        studForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('studSubmitBtn');
            const ogBtn = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
            btn.disabled = true;

            try {
                const pssgmEl = document.getElementById('studEditPssgm');
                const telEl = document.getElementById('studEditTel');
                const beltEl = document.getElementById('studEditBelt');

                const payload = {
                    nama: document.getElementById('studEditName').value.trim(),
                    no_pssgm: pssgmEl ? pssgmEl.value.trim() : '',
                    no_tel: telEl ? telEl.value.trim() : '',
                    bengkung: beltEl ? beltEl.value : 'Putih'
                };

                const { error } = await supabaseClient
                    .from('ahli')
                    .update(payload)
                    .eq('id_ahli', myId);

                if (error) throw error;

                alert('Profil Pemilik Berjaya Dikemaskini!');
                window.location.reload();

            } catch (err) {
                console.error("Update Error:", err);
                alert("Gagal mengemaskini maklumat: " + err.message);
            } finally {
                btn.innerHTML = ogBtn;
                btn.disabled = false;
            }
        });
    }
}
`;

js = js.replace(regex, newContent);
fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/project/cms-daeng-kuning/js/student.js', js, 'utf8');
console.log('Restoration AND patch completed successfully.');

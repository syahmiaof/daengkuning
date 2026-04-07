# SPESIFIKASI TEKNIKAL & ARKITEKTUR SISTEM (TECHNICAL SPECIFICATIONS)

Spesifikasi teknikal perisian ini membincangkan anatomi direktori (fail/folder) serta kerangka logika yang dihubungkan kepada antara-muka pengguna. Keseluruhan modul projek telah disediakan berorientasikan standard tinggi untuk persembahan Projek TVET Nasional.

## 1. Struktur Anatomi Map Fail (Directory Tree Annotated)

Berikut adalah cetakan visual anatomi keseluruhan fail pada aplikasi `cms-daeng-kuning`:

```text
/cms-daeng-kuning
│
├── .gitignore                   # Sekatan perisian ke Github (nod rahsia).
├── package.json / vercel.json   # Konfigurasi Pembangunan & Deployment Vercel.
│
├── index.html                   # Laman Muka Utama Awam. 
├── login.html                   # Modul Gerbang Log-Masuk (Global).
├── dashboard-admin.html         # Paparan Papan Pemuka bagi Admininstrator.
├── admin-ahli.html              # Modul Operasi Senarai Rekod Ahli (Admin).
├── admin-yuran.html             # Modul Audit Transaksi Kewangan (Admin).
├── admin-notis.html             # Modul Penghantaran Hebahan / Pengumuman (Admin).
├── dashboard-student.html       # Landing Page Rasmi Berprofil Pelajar / Murid.
├── student-profile.html         # Modul Peraga Kad ID Visual 3Dimensi (Pelajar).
├── student-payment.html         # Modul Semakan Audit Lengkap Sejarah Resit (Pelajar).
├── student-silibus.html         # Visual Sukatan Pangkalan Modul Kurikulum (Pelajar).
│
├── /assets/                     # Direktori Media Induk.
│   └── /img/                    # Imej (favicon, logo, kad-id, background-textures).
│       ├── logo.png
│       └── favicon.png
│
├── /css/                        # Lembaran Penggayaan Komponen Khas.
│   └── branding.css             # Menentukan tetapan kelas-kelas custom (e.g., .glass-panel).
│
├── /docs/                       # Modul Fail Dokumentasi Akademik (MD).
│
├── /api/                        # Enjin Laluan Awan (Serverless Endpoints - Vercel)
│   └── chat.js                  # Modul Integrasi Suap Balik Sifu AI (Gemini 1.5 - Streaming Response Layer).
│
└── /js/                         # Enjin Logik Interaktif Keseluruhan Projek (Engine Room).
    ├── config.js                # Penyatuan Kunci Rahsia & Endpoint API Backend (Supabase Client Setup).
    ├── auth.js                  # Modul Protokol Sesi, Penyulitan Maklumat Peribadi JWT & Pemeriksaan Skema Profil.
    ├── ui.js                    # Skrip Pengawal Manipulasi DOM Animasi Visual, Interaksi Tetingkap (Modals), dan Carta.
    ├── student.js               # Pengawal Tunggal Arkitek Pelajar (Janaan Matriks 12-Bulanan Yuran, Modul Tetingkap Respon).
    ├── admin-ahli.js            # Enjin CRUD (Create, Read, Update, Delete) Rekod Pesilat.
    └── animations.js            # Pengawal Tatalan Paralaks & Animasi Kemunculan Moden (GSAP & ScrollTrigger bindings).
```

## 2. Penghuraian Logik Rantaian Modul (Modular Logic Blueprint)

CMS berhubung kait secara terus kepada Backend menerusi modul yang dideklarasikan secara kohesif tanpa skrip serabut (*spaghetti codes*):

### A. Teras Pangkalan Penstabil Utama (`js/config.js`)
Fail kunci rahsia terawal (awal muat). Logik ini menterjemahkan pendaftaran talian `window.supabaseClient` secara awam untuk digunakan oleh skrip lain secara pantas. Talian ini yang menggabungkan HTTP Bearer Authorization dari perpustakaan pelayan awan Supabase.

### B. Mesin Pintar Pentadbir (`js/admin-ahli.js` & `js/admin-yuran.js`)
Direkabentuk sebagai satu unit sistem terasing (*Separation of Concerns*). Membawa logik manipulasi data melalui arahan pengkalan pangkalan SQL API *Asynchronous*:
```javascript
// Contoh Pelaksanaan API Update Logik Moden di Supabase SDK v2:
const result = await supabaseClient.from('ahli').update({
     nama: namaInput,
     ic: icInput
}).eq('id_ahli', userIdTarget);
```
Fungsi `fetch()` diulang dengan logik Penomboran (*Pagination Pagination Loader*) jika jumlah data besar untuk elak beban *Time-To-Interactive (TTI)* pada aplikasi awal. Mampu menghasilkan graf perbandingan terus.

### C. Mesin Berkuasa Pelajar / Student Logic (`js/student.js`)
Khusus menjadi 'Jantung Utama' operasi pada sudut visual portal pelajar. Antara kerja terberat dijalankan secara belakang tabir:
- **Konstruktif Matriks Visual Yuran (12 Bulan):**  Fail menarik logik tarikh `new Date()` setempat, dan bertanyakan senarai di belakang pangkalan "Beri Semak Tahun X untuk Profile Y". Kemudian fungsi gelung Javascript memproses setiap rentas bulan menjadi 12 kiub warna yang tepat lalu disuntik *(Injection)* terus ke elemen innerHTML di persekitaran GUI.
- **Kesimpulan Komunikasi Server-Klien:** Talian ini mengurangkan masa lengah interaksi web statik biasa dengan pemproseesaan memori pelanggan *(Client-Side GPU Rendering via Edge function equivalent)*.

## 3. Penilaian Teknikal & Strategi Pertahanan (Technical Critique & Defense)

Dokumentasi ini juga memuatkan analisis kritikal (Code Review) dari sudut kaca mata penilai teknikal, berserta strategi jawapan pertahanan (Defensive Answers) berdasarkan arkitektur sistem semasa.

### A. Seni Bina Frontend (Vanilla JS vs Framework)
*   **Isu:** Menguruskan fail JavaScript yang panjang tanpa kerangka moden (seperti React/Next.js) berpotensi mencetuskan kod sukar diselenggara (*Spaghetti Code*).
*   **Pertahanan Sistem:** Untuk Versi 1 (Prototaip), fokus utama adalah kelajuan pembangunan (*Rapid Prototyping*) dan *Market Validation*. Vanilla JS dengan pendekatan fungsian serba lengkap memadai untuk mengesahkan aliran pengguna dan logik bisnes sebelum berhijrah ke arsitektur *Component-based* pada fasa seterusnya.

### B. Keselamatan Pengesahan Pentadbir (Admin Auth Security)
*   **Isu:** Pentadbir log masuk secara semakan langsung ke pangkalan data (`users` table) tanpa menggunakan Supabase Auth yang sepenuhnya.
*   **Pertahanan Sistem:** Golongan 'Admin' sangat terhad (2-3 orang). Jadual kawalan dilindungi oleh Polisi Keselamatan Peringkat Barisan (Row-Level Security - RLS) di mana tetamu (*anon*) tidak mempunyai kebenaran untuk menulis/membaca data secara rambang. Walau bagaimanapun, penyatuan dengan JWT Supabase Auth disenaraikan dalam *Future Enhancements*.

### C. Prestasi Pemautan Aset (Performance & Lazy Loading)
*   **Isu:** Memuatkan elemen CDN Tailwind, GSAP, dan aset media resolusi tinggi berpotensi menjejaskan Web Vitals.
*   **Tindakan Semasa:** Pengoptimuman muatan lambat atribut `loading="lazy"` telah ditambah pada majoriti imej bersaiz besar untuk mengelakkan beban paparan serentak. Aset video kritikal masih bersandar kepada *caching browser*.

### D. Mengurus Ralat dan Henti Tugas (Error Handling Fallback)
*   **Isu:** Kebergantungan tinggi terhadap pelayan pihak ketiga (Gemini AI dan Supabase API).
*   **Pertahanan Sistem (Selesai):** Pendekatan *Graceful Degradation* diwujudkan, contohnya pada fungsi Sifu AI yang akan menangkap ralat (`try-catch`) terlebih muatan API dan memaparkan fallback paparan mesra ("Sifu sedang berehat sebentar") tanpa merosakkan fungsi UI/DOM halaman. 

### E. Skalabiliti Pangkalan Data (Database Delete Anomalies)
*   **Isu:** Memadam profil ahli (Pelajar) berisiko meninggalkan "data yatim" (Orphan Data) pada jadual berkaitan (Yuran, Log Kehadiran) jika struktur tidak digabungkan.
*   **Tindakan Semasa (Selesai):** Semua Kekunci Asing (Foreign Keys) antara jadual-jadual di Supabase telah diikat dengan penetapan `ON DELETE CASCADE`. Manipulasi rantaian penghapusan ini memastikan jika susut `Pangkalan A`, maka terbuang automatik nilai berkait di `Pangkalan B`. Pangkalan data ini sah 'bersih teguh'.

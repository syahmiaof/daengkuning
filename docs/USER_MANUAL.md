# PANDUAN PENGOPERASIAN SISTEM (USER MANUAL)

Dokumen ini menyediakan tata-cara dan panduan teknikal bagi pengoperasian sistem dari lensa Pengurus Sistem (Admin) serta Ahli/Pelajar.

## 1. Petunjuk Administrator (Pemilik Sistem)
Ruang kerja Administratif digunakan untuk mentadbir selia rekod rasmi tanpa kompromi maklumat. 

### A. Pengurusan Rekod Ahli (Pendaftaran / Modifikasi)
1. Daripada tab `Laman Utama` klik navigasi `Senarai Ahli` di Bar Sisi Kiri.
2. Paparan rajah pangkalan (Tables) akan melimpahkan data senarai murid. Maklumat dicari menggunakan Enjin "Carian ID/IC Lalai Pintar" di penjuru atas jadual.
3. Untuk mendaftar ahli baharu, klik butang emas **[+ Tambah Ahli]**.
4. Sebuah Tetingkap *(Modal Form)* akan keluar. Masukkan ID Unik Ahli (Cth: DK23A) dan isikan Nombor IC *(pilihan dengan atau tanpa lengkok '-').* Nombor akan diformat secara auto oleh kod *Javascript Pattern Regex*.
5. Tekan butang **Simpan Rekod**. Ahli secara logiknya terus disalurkan ke struktur pangkalan data Supabase dalam masa sekadar 150 milisaat.

### B. Kemaskini Rekod Busana (Gallery/Pakaian Modul)
1. Modul pameran digital busana dikemas kini dengan mencari kotak kemasukan di tab Peringkat Pentadbiran.
2. Setiap kotak gambar dimuatkan secara Grid Glassmorphism. Pembuangan *(deletion)* imej dilakukan dengan menekan butang kecil Merah, yang akan melancarkan kotak pertanyaaan sekuriti (Confirmation Guard Dialog) mengelak salah klik.

### C. Analisis Penyata Yuran Ahli Berstruktur
1. Navigasi menuju halaman pentadbiran invois. Admin boleh menilai status kewangan gelanggang secara pukal.
2. Tukar set "Status" resit daripada 'Menunggu' ke 'Selesai' dengan hanya 1-Klik menggunakan butang penanda Status Tersebut. 

---

## 2. Petunjuk Persekitaran Murid (Student Module)
Tetingkap ini disediakan untuk para persilat/peserta bagi mengakses persekitaran mereka sendiri. Modul ini mempunyai *User Experience* rekaan eksklusif premium.

### A. Log Masuk dan Keselamatan Kata Laluan
1. Melawati URL rasmi cawangan dan menuju ke halaman `Dashboard Pelajar`.
2. Input keselamatan tunggal diperlukan: **ID Kad Pengenalan**. Modul mengesahkan IC berbalas di pangkalan Supabase untuk kebenaran lalu ke profil.

### B. Kad Digital Pengenalan (Waris Emas Profile ID)
1. Tekan butang Menu Tepi ke `Profil & Kad ID`.
2. Halaman ini dibalut oleh kesan efek paralaks persektif *(Perspective Rendered)*. Leretkan tetikus *(cursor)* atau jentik ibu jari anda keatas skrin kad untuk menikmati paparan bayang 3D secara mendalam pada kad berhias corak eksklusif.
3. Jika pelajar ingin mengekstrak kad, tekan **Muat Turun**. Imej tersebut ditangkap rentas skrin oleh modul `html2canvas` lalu ia bertukar ke format *.PNG* tulen di memori telefon murid - sedia diguna pakai untuk tempahan atau rujukan lisan.

### C. Penjejak Matriks Yuran (12-Bulan Laporan Pintar)
1. Kembali ke Dashboard utama untuk akses pautan matriks bulanan di **"Status Yuran Semasa 2026"**. Modul memaparkan Jadual Kelendar Setahun, dengan simbol **Hijau** *(Lunas)*, **Merah** *(Tunggak)*, atau Malap jika bulan masa depan.

---

## 3. Sokongan & Troubleshooting Asas
Sistem direka bagi persekitaran pelayar internet berteraskan moden Chromium (Chrome / Edge / Opera) atau Safari versi 15 keatas. Masalah grafik yang kabur sering berulang jika *hardware acceleration* mati di peranti masing-masing.

- **Kegagalan Data Menyegar:** Tatal *(Refresh)* peranti menekan Ctrl + F5 bagi merehatkan pelayan tunai lokal (Clear Local Cache).
- **Log Masuk Diganggu:** Jika tersangkut di skrin peralihan yang tidak bergerak, ia kemungkinan tiada signal API, semak sokongan data mudah alih serta benarkan pengesahan CORS pelayar sekiranya diperlukan.

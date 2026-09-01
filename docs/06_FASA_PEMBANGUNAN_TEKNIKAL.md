# Bab 6: Fasa Spesifikasi Pembangunan Teknikal

Dokumentasi ini menerangkan cara blok pengekodan dibentukkan serta menyenaraikan servis teknologi pihak ke-3 (Third-Party Services) yang menggerakkan tunjang CMS APDK.

## 6.1 Blok Pengekodan Teras
Keseluruhan sistem direalisasikan menggunakan piawaian **HTML5, TailwindCSS, dan Vanilla JavaScript (ES6)** sepenuhnya tanpa menggunakan *frame-works* berat (seperti React JS atau Angular). 
Tindakan progresif ini mendatangkan kesan yang luarbiasa:
1. **Tiada Pembekuan (*No Build Dependencies*):** Sistem boleh diambil oleh mana-mana pembangun (*developer*) dan di-*edit* terus secara tempatan.
2. **Saiz Mikro:** Projek sangat pantas dimuatnaik ke telefon walau dengan akses talian 3G/Edge, disebabkan ketiadaan serpihan *modules folder*.
3. **Senang Alih (*High Portability*):** Mudah dipindahkan ke pelayan percuma seperti GitHub Pages atau Vercel pada bila-bila masa tanpa ralat terminal yang menjengkelkan. 

## 6.2 Integrasi Modul Eksternal Khusus
*   **Papaparse.js (Pemproses CSV):** Komponen ringkas yang menyedut fail Excel senarai ahli beratus orang, diolah masuk ke dalam bahasa JSON dan dikirim terus ke Supabase DB dalam satu kelipan mata. Kosong peratus masalah lenggak (*No bottlenecking*).
*   **BoxIcons:** Menghias identiti visual menggunakan galeri kon (*icons*) awam yang bebas royalti tanpa melemahkan *bandwidth* pelayar.
*   **SweetAlert / Pengendalian Toast:** Amaran kotak terapung (Notifikasi bayaran berjaya & Ralat login) telah diubah dari peringatan menjengkelkan pelayar *native* ('OK' button standard browser) kepada *Toast Alert* licin yang hilang melepasi awan secara automatik (*Auto drop-fade*).

## 6.3 Pengurusan Kawalan Sistem Pusat (Vercel CI/CD)
Sebagai platform berdaya kilang (*Continuous Deployment*), repositori tempatan terikat rapat dengan perkhidmatan awan **Vercel**. 
Setiap kali pakar pengaturcara siap menulis baris fungsi baru, menekan fail Simpan (*Deploy*), ia mengambil kurang dari 18 saat di udara untuk sistem baru siap terbungkus dan terus berkhidmat (*live*) untuk dipantau kepada lebih ratusan telefon pelawat serentak tanpa memberhentikan operasi sistem sejenak (Zero-Downtime Deployment).

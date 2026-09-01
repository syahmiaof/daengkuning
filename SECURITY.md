# Keselamatan Sistem (Security Architecture) 🛡️

**Projek:** CMS Akademi Persilatan Daeng Kuning (APDK)

Dokumen ini ditulis khas untuk rujukan pihak pentadbir APDK, ahli persatuan, dan pihak awam bagi menerangkan dan membuktikan integriti serta tahap keselamatan aplikasi web ini. Aplikasi Akademi Persilatan Daeng Kuning ini telah dibina menggunakan piawaian keselamatan industri (*industry standards*) terkini yang mematuhi pematuhan perlindungan data berskala tinggi.

---

## 1. Pengesahan Pengguna (Authentication)

Sistem APDK **tidak** pernah menyimpan kata laluan dalam bentuk teks biasa (plain-text). Pengurusan log masuk dikawal sepenuhnya oleh kerangka **Supabase Auth** bergred industri berkonsepkan awan.

*   **Penyulitan Kata Laluan (Password Hashing):** Semua kata laluan diproses melalui algoritma penyulitan pelbagai lapisan (`bcrypt`) yang sangat teguh. Walaupun pangkalan data bocor secara rawak, kata laluan ahli mustahil dapat dibaca oleh mana-mana pakar.
*   **Token JWT (JSON Web Token):** Sesi pengguna diuruskan menggunakan JWT yang ditandatangani dengan rahsia kriptografi dalam pelayan. Token ini selamat digunakan dan menghapuskan keperluan pengurusan kuki lama yang terdedah (*vulnerable*) kepada godaman.
*   **Fungsi Anti 'Brute-Force':** Modul secara terbina memperlahankan dan menolak sebarang cubaan bot automatik yang cuba meneka kata laluan. Jika dikesan godaman pada kadar luar biasa, pelayan secara automatik akan menyekat IP penghantar.

## 2. Kawalan Akses Berasaskan Peranan (RBAC)

Aplikasi mengamalkan prinsip pengasingan profil secara ketat (*Strict Role-Based Access Control*).

*   **Sekatan Antara Muka (UI Blocking):** Seorang pengguna berprofil "Pelajar" tidak akan dipaparkan dan tidak akan berupaya melayari URL pentadbiran. Skrip logik lalai akan melontar terus cubaan menaip URL khas ke halaman log masuk.
*   **Pemisahan Kuasa DB:** Hanya pentadbir (Admins / Superadmin) yang diiktiraf di dalam pangkalan data sahaja dibenarkan memanipulasi maklumat dan melaksanakan tugas kritikal.

## 3. Keselamatan Pangkalan Data (Supabase)

Pangkalan data dibina di atas awam menerusi **Supabase PostgreSQL**, pembekal platform database yang bereputasi tinggi.

*   **Row Level Security (RLS):** Konsep paling kritikal. Data diasingkan terus pada peringkat barisan matriks pangkalan data. Bukannya aplikasi web ini yang menyorokkan maklumat rakan pelatih yang lain daripada pengguna, tetapi tapak pangkalan data berkeras *menolak* untuk memberikan data jika token JWT tidak sepadan dengan ID pemilik asal. Masing-masing mempunyai "bilik kebal" yang terlarang dimasuki sesiapa.

## 4. Perlindungan Lintasan Rangkaian (Network Transit)

Setiap pertukaran bit data ketika layar dibuat daripada aplikasi ke pangkalan data adalah dienkripsi dengan selamat:

*   **HTTPS/TLS 1.3 Terpaksa:** Memandangkan laman ini dihoskan menggunakan servis **Vercel** gred dunia, protokol pertahanan dipaksa kepada standard penguncian tertinggi. Mereka yang melayari halaman menggunakan kemudahan Wi-Fi Awam (*Public Wi-Fi* / Mamak) dilindungi sepenuhnya dari taktik memutar dan menangkap data siber (*Packet Sniffing / Man-In-The-Middle attacks*).
*   **Penyulitan dalam Storan (Encryption At-Rest):** Bukan sahaja sewaktu dihantar data dilindungi, malahan ketika data 'berehat' di pangkalan data Supabase, cakera keras fizikalnya disulitkan dengan penyulitan berkelas tentera **AES-256**.

## 5. Pertahanan Kerentanan Am Penggodam

Web Daeng Kuning mengambil langkah proaktif meneutralkan pelbagai cara godaman klasik dan moden:

*   **Ketahanan XSS (Cross-Site Scripting):** Sistem dirancang untuk menggunakan *DOM parsing* yang reaktif. Segala rantaian teks yang dimasukkan akan ditapis ke entiti murni (*sanitized HTML*) bagi menewaskan fungsi arahan *script payload* haram secara asali.
*   **Ketahanan CSRF (Cross-Site Request Forgery):** Oleh kerana tiada "Cookie Authentication" kuno yang digunakan secara terus, ancaman pemindahan kebenaran (*hijacking cookie*) berjaya dielakkan 100%.

---

Sistem Pengurusan CMS APDK meletakkan privasi ahli dan kestabilan operasi persatuan pada tahap hierarki paling utama tanpa kompromi. 

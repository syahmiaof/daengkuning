# Bab 11: Senibina Teknologi, Alat & Susun Atur Pembangunan (Tech Stack & Tools)

Dokumen ini disediakan khusus bagi menjawab mana-mana pertanyaan penguji, pensyarah, atau pemerhati teknikal yang ingin mengetahui ekosistem (*Core Technologies*) di sebalik pembinaan CMS Akademi Persilatan Daeng Kuning.

---

## 11.1 Tunjang Utama: Persekitaran Berasaskan Keperluan Universiti (The Constraints)

Pemilihan kerangka atau "susun atur" untuk aplikasi ini bukanlah secara semberono. Ia ditentukan secara tepat hasil matlamat untuk melepasi garis panduan projek / tugasan berstruktur (*University Specifications*). 

Sebab utama ekosistem draf ini kelihatan sedikit *"bare-metal"* berikutan syarat khusus tugasan yang mewajibkan keaslian penggunaan **HTML, CSS, dan Vanilla JavaScript**, tanpa pergantungan kepada kerangka (*frameworks*) berat yang memadamkan asas pengekodan asli.

## 11.2 Pecahan Peralatan Sistem Semasa (Current Stack)

### 🖥️ Antaramuka Pengguna (Frontend)
1. **HTML5 Semantik:** Struktur rangka dokumen keseluruhan.
2. **Vanilla JavaScript (ES6+):** Enjin penggerak 100% interaktiviti laman, dari mod tetingkap (*Modal*), hingga mengawal komunikasi API pangkalan data jauh.
3. **TailwindCSS (via Play CDN):** Walaupun ia terhad secara logik kompilasi (*compile-time*), penggunaannya membenarkan prototaip elemen visual siap dengan pantas, responsif pada telefon bimbit dan menepati rekaan moden (*Glassmorphism/Dark Mode*). Semuanya tanpa memecahkan syarat keaslian CSS asas.

### ⚙️ Pelayan Belakang & Pangkalan Data (Backend & DB)
1. **Supabase (PostgreSQL 15):** Pilihan backend moden yang berfungsi sebagai perisian awan pintar (BaaS). Dengan API binaan yang dipanggil langsung oleh JavaScript (*Client-side DB query*), kita memadamkan keperluan menulis pelayan laluan secara fizikal (Node.js/PHP Express). Supabase menguruskan secara bersilang:
   - Pengesahan JWT (*Supabase Auth*).
   - Pengurusan Data Hubungan Keselamatan Tinggi (Postgres Table).
   - Penapis Keselamatan (*Row Level Security*).

### ☁️ Pelayan Siaran Langsung & Alat Integrasi Lain
1. **Vercel Edge Network:** Bertindak sebagai rumah (Hosting/Deployment) yang menawarkan penarikan perisian (*pull-request*) berautomatik dari repo dengan protokol sijil rahsia lalai (HTTPS).
2. **Google Gemini (API LLM):** Otak gergasi bagi modul "Sifu AI" chatbot untuk kepuasan respon pengguna secara autonomi.
3. **PapaParse.js:** Modul halus membaca senarai rekod pendaftaran berbentuk lajur (CSV / Excel).

---

## 11.3 Cadangan Migrasi Skalabiliti Pada Tahap Lanjut (Future Tech Evolution)

Diakui secara nyata, memandangkan saiz perisian semakin mengembang (15+ laman dokumen HTML longgar), kaedah konvensional (Satu laman HTML, Satu Skrip) akan menyebabkan pembaziran pengulangan kod (*code redundancy*) seperti mengekod semula blok `<nav>` dan `<footer>` di 15 fail berbeza. 

Selepas fasa pemarkahan / tugasan (*Assignment phase*) melepasi garisan selesai, berikut adalah peta jalan saranan (*migration roadmap*):

1. **Membalut Semula (*Refactoring*) kepada React.js / Next.js:** 
   Penghijrahan antaramuka kepada Next.js adalah langkah yang paling wajar dipertimbangkan. Next.js membenarkan setiap blok Navigation dan Borang dijadikan Modul Bebas (*Standalone React Component*). Laman akan bertindak dengan kelajuan seribu kali lebih responsif secara *Single Page Application Server-Side Rendered (SSR)*.
   
2. **Beralih kepada Prisma ORM atau Backend Node.js:**
   Supabase adalah kebal. Namun amalan menghantar kod pangkalan data (Query API) terus dari sisi Pelayar Pelanggan (*Client-side JavaScript*) tidak disarankan jika projek melibatkan pemotongan perbankan wang (Transaction Hooks). Sebuah Middleware API Backend khas seperti *Nest.js* atau *Express Node.js* perlu dibina agar pangkalan Supabase diakses menerusi jalinan Pelayan-ke-Pelayan (Server-to-Server).

3. **Meninggalkan Tailwind Play CDN:** 
   Tuntutan prestasi industri wajib menggunakan sistem susunan Vite/Webpack untuk menjadikan saiz pengeluaran css CSS serendah 5KB berbanding teknik *on-the-fly execution* semasa.

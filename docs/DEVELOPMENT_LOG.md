# LOG PEMBANGUNAN SISTEM (DEVELOPMENT LOG)

Dokumen ini merekodkan fasa-fasa teknikal sepanjang kitaran hayat pembangunan (SDLC) skrip dan antaramuka sistem CMS Akademi Persilatan Daeng Kuning.

## FASA 1: Asas Pembangunan & Identiti (Foundation)
**Fokus utama:** Pembinaan paksi visual dan tetapan struktur global.
- Diimplementasikan persekitaran kerangka Tailwind CSS secara dalaman di dalam fail HTML melalui skrip arahan berpusat.
- Mewujudkan "Brand Identity" melalui pendaftaran variabel warna global di struktur konfigurasi Tailwind: 
  ```javascript
  colors: {
      gold: { DEFAULT: '#D4AF37', dark: '#B8860B' },
      charcoal: '#111111'
  }
  ```
- Penyediaan visual pemuatan (loading visual) pertama menggunakan logo rasmi pertubuhan berformat *.PNG* telus bagi membentuk reka letak antaramuka yang meyakinkan sebelum komponen sistem dipaparkan.

## FASA 2: Integrasi Interaksi UX Moden (Interaction)
**Fokus utama:** Meniup 'nyawa' pada sistem interaksi pengguna.
- Penyepaduan enjin **GSAP + ScrollTrigger** digunakan pada modul Landing Page. Tatalan halaman dipacu skrip animasi di mana kad-kad informasi dan tipografi utama muncul dari bawah (fade-in-up) secara responsif.
- Membina simulasi statistik "Running Numbers" pada ruang "Dashboard Admin" menggunakan fungsi perulangan gelung `Math.ceil()` yang membaca bilangan ahli secara *live* dari pangkalan data Supabase lalu dirender dengan efek nombor bergolek ke siling (counter upwards).

## FASA 3: Pembangunan Aset Imersif (Immersive Assets)
**Fokus utama:** Mengintegrasikan imersif elemen WebGL dan fungsi interaktif galeri.
- Ruang Galeri dibina berasaskan elemen *Masonry Grid Layout* dengan struktur "Shared-Element" di mana apabila imej bersaiz kecil diklik, skrin akan menggelap dan imej membesar ke hadapan secara pantas tanpa muat semula tab (Lightbox module).
- Eksperimen awalan bersama **Three.js 3D Keris Viewer**. Elemen Canvas dipaut pada komponen utama DOM lalu satu skrip WebGL dibenihankan. Rendering pencahayaan *AmbientLight* berserta tekstur *reflection* memodelkan objek 3D senjata tradisional agar boleh diputarkan dengan kawalan tetikus.

## FASA 4: Pangkalan Data, Awan & Keselamatan (Database & Cloud)
**Fokus utama:** Seni bina Supabase dan konfigurasi API.
- Persediaan arkitektur backend secara *Client-Side JS*. Mengkonfigurasi fail `js/config.js` untuk mencipta klien sambungan (Supabase Client):
  ```javascript
  const supabaseUrl = 'YOUR_SUPABASE_URL';
  const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  ```
- Perlindungan berganda diaplikasikan pada setiap persekitaran peribadi (Admin/Ahli) menerusi perintang skrip sebelum DOM dimuat. Skrip memeriksa pembolehubah localStorage untuk kunci pengesahan `userSession`.
- Pendekatan perlindungan Row Level Security (RLS) diaktifkan ke atas jadual ahli bagi memastikan maklumat anggota tidak boleh dicapai oleh pelawat tanpa token keselamatan *(JWT tokens parameter)*.

## FASA 5: Modul Produk dan Semakan Pantas (Product & Identity)
**Fokus utama:** Modul pentadbiran teras yang lengkap.
- Menginovasikan paparan Busana Showcase menggunakan konsep grid berasaskan reka bentuk *Glassmorphism*. Admin diberi fasiliti untuk tambah, edit, atau padam entri.
- Fungsi **Kad ID Digital "Waris Emas" 3D**. Kad ini dijana secara automatik dengan data dinamik spesifik mengikut murid (Nama, Bengkung, QR Code). Ciri transformasi CSS3 (persektif 3D) membolehkan kad dipusing di udara semasa krusor dilewatinya. Fungsi cetak ke dalam fail Imej (Download capability) dibangunkan menggunakan logik sokongan canvas API bagi memudahkan Ahli menyimpan Kad secara logikal dan nyata di dalam peranti mudah alih masing-masing.

## FASA 6: Model Bahasa Terbina "Sifu AI" (Generative AI Integration)
**Fokus utama:** Sistem Interaktif Penguatkuasaan Identiti Silat.
- Penjelmaan fungsi Asisten AI dalam Dashboard Pelajar yang dikuasakan oleh **Gemini 1.5 Flash**. AI dipertanggungjawabkan untuk membantu membedah maklumat silibus persilatan Daeng Kuning.
- Mengimplementasi **Vercel Serverless Functions** (`/api/chat.js`) sebagai tembok penampan (Proxy) bagi mengelakkan Kunci Rahsia API Gemini (`process.env.GEMINI_API_KEY`) terekspos secara bebas ke klien.
- Teknik aliran *System Prompting* rahsia ditanam sedalamnya supaya entiti Sifu AI menolak borak kosong atau topik pengajian akademik lantas mengekalkan ketulenan jawapan berkisar motivasi pendekar dan teras pertubuhan, bersama animasi seruan tulisan pelbagai (*chunked stream encoding*).

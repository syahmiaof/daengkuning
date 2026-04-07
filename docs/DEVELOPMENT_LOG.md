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
- Penjelmaan fungsi Asisten AI berasaskan model terbaharu **Gemini 2.5 Flash**, diperkasa dengan Fakta Pengetahuan (Knowledge Base) eksklusif berkaitan silibus persilatan, hierarki kepimpinan (Guru Utama, Ketua Jurulatih, Srikandi), susunan bengkung, dan sejarah Akademi Persilatan Daeng Kuning.
- Penstrukturan modular kod ke dalam skrip tunggal (`js/chatbot.js`) yang bertindak sebagai *Global Injector*, menterjemahkan Sifu AI secara terus ke kesemua helaian antaramuka awam (Landing Page, Galeri, Koleksi) tanpa mengganggu struktur HTML sedia ada.
- Mengimplementasi **Vercel Serverless Functions** (`/api/chat.js`) sebagai tembok penampan (Proxy) bagi memastikan kesinambungan kunci rahsia API (API Key) dalam awan. Turut disertakan penapis *Error Handling* elegan yang berupaya meredam secara dinamik ralat *429 Too Many Requests* daripada Google sekiranya mencapai had kitaran maksimum.

## FASA 7: Pengujian Sistem & Penetapan Bug Kritikal (Testing & Bug Hotfixes)
**Fokus utama:** Fasa QA (Quality Assurance) menyeluruh sebelum pelepasan awam kepada pengguna sebenar.

### 7.1 — Bug Fix: Forgot Password Redirect (localhost → Production)
- **Isu Dikesan:** Pautan *reset password* yang dihantar melalui emel Supabase menghala ke `localhost:3000` — iaitu persekitaran pembangunan tempatan — sebaliknya daripada URL produksi sebenar. Ini menyebabkan pautan gagal dibuka pada peranti telefon pintar pengguna.
- **Punca Akar:** Tetapan `Site URL` dan `Redirect URLs` dalam papan pemuka Supabase masih mengandungi nilai asal semasa pembangunan (`http://localhost:3000`).
- **Pembaikan:** Nilai konfigurasi URL dikemaskini dalam **Supabase → Authentication → URL Configuration**:
  - `Site URL` → `https://silatdaengkuning.vercel.app`
  - `Redirect URL` → `https://silatdaengkuning.vercel.app/reset-password.html`
- URL *redirect* dalam `js/auth.js` turut ditukar kepada nilai tetap (*hardcoded*) bagi mengelakkan ralat *dynamic path construction* pada platform produksi.

### 7.2 — Bug Fix: `supabaseClient is not defined` di reset-password.html
- **Isu Dikesan:** Halaman `reset-password.html` memuat naik `js/config.js` sahaja, sedangkan objek `supabaseClient` sebenarnya diinstansikan di dalam `js/database.js`. Ini menyebabkan ralat `supabaseClient is not defined` apabila pengguna cuba mengemukakan kata laluan baharu.
- **Punca Akar:** Ketidakselarasan kebergantungan skrip (*script dependency mismatch*) antara fail HTML dan modul JavaScript.
- **Pembaikan:** Menambah tag `<script src="js/database.js">` ke dalam `reset-password.html` dan menukar mekanisme pemprosesan token pemulihan daripada *IIFE* terus kepada *DOMContentLoaded event listener* bagi memastikan semua skrip pra-dimuatkan sebelum logik auth dijalankan.

### 7.3 — Bug Fix: Token Pemulihan Supabase Tidak Diproses
- **Isu Dikesan:** Apabila pengguna mengklik pautan reset dalam emel, Supabase menambah token dalam bentuk *URL hash fragment* (`#access_token=...&type=recovery`). Halaman `reset-password.html` sebelum ini tidak memproses *hash* ini langsung, menyebabkan sesi pemulihan tidak dapat ditubuhkan.
- **Pembaikan:** Kod JavaScript baharu ditambah untuk mengekstrak `access_token` dan `refresh_token` daripada *URL hash*, kemudian memanggil `supabaseClient.auth.setSession()` bagi menubuhkan sesi pemulihan yang sah sebelum membenarkan pengguna menetapkan kata laluan baharu.

### 7.4 — Integrasi SMTP Tersuai via Resend.com
- **Isu Dikesan:** Had kadar penghantaran emel Supabase peringkat percuma adalah **2 emel/jam**, mengganggu aliran kerja pendaftaran dan pemulihan kata laluan semasa fasa pengujian intensif.
- **Penyelesaian:** Mengkonfigurasi penyedia SMTP tersuai **Resend** (percuma sehingga 3,000 emel/bulan) dalam tetapan **Supabase → Authentication → SMTP Settings**.
  - **Host:** `smtp.resend.com` | **Port:** `465`
  - **Username:** `resend`
  - **Sender:** `onboarding@resend.dev`
  - *API Key disimpan dengan selamat dalam konfigurasi awan Supabase — tidak didedahkan dalam repositori kod.*
- Selepas integrasi, had penghantaran emel dinaikkan kepada **30 emel/jam**, mencukupi untuk fasa pengujian dan operasi produksi skala akademi.


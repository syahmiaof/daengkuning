# PENGURUSAN PROJEK & RISIKO (PROJECT MANAGEMENT)

Perancangan projek ini dirujuk selaras dengan metodologi akademik **Sistem Kitaran Hayat Pembangunan Agile** untuk pembangunan yang bersifat responsif terhadap pindaan fungsi secara iteratif, digabungkan pula dengan takwim jangka masa selama 12 Minggu.

## 1. Jadual Tempoh Kemajuan Carta Gantt (Gantt Chart 12-Week)

| Tugasan Pembangunan / Masa (Minggu) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Fasa Mula: Analisis Keperluan (Requirements)** | 🟩 | 🟩 | | | | | | | | | | |
| Perolehan kehendak pengurusan, spesifikasi ERD | 🟩 | 🟩 | | | | | | | | | | |
| **Fasa Rekaan: UI/UX "Jewelry-Dojo" Design** | | | 🟦 | 🟦 | | | | | | | | |
| Mockup struktur aplikasi dan palet warna sasar | | | 🟦 | 🟦 | | | | | | | | |
| **Fasa Kerangka: Frontend Prototyping (Tailwind)** | | | | | 🟨 | 🟨 | | | | | | |
| Rantaian menu DOM, konfigurasi GSAP. | | | | | 🟨 | 🟨 | | | | | | |
| **Fasa Enjin: Backend Integration (Supabase)** | | | | | | | 🟧 | 🟧 | | | | |
| Integrasi pangkalan JS ke pangkalan Supabase. | | | | | | | 🟧 | 🟧 | | | | |
| **Fasa Kompleksiti: Advanced Visual Features** | | | | | | | | | 🟪 | 🟪 | | |
| Objek 3D & Kad Profil "Waris Emas" Digital, Matriks Yuran 12 Bulan | | | | | | | | | 🟪 | 🟪 | | |
| **Fasa Sekuriti & Pelancaran (Testing & Deployment)** | | | | | | | | | | | 🟥 | 🟥 |
| Penilaian (Testing), Vercel CI/CD Setup, Custom Domain | | | | | | | | | | | 🟥 | 🟥 |

*(Paksi Warna mewakili Fasa Pengukuran yang Ditepati mengikut masa)*.

## 2. Analisis & Penilaian Risiko (Risk Assessment)

Di bawah setiap produk sistem gred tinggi, kawalan risiko diramalkan agar kegagalan sistem dapat ditangani pada mod insiden terburuk (Worst-case scenarios):

### Risiko 1: Prestasi Visual Paparan pada Peranti Lemah (Low-end Devices)
**Tafdiran Konflik:** Visual animasi melampau seperti manipulasi DOM secara masif (ScrollTrigger GSAP, Render Objek Maya Three.js) membebankan pemprosesan kad grafik di telefon lama lalu aplikasi boleh tersekat *lagging*.
**Mitigasi (Langkah Penyelesaian):**  
- Mematikan animasi atau meminimumkan kiraan render 3D menggunakan konfigurasi `requestAnimationFrame` dan tetapan "Fallback".
- Gambar yang dipamer digunakan format termampat (.webp).

### Risiko 2: Ketirisan Keselamatan & Logika Tenteran Sesi DB
**Tatsiran Konflik:** Penggunaan Javascript berpusat (*Client-side rendering*) membuka kerentanan token capaian jika diteliti melalui *Browser Inspector Elements*.
**Mitigasi (Langkah Penyelesaian):**  
- Perlindungan berganda: Polisi pengesanan had pelayar (*Session Check*) digunakan sebelum badan laman dibaca. Parameter pangkalan data Supabase dipecahkan melalui Environment Variables rahsia tatkala sistem di-*build* ke persekitaran Vercel dan polisi RLS dikalibrasi pada *mode Strict* untuk mengekang penggodaman suntikan SQL (SQL-Injection via Client Headers).

# Bab 5: Pengujian Lari Maklumat & Keselamatan Sistem (UAT & Security)

## 5.1 Perimeter Pelaksanaan Keselamatan (Security Implementation)
Sistem CMS APDK telah melalui sate simulasi *User Acceptance Testing (UAT)* untuk memastikan setiap lohong dipateri kemas. Senario yang dipertaruhkan membuktikan ketahanan sistem di peringkat gred bank.

### Penyulitan Kata Laluan (*Hashing*)
- **Amalan Lapuk:** Dahulu kata laluan "ayam123" akan dibaca oleh sesiapa pangkalan data sebagai "ayam123".
- **Realiti APDK:** Supabase enjin Auth mengambil, menyiram *salt algorithms*, dan menyimpannya sebagai `$2a$x0R...` ke dalam *table*. Tiada siapa yang tahu.

### Protokol Perlindungan Pengangkutan (Vercel)
Semua alamat API backend ditambat pada protokol HTTPS-SSL TSL 1.3 menerusi integrasi automatik **Vercel Edge Network**. Kelebihan terbesar: jika pengunjung menyambung internet di stesen bas atau kedai mamak (Risiko Packet Sniffing/Wi-Fi Intercepting), tiada siapa mampu memintas lalu lintas maklumat Sulit pesilat kita ke tapak Supabase.

### Kawalan Pemintasan Log Masuk (RBAC)
Sekiranya sistem mendapati 'CIP Akses JWT' seorang pesilat cuba mengakses `admin-dashboard.html`, program akan melontarkannya terus keluar ke ruang pagar utama dengan pantas (Pengecualian Skrip Serpihan - *Snippet Interception*).

## 5.2 Perlindungan Lanjurtan Pangkalan Data (Row Level Security - RLS)

Sistem menggunakan RLS untuk menjadikan "setiap bilik pesilat berkunci secara maya".
Dalam bahasa mudahnya: "Pangkalan data fizikal menolak secara mentah-mentah jika ID JWT A, mencuba untuk melihat invois yuran bagi ID B." Walaupun anda menembak peluru skrip secara paksa (*injection*), pangkalan data enjin akan menutup akses terus-menerus.

## 5.3 Daya Tahan Suntikan (Cross-Site Scripting - XSS)
Aplikasi CMS menepis arahan HTML liar yang boleh diisi di borang hubungan atau mana-mana tempat menaip. Skrip luar ini akan dihancurkan menjadi simbol tak berbahasa (*Sanitized string block*), menafikan cubaan memancing info dari admin (*Phishing injections*).

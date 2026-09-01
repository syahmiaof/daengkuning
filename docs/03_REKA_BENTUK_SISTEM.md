# Bab 3: Reka Bentuk Sistem & Antara Muka Pengguna (UI/UX)

## 3.1 Falsafah Reka Bentuk Visual
Identiti visual web CMS Akademi Persilatan Daeng Kuning mementingkan 3 unsur utama yang harus seiring dengan imej warisan persilatan tapi tanpa mengorbankan tahap moden teknologi IT:
- **Kemegahan & Warisan:** Identiti persilatan nusantara divisualisasikan melalui tona korporat emas premium (`#D4AF37`) & tona tembaga gangsa yang diselitkan dalam butang, latar garisan dan tipografi.
- **Kesungguhan & Fokus:** Menggunakan dasar reka bentuk *Dark Mode* penuh (`#0f0f0f` sehingga hitam legap) untuk menimbulkan persekitaran yang padu, elegan, berlawanan dengan tona terang (putih/klinikal) biasa.
- **Selesa & Intuitif (UX):** Walaupun ia tampak moden dengan palet warna epik, elemen-elemen fungsi harian (seperti jadual, input borang) menggunakan susun atur kotak kad (Card Layouts) nipis dengan lapisan kekaburan transparan (Glassmorphism & blur effects). Pengguna yang tua atau muda tidak akan keliru mencari butang 'Simpan' atau 'Log Masuk'.

## 3.2 Pemilihan Tipografi
Kita membiarkan muka taip (*fonts*) kekal bersih menggunakan pelayan *Google Fonts*:
- **Inter (Sans-Serif):** Dipilih khas untuk memudahkan proses bacaan data angka (Kewangan / Resit) serta memanjangkan ketahanan mata (*eye-strain relief*) untuk pentadbir.
- Pembesaran dan penekanan dilakukan menggunakan *font-weight* dan transisi skala tumpuan (*hover grow*).

## 3.3 Struktur Peta Navigasi Awam (Sitemap)
Bagi pengguna luar (Bukan Ahli), mereka boleh menyelusuri pautan terbuka seperti:
- **Halaman Teras:** Tapak Utama (`index.html`) sebagai etalase maya.
- **Identiti:** Sejarah (`about.html`), Warisan Pemakaian & Senjata (`warisan.html`).
- **Media Acara:** Pengalaman tontonan berskala penuh (`gallery.html`) dan Muzium maya (`koleksi.html`).
- **Hubungan & Gelanggang:** Rujukan lokasi (`contact.html`).

## 3.4 Papan Pemuka Khusus (Internal Dashboards)
**Untuk Ahli / Pesilat:**
- Berpusat di `dashboard-student.html` memberi bacaan analitik mudah (Bilangan bayaran sukses, tunggakan bil). Akses profil dan memuatnaik bukti resit bank peribadi di tab tertutup.
  
**Untuk Admin:**
- Rupa papan utama `dashboard-admin.html` sengaja dipadankan dengan *Side Navigation Menu* (Sebelah kiri skrin gaya *Drawer*) berbeza dengan ahli, membawa erti ruang kontrol yang memberi gambaran lebih autoriti.
- Rekaan jadual menggunakan cermin lebar melintang yang kalis selirat.

## 3.5 Interaktiviti Micro (Micro-Animations)
Demi memberi nafas *alive* atau denyut maya yang meyakinkan:
- Menambah sistem pesanan pemuat turun animasi pusing (*Spinner loading*).
- Transisi kad di laman awam secara dinamik yang terapung 2 darjah apabila disentuh kursor.
- Modul pemberitahuan kecemasan (*toast notification*) pantas di bucu skrin berbanding pemberitahuan pelayar asal (*native alert*) yang nampak amatur dan menyakitkan mata.

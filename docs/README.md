# PROJEK CMS AKADEMI PERSILATAN DAENG KUNING
## DOKUMEN 1: RINGKASAN PROJEK (PROJECT OVERVIEW)

### 1.1 Pengenalan Sistem
Sistem Pengurusan Kandungan (CMS) Akademi Persilatan Daeng Kuning merupakan sebuah platform web bersepadu yang dibangunkan khusus untuk mengurus data pentadbiran ahli, merekod kutipan yuran bulanan, serta menyediakan portal awam yang interaktif untuk ahli pesilat. Sistem ini direka bentuk bagi menggantikan kaedah pengurusan manual ke arah digitalisasi yang efisien. Di samping memfokuskan kepada kefungsian asas pangkalan data, antaramuka sistem ini telah melalui fasa rekayasa UI/UX yang komprehensif bagi memastikan ia menepati piawaian akademik dan spesifikasi industri web moden.

### 1.2 Falsafah Reka Bentuk 'Jewelry-Dojo' (Dark & Gold)
Reka bentuk antaramuka dipacu oleh falsafah "Jewelry-Dojo", iaitu gabungan estetika seni pertahanan diri tradisional yang agresif (elemen warna *Charcoal/Black*) dan nilai prestij yang eksklusif (elemen warna *Gold/Kuningan*). 

Konsep warna ini merangkumi:
- **Latar Belakang (Background):** Paduan tona gelap `bg-[#0a0a0a]` dan `#111111` bagi mencipta ruang kelam dan eksklusif.
- **Tipografi:** Penggunaan fon rasmi *Playfair Display* (Serif) pada setiap tajuk utama dan *Inter* (Sans-serif) untuk teks isi bagi mewujudkan hierarki bacaan berstatus premium.
- **Aksen Visual:** Pengaplikasian gaya *Glassmorphism* (panel kaca separa jernih) dan *CSS Gradients* pada butang serta teks untuk menaikkan suasana mewah dan dinamik.

### 1.3 Asas Teknologi (Technology Stack)
Infrastruktur CMS Akademi Persilatan Daeng Kuning dibangunkan menerusi seni bina moden tanpa pelayan *(Serverless Architecture)*, menggunakan pengasingan logik *Frontend* terbina dan *Backend-as-a-Service*:

#### A. Pembangunan Bahagian Hadapan (Frontend)
- **Teraju Utama:** HTML5, Vanilla JavaScript.
- **Rangka Kerja CSS:** **Tailwind CSS** (CDN Implementation) membolehkan ciptaan kelas utiliti dengan pantas dan pengurusan paparan responsif secara *Mobile-First Design*.
- **Enjin Animasi:** **GSAP (GreenSock Animation Platform)** bertindak untuk penganimasian tatalan dinamik (*scroll animations*) dan kotak kemunculan timbul (*pop-outs*).
- **Enjin 3-Dimensi:** **Three.js** dioptimumkan untuk me-render peragaan objek 3D *(contoh: visual senjata Keris/elemen grafik)* secara real-time menerusi pelayar web tanpa bantuan pemalam luaran (plugin).

#### B. Pengurusan Pangkalan Data & Keselamatan (Backend)
- **Pelayan Web & ID:** **Supabase (PostgreSQL)** dipilih sebagai teras pangkalan data. Seni bina berasaskan infrastruktur awan (Cloud) ini menyediakan kelajuan capaian melalui GraphQL/REST API.
- **Autentikasi (Auth):** Menggunakan Supabase Authentication yang dipadukan bersama sistem sesi simpanan (*Local Storage Session*) untuk memastikan tahap keselamatan berganda. Polisi tahap baris *(Row Level Security - RLS)* dikuatkuasakan di atas setiap jadual pangkalan data.

#### C. Proses Penerbitan & Mengehos (Deployment)
- **Pelayan Awan (Hosting):** Aplikasi ini diterbitkan melalui **Vercel**, sebuah pelayan awan persekitaran web terkini yang menawarkan CDN bertaraf global secara tersedia untuk pemuatan statik pantas (ultra-fast static loading).

### 1.4 Strategi URL Profesional (Custom Domain Strategy)
Bagi memberi impresi digital yang sah, platform ini pada mulanya dihoskan melalui `silatdaengkuning.vercel.app`. Walaubagaimanapun, selaras dengan keperluan penjenamaan komersil, persediaan CNAME dan rekod DNS telah dirancang di mana domain Vercel ini dipetakan secara sambungan terus ke domain rasmi top-level (**TLD**) berbayar seperti `.com.my` atau `.my` (contoh: *daengkuning.com.my*). Pertukaran ini dikonfigurasi melalui papan pemuka Vercel di bahagian penjanaan sub-domain dan *SSL/TLS Certificate* automatik daripada Let's Encrypts diterbitkan bagi menjamin kelancaran HTTPS yang selamat sepanjang sesi.

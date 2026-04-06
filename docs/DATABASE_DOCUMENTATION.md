# DOKUMENTASI PANGKALAN DATA & KESELAMATAN (DATABASE DOCUMENTATION)

Keutuhan CMS Akademi Persilatan Daeng Kuning didasarkan kepada sokongan perkhidmatan PostgreSQL (Supabase) berasaskan spesifikasi normalisasi yang moden, pantas, dan selamat.

## 1. Peta Rajah Hubungan Entiti (Textual ERD)

Jadual asas dan hubungan di dalam Supabase dipetakan dengan kardinaliti (keterikatan data) bagi memastikan pengurusan memori terkawal.

```text
+-------------------+       +-------------------+       +--------------------+
|       users       |       |       ahli        |       |       yuran        |
+-------------------+       +-------------------+       +--------------------+
| - id (UUID) [PK]  |1     1| - id_ahli [PK]    |1     M| - id_yuran [PK]    |
| - role            |------>| - ic (UNIQUE)     |------>| - id_ahli [FK]     |
| - created_at      |       | - nama            |       | - bulan            |
+-------------------+       | - bengkung        |       | - tahun            |
                            | - gelanggang      |       | - amaun            |
                            +-------------------+       | - status           |
                                      |                 +--------------------+
                                      |1
                                      |
                                      v M
                            +-------------------+
                            |  notis_interaksi  |
                            +-------------------+
                            | - id_notis [PK]   |
                            | - id_ahli [FK]    |
                            | - is_read         |
                            | - is_liked        |
                            +-------------------+
```

## 2. Definisi Skema (Schema Definitions)

Berikut adalah takrifan struktur utama (Primary Tables) di dalam Supabase DB:

### 2.1 Jadual: Ahli (Profil Murid/Student)
| Nama Lajur (Column) | Jenis Data (Type) | Atribut | Keterangan |
| :--- | :--- | :--- | :--- |
| `id_ahli` | `VARCHAR(20)` | PRIMARY KEY | Cth: DK001, DK002. Dijana berturutan oleh Admin. |
| `ic` | `VARCHAR(15)` | UNIQUE | Nombor kad pengenalan (12 digit rawak). |
| `nama` | `TEXT` | NOT NULL | Nama rasmi yang akan muncul pada Sijil/Kad Digital. |
| `no_tel` | `VARCHAR(20)` | NOT NULL | Nombor pendaftaran Whatsapp rasmi untuk resit pintar. |
| `bengkung` | `TEXT` | NOT NULL | Jenis dan aras tingkat (Contoh: Pelangi Hitam...). |
| `gelanggang` | `TEXT` | NOT NULL | Lokasi gelanggang / Daerah pecahan kem latihan. |

### 2.2 Jadual: Yuran (Transasksi Transisi)
| Nama Lajur (Column) | Jenis Data (Type) | Atribut | Keterangan |
| :--- | :--- | :--- | :--- |
| `id_yuran` | `BIGINT` | PRIMARY KEY, AUTO_INCREMENT | Auto penjanaan bagi resit berformat rawak. |
| `id_ahli` | `VARCHAR(20)` | FOREIGN KEY | ID Pelajar yang dirujuk ke jadual Ahli. |
| `bulan` | `VARCHAR(2)` | NOT NULL | Digunakan dalam penjejak 12-bulan (Cth: "03" untuk Mac). |
| `tahun` | `VARCHAR(4)` | NOT NULL | Tempoh fiskal bagi penjejak yuran masa nyata. |
| `status` | `VARCHAR(50)` | NOT NULL | Parameter terhad: "Selesai", "Tertunggak", "Menunggu". |

## 3. Protokol Keselamatan Aras Talian (Row Level Security - RLS)

Demi mematuhi piawaian Data Perlindungan Peribadi (PDPA), jadual pangkalan data diawasi menggunakan pemangkas (firewall) dasar RLS Supabase:

1. **Jadual `ahli`:**
   - **SELECT (Read-Only Publik):** Pengguna awam yang log masuk sebagai tetamu *(anon/guest)* terhalang dari mengakses info melainkan identiti penapis (filter) padan. Skema `eq("ic", ic_number)` pada API JavaScript digunakan dan diluluskan hanya jika status pendaftaran dipanggil dari papan pemuka.
   - **INSERT/UPDATE/DELETE (Admin Only):** Melalui polisi "Enable insert for role Superadmin/Admin", semua proses perubahan rekod akan disekat oleh RLS (Penyata: error 403 Forbidden Error) jika token operasi tidak memiliki pengesahan darjat kawalan yang mencukupi.

2. **Jadual `yuran`:**
   - Permintaan API dilengkapkan dengan penapisan RLS di mana pelajar hanya dibenarkan membaca rentetan `yuran` milik dirinya bersandarkan ID sesi (*`auth.uid` comparison equivalent logic using JS local session proxy*).
   - Manipulasi parameter status "Selesai / Tertunggak / Gagal" dikeraskan secara absolut—iaitu hanya pemilik kunci API persendirian (Admin portal) sahaja dibenarkan menyunting *(update)*.

# Bab 8: Anggaran Kos Komersial & Operasi

Satu kegusaran utama bagi mana-mana badan bukan kerajaan (Pertubuhan Silat) dalam mendigitalisasi struktur persatuan adalah dari segi bajet.
Arkitektur CMS Daeng Kuning (APDK) memecahkan kebuntuan "Kos IT Itu Mahal" dengan menggunakan konsep pengehosan Teragih Maya (Cloud Serverless). Sistem kita secara harmoni mengutip pelbagai geran teknologi percuma korporat (*Generous Free-Tiers*).

## 8.1 Strategi RM0 (Permulaan - Sehingga 1,200 Pesilat Aktif)
Pada fasa Teras, pengerusi *TIDAK PERLU MEMBAYAR 1 SEN PUN* secara teknikal bagi kos operasi pelayan untuk memaparkan data di dalam aplikasi.
Berdasarkan kiraan beban pemprosesan:
- **Pelayan Web Hosting Vercel (Front-end):** Kuota percuma menyokong *100 Gigabyte Bandwidth* (Mampu menampung kira-kira 50,000 klik muatan skrin setiap bulan). Kos bulanan: **RM 0**.
- **Backend Pangkalan Data Supabase:** Menyediakan sokongan untuk had pangkalan 500 MB saiz data, serta pelayan teras 2 terabyte *bandwidth*. Untuk data ringkas seperti Borang Pelajar dan Nombor Resit, 500 MB memuatkan jutaan data tanpa halangan. Kos bulanan: **RM 0**.
- **Google Gemini AI API (Sifu Model):** Terbenam dalam pakej pemaju. Google Gemini membenarkan panggilan kuota sehingga 50 tanyaan setiap minit tanpa cukai bayaran untuk fasa rintis. Kos bulanan: **RM 0**.

> *Pengecualian Kos: Namun begitu, APDK dicadangkan untuk membeli **Nama Domain (URL web.com)** sendiri yang berharga di antara RM 40 - RM 60 ringgit / tahun, bagi menunjukkan kredibiliti komersial berbanding menggunakan URL subdomain `silatdaengkuning.vercel.app`.*

## 8.2 Ramalan (*Forecast*) Sekiranya Dinaik-taraf Modul Skala Besar (Enterprise-Tier)
Kemampanan merupakan isu masa depan. Anggaplah Daeng Kuning berkembang ke seluruh cawangan kebangsaan dan mempunyai 10,000 pesilat yang muatnaik dokumen gambar bertebaran. Waktu ini kos berbayar bermula, tetapi nilainya sangat kecil berbanding kemampuan persatuan.

Skala Premium (Anggaran):
- **Supabase Pro Database Plan:** ~$25 / Bulan (RM115.00/bulan) untuk had 100,000 pendaftaran pelawat pelayan (Auth) serentak berserta *8GB storan imej resit bulanan*. Kestabilan tanpa henti.
- **Vercel Pro CDN Deploy:** ~$20 / Bulan (RM90.00/bulan). Pelayan pemacu dengan liputan kebolehpercayaan awan sehingga 1000GB data grafik ditarik tanpa cacat.

**Konklusi Keseluruhan Kos:** Arkitektur web moden ini menjimatkan Persatuan sehingga RM10,000 / tahun jika dibandingkan dengan menyewa agensi perisian membelikan komputer pangkalan *dedicated server fizikal* model lama di ofis pertubuhan.

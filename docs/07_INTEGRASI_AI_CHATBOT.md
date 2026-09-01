# Bab 7: Integrasi Modul Generatif AI (Chatbot SIFU)

Keunggulan sistem CMS Daeng Kuning tidak terhenti pada papan pemuka rekod semata-mata, malah turut dilengkapi **Kecerdasan Buatan (Artificial Intelligence)** menerusi enjin Google Gemini 1.5. Ia dimanifestasikan melalui "Sifu AI"—pembantu real-sentient yang ditugaskan khusus menjawab pertanyaan ahli secara masa nyata (*real-time*).

## 7.1 Mengapa Kita Memerlukan Sifu AI?
Mengurus 1,000+ ahli yang mendaftar sering mendatangkan limpahan soalan generik (FAQ) tidak kritikal ke telefon Cikgu Silat dan Bendahari seperti: 
> "Cikgu, baju silat ni kalau beli hujung bulan dapat tak?" 
> "Macam mana nak cuci bengkung merah?"

Dengan adanya kotak Sifu AI di halaman pelajar, AI akan mengambil alih tugas pembantu khidmat pelanggan 24/7 dan memberikan respon tepat, bernas dan sangat pantas berpandukan data.

## 7.2 Struktur Pembangunan Psikologi Prompt (*Prompt Engineering*)
Kami tidak melepaskan robot AI ini bercakap semberono. Sistem skrip pengurusan Chatbot (berada di dalam `js/chatbot.js`) disuap dengan *System Instruction* peribadi yang sangat spesifik dan terkawal.

- **Arahan Identiti:** "Anda adalah Sifu AI, seorang pesilat legenda dari Malaysia. Gunakan bahasa santai dan sopan. Cuma jawab tentang ilmu CMS Daeng Kuning, Silat Gayong, Pendaftaran Ahli, dan Etika. Tolak sebarang permintaan di luar perimeter ini."
- **Parameter Maklumat Teras:** Robot disuapkan skema harga yuran mengikut cawangan (Batu 8, Changkat Ibul), syarat pertandingan, struktur pewarisan bengkung, dan waktu kelas latihan.

## 7.3 Implikasi Prestasi Sistem (Serverless Call)
Sistem ini menggunakan pelayan teragih bersekutu API Rest (Fetch HTTP headers). Ianya dijalankan menerusi "Client-Side Request" ke API Gemini AI yang sah.
Bermakna, web kita tidak mengalami masalah pening atau perlahan sama sekali memandangkan pengkomputeran logik bot dijalankan secara asinkroni oleh pelayan infrastruktur gergasi Google (*Serverless AI Offloading*). Cepat, Tepat, Hebat.

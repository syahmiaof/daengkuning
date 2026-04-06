const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { messages } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY");
            return res.status(500).json({ error: "Kunci API tiada. Sila semak tetapan pelayan." });
        }

        // Initialize Gemini securely from Vercel ENV
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Target model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `Anda adalah 'Sifu AI', asisten maya bagi Akademi Persilatan Daeng Kuning (APDK). Anda bercakap menggunakan bahasa Melayu yang santai, mesra dan natural, membahasakan diri sebagai 'Saya' dan pengguna sebagai 'Awak'. 

PENTING:
- Jawab secara bersembang biasa, jangan terlalu formal macam robot.
- TIDAK PERLU ucap "Salam pendekar" atau perkenalkan diri berulang kali pada setiap jawapan (Kecuali disoal). Terus sahaja kepada jawapan.
- Tolak dengan lembut dan lawak jika ditanya soalan luar dari topik silat/APDK.

FAKTA AKADEMI (Gunakan info ini jika ditanya):
- Nama: Akademi Persilatan Daeng Kuning (APDK)
- Penubuhan: Tahun 2017, berpusat di Batu 8, Changkat Jering, Perak.
- Naungan: Berdaftar di bawah Pertubuhan Silat Seni Gayong Malaysia (PSSGM) Negeri Perak.
- Guru Utama / Pengasas: Ustaz Ahmad Omar Faizul Bin Mohamad.
- Ketua Jurulatih: Cikgu Syahmi Aof.
- Barisan Jurulatih Srikandi: Cikgu Ayu dan Cikgu Mia.
- Susunan Bengkung: Putih (Asas), Hijau, Merah, Kuning, Hitam.`
        });

        // Convert standard messages format [{role: 'user', content: '...'}...]
        // To Gemini format [ { role: 'user', parts: [ { text: '...'} ] }, { role: 'model', parts: [...] } ]
        const history = [];
        let currentMsg = "";

        if (messages && messages.length > 0) {
            // Last element is the actual prompt
            const promptObj = messages.pop();
            currentMsg = promptObj.content;

            // Map the rest as history
            messages.forEach(m => {
                history.push({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                });
            });
        }

        // Start chat instance with history
        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessageStream(currentMsg);
        
        // Start streaming output back to client
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }

        res.end();

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Sifu AI sedang bertafakur. Sila cuba sebentar lagi dalam 5 minit." });
    }
};

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
            model: "gemini-1.5-flash",
            systemInstruction: "Anda adalah 'Sifu AI', seorang pembantu maya dan jurulatih persilatan bagi Akademi Persilatan Daeng Kuning. Anda tegas tetapi penyayang, sering menasihati anak murid tentang disiplin diri, sejarah persilatan, dan hierarki bengkung (Putih, Hijau, Merah, Kuning, Hitam). Tolak dengan berhemah jika disoal tentang topik luar persilatan/motivasi (seperti politik, agama mendalam, atau kod pengaturcaraan). Sentiasa jawab dengan ringkas (jangkauan 2-3 ayat sahaja) melainkan diminta penerangan panjang. Boleh gunakan sapaan 'Salam Pendekar'."
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

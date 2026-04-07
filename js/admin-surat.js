// Setiausaha AI - Surat Rasmi Generator
let generatedSuratContent = "";

async function generateSuratAI() {
    const jenis = document.getElementById('surat-jenis').value;
    const penerima = document.getElementById('surat-penerima').value.trim();
    const tujuan = document.getElementById('surat-tujuan').value.trim();
    const previewContainer = document.getElementById('surat-preview-container');

    if (!penerima || !tujuan) {
        alert("Sila isikan nama penerima dan tujuan surat.");
        return;
    }

    // Set loading state
    previewContainer.innerHTML = '<div class="text-center mt-20"><i class="fas fa-circle-notch fa-spin text-4xl text-gold mb-3"></i><p class="text-gray-400">Setiausaha AI sedang merangka surat anda...</p></div>';

    // Construct prompt
    const prompt = `Anda adalah seorang Setiausaha Kehormat yang profesional untuk "Akademi Persilatan Daeng Kuning" (APDK).
Tolong drafkan surat rasmi berjenis "${jenis}". 
Penerima: ${penerima}
Tujuan utama: ${tujuan}

Keperluan Format (Jangan ubah):
1. Mulakan dengan "Kepada," di atas kiri.
2. Tulis sekurang-kurangnya 3 perenggan yang sangat rasmi, mampat, dan tepat menggunakan Bahasa Melayu Tinggi.
3. Akhiri dengan:
"Yang menjalankan tugas,"
(Tandatangan)
AHMAD OMAR FAIZUL
Pengasas & Gurulatih Tertinggi
Akademi Persilatan Daeng Kuning

Hasilkan Teks Surat sahaja tanpa ulasan atau penjelasan.`;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: [ 
                    { role: "user", content: prompt } 
                ] 
            })
        });

        if (!response.ok) {
            throw new Error("Ralat menghubungi servis AI.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let fullResponse = "";
        
        previewContainer.innerHTML = ""; // Clear loader
        
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                previewContainer.innerText = fullResponse;
                previewContainer.scrollTop = previewContainer.scrollHeight;
            }
        }

        generatedSuratContent = fullResponse;

    } catch (e) {
        console.error(e);
        previewContainer.innerHTML = `<div class="text-red-500 mt-10 text-center"><i class="fas fa-exclamation-triangle text-3xl mb-2"></i><br>Ralat menjana surat: ${e.message}</div>`;
    }
}

function downloadSuratPDF() {
    if (!generatedSuratContent) {
        alert("Sila jana surat terlebih dahulu sebelum muat turun.");
        return;
    }
    
    if (!window.jspdf) {
        alert('Enjin PDF belum dimuatkan. Sila semak capaian CDN.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Logo APDK
    const logoImg = new Image();
    logoImg.src = 'assets/img/logo.png';
    const sigImg = new Image();
    sigImg.src = 'assets/img/ahmad.png';

    setTimeout(() => {
        // Header
        try { doc.addImage(logoImg, 'PNG', 20, 15, 25, 25); } catch(e){}
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(22);
        doc.setFont('times', 'bold');
        doc.text('AKADEMI PERSILATAN DAENG KUNING', 50, 25);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('No. Pendaftaran: 1234-56-78 | Emel: rasmi@daengkuning.com | Tel: 019-XXXXXXX', 50, 31);
        doc.text('No 43 Belakang Masjid Batu 8, Sijangkang, 42500 Telok Panglima Garang, Selangor', 50, 36);

        // Line Break
        doc.setDrawColor(212, 175, 55); 
        doc.setLineWidth(0.8);
        doc.line(20, 43, 190, 43);

        // Date and Reference (Mock)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text('Tarikh: ' + new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' }), 140, 52);
        doc.text('Ruj. Kami: APDK/S/26/' + Math.floor(Math.random() * 900+100), 20, 52);

        // Letter Body
        // Split text by paragraphs and render via jsPDF text split logic
        const splitText = doc.splitTextToSize(generatedSuratContent, 170);
        // We will start at Y=65 and check for page breaks
        let cursorY = 65;
        
        // Let's iterate line by line to add signature image if we encounter "AHMAD OMAR FAIZUL"
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0,0,0);
        
        for (let i = 0; i < splitText.length; i++) {
            if (cursorY > 270) {
                doc.addPage();
                cursorY = 20;
            }
            const line = splitText[i];
            
            // Check if signature logic should trigger (heuristic)
            if (line.includes('AHMAD OMAR FAIZUL')) {
                // Add signature right above the text
                try { doc.addImage(sigImg, 'PNG', 20, cursorY - 15, 30, 15); } catch(e){}
            }

            doc.text(line, 20, cursorY);
            cursorY += 6; // line height
        }

        doc.save(`Surat_Rasmi_APDK_${Date.now()}.pdf`);
    }, 500);
}

// Map the functions globally since we use inline onclick
window.generateSuratAI = generateSuratAI;
window.downloadSuratPDF = downloadSuratPDF;

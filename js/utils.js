// Universal Data Utilities

window.utils = {
    // Formats ISO string into Malaysian locale readable strings e.g., 2 Mac 2026
    formatDateMy: function(isoString) {
        if (!isoString) return 'N/A';
        
        try {
            const dateObj = new Date(isoString);
            return dateObj.toLocaleDateString('ms-MY', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
        } catch(e) {
            return isoString;
        }
    },

    // Formats integers/floats into RM strings
    formatCurrency: function(amount) {
        const num = parseFloat(amount || 0);
        if (isNaN(num)) return 'RM 0.00';
        return 'RM ' + num.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // Generates PDF Receipt
    generateReceiptPDF: function(paymentData) {
        if (!window.jspdf) {
            alert('Enjin PDF belum dimuatkan. Sila semak pautan CDN.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Helper for Month Format - handles both "4" and "4 2026" from DB
        const monthNames = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
        let rawBulan = (paymentData.bulan || '-').toString().trim();
        let bulanNum = parseInt(rawBulan.split(' ')[0]); // ambik nombor bulan je
        let properBulan = (bulanNum >= 1 && bulanNum <= 12) ? monthNames[bulanNum - 1] : rawBulan;

        // Extract Data Safely
        const namaAhli = paymentData.nama || 'Pesilat Tanda Nama';
        const idAhli = paymentData.id_ahli || 'N/A';
        const bengkung = paymentData.bengkung || 'Tiada Maklumat';
        const tahun = paymentData.tahun || '-';
        const jumlahObj = parseFloat(paymentData.jumlah || 0);
        
        // For group: use kumpulan_bulan if available (e.g. "Mac, April"), else single month
        const bulanDisplay = paymentData.kumpulan_bulan || `${properBulan} ${tahun}`;
        
        // Detailed data extracting assuming Supabase timestamps
        const tarikhTrans = paymentData.created_at ? new Date(paymentData.created_at).toLocaleDateString('ms-MY') : '-';
        const teraMasa = new Date().toLocaleString('ms-MY', { hour12: true });

        // Pre-load logo image
        const logoImg = new Image();
        logoImg.src = 'assets/img/logo.png';

        // Pre-render true cursive text via canvas trick to bypass jsPDF font limitations
        const sigCanvas = document.createElement('canvas');
        sigCanvas.width = 400;
        sigCanvas.height = 120;
        const ctx = sigCanvas.getContext('2d');
        // Fallbacks included just in case
        ctx.font = "italic 68px 'Alex Brush', 'Brush Script MT', 'Great Vibes', cursive";
        ctx.fillStyle = "#D4AF37"; // Signature Gold
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Daeng Kuning", 200, 60);
        const sigDataUrl = sigCanvas.toDataURL("image/png");

        setTimeout(() => {
            // 1. ROYAL BORDER
            doc.setDrawColor(212, 175, 55); 
            doc.setLineWidth(1.5);
            doc.rect(10, 10, 190, 277); 
            doc.setLineWidth(0.3);
            doc.rect(12, 12, 186, 273); 

            // 2. WATERMARK
            doc.setFont('times', 'bolditalic');
            doc.setTextColor(250, 246, 230); 
            doc.setFontSize(80);
            doc.text('DAENG KUNING', 105, 170, { angle: 45, align: 'center' });

            // 3. HEADER
            try { doc.addImage(logoImg, 'PNG', 90, 18, 25, 25); } catch(e){}

            // TITLE: RESIT RASMI
            doc.setTextColor(212, 175, 55); // Gold
            doc.setFontSize(18);
            doc.setFont('times', 'bold');
            doc.text('RESIT RASMI', 105, 50, { align: 'center' }); // Centered Huge Title

            doc.setTextColor(50, 40, 20); 
            doc.setFontSize(22);
            doc.setFont('times', 'bold');
            doc.text('AKADEMI PERSILATAN DAENG KUNING', 105, 60, { align: 'center' });

            // Line Break
            doc.setDrawColor(212, 175, 55); 
            doc.setLineWidth(0.5);
            doc.line(20, 65, 190, 65);

            // 4. MEMBER INFO (Proper Grid Alignment)
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(11);
            
            // Left Column - Names (stacked vertically, each name on its own line)
            doc.setFont('times', 'normal');
            doc.text('Diterima daripada:', 20, 75);
            
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            
            // Split names by \n (group) or by splitTextToSize (single long name)
            const nameLines = namaAhli.includes('\n')
                ? namaAhli.split('\n').map(n => n.trim().toUpperCase())
                : doc.splitTextToSize(namaAhli.toUpperCase(), 100);
            
            doc.text(nameLines, 20, 81);
            
            // Push other items down based on number of name lines
            let extraHeight = (nameLines.length - 1) * 5.5;
            let leftNextY1 = 87 + extraHeight;
            let leftNextY2 = 92 + extraHeight;
            
            doc.setFontSize(11);
            doc.setFont('times', 'normal');
            doc.text('ID Pendaftaran', 20, leftNextY1);
            doc.text(':', 45, leftNextY1);
            doc.setFont('times', 'bold');
            doc.text(idAhli, 50, leftNextY1);

            doc.setFont('times', 'normal');
            doc.text('Taraf Bengkung', 20, leftNextY2);
            doc.text(':', 45, leftNextY2);
            doc.setFont('times', 'bold');
            doc.text(bengkung, 50, leftNextY2);

            // Right Column
            const rightLabelX = 125;
            const rightColonX = 150;
            const rightValueX = 154;

            doc.setFont('times', 'normal');
            doc.text('Tarikh Bayaran', rightLabelX, 75);
            doc.text(':', rightColonX, 75);
            doc.setFont('times', 'bold');
            doc.text(tarikhTrans, rightValueX, 75);

            doc.setFont('times', 'normal');
            doc.text('No. Resit', rightLabelX, 81);
            doc.text(':', rightColonX, 81);
            doc.setFont('times', 'bold');
            doc.text('DK-REC/' + (paymentData.id_yuran || Math.floor(Math.random() * 900+100)), rightValueX, 81);

            doc.setFont('times', 'normal');
            doc.text('Status', rightLabelX, 87);
            doc.text(':', rightColonX, 87);
            doc.setFont('times', 'bold');
            doc.setTextColor(34, 197, 94); // Green
            doc.text('SAH (DILULUSKAN)', rightValueX, 87);
            
            doc.setTextColor(30, 30, 30); 

            // 5. TRANSACTION TABLE
            const tableCol = ["PERIHAL", "BULAN / TAHUN", "JUMLAH (RM)"];
            const tableRows = [
                ["YURAN LATIHAN BULANAN", bulanDisplay, window.utils.formatCurrency(jumlahObj)]
            ];

            doc.autoTable({
                startY: Math.max(102, leftNextY2 + 10),
                head: [tableCol],
                body: tableRows,
                theme: 'plain',
                styles: { font: 'times', fontSize: 11, cellPadding: 8, textColor: [30, 30, 30] },
                headStyles: { fillColor: [248, 245, 235], fontStyle: 'bold', textColor: [100, 80, 40], lineWidth: 0.1, lineColor: [212, 175, 55] },
                bodyStyles: { lineWidth: 0.1, lineColor: [212, 175, 55] },
                columnStyles: { 2: { halign: 'right', fontStyle: 'bold' }, 1: { halign: 'center' } },
                margin: { left: 20, right: 20 }
            });

            // 6. TOTAL AMOUNT (Adjusted Box Size and Text)
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setDrawColor(212, 175, 55); 
            doc.setFillColor(250, 248, 242); 
            doc.setLineWidth(0.5);
            // Box is from X=110 to X=190 (width 80)
            doc.rect(110, finalY, 80, 15, 'FD'); 
            
            doc.setFont('times', 'bold');
            doc.setTextColor(50, 40, 20);
            doc.setFontSize(14);
            doc.text('JUMLAH :', 120, finalY + 10);
            // Value perfectly aligned to the right inside the box (width spans up to 190, center margin is 185)
            doc.text(window.utils.formatCurrency(jumlahObj), 185, finalY + 10, { align: 'right' });

            // 7. SIGNATURE (True Cursive Rendering via Canvas)
            try { 
                // Draw the generated canvas as an image to guarantee cursive font rendering without jsPDF VFS
                doc.addImage(sigDataUrl, 'PNG', 15, finalY + 28, 80, 24); 
            } catch(e) {
                // emergency fallback
                doc.setFont('times', 'italic'); doc.setFontSize(30); doc.setTextColor(212, 175, 55); 
                doc.text('Daeng Kuning', 55, finalY + 48, { align: 'center' }); 
            }
            
            doc.setDrawColor(150, 130, 100);
            doc.setLineWidth(0.3);
            doc.line(20, finalY + 55, 90, finalY + 55);
            
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text('SETIAUSAHA', 20, finalY + 62);
            doc.setFontSize(10);
            doc.setFont('times', 'normal');
            doc.text('AKADEMI PERSILATAN DAENG KUNING', 20, finalY + 68);

            // Thank You Note
            doc.setFont('times', 'italic');
            doc.setFontSize(11);
            doc.setTextColor(100, 90, 70);
            const quoteY = finalY + 85;
            doc.text('Terima kasih di atas komitmen dan pembayaran yuran ini.', 105, quoteY, { align: 'center' });

            // 8. FOOTER
            doc.setFont('times', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(150, 140, 120);
            doc.text(`Dijana secara automatik oleh pangkalan data APDK pada ${teraMasa}.`, 105, 280, { align: 'center' });

            // Generate
            const fileName = `Resit_Bayaran_${idAhli}_${properBulan}-${tahun}.pdf`;
            doc.save(fileName);
        }, 400); // Wait 400ms to allow canvas and image buffering
    },

    // Phase 3: Global Activity Logger
    createLog: async function(aksi, sasaran) {
        try {
            if(!window.supabaseClient) return; // Ensure client exists
            let admin_id = 'Unknown';
            const sess = localStorage.getItem('userSession');
            if(sess) {
                const sessionObj = JSON.parse(sess);
                admin_id = sessionObj.username || 'Admin';
            }

            await window.supabaseClient.from('aktiviti_log').insert({
                aksi: aksi,
                sasaran: sasaran,
                admin_id: admin_id
            });
        } catch (e) {
            console.error("Gagal merekod log sistem:", e);
        }
    }
};

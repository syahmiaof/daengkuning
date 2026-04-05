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

    // Generates Premium PDF Receipt using jsPDF & autoTable
    generateReceiptPDF: function(paymentData) {
        if (!window.jspdf) {
            alert('Enjin PDF belum dimuatkan. Sila semak pautan CDN.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Extract Data Safely
        const namaAhli = paymentData.nama || 'Pesilat Tanda Nama';
        const idAhli = paymentData.id_ahli || 'N/A';
        const bengkung = paymentData.bengkung || 'Tiada Maklumat';
        const bulan = paymentData.bulan || '-';
        const tahun = paymentData.tahun || '-';
        const jumlahObj = parseFloat(paymentData.jumlah || 0);

        // 1. Watermark - OFFICIAL RECEIPT (Rotated & Opacity via color)
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(240, 240, 240); // Sangat cerah kelabu untuk elak serabut
        doc.setFontSize(60);
        // Put in center, rotate -45 deg
        doc.text('OFFICIAL RECEIPT', 30, 200, { angle: 45 });

        // 2. HEADER - Typography
        doc.setTextColor(17, 17, 17); // Charcoal Black
        doc.setFontSize(22);
        doc.setFont('times', 'bold');
        doc.text('AKADEMI PERSILATAN DAENG KUNING', 105, 30, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Resit Rasmi Latihan • Janaan Sistem Automatik', 105, 38, { align: 'center' });

        // Line Break
        doc.setDrawColor(212, 175, 55); // Gold
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // 3. MEMBER INFO
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text('Maklumat Pelajar:', 20, 60);
        doc.setFont('helvetica', 'bold');
        doc.text(namaAhli.toUpperCase(), 20, 67);
        doc.setFont('helvetica', 'normal');
        doc.text('ID Pesilat : ' + idAhli, 20, 73);
        doc.text('Bengkung : ' + bengkung, 20, 79);

        const printDate = new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
        doc.text('Tarikh : ' + printDate, 140, 67);
        doc.text('No. Rujukan : REC-' + (paymentData.id_yuran || Math.floor(Math.random() * 9000) + 1000), 140, 73);

        // 4. TRANSACTION TABLE
        const tableCol = ["Penerangan Kelulusan", "Tempoh (Bulan/Tahun)", "Amaun"];
        const tableRows = [
            ["Yuran Latihan Bulanan Daeng Kuning", `${bulan}/${tahun}`, window.utils.formatCurrency(jumlahObj)]
        ];

        doc.autoTable({
            startY: 95,
            head: [tableCol],
            body: tableRows,
            theme: 'plain',
            styles: { font: 'helvetica', fontSize: 11, cellPadding: 6 },
            headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { textColor: [50, 50, 50], lineWidth: 0.1, lineColor: [200, 200, 200] },
            columnStyles: { 2: { halign: 'right' } } // 0-indexed: Align amaun ke kanan
        });

        // 5. TOTAL BOX (Bold Gold)
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setDrawColor(212, 175, 55); // border-#D4AF37
        doc.setFillColor(255, 253, 243); // Off-white gold tint
        doc.setLineWidth(1);
        doc.rect(120, finalY, 70, 15, 'FD'); // Fill & Draw
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 17, 17);
        doc.text('JUMLAH:', 125, finalY + 10);
        doc.setTextColor(184, 134, 11); // Gold text
        doc.text(window.utils.formatCurrency(jumlahObj), 185, finalY + 10, { align: 'right' });

        // 6. FOOTER
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Dikeluarkan pada: ' + new Date().toLocaleString('ms-MY'), 105, 270, { align: 'center' });
        doc.text('Ini adalah resit janaan komputer. Tiada tandatangan fizikal diperlukan.', 105, 275, { align: 'center' });

        // Generate Filename & Save
        const fileName = `Resit_DaengKuning_${idAhli}_${bulan}-${tahun}.pdf`;
        doc.save(fileName);
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

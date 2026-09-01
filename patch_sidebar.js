const fs = require('fs');
const path = require('path');

const adminPages = [
    { file: 'dashboard-admin.html', label: 'Ringkasan', icon: 'fa-th-large' },
    { file: 'admin-ahli.html', label: 'Senarai Ahli', icon: 'fa-users' },
    { file: 'admin-yuran.html', label: 'Pengurusan Yuran', icon: 'fa-file-invoice-dollar' },
    { file: 'admin-gelanggang.html', label: 'Pengurusan Gelanggang', icon: 'fa-map-marked-alt' },
    { file: 'admin-notis.html', label: 'Hebahan (Notis)', icon: 'fa-bullhorn' },
    { file: 'admin-suara.html', label: 'Suara Pesilat', icon: 'fa-comments' },
    { file: 'admin-surat.html', label: 'Surat Rasmi (AI)', icon: 'fa-envelope-open-text' },
    { file: 'admin-pengurusan.html', label: 'Urus Pentadbir', icon: 'fa-user-shield', extraClass: 'rbac-superadmin hidden ' }
];

const studentPages = [
    { file: 'dashboard-student.html', label: 'Laman Utama', icon: 'fa-home' },
    { file: 'student-payment.html', label: 'Pembayaran Yuran', icon: 'fa-receipt' },
    { file: 'student-profile.html', label: 'Profil & Kad ID', icon: 'fa-id-badge' },
    { file: 'student-silibus.html', label: 'Silibus & Bengkung', icon: 'fa-book-open' },
    { file: 'student-suara.html', label: 'Suara Pesilat', icon: 'fa-bullhorn' }
];

function generateNav(pages, currentFile) {
    let html = '            <ul class="space-y-2">';
    
    pages.forEach(p => {
        const isActive = p.file === currentFile;
        const extraC = p.extraClass || '';
        if (isActive) {
            html += `                <li>
                    <a href="${p.file}" class="${extraC}flex items-center px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all">
                        <i class="fas ${p.icon} w-6"></i>
                        <span class="font-medium tracking-wide">${p.label}</span>
                    </a>
                </li>
`;
        } else {
            html += `                <li>
                    <a href="${p.file}" class="${extraC}flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                        <i class="fas ${p.icon} w-6 group-hover:text-gold transition-colors"></i>
                        <span class="font-medium tracking-wide">${p.label}</span>
                    </a>
                </li>
`;
        }
    });

    html += '            </ul>';
    return html;
}

function processFiles(pagesList, directory) {
    const files = fs.readdirSync(directory);
    
    pagesList.forEach(p => {
        if (!files.includes(p.file)) return;
        
        const filePath = path.join(directory, p.file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the <ul> segment inside <nav>
        const ulStartRegex = /<ul class="space-y-2">/is;
        const navEndRegex = /<\/ul>/is;
        
        const startIndex = content.search(ulStartRegex);
        if (startIndex === -1) {
            console.log("Could not find <ul class='space-y-2'> in " + p.file);
            return;
        }
        
        // Look for the closing </ul> from the start index
        const substringFromStart = content.substring(startIndex);
        const endMatch = substringFromStart.match(navEndRegex);
        
        if (!endMatch) {
            console.log("Could not find </ul> in " + p.file);
            return;
        }
        
        const endIndex = startIndex + endMatch.index + 5; // length of </ul> is 5
        
        const newNavBlock = generateNav(pagesList, p.file);
        
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        
        fs.writeFileSync(filePath, before + newNavBlock + after, 'utf8');
        console.log("Patched sidebar navigation in " + p.file);
    });
}

// 1. Process Admin Pages
processFiles(adminPages, __dirname);

// 2. Process Student Pages
processFiles(studentPages, __dirname);

console.log("Done patching all navs!");

const fs = require('fs');

const filesToInjectUI = ['dashboard-student.html', 'student-payment.html', 'student-silibus.html', 'student-suara.html'];

for (const file of filesToInjectUI) {
    if(!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('js/ui.js')) {
        // inject after js/utils.js
        if (html.includes('js/utils.js')) {
            html = html.replace(/<script src="js\/utils\.js[^>]*><\/script>/, '$&\n    <script src="js/ui.js"></script>');
            fs.writeFileSync(file, html);
            console.log(`Injected ui.js to ${file}`);
        } else if (file === 'student-suara.html') {
            html = html.replace('</body>', '    <script src="js/ui.js"></script>\n</body>');
            fs.writeFileSync(file, html);
        } else if (file === 'student-payment.html') {
            html = html.replace('</body>', '    <script src="js/ui.js"></script>\n</body>');
            fs.writeFileSync(file, html);
        }
    }
}

// Fix dashboard sidebar missing Suara Pesilat
let dash = fs.readFileSync('dashboard-student.html', 'utf8');
if(!dash.includes('student-suara.html')) {
    const dashLinkBeforeSidebar = dash.lastIndexOf('</ul>');
    if (dashLinkBeforeSidebar !== -1) {
        const suaraLink = '                <li><a href="student-suara.html" class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group"><i class="fas fa-bullhorn w-6 group-hover:text-gold transition-colors"></i><span class="font-medium">Suara Pesilat</span></a></li>\n            ';
        dash = dash.substring(0, dashLinkBeforeSidebar) + suaraLink + dash.substring(dashLinkBeforeSidebar);
        fs.writeFileSync('dashboard-student.html', dash);
        console.log(`Injected Suara Pesilat to dashboard-student.html`);
    }
}

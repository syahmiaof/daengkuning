const fs = require('fs');

let content = fs.readFileSync('dashboard-admin.html', 'utf8');

const itemToInsert = `                <li>
                    <a href="admin-surat.html" class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                        <i class="fas fa-envelope-open-text w-6 group-hover:text-gold transition-colors"></i>
                        <span class="font-medium tracking-wide">Surat Rasmi (AI)</span>
                    </a>
                </li>`;

// Replace right before admin-notis.html
if (!content.includes('admin-surat.html')) {
    content = content.replace(/(<li>\s*<a href="admin-notis\.html")/g, itemToInsert + '\n                $1');
    fs.writeFileSync('dashboard-admin.html', content);
    console.log('patched dashboard-admin');
} else {
    console.log('Already there');
}

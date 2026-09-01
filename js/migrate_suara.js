const fs = require('fs');

const pages = [
  'dashboard-student.html',
  'student-payment.html',
  'student-profile.html',
  'student-silibus.html'
];

const sidebarItem = `                <li><a href="student-suara.html" class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group"><i class="fas fa-bullhorn w-6 group-hover:text-gold transition-colors"></i><span class="font-medium">Suara Pesilat</span></a></li>`;

for(let p of pages) {
  let html = fs.readFileSync(p, 'utf8');
  if(!html.includes('student-suara.html')) {
    html = html.replace('            </ul>', sidebarItem + '\n            </ul>');
    fs.writeFileSync(p, html);
    console.log('Sidebar injected into: ' + p);
  }
}

// 2. Extract Suara Pesilat Feed from dashboard-student.html
let dashHtml = fs.readFileSync('dashboard-student.html', 'utf8');
const startToken = `                <!-- Suara Pesilat (Feed) -->`;
const endToken = `<!-- Sifu Contact Block -->`;

const startIndex = dashHtml.indexOf(startToken);
const endIndex = dashHtml.indexOf(endToken);

let suaraBlockHtml = '';
if(startIndex > -1 && endIndex > -1) {
    suaraBlockHtml = dashHtml.substring(startIndex, endIndex);
    // Remove it from dashboard
    dashHtml = dashHtml.replace(suaraBlockHtml, '');
    fs.writeFileSync('dashboard-student.html', dashHtml);
    console.log('Extracted Suara Block from dashboard-student.html');
}

// 3. Create student-suara.html based on student-silibus.html as template
let templateHtml = fs.readFileSync('student-silibus.html', 'utf8');

// The active nav class in the sidebar item
const oldNavActive = `class="flex items-center px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all"`;
const normalNavClass = `class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group"`;

templateHtml = templateHtml.replace(
    `<li><a href="student-silibus.html" class="flex items-center px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all">`,
    `<li><a href="student-silibus.html" class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">`
);

templateHtml = templateHtml.replace(
    `<li><a href="student-suara.html" class="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">`,
    `<li><a href="student-suara.html" class="flex items-center px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all">`
);

// Replace Title
templateHtml = templateHtml.replace('<title>Silibus & Bengkung | Akademi Persilatan Daeng Kuning</title>', '<title>Suara Pesilat | Komuniti Daeng Kuning</title>');
templateHtml = templateHtml.replace(`Silibus <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Pesilat</span>`, `Suara <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Pesilat</span>`);
templateHtml = templateHtml.replace(`Kurikulum dan modul latihan rasmi.`, `Ruang berinteraksi bersama seluruh warga persilatan.`);
templateHtml = templateHtml.replace(`<i class="fas fa-book-open"></i>`, `<i class="fas fa-bullhorn"></i>`);

// Replace Main Content Area
const mainStart = templateHtml.indexOf('<div class="flex-1 p-6 lg:p-10 pb-24 max-w-7xl mx-auto w-full">');
// Since the template ends with <script src="js/student.js"> we cut it before the scripts/end div
const mainEnd = templateHtml.indexOf('</main>');

if(mainStart > -1 && mainEnd > -1) {
    const mainContent = templateHtml.substring(mainStart, mainEnd);
    
    // Inject the suaraBlockHtml ensuring it uses the student-social.js at the end
    const newMainContent = `
        <div class="flex-1 p-6 lg:p-10 pb-24 max-w-7xl mx-auto w-full">
            <div class="grid grid-cols-1 gap-6">
                ${suaraBlockHtml}
            </div>
        </div>
    `;
    templateHtml = templateHtml.replace(mainContent, newMainContent);
    
    // Ensure student-social.js is only on this page
    if(!templateHtml.includes('student-social.js')) {
        templateHtml = templateHtml.replace('<script src="js/student.js?v=6"></script>', '<script src="js/student.js?v=6"></script>\n    <script src="js/student-social.js"></script>');
    }

    fs.writeFileSync('student-suara.html', templateHtml);
    console.log('student-suara.html successfully generated.');
}

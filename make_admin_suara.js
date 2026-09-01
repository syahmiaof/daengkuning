const fs = require('fs');

let studentSuara = fs.readFileSync('student-suara.html', 'utf8');
let adminAhli = fs.readFileSync('admin-ahli.html', 'utf8');

const navRegex = /<nav class="flex-1 px-4 py-6 justify-between flex flex-col">[\s\S]*?<\/nav>/i;
const adminNavMatch = adminAhli.match(navRegex);

if(adminNavMatch) {
    studentSuara = studentSuara.replace(navRegex, adminNavMatch[0]);
    studentSuara = studentSuara.replace(/Dashboard Pelajar/g, 'Portal Pentadbir');
    studentSuara = studentSuara.replace(/dashboard-student\.html/g, 'dashboard-admin.html');
    
    // Inject student-social.js with v=3 so cache is busted
    studentSuara = studentSuara.replace(/student-social\.js\?v=2/g, 'student-social.js?v=3');
    studentSuara = studentSuara.replace(/student-social\.js/g, 'student-social.js?v=3');
    
    fs.writeFileSync('admin-suara.html', studentSuara);
    console.log('Created admin-suara.html');
} else {
    console.log('Could not find nav in admin-ahli.html');
}

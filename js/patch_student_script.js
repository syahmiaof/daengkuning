const fs = require('fs');
let html = fs.readFileSync('dashboard-student.html', 'utf8');

const t1 = `<script src="js/student.js"></script>`;
const p1 = `<script src="js/student.js"></script>\n    <script src="js/student-social.js"></script>`;

if (html.includes(t1)) {
    html = html.replace(t1, p1);
    fs.writeFileSync('dashboard-student.html', html);
    console.log('Script tag injected!');
} else {
    console.log('Script tag target not found.');
}

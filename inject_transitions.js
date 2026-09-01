const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;

    // Inject CSS into head if not exists
    if (!content.includes('css/transitions.css')) {
        content = content.replace('</head>', '    <link rel="stylesheet" href="css/transitions.css">\n</head>');
        modified = true;
    }

    // Inject JS before </body> if not exists
    if (!content.includes('js/transitions.js')) {
        content = content.replace('</body>', '    <script src="js/transitions.js"></script>\n</body>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(f, content);
        console.log('Injected transitions into ' + f);
    }
});

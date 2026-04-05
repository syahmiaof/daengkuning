const fs = require('fs');

// Read all HTML files in the current directory
const directory = '.';
const files = fs.readdirSync(directory).filter(file => file.endsWith('.html'));

// The precise favicon tag to inject
const faviconTag = '\n    <link rel="icon" type="image/png" href="assets/img/logo.png">\n</head>';

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('rel="icon"')) {
        // If there's an existing <head> tag, inject right before closing
        if (content.includes('</head>')) {
            content = content.replace('</head>', faviconTag);
            fs.writeFileSync(file, content);
            updatedCount++;
            console.log(`Added favicon to ${file}`);
        } else {
            console.log(`Skipped ${file} - no </head> tag found.`);
        }
    } else {
        console.log(`Skipped ${file} - already has favicon.`);
    }
});

console.log(`Successfully appended favicon to ${updatedCount} files.`);

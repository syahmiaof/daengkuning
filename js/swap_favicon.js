const fs = require('fs');

const directory = '.';
const files = fs.readdirSync(directory).filter(file => file.endsWith('.html'));

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We strictly use regex to target only the favicon, NOT the main navbar logo image
    const faviconRegex = /<link[^>]*rel="icon"[^>]*href="assets\/img\/logo\.png"/g;
    
    if (faviconRegex.test(content)) {
        // Replace just the href part of the favicon tag
        content = content.replace(faviconRegex, match => match.replace('assets/img/logo.png', 'assets/img/dkf.png'));
        fs.writeFileSync(file, content);
        updatedCount++;
        console.log(`Updated favicon in ${file}`);
    }
});

console.log(`Successfully updated favicon in ${updatedCount} files.`);

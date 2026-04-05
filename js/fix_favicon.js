const fs = require('fs');

const directory = '.';
const files = fs.readdirSync(directory).filter(file => file.endsWith('.html'));

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('dk_logo_gold.png')) {
        content = content.replace(/dk_logo_gold\.png/g, 'logo.png');
        fs.writeFileSync(file, content);
        updatedCount++;
        console.log(`Fixed old filename in ${file}`);
    }
});

console.log(`Successfully fixed ${updatedCount} files.`);

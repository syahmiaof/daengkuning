const fs = require('fs');
const files = ['index.html', 'about.html', 'gallery.html', 'contact.html', 'warisan.html'];

const navRegex = /(<a href="gallery\.html"[\s\S]*?>Galeri<\/a>)/g;
const busanaLink = `\n                        <a href="busana.html"\n                            class="text-gray-300 hover:text-silat-gold transition-colors duration-300 text-sm font-medium">Busana</a>`;

let successCount = 0;

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let initialLength = content.length;
        
        // ensure we only replace if Busana is not already there
        if (!content.includes('href="busana.html"')) {
            content = content.replace(navRegex, `$1${busanaLink}`);
            fs.writeFileSync(file, content);
            console.log(`Injected Busana nav into: ${file}`);
            successCount++;
        } else {
            console.log(`Skipped ${file} - Busana already exists.`);
        }
    }
});

console.log(`Successfully updated ${successCount} files.`);

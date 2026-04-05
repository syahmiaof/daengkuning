const fs = require('fs');
const files = ['index.html', 'about.html', 'gallery.html', 'contact.html', 'warisan.html'];

// Nav Regex: matches the 10x10 shield div and the subsequent span
const navRegex = /<div[^>]*class="[^"]*w-10 h-10[^"]*"[^>]*>\s*(?:<!--[\s\S]*?-->\s*)?<i class='bx bx-shield-quarter[^>]*><\/i>\s*<\/div>\s*<span class="royal-brand-logo[^>]*>Daeng<span class="brand-gold">Kuning<\/span><\/span>/g;

// Footer Regex: matches the 12x12 shield div and the subsequent title/tag div
const footerRegex = /<div class="[^"]*w-12 h-12[^"]*">\s*<i class='bx bx-shield-quarter[^>]*><\/i>\s*<\/div>\s*<div>\s*<h3 class="royal-brand-logo[^>]*>Daeng<span class="brand-gold">Kuning<\/span><\/h3>\s*<p class="royal-brand-tagline[^>]*>[^<]*<\/p>\s*<\/div>/g;

const newNav = `<img src="assets/img/logo.png" alt="Daeng Kuning Logo" class="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">`;
const newFooter = `<img src="assets/img/logo.png" alt="Daeng Kuning Logo" class="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">`;

let successCount = 0;

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let initialLength = content.length;
        
        content = content.replace(navRegex, newNav);
        content = content.replace(footerRegex, newFooter);
        
        if (content.length !== initialLength) {
            fs.writeFileSync(file, content);
            console.log(`Updated: ${file}`);
            successCount++;
        } else {
            console.log(`No match found in: ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});

console.log(`Successfully updated ${successCount} files.`);

const fs = require('fs');
const files = ['index.html', 'about.html', 'gallery.html', 'contact.html', 'warisan.html'];

const navRegex = /<img src="assets\/img\/logo\.png" alt="Daeng Kuning Logo" class="h-12 w-auto object-contain drop-shadow-\[0_0_10px_rgba\(212,175,55,0\.4\)\]">/g;

const newNav = `<img src="assets/img/logo.png" alt="Daeng Kuning Logo" class="h-16 md:h-[4.5rem] w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <span class="royal-brand-logo text-3xl md:text-5xl pb-2" style="padding-left: 10px;">Daeng<span class="brand-gold">Kuning</span></span>`;

const footerRegex = /<img src="assets\/img\/logo\.png" alt="Daeng Kuning Logo" class="h-16 w-auto object-contain drop-shadow-\[0_0_15px_rgba\(212,175,55,0\.5\)\]">/g;

const newFooter = `<img src="assets/img/logo.png" alt="Daeng Kuning Logo" class="h-20 md:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                    <div style="padding-left: 10px;">
                        <h3 class="royal-brand-logo text-4xl md:text-5xl pb-2">Daeng<span class="brand-gold">Kuning</span></h3>
                        <p class="royal-brand-tagline text-xs md:text-sm">Akademi Persilatan Tradisional & Moden</p>
                    </div>`;

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

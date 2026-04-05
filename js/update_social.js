const fs = require('fs');
const files = ['index.html', 'about.html', 'contact.html', 'warisan.html'];

const fbRegex = /<a href="#" class="social-slide-btn">\s*<i class='bx bxl-facebook-circle'><\/i>\s*<span class="social-text">Facebook<\/span>\s*<\/a>/g;
const newFb = `<a href="https://www.facebook.com/GelanggangDaengKuningBatu8/" target="_blank" rel="noopener noreferrer" class="social-slide-btn">
                        <i class='bx bxl-facebook-circle'></i>
                        <span class="social-text">Facebook</span>
                    </a>`;

const tiktokRegex = /<a href="#" class="social-slide-btn">\s*<i class='bx bxl-tiktok'><\/i>\s*<span class="social-text">TikTok<\/span>\s*<\/a>/g;
const newTiktok = `<a href="https://www.tiktok.com/@gelanggangdaengkuning?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" class="social-slide-btn">
                        <i class='bx bxl-tiktok'></i>
                        <span class="social-text">TikTok</span>
                    </a>`;

let successCount = 0;

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let initialLength = content.length;
        
        content = content.replace(fbRegex, newFb);
        content = content.replace(tiktokRegex, newTiktok);
        
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

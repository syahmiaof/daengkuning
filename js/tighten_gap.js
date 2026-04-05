const fs = require('fs');
const files = ['index.html', 'about.html', 'gallery.html', 'contact.html', 'warisan.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        content = content.replace(
            /<span class="royal-brand-logo text-3xl md:text-5xl pb-2" style="padding-left: 10px;">/g,
            '<span class="royal-brand-logo text-3xl md:text-5xl pb-2" style="margin-left: -1.5rem;">'
        );
        
        content = content.replace(
            /<div style="padding-left: 10px;">/g,
            '<div style="margin-left: -2.5rem;">'
        );

        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
    }
});

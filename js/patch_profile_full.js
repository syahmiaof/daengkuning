const fs = require('fs');
let html = fs.readFileSync('js/student.js', 'utf8');

const t1 = `            const { error } = await supabaseClient
                .from('ahli')
                .update(payload)
                .eq('id_ahli', myId);

            if (error) throw error;`;
const r1 = t1 + `\n            if(window.utils && window.utils.createLog) window.utils.createLog('Kemaskini Profil', myId + ' kemaskini maklumat diri');`;

const t2 = `            // Update row parameter in database
            const { error: dbErr } = await supabaseClient.from('ahli').update({ avatar_url: pubUrl }).eq('id_ahli', myId);
            if (dbErr) throw dbErr;`;
const r2 = t2 + `\n            if(window.utils && window.utils.createLog) window.utils.createLog('Muat Naik Avatar', myId + ' menukar gambar profil');`;

html = html.replace(t1, r1);
html = html.replace(t2, r2);

const t3 = `            const { error: yuranError } = await supabaseClient
                .from('yuran')
                .insert(submissionPayload);

            if (yuranError) throw yuranError;`;
const r3 = t3 + `\n            if(window.utils && window.utils.createLog) window.utils.createLog('Bayaran Yuran', myId + ' menghantar resit');`;

html = html.replace(t3, r3);

fs.writeFileSync('js/student.js', html);
console.log('Profile and Activity Logs patched!');

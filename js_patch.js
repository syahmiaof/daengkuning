const fs = require('fs');
let code = fs.readFileSync('js/student.js', 'utf8');

const tOld = `    const icEl = document.getElementById('studEditIc');
    if(icEl) icEl.value = ahli.ic || '';

    const beltDisp = document.getElementById('studEditBeltDisplay');
    if(beltDisp) beltDisp.innerText = ahli.bengkung || 'Tiada';

    const gelanggangDisp = document.getElementById('studEditGelanggangDisplay');
      if(gelanggangDisp) gelanggangDisp.innerText = ahli.gelanggang || 'Tiada';

      const idDisp = document.getElementById('studEditIdDisplay');
      if(idDisp) idDisp.innerText = ahli.id_ahli || JSON.parse(localStorage.getItem('userSession'))?.username || '-';`;

const tNew = `    const icEl = document.getElementById('studEditIC');
    if(icEl) icEl.value = ahli.ic || '';

    const beltDisp = document.getElementById('studEditBelt');
    if(beltDisp) beltDisp.value = ahli.bengkung || 'Tiada';

    const idDisp = document.getElementById('studEditIdDisabled');
    if(idDisp) idDisp.value = ahli.id_ahli || JSON.parse(localStorage.getItem('userSession'))?.username || '-';`;

code = code.replace(tOld, tNew);

const sOld = `            const payload = {
                nama: document.getElementById('studEditName').value.trim(),
                no_pssgm: document.getElementById('studEditPssgm').value.trim(),
                no_tel: document.getElementById('studEditTel').value.trim(),
                no_waris: document.getElementById('studEditTelWaris').value.trim()
            };
            
            const icVal = document.getElementById('studEditIc')?.value.trim();
            if (icVal) payload.ic = icVal;`;

const sNew = `            const payload = {
                nama: document.getElementById('studEditName').value.trim(),
                ic: document.getElementById('studEditIC')?.value.trim() || undefined,
                no_pssgm: document.getElementById('studEditPssgm').value.trim() || null,
                no_tel: document.getElementById('studEditTel').value.trim(),
                no_tel_waris: document.getElementById('studEditTelWaris').value.trim()
            };`;

code = code.replace(sOld, sNew);

fs.writeFileSync('js/student.js', code, 'utf8');
console.log('done patching student.js');

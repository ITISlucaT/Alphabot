const mapContainerSection = document.querySelector('section.map-container');
const infoBtn = document.querySelector('section.map-container button#info-btn');

infoBtn.addEventListener('click', () => {
    const popup = document.createElement('div');
    const closePopupBtn = document.createElement('button');

    popup.setAttribute('id', 'info');
    closePopupBtn.innerText = 'close';
    closePopupBtn.classList.add('close-popup', 'material-icons-outlined', 'base-btn');

    const pl = activeMarkers.filter(m => m.data.marker === 'PL');
    const plProperties = [...new Set(pl.map(p => p.data.proprieta))];
    const plLightBulbTypes = [...new Set(pl.map(p => p.data.tipo_apparecchio.match(/^\w+/g)?.[0]))];
    const plLightBulbPower = [...new Set(pl.map(p => p.data.lampada_potenza.match(/^\w+/g)?.[0]))];


    const qe = activeMarkers.filter(m => m.data.marker === 'QE');
    const activeReports = activeMarkers.filter(m => m.data.segnalazioni_in_corso.length > 0);

    const totPl = calculatePlTot(pl);
    popup.innerHTML = `
        <div class="row">
            <h1 class="row-heading">Generali:</h1>
            <div class="row-content">
                <div class="group">
                    <h1>Punti Totali:</h1>
                    <h2>${pl.length}</h2>
                </div>
                <div class="group">
                    <h1>Apparecchi illuminanti Totali:</h1>
                    <h2>${totPl}</h2>
                </div>
                <div class="group">
                    <h1>Quadri Elettrici Totali:</h1>
                    <h2>${qe.length}</h2>
                </div>
                <div class="group">
                    <h1>Totale segnalazioni in corso:</h1>
                    <h2>${activeReports.length}</h2>
                </div>
            </div>
        </div>
        <div class="row">
            <h1 class="row-heading">Punti Luce Divisi per Proprietà:</h1>
            <div class="row-content">
                ${plProperties.map(prop => `
                    <div class="group">
                        <h1>${prop}:</h1>
                        <h2>${calculatePlTot(pl.filter(p => p.data.proprieta === prop))}</h2>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="row">
            <h1 class="row-heading">Punti Luce Divisi per Tipo Armatura:</h1>
            <div class="row-content">
                ${plLightBulbTypes.map(lightBulbType => `
                    <div class="group">
                        <h1>${lightBulbType}:</h1>
                        <h2>${calculatePlTot(pl.filter(p => p.data.tipo_apparecchio.startsWith(lightBulbType)))}</h2>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="row">
            <h1 class="row-heading">Punti Luce Divisi per Tipo Lampada:</h1>
            <div class="row-content">
                ${plLightBulbPower.map(lightBulbType => `
                    <div class="group">
                        <h1>${lightBulbType}:</h1>
                        <h2>${calculatePlTot(pl.filter(p => p.data.lampada_potenza.startsWith(lightBulbType)))}</h2>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    closePopupBtn.addEventListener('click', () => {
        popup.remove();
    });

    popup.prepend(closePopupBtn);
    mapContainerSection.append(popup);
})


function calculatePlTot(activeMarkers){
    let tot = 0;
    activeMarkers.forEach(pl => {
        const n_lp = pl.data.numero_apparecchi
        if (n_lp){
            const n = Number(n_lp);
            if (n){
                tot += n;
            }else{
                tot += 1;
            }
        }else{
            tot +=1;
        }

    });
    return tot;
}
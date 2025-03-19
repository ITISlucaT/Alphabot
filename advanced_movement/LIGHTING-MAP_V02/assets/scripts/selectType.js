function selectType(indexQuadro, response) {
    let puntoColor={};
    if (response.punti_luce[indexQuadro].marker === 'PL') {
        if (responseIcon.punti_luce[indexQuadro].proprieta === 'Municipale' || responseIcon.punti_luce[indexQuadro].proprieta === 'MUNICIPALE'|| responseIcon.punti_luce[indexQuadro].proprieta === 'municipale'|| responseIcon.punti_luce[indexQuadro].proprieta === 'COMUNE' || responseIcon.punti_luce[indexQuadro].proprieta === 'Comune'|| responseIcon.punti_luce[indexQuadro].proprieta === 'Comune' || responseIcon.punti_luce[indexQuadro].proprieta === 'Comune' || responseIcon.punti_luce[indexQuadro].proprieta === 'comune') {
        puntoColor={
            coloreBackground:'#0000FF',
            coloreGliph: '#0000FF',
            icona: ''
        };
    } else if (responseIcon.punti_luce[indexQuadro].proprieta === 'EnelSole' || responseIcon.punti_luce[indexQuadro].proprieta === 'Enelsole'|| responseIcon.punti_luce[indexQuadro].proprieta === 'Enel') {
        puntoColor={
            coloreBackground:'#FF0000',
            coloreGliph: '#FF0000'
        };
    }
    else {
        puntoColor={
            coloreBackground: '#000000',
            coloreGliph: '#000000',
            icona: ''
        };
    }
}else if (responseIcon.punti_luce[indexQuadro].marker === 'QE') {
    if (responseIcon.punti_luce[indexQuadro].proprieta === 'Municipale' || responseIcon.punti_luce[indexQuadro].proprieta === 'MUNICIPALE'|| responseIcon.punti_luce[indexQuadro].proprieta === 'municipale'|| responseIcon.punti_luce[indexQuadro].proprieta === 'COMUNE' || responseIcon.punti_luce[indexQuadro].proprieta === 'Comune'|| responseIcon.punti_luce[indexQuadro].proprieta === 'Comune' || responseIcon.punti_luce[indexQuadro].proprieta === 'Comune' || responseIcon.punti_luce[indexQuadro].proprieta === 'comune') {
        const cabinetTag = document.createElement("div");
        cabinetTag.className = "cabinet-tag";
        cabinetTag.textContent = responseIcon.punti_luce[indexQuadro].quadro;
        cabinetTag.style.backgroundColor = '#0000FF';
        puntoColor={
            coloreBackground: null,
            coloreGliph: null,
            icona: cabinetTag
        };
}else if (responseIcon.punti_luce[indexQuadro].proprieta === 'EnelSole' || responseIcon.punti_luce[indexQuadro].proprieta === 'Enelsole'|| responseIcon.punti_luce[indexQuadro].proprieta === 'Enel') {
    const cabinetTag = document.createElement("div");
    cabinetTag.className = "cabinet-tag";
    cabinetTag.textContent = responseIcon.punti_luce[indexQuadro].quadro;
    cabinetTag.style.backgroundColor = '#FF0000';
        puntoColor={
            coloreBackground: null,
            coloreGliph: null,
            icona: cabinetTag
        };
} else{
    const cabinetTag = document.createElement("div");
    cabinetTag.className = "cabinet-tag";
    cabinetTag.textContent = responseIcon.punti_luce[indexQuadro].quadro;
    cabinetTag.style.backgroundColor = '#000000';
        puntoColor={
            coloreBackground: null,
            coloreGliph: null,
            icona: cabinetTag
        };
}
}
    else {
        puntoColor={
            coloreBackground:'#FFFFFF',
            coloreGliph: '#FFFFFF'
        };
    }
    return puntoColor;
}
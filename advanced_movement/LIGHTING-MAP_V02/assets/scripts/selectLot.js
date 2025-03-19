let counterForLotti = 0;
let counterLotti = 0;

function lottiUnici(response){
    let lottiUniciVar = [];
    for(var i = 0; i <response.punti_luce.length; i++) {
        let lottoCorrente = response.punti_luce[i].lotto;
        if (!lottiUniciVar.includes(lottoCorrente)){
            lottiUniciVar.push(lottoCorrente);
        }else{}
    }
    return lottiUniciVar;
}

function coloreLottoCorrente(lottiUniciVar) {
    let lottiColor = {};
    let arrayLottiColore = [];
    for (var j=0; j<lottiUniciVar.length; j++){
        lottiColor={
            lotto: lottiUniciVar[j],
            coloreBackground: colorsBackground[j],
            coloreGliph: coloreGliphOn
        };
        arrayLottiColore.push(lottiColor);
    }
    return arrayLottiColore;
}

function coloreMarkerCorrente(arrayLottiColore, indexLotto, response){

    let lottoColor ={};
    if (response.punti_luce[indexLotto].marker === 'PL'){
        for (var i = 0; i < arrayLottiColore.length; i++){
            if (response.punti_luce[indexLotto].lotto === arrayLottiColore[i].lotto) {
                lottoColor={
                    lottoCorrente: response.punti_luce[i].lotto,
                    coloreBackground: arrayLottiColore[i].coloreBackground,
                    coloreGliph: arrayLottiColore[i].coloreGliph,
                    icona: ''
                }
                counterForLotti++;
            }
        }
    
    }else if (response.punti_luce[indexLotto].marker === 'QE'){
        for (var i = 0; i < arrayLottiColore.length; i++) {
            if (response.punti_luce[i].lotto === arrayLottiColore[i].lotto) {
                const cabinetTag = document.createElement("div");
                cabinetTag.className = "cabinet-tag";
                cabinetTag.textContent = response.punti_luce[indexLotto].quadro;
                cabinetTag.style.backgroundColor = arrayLottiColore[i].coloreBackground;
                lottoColor={
                    lottoCorrente: response.punti_luce[i].lotto,
                    coloreBackground: '',
                    coloreGliph: '',
                    icona: cabinetTag
                };
                counterLotti++;
            }
        }   
    }else {
        lottoColor={
            //lottoCorrente: response.punti_luce[i].lotto,
            coloreBackground: '#FFFFFF',
            coloreGliph: '#ff0004',
            icona: ''
        }
    }
    return lottoColor;
}
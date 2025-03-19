let quadri = [];
let counter = 0;
let counterQuadri = 0;

function quadriUnici(response) {
    let quadriUniciVar = []; // Un nuovo array per memorizzare i quadri univoci
    for (var i = 0; i < response.punti_luce.length; i++) {
      let quadroCorrente = response.punti_luce[i].quadro;
      if (!quadriUniciVar.includes(quadroCorrente)) {
        quadriUniciVar.push(quadroCorrente); // Aggiungi il quadro all'array dei quadri unici
      } else {}
    }
    return quadriUniciVar;
}

function coloreQuadroCorrente(quadriUnici) {
    let quadriColor = {};
    let arrayQuadriColore = [];
    for (var j = 0; j < quadriUnici.length; j++) {

            quadriColor = {
                numeroQuadro: quadriUnici[j],
                coloreBackground: colorsBackground[j],
                coloreGliph: colorsGliph[j]
            };


    arrayQuadriColore.push(quadriColor);
}

return arrayQuadriColore;
}

function colorePuntoCorrente (arrayQuadriColore, indexQuadro, response) {
  
  let puntoColor = {};
  if (response.punti_luce[indexQuadro].marker === 'PL') { 
  for (var i = 0; i < arrayQuadriColore.length; i++){
  if (response.punti_luce[indexQuadro].quadro === arrayQuadriColore[i].numeroQuadro) {
    puntoColor = {
      PuntoLuce: response.punti_luce[i].numero_palo,
      quadroCorrente: response.punti_luce[i].quadro,
      coloreBackground: arrayQuadriColore[i].coloreBackground,
      coloreGliph: arrayQuadriColore[i].coloreGliph,
      icona: ''
    }
    counter++;
  }
}
}else if (response.punti_luce[indexQuadro].marker === 'QE') {
  for (var i = 0; i < arrayQuadriColore.length; i++){

    if (response.punti_luce[indexQuadro].quadro === arrayQuadriColore[i].numeroQuadro) {

      const cabinetTag = document.createElement("div");
      cabinetTag.className = "cabinet-tag";
      cabinetTag.textContent = response.punti_luce[indexQuadro].quadro;
      cabinetTag.style.backgroundColor = arrayQuadriColore[i].coloreBackground;
          puntoColor={
              coloreBackground: '',
              coloreGliph: '',
              icona: cabinetTag,
              PuntoLuce: response.punti_luce[i].numero_palo,
              quadroCorrente: response.punti_luce[i].quadro
          };
          counterQuadri++;
    }
  }
}else{
  puntoColor={
    coloreBackground: '#FFFFFF',
    coloreGliph: '#FFFFFF',
    icona: '',
    PuntoLuce: response.punti_luce[i].numero_palo,
    quadroCorrente: response.punti_luce[i].quadro
};
}
return puntoColor;
}

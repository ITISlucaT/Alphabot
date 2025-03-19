async function initMapForCabinet() {
    const {PinElement} = await google.maps.importLibrary("marker");
    globalCounter = 0;
    let coloreQuadri = [];
    let quadriUniciColor= [];
    let currentInfoWindow = null;
    
    removeMarkers();

    const city = citySelect.value;

    fillSessionStorage(citySelect.value, highlightSelect.value, filterSelect.value);
    
    if (city !== lastCityLoaded) {
        const mapData = await mapDatas(city);
        response = mapData.response;
        markers = mapData.markers;
        infowindow = mapData.infowindow;
        lastCityLoaded = city; 
        }else{
            if(highlightSelect.value !== lastHighlightSelected || filterSelect.value !== lastFilterSelected){
                map.setZoom(parseInt(localStorage.getItem("zoom")));
                map.setCenter(new google.maps.LatLng(markers[0].lat, markers[0].lng));
            }else{
                map.setZoom(parseInt(localStorage.getItem("zoom")));
                map.setCenter(new google.maps.LatLng(parseFloat(localStorage.getItem("lat")), parseFloat(localStorage.getItem("lng"))))
            }
            lastHighlightSelected = highlightSelect.value;
            lastFilterSelected = filterSelect.value;
               
        }
        geolocationPosition();
        let filteredMarkers = markers
        if(filterSelect.value !== "SELECT")
            filteredMarkers = chooseFilter(markers)
    quadriUniciColor=quadriUnici(response);
        
    for(const marker of filteredMarkers) {
    const content = { ...marker };
    delete content.lat;
    delete content.lng;

    const position = new google.maps.LatLng(marker.lat, marker.lng);
    let puntoColor={};

    coloreQuadri=coloreQuadroCorrente(quadriUniciColor);
    puntoColor=colorePuntoCorrente(coloreQuadri,globalCounter, response);
    
    
   let pinColor;
        if (marker.segnalazioni_in_corso.length > 0) {
            
            if(puntoColor.icona === ''){
                puntoColor.coloreGliph = '#ffff00'; 
                pinColor = new PinElement({
                    background: puntoColor.coloreBackground,
                    borderColor: '#000000',
                    scale: 1,
                    glyphColor: puntoColor.coloreGliph, 
                    //glyph: puntoColor.icona
                });
            }else{
                const dangerSvg = `<svg fill="#ffff00" height="100%" width="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 374.643 374.643" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 374.643 374.643">
                                        <path d="m107.365,292.59c0,21.955 8.723,42.43 24.563,57.65l25.394,24.402v-60.468h60v60.467l25.394-24.401c15.839-15.221 24.563-35.694 24.563-57.65 0-38.96-28.016-71.482-64.956-78.524v-53.488c36.94-7.042 64.956-39.564 64.956-78.524 0-21.956-8.724-42.43-24.563-57.65l-25.395-24.403v60.467h-60v-60.468l-25.394,24.402c-15.839,15.221-24.563,35.695-24.563,57.65 0,38.96 28.016,71.482 64.956,78.524v53.488c-36.938,7.044-64.955,39.566-64.955,78.526zm129.203-8.415h-98.494c4.011-23.554 24.568-41.541 49.247-41.541 24.68-2.84217e-14 45.237,17.987 49.247,41.541zm-98.494-193.707h98.494c-4.011,23.554-24.567,41.541-49.247,41.541-24.679-2.84217e-14-45.236-17.988-49.247-41.541z"/>
                                    </svg>`
                var newDiv = document.createElement('div');

                newDiv.innerHTML = dangerSvg;
                puntoColor.icona.insertBefore(newDiv, puntoColor.icona.firstChild);
                pinColor = new PinElement({
                    background: puntoColor.coloreBackground,
                    borderColor: '#000000',
                    scale: 1,
                    glyphColor: puntoColor.coloreGliph, 
                    glyph: puntoColor.icona
                });
            }
        }
        else{
            pinColor = new PinElement({
                background: puntoColor.coloreBackground,
                borderColor: '#000000',
                scale: 1,
                glyphColor: puntoColor.coloreGliph, 
                glyph: puntoColor.icona
            });
        }
            
    const mapMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: position,
        content: pinColor.element
        });

    createInfoWindow(mapMarker, infowindow, content, marker, city)
    globalCounter++;
    activeMarkers.push({ data: marker, ref: mapMarker });
    }

}
async function initMapForType() {
    const {PinElement} = await google.maps.importLibrary("marker");
    i = 0;
    let quadriUniciColor= [];
    let currentInfoWindow = null;
    
    const city = citySelect.value;
    fillSessionStorage(citySelect.value, highlightSelect.value, filterSelect.value);
    removeMarkers();

    if (city !== lastCityLoaded) {
        const mapData = await mapDatas(city);
        response = mapData.response;
        markers = mapData.markers;
        infowindow = mapData.infowindow;
        lastCityLoaded = city; // Aggiorna l'ultima città caricata
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
        
        puntoColor=selectType(i, response);

        if (marker.segnalazioni_in_corso.length > 0) {
            puntoColor.coloreGlyph = '#ffff00'
        }

        const pinColor = new PinElement({
        //element: pinElementOptions.element,
        background: puntoColor.coloreBackground,
        borderColor: '#000000',
        scale: 1,
        glyphColor: puntoColor.coloreGlyph,
        glyph: puntoColor.icona
        });
                
        const mapMarker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: position,
            content: pinColor.element
            });

        createInfoWindow(mapMarker, infowindow, content, marker, city)
        i++;
        activeMarkers.push({ data: marker, ref: mapMarker });
    }
        

    }
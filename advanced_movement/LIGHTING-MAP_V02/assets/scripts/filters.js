function filterByReported(markers){
    return markers.filter(marker =>{
        if (marker.segnalazioni_in_corso.length > 0) return true;
    })
}

function filterByCabinet(markers){
    return markers.filter(marker =>{
        if (marker.marker === 'QE') return true;
    })
}


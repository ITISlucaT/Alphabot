
function colorMarkers(value) {
    if(!value?.length) return activeMarkers.forEach(marker => marker.ref.setIcon({
        path: marker.data.MARKER === 'PL'
            ? mapIcons.shapes.MAP_PIN
            : marker.data.MARKER === 'QE'
                ? mapIcons.shapes.SQUARE_ROUNDED
                : mapIcons.shapes.SQUARE_PIN,
        fillColor: DEFAULT_COLOR,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 1
    }));

    activeMarkers
        .forEach(marker => marker.ref.setIcon({
                path: marker.data.MARKER === 'PL'
                    ? mapIcons.shapes.MAP_PIN
                    : marker.data.MARKER === 'QE'
                        ? mapIcons.shapes.SQUARE_ROUNDED
                        : mapIcons.shapes.SQUARE_PIN,
                fillColor: Object.fromEntries([...new Set(activeMarkers.map(marker => marker.data[value]))].map((value, i) => [value, COLORS[i]]))[marker.data[value]] ?? DEFAULT_COLOR,
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 1
            })
        );
}

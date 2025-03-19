const BASE_URL = 'https://lighting-map.glitch.me'; 

const citySelect = document.querySelector('select#city');
const mapDiv = document.querySelector('div#map');
const btnAggiungi = document.getElementById('btnAggiungi');
const highlightSelect = document.querySelector('select#highlight');
const filterSelect = document.querySelector('select#filter');
const COLORS = ['#0097e6', '#8c7ae6', '#e1b12c', '#44bd32', '#40739e', '#273c75'];

let activeMarkers = [];
let lastModified = 0;
let responseIcon = [];
let contentIcon = [];
let contMarker = 0;
let globalCounter = 0;
let lastCityLoaded = null;
let lastHighlightSelected = null;
let lastFilterSelected = null;
let response, markers, infowindow;
let jsonResponseForDownload;
let isRecharged = false;
let userLocation, possibleUserLocation;
let currentInfoWindow = null;

const listIgnoratedFieldsPL = ["_id", "pod",  "numero_contatore", "alimentazione", "potenza_contratto", "potenza", "punti_luce", "tipo", "__v"];
const listIgnoratedFieldsQE = [
    "_id",
    "numero_palo",
    "composizione_punto",
    "lotto",
    "quadro",
    "proprieta",
    "tipo_apparecchio",
    "modello",
    "numero_apparecchi",
    "lampada_potenza",
    "tipo_sostegno",
    "tipo_linea",
    "promiscuita",
    "note",
    "garanzia",
    "__v"
];

const map = new google.maps.Map(mapDiv, {
    zoom: 15,
    center: new google.maps.LatLng(0, 0),
    //styles: [{ featureType: 'poi', stylers: [{ 'visibility': 'off' }] }],
    mapId: "3893e55ce832a481"
});



const translation_report_type = {
    "LIGHT_POINT_OFF": "Punto luce spento",
    "PLANT_OFF": "Impianto spento",
    "DAMAGED_COMPLEX": "Complesso danneggiato",
    "DAMAGED_SUPPORT": "Morsettiera rotta",
    "BROKEN_TERMINAL_BLOCK": "Sostegno danneggiato",
    "BROKEN_PANEL": "Quadro danneggiato",
    "OTHER": "Altro",
    "MADE_SAFE_BUT_SYSTEM_NEEDS_RESTORING": "Messa in sicurezza ma da ripristinare impianto",
    "FAULT_ELIMINATED_AND_SYSTEM_RESTORED": "Guasto eliminato e impianto ripristinato"
}  

function translateString(englishString) {
    return translation_report_type[englishString] || englishString;
  }

function transformDateToIT(dateToConvert){
  const date = new Date(dateToConvert);

  const options = {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
  };

  return date.toLocaleString("it-IT", options);
}

async function getData(city) {
    try {
      const response = await fetch(`${BASE_URL}/townHalls/${city}`)
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  }

function removeMarkers() {
    activeMarkers.forEach(marker => {
        marker.ref.setMap(null);
    });
    activeMarkers = [];
}

function centerMapOnNewData(markers) {
    if (markers.length > 0) {
      const firstMarkerPosition = new google.maps.LatLng(markers[0].lat, markers[0].lng);
      map.setCenter(firstMarkerPosition);
    }
  } 


  function initializeMap() {
    map = new google.maps.Map(mapDiv, {
        zoom: 15,
        center: new google.maps.LatLng(0, 0),
        mapId: "3893e55ce832a481"
    });
  }



function createInfoWindow(mapMarker, infowindow, content, marker, city) {
    mapMarker.addListener('gmp-click', () => {
        if (currentInfoWindow) {
            currentInfoWindow.close();
        }
        if(userData.user_type === "SUPER_ADMIN"){
        //bottone per l'edit del punto
        google.maps.event.addListener(infowindow, 'domready', function() {
            const iwOuter = document.querySelector('.gm-style-iw');
    
            if (iwOuter) {
                const targetDiv = iwOuter.querySelector('.gm-style-iw-chr');
                if (targetDiv) {
                    // Seleziona il bottone esistente e rimuovilo
                    const existingButton = targetDiv.querySelector('button.material-icons-outlined');
                    if (existingButton) {
                        targetDiv.removeChild(existingButton);
                    }
                    
                    let btnEdit = document.createElement('button');
                    btnEdit.className = "material-icons-outlined base-btn";
                    btnEdit.id = "edit-btn";
                    btnEdit.textContent = "edit";
                    btnEdit.onclick = () => {
                        const editableContent = makeContentEditable(content);
                        infowindow.setContent(editableContent);
                        google.maps.event.addListener(infowindow, 'domready', function() {
                            const btnSave = document.getElementById('btnSave');
                            if (btnSave) 
                                btnSave.addEventListener("click", ()=>saveEdit(marker, infowindow));
                        });
                    };
                    
                    let firstChild = targetDiv.firstChild;

                    if (firstChild) {
                        targetDiv.insertBefore(btnEdit, firstChild);
                    } else {
                        targetDiv.appendChild(btnEdit);
                    }
                }
            }
        });
    }
        
        if (infowindow.getMap()) return;
          let infowindowContent = Object.entries(content)
            .filter(([_key, value]) =>  (!Array.isArray(value) || value.length > 0))
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    // Crea un elenco per gli array non vuoti
                    const listItems = value.reverse().map(item => {
                        if (item.report_type) {
                            const dateString = transformDateToIT(item.report_date);
                            return `<details><summary class="list-item">${dateString} - ${translateString(item.report_type)}</summary>
                            <p>${item.description}</p>
                            </details>`;
                        } else if (item.operation_type) {
                            const dateString = transformDateToIT(item.operation_date);
                            return `<details><summary class="list-item">${dateString} - ${translateString(item.operation_type)}</summary>
                            <p>${item.note}</p>
                            </details>`;
                        } else {
                            return `<li class="list-item">${translateString(item)}</li>`;
                        }
                    }).join('');
                    
                    return `<strong>${key}:</strong><ul class="list-container">${listItems}</ul>`;
                }  else {
                    if (marker.marker === "PL") {
                        if (listIgnoratedFieldsPL.includes(key)) return ""
                        else if (!value) return `<strong>${key}:</strong> N.D.`
                        else return `<strong>${key}:</strong> ${value}`
                    } else{
                        if (listIgnoratedFieldsQE.includes(key)) return '' 
                        else if (!value) return `<strong>${key}:</strong> N.D.`
                        else return `<strong>${key}:</strong> ${value}`
                    }
                }
            })
            .filter(Boolean)
            .join('<br>');

          infowindowContent += `<div class="containerButtonInfoWindow"><button class="base-btn street-view" onclick="toggleStreetView(${marker.lat}, ${marker.lng})">Vedi in StreetView</button>`;
          infowindowContent += `<button class="base-btn navigate-point" onclick="navigateToLocation(${marker.lat}, ${marker.lng})">Vai al punto</button>`;
            if(userData.user_type !== "DEFAULT_USER")
                infowindowContent +=`<button class="base-btn operation-button" onclick="startOperation('${city}','${clearBlanket(marker.numero_palo)}', ${marker.lat}, ${marker.lng})">Risolvi guasto</button>`;
          infowindowContent += `<button class="base-btn report-point" onclick="reportPoint('${city}','${clearBlanket(marker.numero_palo)}', ${marker.lat}, ${marker.lng}, '${clearBlanket(marker.indirizzo)}')">Segnala guasto</button>`
            infowindowContent += `</div>`;

          infowindow.setContent(infowindowContent);
          infowindow.open(map, mapMarker);
          currentInfoWindow = infowindow;
          map.addListener('click', () => {
            if (infowindow) {
                infowindow.close();
                currentInfoWindow = null;
            }
        });

      });
}

function makeContentEditable(content) {
    let newContent = Object.entries(content)
        .filter(([_key, value]) => value ?? false)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                const listItems = value.map((item, index) => {
                    if (item.report_type) {
                        const dateString = transformDateToIT(item.report_date);
                        return `<li class="list-item"><label for="input-${key}-${index}">${dateString}</label><input type="text" id="input-${key}-${index}" value="${translateString(item.report_type)}" /><input type="text" id="input-${key}-${index}-type" value="${item.description}" /></li>`;
                    } else if (item.operation_type) {
                        const dateString = transformDateToIT(item.operation_date);
                        return `<li class="list-item"><label for="input-${key}-${index}">${dateString}</label><input type="text" id="input-${key}-${index}" value="${translateString(item.operation_type)}" /><input type="text" id="input-${key}-${index}-type" value="${item.note}" /></li>`;
                    } else {
                        return `<li class="list-item"><input type="text" id="input-${key}-${index}" value="${translateString(item)}" /></li>`;
                    }
                }).join('');
                
                return `<strong>${key}:</strong><ul class="list-container">${listItems}</ul>`;
            } else {
                return `<strong>${key}:</strong> <input type="text" id="input-${key}" value="${value}" />`;
            }
        })
        .join('<br>');

    newContent += `<div class="containerButtonInfoWindow"><button class="base-btn save" id="btnSave">Salva</button></div>`;
    return newContent;
}


function createReportJSON(th){
    let jsonToSend={
        segnalazioni_in_corso: [],
        segnalazioni_risolte: [],
        operazioni_effettuate: []
    }
    th.punti_luce.forEach(pl=>{
        if (pl.segnalazioni_in_corso.length > 0) {
            pl.segnalazioni_in_corso.forEach(report =>{
                const objToInsert ={
                    COMUNE: citySelect.value,
                    NUMERO_PALO: pl.numero_palo,
                    INDIRIZZO: pl.indirizzo,
                    DATA_SEGNALAZIONE: transformDateToIT(report.report_date),
                    TIPO_DI_SEGNALAZIONE: translateString(report.report_type),
                    DESCRIZIONE: report.description
                }
                jsonToSend.segnalazioni_in_corso.push(objToInsert)
            })  
        }
        if (pl.segnalazioni_risolte.length > 0) {
            pl.segnalazioni_in_corso.forEach(report =>{
                const objToInsert ={
                    COMUNE: citySelect.value,
                    NUMERO_PALO: pl.numero_palo,
                    INDIRIZZO: pl.indirizzo,
                    DATA_RISOLUZIONE: transformDateToIT(report.report_date),
                    TIPO_DI_SEGNALAZIONE: translateString(report.report_type),
                    DESCRIZIONE: report.description
                }
                jsonToSend.segnalazioni_risolte.push(objToInsert)
            })  
        }
        if (pl.operazioni_effettuate.length > 0) {
            pl.operazioni_effettuate.forEach(operation => {
                const objToInsert ={
                    COMUNE: citySelect.value,
                    NUMERO_PALO: pl.numero_palo,
                    INDIRIZZO: pl.indirizzo,
                    DATA_OPERAZIONE: transformDateToIT(operation.operation_date),
                    TIPO_DI_OPERAZIONE: translateString(operation.operation_type),
                    DESCRIZIONE: operation.note,
                    RESPONSABILE_OPERAZIONE: operation.operation_responsible ? operation.operation_responsible.name + '_' + operation.operation_responsible.surname : ''
                }
                jsonToSend.operazioni_effettuate.push(objToInsert)
            }) 
        }
    })
    return jsonToSend;
}

async function mapDatas(city){

    const response = await getData(city)
    jsonResponseForDownload = createReportJSON(response)

    responseIcon = response;
    const markers = response.punti_luce.map(point => ({ ...point, lat: point.lat.replace(',', '.'), lng: point.lng.replace(',', '.') }));
    lastModified = response.lastModified;
    (!localStorage.getItem("lat") && !localStorage.getItem("lng")) || citySelect.value !== lastCityLoaded ? map.setCenter(new google.maps.LatLng(markers[0].lat, markers[0].lng)): map.setCenter(new google.maps.LatLng(parseFloat(localStorage.getItem("lat")), parseFloat(localStorage.getItem("lng"))));
    !localStorage.getItem("zoom")? map.setZoom(10) : map.setZoom(localStorage.getItem("zoom"));
    const infowindow = new google.maps.InfoWindow();
    //if (autocomplete) autocomplete.setBounds(map.getBounds()); //autocompletamento barra di ricerca

    return {response, markers, infowindow}
}

function fillSessionStorage(city, highlightSelected, filterSelected){
    localStorage.setItem("selectedCity", city);
    localStorage.setItem("highlightSelected", highlightSelected);
    localStorage.setItem("filterSelected", filterSelected);
}

function setValuesFromSessionStorage(){
    citySelect.value = localStorage.getItem("selectedCity");
    highlightSelect.value = localStorage.getItem("highlightSelected");
    filterSelect.value = localStorage.getItem("filterSelected"); 
}

function setZoomSessionStorage(lat, lng){
    localStorage.setItem("lat", lat);
    localStorage.setItem("lng", lng);
}

async function initMap() {
  const {PinElement} = await google.maps.importLibrary("marker");

    const city = citySelect.value;
    
    removeMarkers();
    
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
    
    fillSessionStorage(citySelect.value, highlightSelect.value, filterSelect.value);

    let filteredMarkers = markers
    if(filterSelect.value !== "SELECT")
        filteredMarkers = chooseFilter(markers)
    
     
    geolocationPosition();
    
    for(const marker of filteredMarkers) {
        const content = { ...marker };
        delete content.lat;
        delete content.lng;

        let glyph_color = DEFAULT_COLOR;
        if (marker.segnalazioni_in_corso.length > 0) {
            glyph_color = '#ffff00'
        }
        
        const position = new google.maps.LatLng(marker.lat, marker.lng);

       const pinColor = new PinElement({
        //element: pinElementOptions.element,
        background: DEFAULT_COLOR,
        borderColor: '#000000',
        scale: 1,
        glyphColor: glyph_color,
        //glyph: puntoColor.icona
       });
        const mapMarker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: position,
            content: pinColor.element
            });

        createInfoWindow(mapMarker, infowindow, content, marker, city)

        activeMarkers.push({ data: marker, ref: mapMarker });
    
    }
}

function clearBlanket(str) {
    return str.replace(/[\s'"]+/g, '');
}


function toggleStreetView(lat, lng) {
    setZoomSessionStorage(lat, lng);
    if(lat && lng) {
        const position = new google.maps.LatLng(lat, lng);
        const DOMElement = document.getElementById('streetview');
        new google.maps.StreetViewPanorama(DOMElement, { position });
    }

    const container = document.querySelector('section.streetview-container');
    const mapContainer = document.querySelector('section.map-container');
    mapContainer.style.display = mapContainer.style.display !== 'block' ? 'block' : 'none';
    container.style.display = container.style.display !== 'block' ? 'block' : 'none';
}

function navigateToLocation(lat, lng) {
    setZoomSessionStorage(lat, lng);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url);
}

function reportPoint(th, n_lp, lat, lng, addr) {
    setZoomSessionStorage(lat, lng);
    const url = `report.html?comune=${encodeURIComponent(th)}&numeroPalo=${encodeURIComponent(n_lp)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&adr=${encodeURIComponent(addr)}`;
    window.location.href = url;
}

function startOperation(th, n_lp, lat, lng){
    setZoomSessionStorage(lat, lng);
    const url = `operation.html?comune=${encodeURIComponent(th)}&numeroPalo=${encodeURIComponent(n_lp)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
    window.location.href = url;
}

async function saveEdit(content) {
    const updatedContent = updateParams(content);
    const jsonToSend = {
        user_type: userData.user_type,
        light_point: updatedContent
    }  
    try {
        const response = await fetch(`${BASE_URL}/townHalls/lightPoints/update/${updatedContent._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(jsonToSend)
        });
    
        if (!response.ok) {
            const errorResult = await response.text();
            console.error(errorResult);
            const stringToAdd = `<div>${errorResult}</div>`;
            infowindow.setContent(stringToAdd);
        } else {
            const successResult = await response.json(); // Assumendo che il server restituisca JSON
            const stringToAdd = `<div class="dummy-positioning d-flex"><div class="success-icon">
                <div class="success-icon__tip"></div>
                <div class="success-icon__long"></div></div>
                </div>`;
            infowindow.setContent(stringToAdd);
        }
        setTimeout(() => {
            infowindow.close();
        }, 2000);
    
    } catch (e) {
        const stringToAdd = `<div>Nessuna risposta dal server</div>`;
        infowindow.setContent(stringToAdd);
        console.error(e);
        setTimeout(() => {
            infowindow.close();
        }, 2000);
    }
    
}



function updateParams(content) {
    
    let updatedContent = {...content}; 

    Object.entries(content).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            updatedContent[key] = value.map((item, index) => {
                let updatedItem = {...item}; 
                if (item.report_type) {
                    let reportTypeInput = document.getElementById(`input-${key}-${index}`);
                    let descriptionInput = document.getElementById(`input-${key}-${index}-type`);
                    if (reportTypeInput && descriptionInput) {
                        updatedItem.report_type = translateString(reportTypeInput.value);
                        updatedItem.description = descriptionInput.value;
                    }
                }
                else if (item.operation_type) {
                    let operationTypeInput = document.getElementById(`input-${key}-${index}`);
                    let noteInput = document.getElementById(`input-${key}-${index}-type`);
                    if (operationTypeInput && noteInput) {
                        updatedItem.operation_type = translateString(operationTypeInput.value);
                        updatedItem.note = noteInput.value;
                    }
                }
                else {
                    let simpleInput = document.getElementById(`input-${key}-${index}`);
                    if (simpleInput) {
                        updatedItem = translateString(simpleInput.value);
                    }
                }
                return updatedItem;
            });
        } else {
            let inputElement = document.getElementById(`input-${key}`);
            if (inputElement) {
                updatedContent[key] = inputElement.value;
            }
        }
    });
    return updatedContent;
}

function createSuccessElement(divContainer){
    
    var dummyPositioning = document.createElement('div');
    dummyPositioning.className = 'dummy-positioning d-flex';

    var successIcon = document.createElement('div');
    successIcon.className = 'success-icon';

    var successIconTip = document.createElement('div');
    successIconTip.className = 'success-icon__tip';

    var successIconLong = document.createElement('div');
    successIconLong.className = 'success-icon__long';

    successIcon.appendChild(successIconTip);
    successIcon.appendChild(successIconLong);

    dummyPositioning.appendChild(successIcon);

    divContainer.appendChild(dummyPositioning);

}
let pos;
function goToActualDestination(){
    map.setCenter(pos)
}


function geolocationPosition(){
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            if (!userLocation) {
                userLocation = new google.maps.marker.AdvancedMarkerElement({
                    position: pos,
                    map: map,
                    title: 'La tua posizione',
                    content: document.createElement('div')
                });
                userLocation.content.innerHTML = '<div style="background-color: #4285F4; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white;"></div>';

            } else {
                userLocation.position = pos;
            }

            if (!possibleUserLocation) {
                possibleUserLocation = new google.maps.Circle({
                    map: map,
                    radius: position.coords.accuracy,
                    fillColor: '#4285F4',
                    fillOpacity: 0.2,
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.5,
                    strokeWeight: 1
                });

            } else {
                possibleUserLocation.setCenter(pos);
                possibleUserLocation.setRadius(position.coords.accuracy);
            }
            if (position.coords.accuracy < 15) { 
                possibleUserLocation.setMap(map); 
            } else {
                possibleUserLocation.setMap(null); 
            }
            map.addListener('zoom_changed', function() {
                var zoomLevel = map.getZoom();
                localStorage.setItem("zoom", zoomLevel);

                if (zoomLevel < 15 || position.coords.accuracy > 15) {
                    possibleUserLocation.setMap(null); 
                } else {
                    possibleUserLocation.setMap(map); 
                }
            });

        }, function() {
            handleLocationError(true, map.getCenter());
        }, {
            enableHighAccuracy: true 
        });
    }
}


function chooseFilter(markers){
    const selectedFilter = filterSelect.value;

    switch (selectedFilter) {
        case 'REPORTED':
            return filterByReported(markers);
            break;

        case 'MARKER':
            return filterByCabinet(markers);
            break;

        case 'PROPRIETA':
            break;
        case 'LOTTO':
            break;
        default:
            break; 
    }

}

  

function loadMap() {
    const selectedMap = highlightSelect.value;
    switch (selectedMap) {
    case 'MARKER':
        initMapForCabinet()
        break;
    case 'PROPRIETA':
        initMapForType();
        break;
    case 'LOTTO':
        initMapLot();
        break;
    default:
        initMap();
        break;
    }
  }

citySelect.addEventListener('change', loadMap);
highlightSelect.addEventListener('change',  loadMap);
filterSelect.addEventListener('change', loadMap);

if (!localStorage.getItem("selectedCity") && !localStorage.getItem("highlightSelected") && !localStorage.getItem("filterSelected")) 
    fillSessionStorage(userData.town_halls_list[0].name, highlightSelect.value, filterSelect.value);

setValuesFromSessionStorage();

//setZoomSessionStorage(0, 0)
createLoader(mapDiv);
document.addEventListener('DOMContentLoaded',() => {
    loadMap();
    removeLoader(mapDiv);
});

function createLoader(container) {
    const loader = document.createElement('div');
    loader.className = 'loader';

    for (let i = 0; i < 3; i++) {
      const circle = document.createElement('div');
      circle.className = 'circle';
      loader.appendChild(circle);
    }

    const square = document.createElement('div');
    square.className = 'square';
    loader.appendChild(square);

    container.appendChild(loader);
  }

  function removeLoader(container) {
    const loader = container.querySelector('.loader');
    if (loader) {
      container.removeChild(loader);
    }
  }
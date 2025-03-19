const form = document.querySelector('form#search-bar');
const input = document.querySelector('form#search-bar input');
const btnSearchBar = document.getElementById('btnSearchBar');
const selectFilter = document.getElementById('searchFilter');
const arrowRight = document.getElementById('arrowRight');
const arrowLeft = document.getElementById('arrowLeft');
const slctCity = document.getElementById('city');
const suggestionsBox = document.getElementById('suggestions');
const deleteBtn = document.getElementById('delete-btn'); 

let foundMarkers = [];
let arrowCounter = 0;

arrowLeft.style.display = 'none';
arrowRight.style.display = 'none';

async function search(e) {
    e.preventDefault(); // Previene il comportamento di invio predefinito del form
    const city = slctCity.value;

    arrowCounter = 0;
    let marker = [];
    foundMarkers = [];
    if (!input.value) {
        alert('Digita un valore nella barra di ricerca');
        return;
    } 

    marker = searchMarkers();

    if (marker.length === 0) {
        alert('Valore non trovato');
        return;
    }
    if (!marker) {
        alert('Marker non definito');
        return;
    } 
    marker[0].ref.map.setZoom(30);
    marker[0].ref.map.setCenter(new google.maps.LatLng(marker[0].data.lat, marker[0].data.lng));
  
    input.value = ''; // Pulisce l'input
    foundMarkers = marker; // Salva i marker trovati
    marker = [];
    if (foundMarkers.length > 1) {
        arrowLeft.style.display = 'inline-block'; // Mostra il bottone sinistro
        arrowRight.style.display = 'inline-block';
    } else {
        arrowLeft.style.display = 'none';
        arrowRight.style.display = 'none';
    }
    suggestionsBox.style.display = 'none';
    return foundMarkers;
}

btnSearchBar.addEventListener('click', search);
form.addEventListener('submit', search);

arrowRight.addEventListener('click', e => {
    arrowCounter++;
    if (arrowCounter >= foundMarkers.length) {
        arrowCounter = foundMarkers.length - 1; // Correzione
        return;
    } 
    foundMarkers[arrowCounter].ref.map.setZoom(30);
    foundMarkers[arrowCounter].ref.map.setCenter(new google.maps.LatLng(foundMarkers[arrowCounter].data.lat, foundMarkers[arrowCounter].data.lng));
});

arrowLeft.addEventListener('click', e => {
    arrowCounter--;
    if (arrowCounter < 0) {
        arrowCounter = 0; // Correzione
        return;
    } 
    foundMarkers[arrowCounter].ref.map.setZoom(30);
    foundMarkers[arrowCounter].ref.map.setCenter(new google.maps.LatLng(foundMarkers[arrowCounter].data.lat, foundMarkers[arrowCounter].data.lng));
});

input.addEventListener('input', () => {
    const searchValue = input.value.trim().toLowerCase();
    if (searchValue) {
        showSuggestions(searchValue);
    } else {
        suggestionsBox.style.display = 'none';
    }
});

deleteBtn.addEventListener('click', () => {
    input.value = '';
    suggestionsBox.style.display = 'none'; // Nascondi i suggerimenti
});

// Mostra suggerimenti trovati
function showSuggestions(searchValue) {
    const filterType = selectFilter.value;

    // Pulisci i suggerimenti precedenti
    suggestionsBox.innerHTML = '';
    
    // Filtra gli activeMarkers in base al filtro selezionato
    const filteredMarkers = filterMarkers();

    // Mostra suggerimenti trovati
    if (filteredMarkers.length > 0) {
        suggestionsBox.style.display = 'block';

        filteredMarkers.forEach(marker => {
            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion-item');

            // Aggiungi contenuto in base al filtro
            if (filterType === "NumeroPalo") suggestion.textContent = marker.data.numero_palo;
            else if (filterType === "Quadro") suggestion.textContent = marker.data.quadro;
            else if (filterType === "Lotto") suggestion.textContent = marker.data.lotto;
            else if (filterType === "Via") suggestion.textContent = marker.data.indirizzo;

            // Imposta il comportamento di click
            suggestion.addEventListener('click', (e) => {
                input.value = suggestion.textContent; // Imposta l'input
                suggestionsBox.style.display = 'none'; // Nasconde i suggerimenti
                search(e); // Esegui la ricerca
            });

            suggestionsBox.appendChild(suggestion);
        });
    } else {
        suggestionsBox.style.display = 'none';
    }
}

function searchMarkers() {
    let marker = [];
    const valueInput = input.value;
    if (selectFilter.value === 'NumeroPalo') {
        marker = activeMarkers.filter(m => m.data.numero_palo.toLowerCase() == valueInput.toLowerCase());
    } else if (selectFilter.value === 'Quadro') {
        marker = activeMarkers.filter(m => m.data.quadro.toLowerCase() == valueInput.toLowerCase());
    } else if (selectFilter.value === 'Lotto') {
        marker = activeMarkers.filter(m => m.data.lotto.toLowerCase() === valueInput.toLowerCase());
    }

    return marker;
}

function filterMarkers() {
    const valueInput = input.value.toLowerCase();
    const uniqueMarkers = {};
    let marker = [];
    if (selectFilter.value === 'NumeroPalo') {
        marker = activeMarkers.filter(m => {
            const numPalo = m.data.numero_palo.toLowerCase();
            if (numPalo.startsWith(valueInput) && !uniqueMarkers[numPalo]) {
                uniqueMarkers[numPalo] = true; 
                return true; 
            }
            return false;
        });
    } else if (selectFilter.value === 'Quadro') {
        marker = activeMarkers.filter(m => {
            const quadro = m.data.quadro.toLowerCase();
            if (quadro.startsWith(valueInput) && !uniqueMarkers[quadro]) {
                uniqueMarkers[quadro] = true;
                return true;
            }
            return false;
        });
    } else if (selectFilter.value === 'Lotto') {
        marker = activeMarkers.filter(m => {
            const lotto = m.data.lotto.toLowerCase();
            if (lotto.startsWith(valueInput) && !uniqueMarkers[lotto]) {
                uniqueMarkers[lotto] = true;
                return true;
            }
            return false;
        });    }

    return marker;
}

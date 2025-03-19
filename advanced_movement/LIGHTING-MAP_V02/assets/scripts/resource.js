let city = document.getElementById('city');
const userData = JSON.parse(localStorage.getItem('userData'));

function addOptionCity(city){
    userData.town_halls_list.forEach(element => {
        createOptionForSelect(city, element.name, element.name);
    });
}

function createOptionForSelect(object, text, value) {
    let option = document.createElement("option");
    option.text = text
    option.value = value;
    object.add(option);
  }

addOptionCity(city);

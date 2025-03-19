const BASE_URL = 'https://lighting-map.glitch.me'; 
const loginForm = document.querySelector('form#login-form');
const inputs = [...document.querySelectorAll('form#login-form input')];
let span = document.getElementById("alert")
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const loginLoader = document.getElementById("loginLoader");
const btnConferma = document.getElementById("btnConferma");

loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('inptEmail').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('inptUsername').value;
    const surname = document.getElementById('inptSurname').value;
    
    btnConferma.style.display = 'none';
    loginLoader.style.display = 'block';

    if(!checkPassword()){
        span.textContent = "Le password non corrispondono";
        setTimeout(() => {span.textContent = ""}, 3000);
        return;
    }
    
    const dataToSend = {
        name: username,
        surname: surname,
        email: email,
        password: password
    };
    try {
        const response = await fetch(`${BASE_URL}/users/addPendingUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        btnConferma.style.display = 'block';
        loginLoader.style.display = 'none';

    if (response.ok) {
        const result = await response.text(); 
        const containerCard = document.getElementById('containerCard')
        clearAllChildren(containerCard);
        createCard('Registrazione effettuata, verrà inviato un messaggio alla mail fornita quando la richiesta verrà approvata', containerCard);
        await sendMailToAdmin(username, surname)
    } else {
        console.error('signin fallito:', response.status);
        span.textContent = await response.text();
        setTimeout(() => span.textContent = "", 3000);
    }
} catch (error) {
    console.error(error);
    span.textContent = "Connessione al server assente";
    setTimeout(() => span.textContent = "", 3000);
    btnConferma.style.display = 'block';
    loginLoader.style.display = 'none';
}
   
});


togglePassword.addEventListener('click', function (e) {
    const password = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    if (password.type === 'password') {
        password.type = 'text';
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash'); // Cambia l'icona in "occhio chiuso"
    } else {
        password.type = 'password';
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye'); // Cambia l'icona in "occhio aperto"
    }
});

toggleConfirmPassword.addEventListener('click', function (e) {
    const password = document.getElementById('confirmPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (password.type === 'password') {
        password.type = 'text';
        toggleConfirmPassword.classList.remove('fa-eye');
        toggleConfirmPassword.classList.add('fa-eye-slash'); // Cambia l'icona in "occhio chiuso"
    } else {
        password.type = 'password';
        toggleConfirmPassword.classList.remove('fa-eye-slash');
        toggleConfirmPassword.classList.add('fa-eye'); // Cambia l'icona in "occhio aperto"
    }
});

function checkPassword(){

    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    password.type = 'text'
    confirmPassword.type = 'text'

    if (password.value === confirmPassword.value) {
        password.type = 'password'
        confirmPassword.type = 'password'
        return true;
    }else{
        password.type = 'password'
        confirmPassword.type = 'password'
        return false; 
    }

}



function createCard(msgText, obj) {
    const divFormContainer = obj

    const card = document.createElement('div');
    card.id = 'card';
    card.className = 'animated fadeIn';

    const upperSide = document.createElement('div');
    upperSide.id = 'upper-side';

    let svg, status;
    upperSide.style.backgroundColor = '#57A773 !important';
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('id', 'checkmark');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('x', '0px');
    svg.setAttribute('y', '0px');
    svg.setAttribute('xml:space', 'preserve');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M131.583,92.152l-0.026-0.041c-0.713-1.118-2.197-1.447-3.316-0.734l-31.782,20.257l-4.74-12.65 c-0.483-1.29-1.882-1.958-3.124-1.493l-0.045,0.017c-1.242,0.465-1.857,1.888-1.374,3.178l5.763,15.382 c0.131,0.351,0.334,0.65,0.579,0.898c0.028,0.029,0.06,0.052,0.089,0.08c0.08,0.073,0.159,0.147,0.246,0.209 c0.071,0.051,0.147,0.091,0.222,0.133c0.058,0.033,0.115,0.069,0.175,0.097c0.081,0.037,0.165,0.063,0.249,0.091 c0.065,0.022,0.128,0.047,0.195,0.063c0.079,0.019,0.159,0.026,0.239,0.037c0.074,0.01,0.147,0.024,0.221,0.027 c0.097,0.004,0.194-0.006,0.292-0.014c0.055-0.005,0.109-0.003,0.163-0.012c0.323-0.048,0.641-0.16,0.933-0.346l34.305-21.865 C131.967,94.755,132.296,93.271,131.583,92.152z');
    svg.appendChild(path);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '5');
    circle.setAttribute('stroke-miterlimit', '10');
    circle.setAttribute('cx', '109.486');
    circle.setAttribute('cy', '104.353');
    circle.setAttribute('r', '32.53');
    svg.appendChild(circle);
    status = document.createElement('h3');
    status.id = 'status';
    status.textContent = 'Successo';

    const contBtn = document.createElement('a');
      contBtn.href = 'index.html';
      contBtn.id = 'contBtn';
      contBtn.textContent = 'Torna al login';

    

    upperSide.appendChild(svg);
    upperSide.appendChild(status);

    const lowerSide = document.createElement('div');
    lowerSide.id = 'lower-side';

    const message = document.createElement('p');
    message.id = 'message';
    message.textContent = msgText;

    lowerSide.appendChild(message);
    lowerSide.appendChild(contBtn);
    card.appendChild(upperSide);
    card.appendChild(lowerSide);

    divFormContainer.appendChild(card);
  }

  function clearAllChildren(elem) {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  }

async function sendMailToAdmin(name, surname){
    let date = new Date();
    let dateISO = date.toISOString();
    const dataToSend = {
        user:{
            name: name,
            surname: surname,
            date: dateISO
        }
    }

    try {
        const response = await fetch(`${BASE_URL}/send-email-to-user/userNeedValidation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.text()
        if (!response.ok){
            console.warn(result);
        }
    }catch(e){
        console.error('signin fallito:', response.status);
    }
}
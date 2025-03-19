const BASE_URL = 'https://lighting-map.glitch.me'; 
const loginForm = document.querySelector('form#login-form');
const inputs = [...document.querySelectorAll('form#login-form input')];
let span = document.getElementById("alert")
const togglePassword = document.getElementById("togglePassword");
const loginLoader = document.getElementById("loginLoader");
const btnConferma = document.getElementById("btnConferma");

loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    btnConferma.style.display = 'none';
    loginLoader.style.display = 'block';
    const dataToSend = {
        email: email,
        password: password
    };
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        btnConferma.style.display = 'block';
        loginLoader.style.display = 'none';

    if (response.ok) {
        const result = await response.json(); 

        localStorage.setItem('userData', JSON.stringify(result.user));
        
        window.location.href = 'resource.html';
    } else {
        console.error('Login fallito:', response.status);
        span.textContent = await response.text();
        setTimeout(() => span.textContent = "", 3000);
    }
} catch (error) {
    console.error(error);
    btnConferma.style.display = 'block';
    loginLoader.style.display = 'none';
    span.textContent = "Connessione al server assente";
    setTimeout(() => span.textContent = "", 3000);
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


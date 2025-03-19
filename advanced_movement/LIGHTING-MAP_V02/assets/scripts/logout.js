const btnLogout = document.getElementById('btnLogout');

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('userData');
    window.location.href = '/LIGHTING-MAP/index.html';
})
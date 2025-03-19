async function deletePoint(lat, lng) {
    try {
        const { ok } = await (await fetch('deletePin.php', {
            method: 'POST', 
            body: JSON.stringify({ lat, lng }),
            headers: { 'Content-Type': 'application/json' }
        })).json();

        if(ok) window.location.href = window.location.href;
    } catch(e) { console.error(e); }
}
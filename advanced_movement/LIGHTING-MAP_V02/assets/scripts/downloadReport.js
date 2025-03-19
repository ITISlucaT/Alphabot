const download_btn = document.getElementById('download-btn');


download_btn.addEventListener('click', async (e)=>{
    e.preventDefault();
    if (!confirm("Scaricare il report delle segnalazioni?")) return
    const city = citySelect.value;
    fetch(`${BASE_URL}/api/downloadExcelReport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonResponseForDownload)
    })
    .then(response => {
        return response.blob()
    })
    .then(blob => {
        if (blob && blob.size > 0) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date(Date.now());
            const dateTime = date.getDate()+'-'+(date.getMonth() + 1)+'-'+date.getFullYear();
            a.download = `${city}_report_segnalazioni_${dateTime}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            throw new Error('Il Blob è undefined o vuoto');
        }
    })
    .catch(error => console.error(error));
});


# Robot Controller WebApp

Questa è una web app basata su Flask per controllare un Alphabot tramite interfaccia grafica.

## 🔧 Installazione

1. **Clona il repository:**
   ```bash
   git clone https://github.com/tuo-username/robot-controller.git
   cd robot-controller
   ```

2. **Crea un ambiente virtuale (opzionale ma consigliato):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Su Windows: venv\Scripts\activate
   ```

3. **Installa le dipendenze:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configura le variabili d'ambiente:**
   Crea un file `.env` con:
   ```
   SECRET_KEY="tuo_jwt_secret"
   FLASK_SECRET_KEY="tuo_flask_secret"
   ```

## 🚀 Avvio dell'App

```bash
python3 app.py
```

L'app sarà disponibile su `http://localhost:4444/`.

## 📂 Struttura del Progetto

```
robot-controller/
│-- app.py                 # Backend Flask
│-- templates/
│   ├── home.html          # UI principale
│   ├── login.html         # Pagina di login
│   ├── create_account.html# Registrazione utenti
│-- scripts/
│   ├── db.py              # Gestione database
│-- static/
│   ├── style.css          # Stili CSS 
│-- README.md              # Questa documentazione
│-- requirements.txt       # Dipendenze Python
```

## 🔑 Autenticazione
L'app utilizza JWT per gestire la sessione utente. Il token è memorizzato nei cookie e scade dopo 1 ora.

## 🎮 Controllo del Robot
L'utente può inviare comandi di movimento tramite i pulsanti della UI. Il backend riceve i comandi via `/move`.

## 📜 Licenza
MIT License.


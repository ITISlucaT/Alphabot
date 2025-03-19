# app.py - Flask backend per il controllo del robot
##########

#Author: Torelli Luca Augusto & Giordano Pietro

#Date: 139-03-2025

#Description: Flask backend per il controllo del robot

##########

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from scripts import db
import datetime
import jwt
from AlphaBot import AlphaBot 

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # TODO: Sostituire con una variabile d'ambiente per sicurezza
SECRET_KEY = 'jwtsecretkey' 

def generate_jwt(username):
    """Genera un token JWT valido per 1 ora."""
    payload = {
        "sub": username,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_jwt(token):
    """Verifica il token JWT e restituisce il nome utente se valido."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route("/", methods=["GET"])
def home():
    """Renderizza la homepage se l'utente è autenticato."""
    token = request.cookies.get("jwt")
    if not token:
        return redirect(url_for("login"))
    
    username = verify_jwt(token)
    if username:
        return render_template("home.html", username=username)

    flash("Sessione scaduta, esegui nuovamente il login.", "error")
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    """Gestisce il login dell'utente."""
    if request.method == "POST":
        conn, cursor = db.connect_to_db()
        username = request.form.get("e-mail")
        password = request.form.get("password")
        
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()
        
        if user and check_password_hash(user[2], password):
            token = generate_jwt(username)
            response = make_response(redirect(url_for("home")))
            expiry = datetime.datetime.now() + datetime.timedelta(hours=1)
            response.set_cookie("jwt", token, httponly=True, expires=expiry)
            return response

        flash("Username o password non corretti.", "error")
    
    return render_template("login.html")

@app.route("/create_account", methods=["GET", "POST"])
def create_account():
    """Gestisce la registrazione di nuovi utenti."""
    if request.method == "POST":
        username = request.form.get("e-mail")
        password = request.form.get("password")
        
        conn, cursor = db.connect_to_db()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return render_template("create_account.html", error="Username already exists.")
        
        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        conn.close()
        return redirect(url_for("login"))
    
    return render_template("create_account.html")

@app.route("/logout")
def logout():
    """Gestisce il logout dell'utente rimuovendo il token."""
    response = make_response(redirect(url_for("login")))
    response.delete_cookie("jwt")
    flash("Logout effettuato.", "success")
    return response

@app.route("/move", methods=["POST"])
def move_robot():
    """Endpoint API per controllare il movimento del robot."""
    token = request.cookies.get("jwt")
    if not token:
        return jsonify({"error": "Non autorizzato"}), 401
    
    username = verify_jwt(token)
    if not username:
        return jsonify({"error": "Sessione scaduta"}), 401
    
    data = request.get_json()
    if not data or 'direction' not in data:
        return jsonify({"error": "Dati mancanti"}), 400
    
    direction = data['direction']
    print(f"Direzione ricevuta: {direction}")
    
    ab = AlphaBot()
    if direction == "avanti":
        ab.forward()
    elif direction == "indietro":
        ab.backward()
    elif direction == "destra":
        ab.right()
    elif direction == "sinistra":
        ab.left()
    elif direction == "stop":
        ab.stop()
    
    return jsonify({"message": f"Robot in movimento: {direction}"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=4444)
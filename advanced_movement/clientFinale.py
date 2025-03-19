import socket
from pynput import keyboard
import threading
import time

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # AF_INET = IPV4, SOCK_STREAM = TCP

server_address = ("192.168.1.149", 8889)

letter_dictionary = {"w": False, "s": False, "a": False, "d": False, "p": False, "q": False}

client_socket.connect(server_address)

premute = []  # Definizione della variabile globale premute

last_message = ""  # Per tracciare l'ultimo messaggio inviato
heartbeat_interval = 2  # Intervallo di invio heartbeat in secondi

# Funzione per inviare heartbeat periodici
def heartbeat():
    while True:
        try:
            client_socket.send("HEARTBEAT".encode('utf-8'))
            time.sleep(heartbeat_interval)
        except socket.error:
            print("Connessione persa durante l'invio dell'heartbeat.")
            break

# Avvia il thread per l'invio degli heartbeat
threading.Thread(target=heartbeat, daemon=True).start()

def send_message(message):
    global last_message
    if message != last_message:  # Invia solo se il messaggio è diverso dall'ultimo
        print("Invio...")
        client_socket.send(message.encode('utf-8'))
        last_message = message

def on_press(key):
    global premute
    try:
        if key.char.isalpha():
            if key.char in letter_dictionary.keys():
                if not letter_dictionary[key.char]:
                    letter_dictionary[key.char] = True

                    if key.char in ["p", "q"]:
                        send_message(key.char)
                        return

                    premute = []
                    if letter_dictionary["w"]:
                        if letter_dictionary["a"]:
                            premute = [-70, 40]
                        elif letter_dictionary["d"]:
                            premute = [-40, 70]
                        else:
                            premute = [-100, 100]
                    elif letter_dictionary["s"]:
                        if letter_dictionary["a"]:
                            premute = [20, -90]
                        elif letter_dictionary["d"]:
                            premute = [90, -20]
                        else:
                            premute = [100, -100]
                    elif letter_dictionary["a"]:
                        premute = [0,-50]
                    elif letter_dictionary["d"]:
                        premute = [50,0]

                    if len(premute) > 1:
                        message = f"{premute[0]},{premute[1]}"
                    else:
                        message = f"{premute[0]}"

                    send_message(message)
    except AttributeError:
        pass  # Gestione implicita dei tasti non alfabetici

def on_release(key):
    global premute
    try:
        if key.char in letter_dictionary:
            letter_dictionary[key.char] = False

            if key.char in ["p", "q"]:
                send_message("allKeysReleased")
                return

            premute = []
            if letter_dictionary["w"]:
                if letter_dictionary["a"]:
                    premute = [-85, 55]
                elif letter_dictionary["d"]:
                    premute = [-55, 85] #-40 70
                else:
                    premute = [-100, 100]
            elif letter_dictionary["s"]:
                if letter_dictionary["a"]:
                    premute = [20, -90]
                elif letter_dictionary["d"]:
                    premute = [90, -20]
                else:
                    premute = [100, -100]
            elif letter_dictionary["a"]:
                premute = [0,-50]
            elif letter_dictionary["d"]:
                premute = [50,0]

            if len(premute) > 1:
                message = f"{premute[0]},{premute[1]}"
            elif len(premute) == 1:
                message = f"{premute[0]}"
            else:
                message = "allKeysReleased"

            send_message(message)

    except AttributeError:
        pass  # Gestione implicita dei tasti non alfabetici

    if key == keyboard.Key.esc:
        print("\nChiusura della connessione...")
        message = "CLOSE"
        send_message(message)
        return False

with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()
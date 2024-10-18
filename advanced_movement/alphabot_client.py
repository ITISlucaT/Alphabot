import socket
import threading
import time
from pynput import keyboard

server_address = ("192.168.2.14", 6971)
BUFFER_SIZE = 4096

# Mappa dei tasti con i comandi corrispondenti
key_command_map = {
    'w': 'forward',
    's': 'backward',
    'd': 'right',
    'a': 'left'
}

active_keys = set()  # Insieme di tasti attualmente premuti
last_command = None  # Variabile per memorizzare l'ultimo comando inviato
is_connected = True  # Flag per monitorare la connessione

def send_command(tcp_client_socket, command):
    """Invia un comando valido al server se è diverso dall'ultimo comando."""
    global last_command  # Permette di modificare la variabile globale
    
    if command != last_command:
        if command in key_command_map.values() or command == "stop" or len(command) > 1:
            message = f"{command}"
            tcp_client_socket.send(message.encode("utf-8"))
            print(f"Inviato: {message}")
            last_command = command  # Aggiorna il comando precedente
        else:
            print(f"Errore: comando non valido.")
    else:
        print(f"Comando '{command}' già inviato, non invio duplicato.")

def update_command(tcp_client_socket):
    """Aggiorna il comando corrente basato sui tasti attualmente premuti."""
    if active_keys:
        combined_command = "".join(sorted([key_command_map[k] for k in active_keys]))
        send_command(tcp_client_socket, combined_command)
    else:
        send_command(tcp_client_socket, "stop")

def on_press(key, tcp_client_socket):
    """Gestisci la pressione di un tasto e aggiorna i comandi."""
    try:
        k = key.char 
        if k in key_command_map:
            active_keys.add(k)
            update_command(tcp_client_socket)
    except AttributeError:
        pass  # Ignora i tasti speciali (Shift, Ctrl, ecc.)

def on_release(key, tcp_client_socket):
    """Gestisci il rilascio di un tasto e aggiorna i comandi."""
    try:
        k = key.char
        if k in key_command_map and k in active_keys:
            active_keys.remove(k)
            update_command(tcp_client_socket)
    except AttributeError:
        pass  # Ignora i tasti speciali

def send_heartbeat(tcp_client_socket, interval=0.1):
    """Invia l'heartbeat al server a intervalli regolari."""
    global is_connected
    while is_connected:
        try:
            tcp_client_socket.send("HEARTBEAT".encode("utf-8"))
            time.sleep(interval)
        except (socket.error, ConnectionResetError):
            print("Connessione persa con il server.")
            is_connected = False  # Imposta il flag a False in caso di errore
            break

def main():
    global is_connected
    # Crea il socket del client
    tcp_client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        tcp_client_socket.connect(server_address)
        print(f"Connesso al server {server_address}")

        menu_message = tcp_client_socket.recv(BUFFER_SIZE).decode("utf-8")
        print(menu_message)
        
        heartbeat_thread = threading.Thread(target=send_heartbeat, args=(tcp_client_socket, ))
        heartbeat_thread.start()
        print("Premi 'w', 'a', 's', 'd' per inviare i comandi, 'Esc' per uscire.")
        
        # Utilizza il listener per i tasti
        with keyboard.Listener(
            on_press=lambda key: on_press(key, tcp_client_socket),
            on_release=lambda key: on_release(key, tcp_client_socket)) as listener:
            listener.join()

    except (socket.error, ConnectionResetError, KeyboardInterrupt):
        print("Chiusura client")
    finally:
        is_connected = False  # Imposta il flag a False per fermare il thread di heartbeat
        heartbeat_thread.join()
        tcp_client_socket.close()
        print("Socket chiuso.")

if __name__ == "__main__":
    main()

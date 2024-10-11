import socket
from pynput import keyboard

server_address = ("192.168.1.135", 6971)
BUFFER_SIZE = 4096

# Mappa dei tasti con i comandi corrispondenti
key_command_map = {
    'w': 'forward',
    's': 'backward',
    'd': 'right',
    'a': 'left'
}

def send_command(tcp_client_socket, command):
    """Invia un comando valido al server."""
    if command in key_command_map.values():
        message = f"{command}"
        tcp_client_socket.send(message.encode("utf-8"))
        print(f"Inviato: {message}")
    else:
        print(f"Errore: comando non valido.")

def on_press(key, tcp_client_socket):
    """Gestisci la pressione di un tasto e invia il comando corrispondente."""
    try:
        k = key.char  # Rileva il carattere premuto
        if k in key_command_map:
            send_command(tcp_client_socket, key_command_map[k])
    except AttributeError:
        pass  # Ignora i tasti speciali (Shift, Ctrl, ecc.)

def main():
    # Crea il socket del client
    tcp_client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        tcp_client_socket.connect(server_address)
        print(f"Connesso al server {server_address}")

        menu_message = tcp_client_socket.recv(BUFFER_SIZE).decode("utf-8")
        print(menu_message)

        # Avvia il listener per intercettare la pressione dei tasti
        print("Premi 'w', 'a', 's', 'd' per inviare i comandi, 'Esc' per uscire.")
        with keyboard.Listener(
            on_press=lambda key: on_press(key, tcp_client_socket)) as listener:
            listener.join()

    except KeyboardInterrupt:
        print("Chiusura client")
    finally:
        tcp_client_socket.close()

if __name__ == "__main__":
    main()

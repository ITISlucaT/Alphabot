import socket
import threading
import time
#import AlphaBot 

server_address = ("192.168.2.14", 6971)
BUFFER_SIZE = 4096

commands_list = ["forward", "backward", "right", "left", "forwardright", "forwardleft", "backwardright", "backwardleft", "stop"]

menu_message = """
USAGE: #command_name #value(0-100)
    1 - forward
    2 - backward
    3 - right
    4 - left
"""

HEARTBEAT_TIMEOUT = 2 # Tempo massimo di attesa tra gli heartbeat
last_heartbeat_time = time.time()  # Variabile globale per tracciare l'ultimo heartbeat
is_connected = True

#ab = AlphaBot.AlphaBot()

# Funzione per gestire gli heartbeat
def handle_heartbeat(conn):
    global last_heartbeat_time

    while True:
        try:
            data = conn.recv(BUFFER_SIZE).decode("utf-8")
            if data == "HEARTBEAT":
                last_heartbeat_time = time.time()
        except (socket.error, ConnectionResetError):
            print("Errore di connessione mentre si riceve l'heartbeat.")
            is_connected = False
            break

# Funzione per gestire i comandi in arrivo
def handle_commands(conn):
    global last_heartbeat_time, is_connected

    try:
        while is_connected:
            data = conn.recv(BUFFER_SIZE).decode("utf-8")

            if data in commands_list:
                print(f"Comando ricevuto: {data}")
                if data == commands_list[0]: 
                    print("avanti")
                    # ab.forward()
                # elif data == commands_list[1]: ab.backward()
                # elif data == commands_list[2]: ab.right()
                # elif data == commands_list[3]: ab.left()
                elif data == commands_list[4]: 
                    print("avanti destra")
                elif data == commands_list[5]:
                    print("avanti sinistra")
                elif data == commands_list[6]:
                    print("indietro destra")
                elif data == commands_list[7]:
                    print("indietro sinistra")
                # else: ab.stop()

                if not data:
                    break  
            elif data != "HEARTBEAT":
                print(f"Messaggio sconosciuto: {data}")

            if not data:
                break
    except (socket.error, ConnectionResetError) as e:
        print(f"Errore di connessione: {e}")
        is_connected = False

def monitor_heartbeat():
    global last_heartbeat_time, is_connected
    #global ab
    while True:
        if time.time() - last_heartbeat_time > HEARTBEAT_TIMEOUT:
            print("Heartbeat non ricevuto in tempo! Arresto del robot.")
            #ab.stop()
            is_connected = False
            break
        time.sleep(HEARTBEAT_TIMEOUT / 2)  # Controlla frequentemente lo stato degli heartbeat

def main():
    global is_connected
    tcp_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp_server_socket.bind(server_address)
    tcp_server_socket.listen(1)
    print(f"Server in ascolto su {server_address}")

    conn, client_address = tcp_server_socket.accept()
    print(f"Connesso al client {client_address}")

    conn.send(menu_message.encode("utf-8"))

# N.B. i thread di heartbeat sono daemon, non bisogna chiuderli esplicitamente
    heartbeat_thread = threading.Thread(target=handle_heartbeat, args=(conn,), daemon=True)
    heartbeat_thread.start()

    commands_thread = threading.Thread(target=handle_commands, args=(conn,))
    commands_thread.start()

    heartbeat_monitor_thread = threading.Thread(target=monitor_heartbeat, daemon=True)
    heartbeat_monitor_thread.start()

    commands_thread.join()

    conn.close()
    tcp_server_socket.close()
    print("Connection closed")

if __name__ == "__main__":
    main()

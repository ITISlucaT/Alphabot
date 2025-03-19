import socket
import threading
import time
#import AlphaBot 
import sqlite3


server_address = ("10.210.0.177", 6971)
BUFFER_SIZE = 4096

commands_list = ["forward", "backward", "right", "left", "forwardright", "forwardleft", "backwardright", "backwardleft", "stop"]

menu_message = """
USAGE: #command_name #value(0-100)
    1 - forward
    2 - backward
    3 - right
    4 - left
"""

HEARTBEAT_TIMEOUT = 2000 # Tempo massimo di attesa tra gli heartbeat (espresso in secondi)
last_heartbeat_time = time.time()  # Variabile globale per tracciare l'ultimo heartbeat
is_connected = True

#ab = AlphaBot.AlphaBot()

# Funzione per gestire gli heartbeat
def handle_heartbeat(conn):
    global last_heartbeat_time

    while True:
        time.sleep(5)
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
    global last_heartbeat_time, is_connected, macro_commands

    try:
        while is_connected:
            data = conn.recv(BUFFER_SIZE).decode("utf-8")

            if data in commands_list:
                print(f"Comando ricevuto: {data}")
                
                if data == commands_list[0]: 
                    print("avanti")
                    #ab.setMotor(50, -40)
                elif data == commands_list[1]: 
                    print("indietro")
                    #ab.setMotor(-50, 40)
                elif data == commands_list[2]: 
                    print("destra")
                    #ab.setMotor(0, 50)
                elif data == commands_list[3]: 
                    print("sinistra")
                    #ab.setMotor(-50, 0)
                elif data == commands_list[4]: 
                    #ab.setMotor(80, 60)
                    print("avanti destra")
                elif data == commands_list[5]:
                    #ab.setMotor(60, 80)
                    print("avanti sinistra")
                elif data == commands_list[6]:
                    #ab.setMotor(-70, -50)
                    print("indietro destra")
                elif data == commands_list[7]:
                    #ab.setMotor(-50, -70)
                    print("indietro sinistra")
                else: 
                    if data in macro_commands:
                        for data in macro_commands:
                            lista_comandi = data[1].split(',')

                            # Separazione del comando e del tempo
                            parsed_commands = []
                            for cmd in lista_comandi:
                                action = ''.join([c for c in cmd if c.isalpha()])  # Estrae la parte testuale
                                time_action = int(''.join([c for c in cmd if c.isdigit()]))  # Estrae la parte numerica
                                if action == commands_list[0]: 
                                    print("avanti")
                                    #ab.forward()
                                elif action == commands_list[1]: 
                                    print("indietro")
                                    #ab.backward()
                                elif action == commands_list[2]: 
                                    print("destra")
                                    #ab.right()
                                elif action == commands_list[3]: 
                                    print("sinistra")
                                    #ab.left()
                                time.sleep(time_action)
                    #else:
                        #ab.stop()
                
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

def connect_to_db():
    # Connessione al db
    conn = sqlite3.connect('./../db_example.db')
    cur = conn.cursor()

    cur.execute('''
        SELECT * FROM macro;
    ''')
    conn.commit() # manda l'SQL


    datas = cur.fetchall() # Restituisce una lista di tuple

    for data in datas:
        print(data)

    # Chiudo la connessione
    conn.close()
    return datas    

def main():
    global is_connected
    global macro_commands
    tcp_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp_server_socket.bind(server_address)
    tcp_server_socket.listen(1)
    print(f"Server in ascolto su {server_address}")
    macro_commands = connect_to_db()
    if not macro_commands:
        print("Nessuna macro trovata nel db")
    print("Connessione al db completata correttamente")
    conn, client_address = tcp_server_socket.accept()
    print(f"Connesso al client {client_address}")

    conn.send(menu_message.encode("utf-8"))
    conn.recv(BUFFER_SIZE).decode("utf-8")
    conn.send(str(macro_commands).encode("utf-8"))

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

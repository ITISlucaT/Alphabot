# TODO: Remove this when we remove

import socket
import AlphaBot as ab

server_address = ("192.168.1.135", 6971)
BUFFER_SIZE = 4096 

BOT_SPEED = 50

commands_list = ["forward","backward","right","left"]
#commands_list = ["w","s","a","d"]


menu_message = """
USAGE: #command_name #value(0-100)
    1 - forward
    2 - backward
    3 - right
    4 - left
"""
alphaB = ab.AlphaBot()
tcp_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

tcp_server_socket.bind(server_address)

tcp_server_socket.listen(1)
print(f"Server in ascolto su {server_address}")

conn, client_address = tcp_server_socket.accept()
print(f"Connesso al client {client_address}")

conn.send(menu_message.encode("utf-8"))

try:
    while True:
       
        data = conn.recv(BUFFER_SIZE).decode("utf-8")
        #command, value = data.split(" ")
        #print(f"Command: {command} value {value}")
        
        if data == commands_list[0]: 
            print(f"Mi sto muovento avanti")
            alphaB.forward(BOT_SPEED)
        elif data == commands_list[1]: alphaB.backward(BOT_SPEED)
        elif data == commands_list[2]: alphaB.right(BOT_SPEED)
        elif data == commands_list[3]: alphaB.left(BOT_SPEED)

        if not data:
            break  

        print(f"Ricevuto dal client: {data}")
        
        # Esegui logica sui comandi
except KeyboardInterrupt:
    print("Chiusura server")
finally:
    tcp_server_socket.close()
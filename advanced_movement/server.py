import socket
import AlphaBot

tastiConcessi = ['w', 'a', 's', 'd']
alphabot_address = ("192.168.1.149", 34512)

alphabot_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
alphabot_tcp.bind(alphabot_address)
alphabot_tcp.listen(1)
print("Server AlphaBot in ascolto...")

alpha = AlphaBot.AlphaBot()
try:
    while True:
        client, address = alphabot_tcp.accept()
        print(f"Connessione accettata da {address}")
        while True:
            messaggio = client.recv(4096).decode('utf-8')
            if messaggio == "end":
                client.close()
                break
            else:
                messaggio = messaggio.split(",")
                try:
                    right = int(messaggio[0])
                except:
                    right = eval(messaggio[0])

                try:
                    left = int(messaggio[1])
                except:
                    left = eval(messaggio[1])

                alpha.setMotor(right, left)
                print(right, left)
        print(f"connessione chiusa con {address}")

except KeyboardInterrupt:
    print("Server interrotto manualmente.")
finally:
    alphabot_tcp.close()
    print("Server chiuso.")
import sqlite3

# Connessione al db
conn = sqlite3.connect('db_example.db')
cur = conn.cursor()

# cur.execute('''CREATE TABLE macro (
#     tasto TEXT PRIMARY KEY,
#     comandi TEXT
# );
# ''')

# cur.execute('''INSERT INTO macro (tasto, comandi) VALUES ('F1', 'forward10,backward5');''')
# cur.execute('''INSERT INTO macro (tasto, comandi) VALUES ('F2', 'left45,right90');''')
# cur.execute('''INSERT INTO macro (tasto, comandi) VALUES ('F3', 'forward20,left30,backward10');''')

cur.execute('''
SELECT * FROM macro;
''')
conn.commit()# manda i comandi


datas = cur.fetchall() # Restituisce una lista di tuple



for data in datas:
    # Split dei singoli comandi
    lista_comandi = data[1].split(',')

    # Separazione del comando e del tempo
    parsed_commands = []
    for cmd in lista_comandi:
        action = ''.join([c for c in cmd if c.isalpha()])  # Estrae la parte testuale
        time = int(''.join([c for c in cmd if c.isdigit()]))  # Estrae la parte numerica
        parsed_commands.append((action, time))

    print(parsed_commands)

    # Stringa di comandi




# Chiudo la connessione
conn.close()

# se premo un tasto che non è wasd mi connetto al db e chiedo che macro usare
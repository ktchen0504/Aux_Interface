import sys
import random
from socketIO_client_nexus import SocketIO, LoggingNamespace
import socket  # for receiving d-lab
import re
import time
import os.path
import logging

# Initialize variables
Ev_stat = 0
first_arg = 0
Ev_break = 1

def randomEvent(*args):
    r = random.randrange(1, 3, 1)
    print(f'random number {r}')
    return ('e' + str(r))

r = randomEvent()
print (f'This is event: {r}')

with SocketIO('localhost', 4000, LoggingNamespace) as socketIO:
    socketIO.emit('Ev', r)
    # socketIO.wait_for_callbacks(seconds=1)

# initialize socket for receiving d-lab
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_address = ("192.168.20.40", 9002)

def socketinitial():
    sock.connect(server_address)
    sock.settimeout(10)
    print(f'connecting to {server_address[0]} port: {server_address[1]}', file = sys.stderr)

# d-lab relay receiving function, d-lab relay without sending header
def receive():
    global Ev_stat
    global first_arg
    global sock
    socketinitial()
    try:
        message = "Event Status..."
        print(f'Checking {message}', file = sys.stderr)
        sock.sendall(str.encode(message))

        while True:
            time.sleep(2)
            data = sock.recv(1024)
            stringdata = data.decode('utf-8')
            strdata = re.split(r'[~\r\n\t+]', stringdata)

            if int(strdata[first_arg]) == 1:
                Ev_stat += 1
                first_arg = 1
                print (f'Event status is now: {Ev_stat}')
                break
            else:
                print (f'Received event status: {Ev_stat}', file = sys.stderr)
    except socket.timeout:
        Ev_stat = 2
        print(f"Time out 1, restart required...")
    finally:
        return Ev_stat

receive()

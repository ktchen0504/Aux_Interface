import sys
import random
from socketIO_client_nexus import SocketIO, LoggingNamespace
import socket  # for receiving d-lab
import re
import time
import os.path
import logging

#-- Initialize variables
Ev_stat = 0
first_arg = 0
second_arg = 1
Ev_break = 1

r = 'hide'
#-- Testing with random variables
# def randomEvent(*args):
#     r = random.randrange(21, 26, 1) - 20
#     print(f'random number {r}')
#     return ('e' + str(r))

# r = randomEvent()
# print (f'This is event: {r}')

#-- End testing random numbers

#-- initialize socket for receiving d-lab
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_address = ("192.168.20.40", 9002)

def socketinitial():
    sock.connect(server_address)
    sock.settimeout(10)
    print(f'connecting to {server_address[0]} port: {server_address[1]}', file = sys.stderr)

#-- d-lab relay receiving function, d-lab relay without sending header
def receive():
    global Ev_stat
    global first_arg
    global second_arg
    global sock
    global r
    sleeptime = 1
    socketinitial()
    try:
        message = "Event Status..."
        print(f'Checking {message}', file = sys.stderr)
        sock.sendall(str.encode(message))

        while True:
            time.sleep(sleeptime)
            data = sock.recv(1024)
            stringdata = data.decode('utf-8')
            strdata = re.split(r'[~\r\n\t+]', stringdata)

            # print(f'first arg of strdata is {strdata[first_arg]}', file = sys.stderr)
            # print(f'second arg of strdata is {strdata[second_arg]}', file = sys.stderr)

            if int(float(strdata[first_arg])) == 1 and int(float(strdata[second_arg])) > 20:
                Ev_stat = int(strdata[second_arg]) - 20
                # first_arg = 1
                print (f'Event status is now: {Ev_stat}')
                r = 'e'+str(Ev_stat)
                sleeptime = 2
                # break
            elif int(float(strdata[second_arg])) == 20:
                Ev_stat = -1
                print (f'Received normal event status: {Ev_stat}', file = sys.stderr)
                r = 'hide'
                sleeptime = 1
            elif int(float(strdata[second_arg])) == 28:
                break
            
            socketIO.emit('Ev', r)
            # return r

    except socket.timeout:
        Ev_stat = 2
        print(f"Time out 1, restart required...")
    # finally:
    #     final_result = 'e' +str(Ev_stat)
    #     print(f'returning: {final_result}')
    #     return ('e' + str(Ev_stat))


#-- connect to local host Javascript server
with SocketIO('localhost', 4000, LoggingNamespace) as socketIO:
    receive()
    # socketIO.emit('Ev', r)
    # socketIO.wait_for_callbacks(seconds=1)
    



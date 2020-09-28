import sys
import random
from socketIO_client_nexus import SocketIO, LoggingNamespace

def randomEvent(*args):
    r = random.randrange(1, 3, 1)
    print('random number', r)
    return ('e' + str(r))

r = randomEvent()
print (r)

with SocketIO('localhost', 4000, LoggingNamespace) as socketIO:
    socketIO.emit('Ev', r)
    # socketIO.wait_for_callbacks(seconds=1)


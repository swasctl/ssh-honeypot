import socket
import threading
from db.database import init_db
from ssh.handler import handle_client
from core.config import HOST, PORT

from core.logging import setup_logging, get_logger
setup_logging()
log = get_logger(__name__)

def start():
    init_db()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((HOST, PORT))
    sock.listen(100)
    log.info(f"Honeypot listening on {HOST}:{PORT}")
    while True:
        client, addr = sock.accept()
        log.info(f"[CONNECTION] {addr[0]}:{addr[1]}")
        t = threading.Thread(target=handle_client, args=(client, addr), daemon=True)
        t.start()

if __name__ == "__main__":
    start()
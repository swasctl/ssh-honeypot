import logging
import threading
import paramiko
from datetime import datetime

from ssh.filesystem import handle_command
from ssh.session import AttackerSession
from db.queries import save_session, save_command, update_duration
from core.config import BANNER, HOSTNAME
from core.hostkey import load_or_create_host_key
from core.enrichment import enrich_ip
from db.queries import save_enrichment

from core.classifier import classify_session
from db.queries import save_classification

from core.classifier import classify_session
from db.queries import save_connection, save_classification, get_commands

from core.logging import get_logger
log = get_logger(__name__)

HOST_KEY = load_or_create_host_key()


class HoneypotInterface(paramiko.ServerInterface):
    def __init__(self, ip: str, port: int):
        self.session = AttackerSession(ip=ip, port=port)
        self.event = threading.Event()

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_auth_password(self, username, password):
        self.session.username = username
        self.session.password = password
        log.info(f"[AUTH] {self.session.ip} → {username}:{password}")
        return paramiko.AUTH_SUCCESSFUL

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True


def handle_client(client_sock, client_addr):
    ip, port = client_addr
    transport = paramiko.Transport(client_sock)
    transport.add_server_key(HOST_KEY)

    interface = HoneypotInterface(ip, port)

    try:
        transport.start_server(server=interface)
    except Exception as e:
        save_connection(ip, port, "unknown", "FAILED", str(e)[:120])
        log.warning("[NEGOTIATION FAILED]", ip=ip, error=str(e))
        return

    channel = transport.accept(20)
    if channel is None:
        save_connection(ip, port, transport.remote_version or "unknown", "FAILED", "no channel")
        session_id = save_session(
            ip=ip, port=port,
            username=interface.session.username,
            password=interface.session.password,
            client_version=transport.remote_version or "unknown",
        )
        enrichment = enrich_ip(ip)
        save_enrichment(session_id, enrichment)
        classification = classify_session([], 0)
        save_classification(session_id, classification)
        return

    interface.session.client_version = transport.remote_version or "unknown"
    interface.event.wait(10)

    session_id = save_session(
        ip=interface.session.ip,
        port=interface.session.port,
        username=interface.session.username,
        password=interface.session.password,
        client_version=interface.session.client_version,
    )

    save_connection(ip, port, interface.session.client_version, "AUTH_OK")

    enrichment = enrich_ip(ip)
    save_enrichment(session_id, enrichment)
    log.info("session_enriched", ip=ip, **enrichment)

    channel.send(BANNER)
    interface.session.start_time = datetime.utcnow()

    cwd = interface.session.cwd
    prompt = lambda: f"root@{HOSTNAME}:{cwd}$ "

    try:
        buf = ""
        channel.send(prompt())
        while True:
            data = channel.recv(1024)
            if not data:
                break
            char = data.decode("utf-8", errors="ignore")
            if char in ("\r", "\n"):
                channel.send("\r\n")
                if buf.strip():
                    save_command(session_id, buf.strip())
                    output, cwd = handle_command(buf, cwd)
                    if output == "__EXIT__":
                        break
                    if output:
                        channel.send(output.replace("\n", "\r\n"))
                buf = ""
                channel.send(prompt())
            elif char == "\x7f":
                if buf:
                    buf = buf[:-1]
                    channel.send("\b \b")
            else:
                buf += char
                channel.send(char)
    except Exception as e:
        log.warning("[SESSION ERROR]", ip=ip, error=str(e))
    finally:
        commands = get_commands(session_id)
        classification = classify_session(
            [c["command"] for c in commands],
            interface.session.elapsed()
        )
        save_classification(session_id, classification)
        update_duration(session_id, interface.session.elapsed())
        channel.close()
        transport.close()
        log.info("[DISCONNECTED]", ip=ip, session_id=session_id)
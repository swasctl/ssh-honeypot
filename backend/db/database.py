import sqlite3
from core.config import DB_PATH

def get_conn():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        port INTEGER,
        username TEXT,
        password TEXT,
        timestamp TEXT,
        duration REAL,
        client_version TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        command TEXT,
        timestamp TEXT,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS enrichment (
        session_id INTEGER PRIMARY KEY,
        country TEXT,
        country_code TEXT,
        city TEXT,
        latitude REAL,
        longitude REAL,
        abuse_score INTEGER,
        total_reports INTEGER,
        last_reported TEXT,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS classifications (
        session_id INTEGER PRIMARY KEY,
        classification TEXT,
        severity TEXT,
        mitre_id TEXT,
        mitre_name TEXT,
        description TEXT,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        port INTEGER,
        timestamp TEXT,
        client_version TEXT,
        result TEXT,
        failure_reason TEXT
    )''')
    conn.commit()
    conn.close()
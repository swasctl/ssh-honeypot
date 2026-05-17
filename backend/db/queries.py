import sqlite3
from datetime import datetime
from db.database import get_conn

def save_session(ip, port, username, password, client_version) -> int:
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "INSERT INTO sessions (ip, port, username, password, timestamp, duration, client_version) VALUES (?,?,?,?,?,?,?)",
        (ip, port, username, password, datetime.utcnow().isoformat(), 0, client_version)
    )
    session_id = c.lastrowid
    conn.commit()
    conn.close()
    return session_id

def update_duration(session_id: int, duration: float):
    conn = get_conn()
    conn.execute("UPDATE sessions SET duration=? WHERE id=?", (duration, session_id))
    conn.commit()
    conn.close()
    
    
    
def get_sessions(limit: int = 100):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM sessions ORDER BY timestamp DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [
        {
            "id": r[0], "ip": r[1], "port": r[2],
            "username": r[3], "password": r[4],
            "timestamp": r[5], "duration": r[6],
            "client_version": r[7]
        }
        for r in rows
    ]

def get_commands(session_id: int):
    conn = get_conn()
    rows = conn.execute(
        "SELECT command, timestamp FROM commands WHERE session_id=? ORDER BY timestamp",
        (session_id,)
    ).fetchall()
    conn.close()
    return [{"command": r[0], "timestamp": r[1]} for r in rows]


def get_stats():
    conn = get_conn()

    total_sessions = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
    total_commands = conn.execute("SELECT COUNT(*) FROM commands").fetchone()[0]
    total_connections = conn.execute("SELECT COUNT(*) FROM connections").fetchone()[0]

    top_passwords = conn.execute(
        "SELECT password, COUNT(*) as c FROM sessions GROUP BY password ORDER BY c DESC LIMIT 10"
    ).fetchall()
    top_ips = conn.execute(
        "SELECT ip, COUNT(*) as c FROM sessions GROUP BY ip ORDER BY c DESC LIMIT 10"
    ).fetchall()
    top_commands = conn.execute(
        "SELECT command, COUNT(*) as c FROM commands GROUP BY command ORDER BY c DESC LIMIT 10"
    ).fetchall()
    classifications = conn.execute(
        "SELECT classification, severity, COUNT(*) as c FROM classifications GROUP BY classification ORDER BY c DESC"
    ).fetchall()

    avg_duration = conn.execute(
        "SELECT AVG(duration) FROM sessions WHERE duration > 0"
    ).fetchone()[0] or 0

    new_ips_last_hour = conn.execute(
        "SELECT COUNT(DISTINCT ip) FROM sessions WHERE timestamp >= datetime('now', '-1 hour')"
    ).fetchone()[0]

    bot_count = conn.execute(
        "SELECT COUNT(*) FROM classifications WHERE classification = 'automated_bot'"
    ).fetchone()[0]
    manual_count = conn.execute(
        "SELECT COUNT(*) FROM classifications WHERE classification != 'automated_bot'"
    ).fetchone()[0]
    total_classified = bot_count + manual_count
    bot_pct = round((bot_count / total_classified) * 100) if total_classified > 0 else 0
    human_pct = 100 - bot_pct

    auth_success = conn.execute(
        "SELECT COUNT(*) FROM connections WHERE result = 'AUTH_OK'"
    ).fetchone()[0]
    auth_success_rate = round((auth_success / total_connections) * 100) if total_connections > 0 else 0

    peak_abuse = conn.execute(
        "SELECT MAX(abuse_score) FROM enrichment"
    ).fetchone()[0] or 0
    peak_abuse_ip = conn.execute(
        """SELECT s.ip, e.country_code FROM enrichment e
           JOIN sessions s ON s.id = e.session_id
           WHERE e.abuse_score = (SELECT MAX(abuse_score) FROM enrichment)
           LIMIT 1"""
    ).fetchone()

    countries = conn.execute(
        "SELECT DISTINCT country_code FROM enrichment WHERE country_code != 'XX' AND country_code IS NOT NULL"
    ).fetchall()
    country_list = [r[0] for r in countries]

    top_country = conn.execute(
        "SELECT country_code, COUNT(*) as c FROM enrichment GROUP BY country_code ORDER BY c DESC LIMIT 1"
    ).fetchone()

    credential_intel = conn.execute(
        """SELECT s.password, COUNT(*) as c,
           CASE
             WHEN s.password IN ('ubuntu','admin','password','123456','root','test','guest','1234','12345','pass')
               THEN 'wordlist'
             WHEN LENGTH(s.password) <= 4 THEN 'default'
             ELSE 'targeted'
           END as cred_type
           FROM sessions s
           GROUP BY s.password ORDER BY c DESC LIMIT 8"""
    ).fetchall()

    conn.close()
    return {
        "total_sessions": total_sessions,
        "total_commands": total_commands,
        "total_connections": total_connections,
        "top_passwords": [{"password": r[0], "count": r[1]} for r in top_passwords],
        "top_ips": [{"ip": r[0], "count": r[1]} for r in top_ips],
        "top_commands": [{"command": r[0], "count": r[1]} for r in top_commands],
        "classifications": [{"classification": r[0], "severity": r[1], "count": r[2]} for r in classifications],
        "avg_duration": round(avg_duration, 1),
        "new_ips_last_hour": new_ips_last_hour,
        "bot_pct": bot_pct,
        "human_pct": human_pct,
        "auth_success_rate": auth_success_rate,
        "peak_abuse": peak_abuse,
        "peak_abuse_ip": f"{peak_abuse_ip[0]} · {peak_abuse_ip[1]}" if peak_abuse_ip else "—",
        "countries": country_list,
        "country_count": len(country_list),
        "top_country": top_country[0] if top_country else "—",
        "credential_intel": [{"password": r[0], "count": r[1], "type": r[2]} for r in credential_intel],
    }
    

def get_latest_sessions(after_id: int):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM sessions WHERE id > ? ORDER BY timestamp DESC", (after_id,)
    ).fetchall()
    conn.close()
    return [
        {
            "id": r[0], "ip": r[1], "port": r[2],
            "username": r[3], "password": r[4],
            "timestamp": r[5], "duration": r[6],
            "client_version": r[7]
        }
        for r in rows
    ]

def save_command(session_id: int, command: str):
    conn = get_conn()
    conn.execute(
        "INSERT INTO commands (session_id, command, timestamp) VALUES (?,?,?)",
        (session_id, command, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    
def save_enrichment(session_id: int, data: dict):
    conn = get_conn()
    conn.execute(
        '''INSERT OR REPLACE INTO enrichment
        (session_id, country, country_code, city, latitude, longitude, abuse_score, total_reports, last_reported)
        VALUES (?,?,?,?,?,?,?,?,?)''',
        (
            session_id,
            data.get("country"), data.get("country_code"), data.get("city"),
            data.get("latitude"), data.get("longitude"),
            data.get("abuse_score"), data.get("total_reports"), data.get("last_reported"),
        )
    )
    conn.commit()
    conn.close()
    
def save_classification(session_id: int, data: dict):
    conn = get_conn()
    conn.execute(
        '''INSERT OR REPLACE INTO classifications
        (session_id, classification, severity, mitre_id, mitre_name, description)
        VALUES (?,?,?,?,?,?)''',
        (session_id, data["classification"], data["severity"],
         data["mitre_id"], data["mitre_name"], data["description"])
    )
    conn.commit()
    conn.close()
    
    
def save_connection(ip: str, port: int, client_version: str, result: str, failure_reason: str = ""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO connections (ip, port, timestamp, client_version, result, failure_reason) VALUES (?,?,?,?,?,?)",
        (ip, port, datetime.utcnow().isoformat(), client_version, result, failure_reason)
    )
    conn.commit()
    conn.close()

def get_connections(limit: int = 100):
    conn = get_conn()
    rows = conn.execute(
        """SELECT c.id, c.ip, c.port, c.timestamp, c.client_version, 
                  c.result, c.failure_reason, e.country_code, e.abuse_score
           FROM connections c
           LEFT JOIN enrichment e ON e.session_id = (
               SELECT s.id FROM sessions s WHERE s.ip = c.ip ORDER BY s.id DESC LIMIT 1
           )
           ORDER BY c.timestamp DESC LIMIT ?""",
        (limit,)
    ).fetchall()
    conn.close()
    return [
        {
            "id": r[0], "ip": r[1], "port": r[2],
            "timestamp": r[3], "client_version": r[4],
            "result": r[5], "failure_reason": r[6],
            "country_code": r[7] or "—",
            "abuse_score": r[8],
        }
        for r in rows
    ]
    
def get_campaigns():
    conn = get_conn()
    rows = conn.execute("""
        SELECT 
            s.ip,
            e.country_code,
            e.abuse_score,
            MIN(s.timestamp) as first_seen,
            MAX(s.timestamp) as last_seen,
            COUNT(*) as attempt_count,
            GROUP_CONCAT(DISTINCT s.password) as passwords,
            c.classification,
            c.mitre_id
        FROM sessions s
        LEFT JOIN enrichment e ON e.session_id = s.id
        LEFT JOIN classifications c ON c.session_id = s.id
        GROUP BY s.ip
        HAVING attempt_count >= 3
        ORDER BY attempt_count DESC
    """).fetchall()
    conn.close()
    return [
        {
            "ip": r[0],
            "country_code": r[1] or "—",
            "abuse_score": r[2],
            "first_seen": r[3],
            "last_seen": r[4],
            "attempt_count": r[5],
            "passwords": r[6].split(",") if r[6] else [],
            "classification": r[7] or "automated_bot",
            "mitre_id": r[8] or "T1110.001",
        }
        for r in rows
    ]

def get_iocs():
    conn = get_conn()
    sessions = conn.execute("""
        SELECT s.ip, s.username, s.password, s.timestamp,
               e.country_code, e.abuse_score,
               c.classification, c.mitre_id, c.severity
        FROM sessions s
        LEFT JOIN enrichment e ON e.session_id = s.id
        LEFT JOIN classifications c ON c.session_id = s.id
        WHERE e.abuse_score >= 50 OR c.severity = 'high'
    """).fetchall()
    conn.close()
    return {
        "generated": __import__("datetime").datetime.utcnow().isoformat(),
        "source": "ssh-honeypot",
        "iocs": [
            {
                "ip": r[0],
                "username": r[1],
                "password": r[2],
                "first_seen": r[3],
                "country": r[4] or "—",
                "abuse_score": r[5],
                "classification": r[6] or "—",
                "mitre": r[7] or "—",
                "severity": r[8] or "—",
            }
            for r in sessions
        ]
    }
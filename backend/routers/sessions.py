from fastapi import APIRouter, Response
from db.queries import get_sessions, get_commands

from db.database import get_conn
import json
from db.queries import get_sessions, get_commands, get_connections, get_campaigns, get_iocs
from fastapi.responses import JSONResponse

from db.queries import get_sessions, get_commands, get_connections



router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("/")
def list_sessions():
    return get_sessions()

@router.get("/{session_id}/commands")
def list_commands(session_id: int):
    return get_commands(session_id)

@router.get("/{session_id}/classification")
def get_classification(session_id: int):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM classifications WHERE session_id=?", (session_id,)
    ).fetchone()
    conn.close()
    if not row:
        return {}
    return {
        "classification": row[1], "severity": row[2],
        "mitre_id": row[3], "mitre_name": row[4], "description": row[5]
    }
    
@router.get("/{session_id}/enrichment")
def get_enrichment(session_id: int):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM enrichment WHERE session_id=?", (session_id,)
    ).fetchone()
    conn.close()
    if not row:
        return {}
    return {
        "country": row[1], "country_code": row[2], "city": row[3],
        "latitude": row[4], "longitude": row[5],
        "abuse_score": row[6], "total_reports": row[7],
        "last_reported": row[8]
    }
    

@router.get("/connections")
def list_connections():
    return get_connections()



@router.get("/campaigns")
def list_campaigns():
    return get_campaigns()


@router.get("/iocs/export")
def export_iocs():
    data = get_iocs()
    content = json.dumps(data, indent=2, default=str)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=honeypot-iocs.json"}
    )
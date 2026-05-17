import geoip2.database
import requests
from core.config import GEOIP_DB_PATH, ABUSEIPDB_API_KEY
from core.logging import get_logger

log = get_logger(__name__)

_geo_reader = geoip2.database.Reader(GEOIP_DB_PATH)

def geoip_lookup(ip: str) -> dict:
    try:
        r = _geo_reader.city(ip)
        return {
            "country": r.country.name or "Unknown",
            "country_code": r.country.iso_code or "XX",
            "city": r.city.name or "Unknown",
            "latitude": r.location.latitude,
            "longitude": r.location.longitude,
        }
    except Exception:
        return {"country": "Unknown", "country_code": "XX", "city": "Unknown", "latitude": None, "longitude": None}

def abuseipdb_lookup(ip: str) -> dict:
    if not ABUSEIPDB_API_KEY:
        return {"abuse_score": None, "total_reports": None, "last_reported": None}
    try:
        r = requests.get(
            "https://api.abuseipdb.com/api/v2/check",
            headers={"Key": ABUSEIPDB_API_KEY, "Accept": "application/json"},
            params={"ipAddress": ip, "maxAgeInDays": 90},
            timeout=5,
        )
        data = r.json().get("data", {})
        return {
            "abuse_score": data.get("abuseConfidenceScore"),
            "total_reports": data.get("totalReports"),
            "last_reported": data.get("lastReportedAt"),
        }
    except Exception as e:
        log.warning("abuseipdb_lookup_failed", ip=ip, error=str(e))
        return {"abuse_score": None, "total_reports": None, "last_reported": None}

def enrich_ip(ip: str) -> dict:
    geo = geoip_lookup(ip)
    abuse = abuseipdb_lookup(ip)
    return {**geo, **abuse}
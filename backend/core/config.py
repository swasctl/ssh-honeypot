import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HP_HOST", "0.0.0.0")
PORT = int(os.getenv("HP_PORT", "2222"))
DB_PATH = os.getenv("HP_DB_PATH", "honeypot.db")
HOST_KEY_PATH = os.getenv("HP_HOST_KEY_PATH", "hostkey.pem")
BANNER = os.getenv("HP_BANNER", "Welcome to Ubuntu 22.04.3 LTS\r\n\r\n")
HOSTNAME = os.getenv("HP_HOSTNAME", "prod-server-01")
GEOIP_DB_PATH = os.getenv("HP_GEOIP_DB_PATH", "data/GeoLite2-City.mmdb")
ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY", "")

# Honeypot shell outputs can look credential-like; keep them env-driven so
# template users can customize or neutralize them without code changes.
FAKE_AWS_ACCESS_KEY_ID = os.getenv("HP_FAKE_AWS_ACCESS_KEY_ID", "AKIAEXAMPLE00000000")
FAKE_AWS_SECRET_ACCESS_KEY = os.getenv("HP_FAKE_AWS_SECRET_ACCESS_KEY", "example-not-real-secret")
FAKE_AWS_ECHO = os.getenv("HP_FAKE_AWS_ECHO", FAKE_AWS_ACCESS_KEY_ID)
FAKE_SECRET_ECHO = os.getenv("HP_FAKE_SECRET_ECHO", "redacted")
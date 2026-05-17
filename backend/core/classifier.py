import yaml
import os
from core.logging import get_logger

log = get_logger(__name__)

with open(os.path.join(os.path.dirname(__file__), "rules.yaml")) as f:
    RULES = yaml.safe_load(f)["rules"]

def classify_session(commands: list[str], duration: float) -> dict:
    matched = None
    for rule in RULES:
        c = rule.get("conditions", {})
        min_cmds = c.get("min_commands", 0)
        max_cmds = c.get("max_commands", float("inf"))
        min_dur = c.get("min_duration", 0)
        max_dur = c.get("max_duration", float("inf"))
        keywords = c.get("command_keywords", [])

        count = len(commands)
        if not (min_cmds <= count <= max_cmds):
            continue
        if not (min_dur <= duration <= max_dur):
            continue
        if keywords and not any(kw in cmd for cmd in commands for kw in keywords):
            continue

        matched = rule
        break

    if not matched:
        matched = {
            "name": "unknown",
            "severity": "low",
            "mitre_id": "T1078",
            "mitre_name": "Valid Accounts",
            "description": "No rule matched"
        }

    log.info("session_classified",
             classification=matched["name"],
             severity=matched["severity"],
             mitre=matched["mitre_id"])

    return {
        "classification": matched["name"],
        "severity": matched["severity"],
        "mitre_id": matched["mitre_id"],
        "mitre_name": matched["mitre_name"],
        "description": matched["description"],
    }
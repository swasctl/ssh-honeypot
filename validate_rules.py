import yaml
with open("backend/core/rules.yaml") as f:
    data = yaml.safe_load(f)
rules = data["rules"]
print(f"{len(rules)} rules loaded OK")
for i, r in enumerate(rules):
    name = r["name"]
    sev = r["severity"]
    mid = r["mitre_id"]
    print(f"  {i+1:02d}. {name:<40} [{sev:<8}] {mid}")

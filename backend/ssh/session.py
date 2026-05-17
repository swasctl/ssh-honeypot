from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class AttackerSession:
    ip: str
    port: int
    username: str = ""
    password: str = ""
    client_version: str = "unknown"
    cwd: str = "/home/admin"
    commands: list[str] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.utcnow)

    def elapsed(self) -> float:
        return (datetime.utcnow() - self.start_time).total_seconds()
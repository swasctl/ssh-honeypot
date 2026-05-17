import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect
from db.queries import get_latest_sessions

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        for ws in self.active:
            await ws.send_text(json.dumps(data))

manager = ConnectionManager()

async def live_feed(ws: WebSocket):
    await manager.connect(ws)
    last_id = 0
    try:
        while True:
            sessions = get_latest_sessions(after_id=last_id)
            for s in sessions:
                last_id = s["id"]
                await manager.broadcast({"type": "new_session", **s})
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(ws)
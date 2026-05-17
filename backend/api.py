from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from routers import sessions, stats
from ws.live import live_feed

app = FastAPI(title="SSH Honeypot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(stats.router)

@app.websocket("/ws/live")
async def websocket_live(ws: WebSocket):
    await live_feed(ws)
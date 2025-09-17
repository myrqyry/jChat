from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from typing import List

app = FastAPI(title="jChat Backend API", version="0.1.0")

from . import db


@app.on_event("startup")
async def startup_event():
    # Initialize the SQLite database for themes
    db.init_db()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connections for real-time chat
active_connections: List[WebSocket] = []

@app.get("/")
async def root():
    return {"message": "jChat Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/chat/{channel}")
async def chat_websocket(websocket: WebSocket, channel: str):
    await websocket.accept()
    active_connections.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            # Process chat message and broadcast to all connections
            message_data = json.loads(data)

            # Broadcast to all connected clients
            for connection in active_connections:
                if connection != websocket:
                    await connection.send_text(json.dumps(message_data))

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.post("/api/themes")
async def save_theme(theme_data: dict):
    """Save a custom theme configuration. Expects {id, name, data}"""
    if not isinstance(theme_data, dict):
        raise HTTPException(status_code=400, detail="Invalid payload")

    theme_id = theme_data.get("id")
    name = theme_data.get("name")
    data = theme_data.get("data")

    if not theme_id or not name or data is None:
        raise HTTPException(status_code=400, detail="Missing required fields: id, name, data")

    # store as JSON string
    db.save_theme(theme_id, name, json.dumps(data))
    return {"status": "saved", "theme": {"id": theme_id, "name": name}}


@app.get("/api/themes")
async def get_themes():
    """Get available themes from the DB"""
    themes = db.list_themes()
    # parse data back to JSON where possible
    parsed = []
    for t in themes:
        try:
            payload = json.loads(t["data"]) if isinstance(t["data"], str) else t["data"]
        except Exception:
            payload = t["data"]
        parsed.append({"id": t["id"], "name": t["name"], "data": payload})
    return {"themes": parsed}


@app.get("/api/themes/{theme_id}")
async def get_theme(theme_id: str):
    t = db.get_theme(theme_id)
    if not t:
        raise HTTPException(status_code=404, detail="Theme not found")
    try:
        payload = json.loads(t["data"]) if isinstance(t["data"], str) else t["data"]
    except Exception:
        payload = t["data"]
    return {"theme": {"id": t["id"], "name": t["name"], "data": payload}}


@app.delete("/api/themes/{theme_id}")
async def delete_theme(theme_id: str):
    ok = db.delete_theme(theme_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Theme not found")
    return {"status": "deleted", "id": theme_id}
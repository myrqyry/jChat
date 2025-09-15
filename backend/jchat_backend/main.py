from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from typing import List

app = FastAPI(title="jChat Backend API", version="0.1.0")

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
    """Save a custom theme configuration"""
    # In a real app, this would save to a database
    return {"status": "saved", "theme": theme_data}

@app.get("/api/themes")
async def get_themes():
    """Get available themes"""
    return {
        "themes": [
            {"name": "Default", "id": "default"},
            {"name": "Gaming", "id": "gaming"},
            {"name": "Minimal", "id": "minimal"},
            {"name": "Retro", "id": "retro"},
            {"name": "Elegant", "id": "elegant"}
        ]
    }
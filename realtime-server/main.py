"""
Realtime Server — WebSocket + MQTT
Handles:
  - Live ambulance/vehicle GPS location broadcasting
  - Hospital bed capacity updates
  - Emergency alert broadcasting
  - MQTT subscriber for IoT device data (ambulances, mobile units)

Connects to:
  - Frontend (Rashi): via WebSocket
  - Backend (Tanya/Lakshita/Prashant): via REST to fetch hospital data
  - MQTT broker: for ambulance IoT device messages
"""

import asyncio
import json
import random
import math
from datetime import datetime
from typing import Dict, Set, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ─────────────────────────────────────────────
#  App setup
# ─────────────────────────────────────────────
app = FastAPI(title="GIS Realtime Server", version="1.0.0")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all local ports to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # tighten to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  In-memory state
# ─────────────────────────────────────────────
class ConnectionManager:
    """Manages all active WebSocket connections and broadcasts."""

    def __init__(self):
        # channel → set of connected WebSocket clients
        self.channels: Dict[str, Set[WebSocket]] = {
            "ambulances": set(),
            "hospitals": set(),
            "alerts": set(),
            "all": set(),
        }

    async def connect(self, websocket: WebSocket, channel: str = "all"):
        await websocket.accept()
        self.channels.setdefault(channel, set()).add(websocket)
        self.channels["all"].add(websocket)
        print(f"[WS] Client connected to channel '{channel}'. "
              f"Total: {len(self.channels['all'])}")

    def disconnect(self, websocket: WebSocket, channel: str = "all"):
        self.channels.get(channel, set()).discard(websocket)
        self.channels["all"].discard(websocket)
        print(f"[WS] Client disconnected. Total: {len(self.channels['all'])}")

    async def broadcast(self, message: dict, channel: str = "all"):
        """Send a JSON message to every client on a channel."""
        dead = set()
        targets = self.channels.get(channel, set()).copy()
        for ws in targets:
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)
        # clean up dead connections
        for ws in dead:
            self.channels[channel].discard(ws)
            self.channels["all"].discard(ws)

    async def send_personal(self, websocket: WebSocket, message: dict):
        await websocket.send_json(message)


manager = ConnectionManager()

# Live state stored in memory (replace with Redis in production)
ambulance_state: Dict[str, dict] = {}
hospital_state: Dict[str, dict] = {}


# ─────────────────────────────────────────────
#  Pydantic models
# ─────────────────────────────────────────────
class AmbulanceLocation(BaseModel):
    ambulance_id: str
    lat: float
    lng: float
    speed_kmh: float = 0
    status: str = "active"          # active | dispatched | at_hospital | idle
    destination_hospital_id: Optional[str] = None
    timestamp: Optional[str] = None


class HospitalUpdate(BaseModel):
    hospital_id: str
    name: str
    available_beds: int
    total_beds: int
    emergency_open: bool = True
    lat: float
    lng: float


class AlertMessage(BaseModel):
    alert_type: str                  # emergency | traffic | closure
    message: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: Optional[float] = None


# ─────────────────────────────────────────────
#  WebSocket endpoints
# ─────────────────────────────────────────────
@app.websocket("/ws/ambulances")
async def ws_ambulances(websocket: WebSocket):
    """Frontend subscribes here to receive live ambulance positions."""
    await manager.connect(websocket, "ambulances")
    try:
        # Send current state immediately on connect
        if ambulance_state:
            await manager.send_personal(websocket, {
                "type": "snapshot",
                "data": list(ambulance_state.values()),
                "timestamp": _now()
            })
        # Keep connection alive; frontend sends pings
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, "ambulances")


@app.websocket("/ws/hospitals")
async def ws_hospitals(websocket: WebSocket):
    """Frontend subscribes here to receive live hospital capacity updates."""
    await manager.connect(websocket, "hospitals")
    try:
        if hospital_state:
            await manager.send_personal(websocket, {
                "type": "snapshot",
                "data": list(hospital_state.values()),
                "timestamp": _now()
            })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "hospitals")


@app.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    """Frontend subscribes here for emergency/area alerts."""
    await manager.connect(websocket, "alerts")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "alerts")


@app.websocket("/ws/all")
async def ws_all(websocket: WebSocket):
    """Single channel for all event types — simpler for the frontend."""
    await manager.connect(websocket, "all")
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, "all")


# ─────────────────────────────────────────────
#  REST endpoints (called by backend / devices)
# ─────────────────────────────────────────────
@app.post("/api/ambulance/update")
async def update_ambulance(location: AmbulanceLocation):
    """
    Called by ambulance devices (or MQTT bridge) to push location.
    Broadcasts to all subscribed frontend clients.
    """
    location.timestamp = location.timestamp or _now()
    payload = location.model_dump()
    ambulance_state[location.ambulance_id] = payload

    message = {
        "type": "ambulance_update",
        "data": payload,
        "timestamp": _now()
    }
    await manager.broadcast(message, "ambulances")
    await manager.broadcast(message, "all")
    return {"status": "broadcasted", "clients": len(manager.channels["ambulances"])}


@app.post("/api/hospital/update")
async def update_hospital(update: HospitalUpdate):
    """
    Called by backend when hospital capacity changes.
    """
    payload = update.model_dump()
    hospital_state[update.hospital_id] = payload

    message = {
        "type": "hospital_update",
        "data": payload,
        "timestamp": _now()
    }
    await manager.broadcast(message, "hospitals")
    await manager.broadcast(message, "all")
    return {"status": "broadcasted", "clients": len(manager.channels["hospitals"])}


@app.post("/api/alert/broadcast")
async def broadcast_alert(alert: AlertMessage):
    """Broadcast emergency/area alerts to all frontend clients."""
    message = {
        "type": "alert",
        "data": alert.model_dump(),
        "timestamp": _now()
    }
    await manager.broadcast(message, "alerts")
    await manager.broadcast(message, "all")
    return {"status": "broadcasted"}


@app.get("/api/ambulances")
async def get_ambulances():
    """REST fallback — returns current ambulance state snapshot."""
    return {"ambulances": list(ambulance_state.values())}


@app.get("/api/hospitals")
async def get_hospitals():
    return {"hospitals": list(hospital_state.values())}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "connections": len(manager.channels["all"]),
        "ambulances_tracked": len(ambulance_state),
        "hospitals_tracked": len(hospital_state),
    }


# ─────────────────────────────────────────────
#  Mock data simulator (dev/demo use only)
#  Simulates 3 ambulances moving around Delhi
# ─────────────────────────────────────────────
DELHI_CENTER = (28.6139, 77.2090)

def _random_offset(base_lat, base_lng, step=0.001):
    return (
        base_lat + random.uniform(-step, step),
        base_lng + random.uniform(-step, step),
    )

async def simulate_ambulances():
    """
    Continuously moves 3 mock ambulances around Delhi.
    Disable this in production and use real device data.
    """
    ambulances = {
        "AMB-001": {"lat": 28.6200, "lng": 77.2000, "status": "active"},
        "AMB-002": {"lat": 28.6100, "lng": 77.2200, "status": "dispatched"},
        "AMB-003": {"lat": 28.6050, "lng": 77.1900, "status": "idle"},
    }
    hospitals_mock = [
        {"hospital_id": "H001", "name": "AIIMS Delhi",
         "available_beds": 12, "total_beds": 50, "emergency_open": True,
         "lat": 28.5678, "lng": 77.2100},
        {"hospital_id": "H002", "name": "Safdarjung Hospital",
         "available_beds": 5, "total_beds": 40, "emergency_open": True,
         "lat": 28.5685, "lng": 77.2066},
        {"hospital_id": "H003", "name": "GTB Hospital",
         "available_beds": 0, "total_beds": 30, "emergency_open": False,
         "lat": 28.6817, "lng": 77.3096},
    ]

    # seed hospital state
    for h in hospitals_mock:
        hospital_state[h["hospital_id"]] = h

    tick = 0
    while True:
        await asyncio.sleep(3)
        tick += 1
        for amb_id, amb in ambulances.items():
            amb["lat"], amb["lng"] = _random_offset(amb["lat"], amb["lng"])
            amb["speed_kmh"] = round(random.uniform(20, 80), 1)
            update = AmbulanceLocation(
                ambulance_id=amb_id,
                lat=amb["lat"],
                lng=amb["lng"],
                speed_kmh=amb["speed_kmh"],
                status=amb["status"],
                timestamp=_now()
            )
            payload = update.model_dump()
            ambulance_state[amb_id] = payload
            msg = {"type": "ambulance_update", "data": payload, "timestamp": _now()}
            await manager.broadcast(msg, "ambulances")
            await manager.broadcast(msg, "all")

        # Randomly change a hospital's bed count every 15 ticks
        if tick % 15 == 0:
            h = random.choice(hospitals_mock)
            h["available_beds"] = max(0, h["available_beds"] + random.randint(-2, 3))
            hospital_state[h["hospital_id"]] = h
            msg = {"type": "hospital_update", "data": h, "timestamp": _now()}
            await manager.broadcast(msg, "hospitals")
            await manager.broadcast(msg, "all")


@app.on_event("startup")
async def startup():
    # Comment this out in production
    asyncio.create_task(simulate_ambulances())
    print("[Server] Realtime server started. Mock simulator running.")


# ─────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────
def _now():
    return datetime.utcnow().isoformat() + "Z"


# ─────────────────────────────────────────────
#  MQTT Bridge (optional — for real ambulances)
# ─────────────────────────────────────────────
"""
To use MQTT (e.g. for real ambulance IoT devices):

pip install paho-mqtt

import paho.mqtt.client as mqtt

MQTT_BROKER = "localhost"
MQTT_TOPIC  = "ambulances/+/location"

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    # data should match AmbulanceLocation schema
    asyncio.run(update_ambulance(AmbulanceLocation(**data)))

mqtt_client = mqtt.Client()
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.subscribe(MQTT_TOPIC)
mqtt_client.loop_start()          # runs in background thread
"""


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

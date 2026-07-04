/**
 * signaling-server.js
 * ──────────────────────────────────────────────────────────────────────
 * WebRTC Signaling Server for Telemedicine module
 *
 * What this does:
 *   WebRTC needs two peers to exchange "offer", "answer", and "ICE
 *   candidate" messages BEFORE the peer-to-peer video channel opens.
 *   This server is the middleman for that exchange only — once the call
 *   is established, video/audio flows directly peer-to-peer.
 *
 * Rooms:
 *   A "room" = one consultation session.
 *   Room ID is generated when a patient requests a consultation.
 *   Doctor joins using the same room ID.
 *
 * Run:
 *   node signaling-server.js
 *   (or: npm start)
 *
 * Port: 3001
 */

const http      = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3001;

// ── HTTP server (minimal — Socket.IO attaches to it) ──────────────────
const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      rooms: rooms.size,
      connections: io.engine.clientsCount
    }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// ── Socket.IO setup ───────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "*",                // tighten to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// In-memory room store
// rooms: Map<roomId, { patients: string[], doctors: string[], created: Date }>
const rooms = new Map();

// socket → { roomId, role }
const socketMeta = new Map();

// ── Helper ────────────────────────────────────────────────────────────
function log(msg, ...args) {
  console.log(`[Signal ${new Date().toISOString()}] ${msg}`, ...args);
}

// ── Socket.IO events ──────────────────────────────────────────────────
io.on("connection", (socket) => {
  log("Client connected:", socket.id);

  // ── 1. Create a new consultation room (patient initiates) ───────────
  socket.on("create-room", ({ patientName = "Patient" } = {}, callback) => {
    const roomId = uuidv4().slice(0, 8).toUpperCase();   // e.g. "A3F7B2C1"
    rooms.set(roomId, {
      patients: [socket.id],
      doctors:  [],
      created:  new Date(),
      patientName,
    });
    socketMeta.set(socket.id, { roomId, role: "patient" });
    socket.join(roomId);
    log(`Room created: ${roomId} by ${socket.id}`);
    callback?.({ roomId });
  });

  // ── 2. Join an existing room (doctor uses the link) ─────────────────
  socket.on("join-room", ({ roomId, role = "doctor" } = {}, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      callback?.({ error: "Room not found" });
      return;
    }

    socket.join(roomId);
    socketMeta.set(socket.id, { roomId, role });

    if (role === "doctor") {
      room.doctors.push(socket.id);
    } else {
      room.patients.push(socket.id);
    }

    log(`${role} ${socket.id} joined room ${roomId}`);

    // Tell everyone else in the room that a peer joined
    socket.to(roomId).emit("peer-joined", {
      peerId: socket.id,
      role,
      roomId,
    });

    callback?.({ ok: true, roomId, peerCount: io.sockets.adapter.rooms.get(roomId)?.size });
  });

  // ── 3. WebRTC signaling messages (forwarded to other peers) ─────────
  //
  // offer: sent by the caller after creating RTCPeerConnection
  socket.on("offer", ({ to, offer }) => {
    log(`Offer from ${socket.id} → ${to}`);
    socket.to(to).emit("offer", { from: socket.id, offer });
  });

  // answer: sent by the callee after receiving the offer
  socket.on("answer", ({ to, answer }) => {
    log(`Answer from ${socket.id} → ${to}`);
    socket.to(to).emit("answer", { from: socket.id, answer });
  });

  // ice-candidate: sent by both sides as network paths are discovered
  socket.on("ice-candidate", ({ to, candidate }) => {
    socket.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // ── 4. Chat message (text fallback when video fails) ────────────────
  socket.on("chat-message", ({ roomId, message, senderName = "User" }) => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    io.to(meta.roomId).emit("chat-message", {
      from:       socket.id,
      senderName,
      message,
      timestamp:  new Date().toISOString(),
    });
  });

  // ── 5. Screen share notification ────────────────────────────────────
  socket.on("screen-share-started", () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    socket.to(meta.roomId).emit("screen-share-started", { from: socket.id });
  });

  socket.on("screen-share-stopped", () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    socket.to(meta.roomId).emit("screen-share-stopped", { from: socket.id });
  });

  // ── 6. Disconnect cleanup ────────────────────────────────────────────
  socket.on("disconnect", () => {
    const meta = socketMeta.get(socket.id);
    if (meta) {
      const { roomId, role } = meta;
      const room = rooms.get(roomId);
      if (room) {
        room.patients = room.patients.filter((id) => id !== socket.id);
        room.doctors  = room.doctors.filter((id) => id !== socket.id);
        // Delete room if empty
        if (room.patients.length === 0 && room.doctors.length === 0) {
          rooms.delete(roomId);
          log(`Room ${roomId} deleted (empty)`);
        } else {
          socket.to(roomId).emit("peer-left", { peerId: socket.id, role });
        }
      }
      socketMeta.delete(socket.id);
      log(`${role} disconnected: ${socket.id}`);
    }
  });
});

// ── Start server ──────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  log(`Signaling server running on http://localhost:${PORT}`);
  log(`Health check: http://localhost:${PORT}/health`);
});

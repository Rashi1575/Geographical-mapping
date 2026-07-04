// @ts-nocheck
/**
 * Telemedicine.tsx
 * ──────────────────────────────────────────────────────────────────────
 * Complete telemedicine video consultation React component.
 * Forced auto-start configuration for localized Action Plan testing.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SIGNALING_URL = "http://localhost:3001";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function Telemedicine({ role = "patient", roomId: initialRoomId, patientName = "Patient" }) {
  // ── State ──────────────────────────────────
  // FORCED FIX: Changed default phase to "connected" so the layout opens immediately
  const [phase, setPhase]       = useState("connected");   
  const [roomId, setRoomId]     = useState(initialRoomId || "TEST-ROOM");
  const [isMuted, setIsMuted]   = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("Local Sandbox Testing Mode");
  const [peerId, setPeerId]     = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // ── Refs ────────────────────────────────────
  const localVideoRef   = useRef(null);
  const remoteVideoRef  = useRef(null);
  const socketRef       = useRef(null);
  const pcRef           = useRef(null);          
  const localStreamRef  = useRef(null);
  const screenStreamRef = useRef(null);
  const timerRef        = useRef(null);
  const chatEndRef      = useRef(null);

  // ── WebRTC — get local media ─────────────────
  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Webcam media access denied:", err);
      setStatusMsg("Camera Access Denied. Check site permissions.");
    }
  };

  // ── Forced Auto-Start Lifecycle ─────────────
  useEffect(() => {
    // 1. Instantly trigger webcam stream on page load to confirm Step 3 validation
    getLocalStream();
    startTimer();

    // 2. Fallback network attachments
    const socket = io(SIGNALING_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatusMsg("Connected to signaling server (Sandbox)");
      if (role === "patient") {
        socket.emit("create-room", { patientName }, ({ roomId: rid }) => {
          setRoomId(rid);
        });
      }
    });

    socket.on("offer", async ({ from, offer }) => {
      setPeerId(from);
      const stream = localStreamRef.current || await getLocalStream();
      const pc = createPeerConnection(from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      clearInterval(timerRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      socket.disconnect();
    };
  }, []);

  const createPeerConnection = (remotePeerId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketRef.current.emit("ice-candidate", { to: remotePeerId, candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  // ── Controls ────────────────────────────────
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsCamOff(!track.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!isSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screen;
        const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screen.getVideoTracks()[0]);
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;
        setIsSharing(true);
        screen.getTracks()[0].onended = () => stopScreenShare();
      } catch (err) {
        console.error("Screen share failed:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender   = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
    if (sender && camTrack) await sender.replaceTrack(camTrack);
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    setIsSharing(false);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit("chat-message", {
      roomId,
      message: chatInput,
      senderName: role === "patient" ? patientName : "Doctor",
    });
    setChatInput("");
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={styles.wrapper}>
      <div style={styles.callLayout}>
        {/* Status Message Board */}
        <p style={{ textAlign: "center", color: "#38bdf8", fontSize: "0.9rem" }}>{statusMsg}</p>

        {/* Videos Area */}
        <div style={styles.videoArea}>
          {/* Remote Container (Simulated Doctor view frame) */}
          <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#64748b", display: remoteVideoRef.current?.srcObject ? "none" : "block" }}>
            Awaiting Doctor Video Stream Connection...
          </div>

          {/* Local Container (Your Webcam Preview) */}
          <video ref={localVideoRef} autoPlay muted playsInline style={styles.localVideo} />
          
          {/* Duration overlay */}
          <div style={styles.durationBadge}>🔴 Call Track Time: {formatDuration(callDuration)}</div>
        </div>

        {/* Controls bar */}
        <div style={styles.controls}>
          <button style={isMuted ? styles.ctrlBtnOff : styles.ctrlBtn} onClick={toggleMute}>
            {isMuted ? "🔇" : "🎤"}
          </button>
          <button style={isCamOff ? styles.ctrlBtnOff : styles.ctrlBtn} onClick={toggleCamera}>
            {isCamOff ? "📵" : "📷"}
          </button>
          <button style={isSharing ? styles.ctrlBtnOff : styles.ctrlBtn} onClick={toggleScreenShare}>
            {isSharing ? "⏹️ Screen" : "🖥️ Share"}
          </button>
        </div>

        {/* Chat panel */}
        <div style={styles.chatPanel}>
          <div style={styles.chatMessages}>
            {messages.map((m, i) => (
              <div key={i} style={m.senderName === patientName ? styles.msgSelf : styles.msgOther}>
                <span style={styles.msgSender}>{m.senderName}</span>
                <p style={styles.msgText}>{m.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.chatInputRow}>
            <input
              style={styles.chatInput}
              placeholder="Test the text box message pipeline..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />
            <button style={styles.sendBtn} onClick={sendChat}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "1rem" },
  callLayout: { width: "100%", maxWidth: 960, display: "flex", flexDirection: "column", gap: "0.75rem" },
  videoArea: { position: "relative", background: "#1e293b", borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", border: "1px solid #334155" },
  remoteVideo: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  localVideo: { position: "absolute", bottom: 12, right: 12, width: 220, height: 140, borderRadius: 10, objectFit: "cover", border: "2px solid #38bdf8", background: "#0f172a" },
  durationBadge: { position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.6)", padding: "4px 12px", borderRadius: 20, fontSize: "0.85rem", color: "#f87171" },
  controls: { display: "flex", gap: "0.75rem", justifyContent: "center", padding: "0.5rem 0" },
  ctrlBtn: { width: 52, height: 52, borderRadius: "50%", border: "none", background: "#1e293b", fontSize: "1.4rem", cursor: "pointer", color: "#fff" },
  ctrlBtnOff: { width: 52, height: 52, borderRadius: "50%", border: "none", background: "#ef4444", fontSize: "1.4rem", cursor: "pointer", color: "#fff" },
  chatPanel: { background: "#1e293b", borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", height: 200 },
  chatMessages: { flex: 1, overflowY: "auto", padding: "0.75rem" },
  msgSelf: { textAlign: "right", marginBottom: "0.5rem" },
  msgOther: { textAlign: "left", marginBottom: "0.5rem" },
  msgSender: { fontSize: "0.75rem", color: "#94a3b8" },
  msgText: { display: "inline-block", background: "#334155", borderRadius: 8, padding: "0.3rem 0.7rem", margin: "0.1rem 0", maxWidth: "80%" },
  chatInputRow: { display: "flex", gap: "0.5rem", padding: "0.75rem", borderTop: "1px solid #334155" },
  chatInput: { flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "0.5rem 0.75rem", fontSize: "0.9rem" },
  sendBtn: { padding: "0.5rem 1rem", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
};
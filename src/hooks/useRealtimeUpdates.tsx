import { useEffect, useRef, useState, useCallback } from "react";

const REALTIME_URL = "ws://localhost:8001";

export function useRealtimeUpdates() {
  // Added <any[]> so TypeScript knows these are arrays
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Added TypeScript definitions to the references
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<any>(null);
  const reconnectTimer = useRef<any>(null);
  const retries = useRef(0);
  const MAX_RETRIES = 10;

  const connect = useCallback(() => {
    if (!navigator.onLine) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${REALTIME_URL}/ws/all`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      retries.current = 0;
      console.log("[WS] Connected to realtime server");
      
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25_000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (err) {
        console.warn("[WS] Bad message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearInterval(pingIntervalRef.current);
      if (retries.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retries.current, 30_000);
        retries.current += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      ws.close();
    };
  }, []);

  const handleMessage = (msg: any) => {
    switch (msg.type) {
      case "snapshot":
        if (Array.isArray(msg.data)) {
          const firstItem = msg.data[0];
          if (firstItem?.ambulance_id !== undefined) setAmbulances(msg.data);
          else if (firstItem?.hospital_id !== undefined) setHospitals(msg.data);
        }
        break;
      case "ambulance_update":
        setAmbulances((prev) => {
          const idx = prev.findIndex((a) => a.ambulance_id === msg.data.ambulance_id);
          if (idx === -1) return [...prev, msg.data];
          const next = [...prev];
          next[idx] = msg.data;
          return next;
        });
        break;
      case "hospital_update":
        setHospitals((prev) => {
          const idx = prev.findIndex((h) => h.hospital_id === msg.data.hospital_id);
          if (idx === -1) return [...prev, msg.data];
          const next = [...prev];
          next[idx] = msg.data;
          return next;
        });
        break;
      case "alert":
        setAlerts((prev) => [msg.data, ...prev].slice(0, 20));
        break;
      case "pong":
        break;
    }
  };

  useEffect(() => {
    connect();
    const onOnline = () => { setIsOnline(true); connect(); };
    const onOffline = () => { setIsOnline(false); };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      clearTimeout(reconnectTimer.current);
      clearInterval(pingIntervalRef.current);
      wsRef.current?.close();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [connect]);

  return { ambulances, hospitals, alerts, isConnected, isOnline };
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#f59e0b", color: "#78350f", padding: "8px 16px", textAlign: "center", fontSize: "0.9rem", fontWeight: 500 }}>
      ⚠️ You are offline — showing cached data. Some features may be unavailable.
    </div>
  );
}

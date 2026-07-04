import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet expects assets at specific paths)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Hospital = {
  id: string;
  name: string;
  description: string;
  position: [number, number];
};

const hospitals: Hospital[] = [
  {
    id: "city-care",
    name: "City Care Hospital",
    description: "24/7 multi-specialty hospital with cardiology and emergency care.",
    position: [28.6219, 77.21],
  },
  {
    id: "metro-health",
    name: "Metro Health Centre",
    description: "Trusted general medicine and outpatient services in central Delhi.",
    position: [28.608, 77.225],
  },
  {
    id: "sunrise-medical",
    name: "Sunrise Medical Institute",
    description: "Trauma and orthopedics specialists with advanced imaging facilities.",
    position: [28.605, 77.195],
  },
];

function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
}

function FlyToHospital({ hospital }: { hospital?: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (hospital) {
      map.flyTo([hospital.lat, hospital.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [hospital, map]);

  return null;
}

export function MapSection({
  height = "h-[460px]",
  selectedHospital,
}: {
  height?: string;
  selectedHospital?: {
    lat: number;
    lng: number;
    name: string;
  };
}) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Location access denied:", error);
        },
      );
    }
  }, []);

  useEffect(() => {
    // Ensure Leaflet recalculates size if the container mounts inside flex/grid layouts
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-border backdrop-blur"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.97 0.02 240 / 0.8), oklch(0.96 0.03 200 / 0.8))",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-teal animate-pulse" />
          <h2 className="text-sm font-semibold text-foreground">Interactive Map</h2>
        </div>
        <span className="text-[10px] text-accent-teal uppercase tracking-wider font-semibold">
          Live
        </span>
      </div>

      <div className={`relative ${height}`}>
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <FlyToLocation position={userLocation} />
          <FlyToHospital hospital={selectedHospital} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hospitals.map((h) => (
            <Marker key={h.id} position={h.position}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold text-sm">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.description}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here 📍</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
